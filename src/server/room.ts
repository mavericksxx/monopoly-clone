/**
 * The `Room` Durable Object — one per game room (SQLite-backed, WebSocket-hibernating).
 *
 * Responsibilities, and nothing else: lobby (join / reconnect / settings / start),
 * holding the authoritative `GameState`, applying actions through the engine, broadcasting,
 * and persisting to SQLite so a hibernated or evicted room resumes. All game rules live in
 * `src/engine`; this file never inspects a `GameAction` beyond routing it to `reduce`.
 */
import { DurableObject } from 'cloudflare:workers';
import type {
  ClientMessage,
  GameAction,
  GameState,
  Player,
  PlayerAction,
  RoomMeta,
  RoomSettings,
  ServerMessage,
} from '../shared/types';
import { DEFAULT_SETTINGS } from '../shared/types';
import type { Env } from './env';
import { parseClientMessage } from './protocol';
import { createGame, reduce } from './engine-adapter';
import { getMap } from '../data/maps/index';
import { createRng, randomSeed } from './rng';

const COLOR_PALETTE = [
  '#e6194b', '#3cb44b', '#4363d8', '#f58231',
  '#911eb4', '#42d4f4', '#f032e6', '#bfef45',
];

// `type` (not `interface`) so these structurally satisfy the SQL API's
// `Record<string, SqlStorageValue>` generic constraint.
type RoomRow = {
  id: number;
  code: string;
  host_id: string | null;
  settings: string;
  started: number;
  rng_seed: number;
  rng_state: number;
  state: string | null;
};

type PlayerRow = {
  id: string;
  token: string;
  name: string;
  color: string;
  join_order: number;
  connected: number;
};

interface SocketAttachment {
  playerId: string;
}

export class Room extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => this.migrate());
  }

  private migrate(): void {
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS room (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        code TEXT NOT NULL,
        host_id TEXT,
        settings TEXT NOT NULL,
        started INTEGER NOT NULL DEFAULT 0,
        rng_seed INTEGER NOT NULL,
        rng_state INTEGER NOT NULL,
        state TEXT
      )
    `);
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        join_order INTEGER NOT NULL,
        connected INTEGER NOT NULL DEFAULT 1
      )
    `);
  }

  // ── Worker-facing RPC ─────────────────────────────────────────────────────

  /** Idempotent: creates the room row the first time it's called, no-ops after. */
  async init(code: string): Promise<{ created: boolean }> {
    if (this.getRoomRow()) return { created: false };
    const seed = randomSeed();
    this.ctx.storage.sql.exec(
      `INSERT INTO room (id, code, host_id, settings, started, rng_seed, rng_state, state)
       VALUES (1, ?, NULL, ?, 0, ?, ?, NULL)`,
      code,
      JSON.stringify(DEFAULT_SETTINGS),
      seed,
      seed,
    );
    return { created: true };
  }

  async getMeta(): Promise<RoomMeta | null> {
    const row = this.getRoomRow();
    return row ? this.roomMetaFromRow(row) : null;
  }

  // ── WebSocket entry point (hibernatable) ───────────────────────────────────

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    if (typeof raw !== 'string') {
      this.sendError(ws, 'binary messages are not supported');
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.sendError(ws, 'malformed JSON');
      return;
    }
    const message = parseClientMessage(parsed);
    if (!message) {
      this.sendError(ws, 'malformed message');
      return;
    }
    try {
      this.handleMessage(ws, message);
    } catch (err) {
      this.sendError(ws, err instanceof Error ? err.message : 'internal error');
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string): Promise<void> {
    this.handleDisconnect(ws);
    // 1005/1006 are reserved (no status / abnormal) and can't be sent back out.
    const safeCode = code === 1005 || code === 1006 ? 1000 : code;
    ws.close(safeCode, reason);
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    this.handleDisconnect(ws);
  }

  // ── Message routing ─────────────────────────────────────────────────────

  private handleMessage(ws: WebSocket, message: ClientMessage): void {
    switch (message.type) {
      case 'join':
        this.handleJoin(ws, message.name, message.token);
        return;
      case 'update_settings':
        this.handleUpdateSettings(ws, message.settings);
        return;
      case 'action':
        this.handleAction(ws, message.action);
        return;
    }
  }

  private handleJoin(ws: WebSocket, name: string, token: string | undefined): void {
    if (this.boundPlayerId(ws)) {
      this.sendError(ws, 'already joined');
      return;
    }
    const row = this.getRoomRow();
    if (!row) {
      this.sendError(ws, 'room not found');
      return;
    }

    if (token) {
      const existing = this.getPlayerByToken(token);
      if (!existing) {
        this.sendError(ws, 'invalid reconnect token');
        return;
      }
      this.closeOtherSocketsFor(existing.id, ws);
      this.bindSocket(ws, existing.id);
      this.setPlayerConnected(existing.id, true, row);
      const freshRow = this.getRoomRow()!;
      this.sendJoined(ws, existing.id, existing.token, freshRow);
      // Reconnecting players get the current lobby roster or full game snapshot via the
      // broadcast below — this socket is already registered (accepted in `fetch`), so it
      // receives its own copy same as everyone else.
      this.broadcastRoomOrState(freshRow);
      return;
    }

    if (row.started) {
      this.sendError(ws, 'room already started');
      return;
    }
    const settings: RoomSettings = JSON.parse(row.settings);
    const players = this.getPlayers();
    if (players.length >= settings.maxPlayers) {
      this.sendError(ws, 'room is full');
      return;
    }

    const playerId = crypto.randomUUID();
    const playerToken = crypto.randomUUID();
    const joinOrder = players.length;
    const color = COLOR_PALETTE[joinOrder % COLOR_PALETTE.length]!;
    const isFirst = players.length === 0;

    this.ctx.storage.sql.exec(
      `INSERT INTO players (id, token, name, color, join_order, connected) VALUES (?, ?, ?, ?, ?, 1)`,
      playerId,
      playerToken,
      name,
      color,
      joinOrder,
    );
    if (isFirst) {
      this.ctx.storage.sql.exec('UPDATE room SET host_id = ? WHERE id = 1', playerId);
    }

    this.bindSocket(ws, playerId);
    const freshRow = this.getRoomRow()!;
    this.sendJoined(ws, playerId, playerToken, freshRow);
    this.broadcastRoomOrState(freshRow);
  }

  private handleUpdateSettings(ws: WebSocket, patch: Partial<RoomSettings>): void {
    const playerId = this.boundPlayerId(ws);
    if (!playerId) {
      this.sendError(ws, 'join first');
      return;
    }
    const row = this.getRoomRow();
    if (!row) {
      this.sendError(ws, 'room not found');
      return;
    }
    if (row.host_id !== playerId) {
      this.sendError(ws, 'only the host can change settings');
      return;
    }
    if (row.started) {
      this.sendError(ws, 'game already started');
      return;
    }

    const settings: RoomSettings = { ...JSON.parse(row.settings), ...patch };
    this.ctx.storage.sql.exec('UPDATE room SET settings = ? WHERE id = 1', JSON.stringify(settings));
    const freshRow = this.getRoomRow()!;
    this.broadcast({
      type: 'room',
      room: this.roomMetaFromRow(freshRow),
      players: this.lobbyPlayerList(freshRow),
    });
  }

  private handleAction(ws: WebSocket, action: GameAction): void {
    const playerId = this.boundPlayerId(ws);
    if (!playerId) {
      this.sendError(ws, 'join first');
      return;
    }
    const row = this.getRoomRow();
    if (!row) {
      this.sendError(ws, 'room not found');
      return;
    }

    if (action.type === 'start_game') {
      this.handleStartGame(ws, playerId, row);
      return;
    }

    if (!row.started) {
      this.sendError(ws, 'game has not started');
      return;
    }
    const state = this.getState(row);
    if (!state) {
      this.sendError(ws, 'game state missing');
      return;
    }

    const map = getMap(state.mapId);
    const rng = createRng(row.rng_state);
    const pa: PlayerAction = { playerId, action };

    let result: { state: GameState; events: ReturnType<typeof reduce>['events'] };
    try {
      result = reduce(map, state, pa, () => rng.next());
    } catch (err) {
      this.sendError(ws, err instanceof Error ? err.message : 'illegal action');
      return;
    }

    this.writeStateAndRng(result.state, rng.state());
    this.broadcast({ type: 'events', events: result.events, version: result.state.version });
    this.broadcast({ type: 'state', state: result.state });
  }

  private handleStartGame(ws: WebSocket, playerId: string, row: RoomRow): void {
    if (row.host_id !== playerId) {
      this.sendError(ws, 'only the host can start the game');
      return;
    }
    if (row.started) {
      this.sendError(ws, 'game already started');
      return;
    }

    const settings: RoomSettings = JSON.parse(row.settings);
    const map = getMap(settings.mapId);
    const players = this.getPlayers().map((p) => ({ id: p.id, name: p.name, color: p.color }));
    const rng = createRng(row.rng_state);

    let state: GameState;
    try {
      state = createGame(map, players, settings, () => rng.next());
    } catch (err) {
      this.sendError(ws, err instanceof Error ? err.message : 'could not start game');
      return;
    }

    this.ctx.storage.sql.exec(
      'UPDATE room SET started = 1, state = ?, rng_state = ? WHERE id = 1',
      JSON.stringify(state),
      rng.state(),
    );
    this.broadcast({ type: 'state', state });
  }

  private handleDisconnect(ws: WebSocket): void {
    const playerId = this.boundPlayerId(ws);
    if (!playerId) return;
    const row = this.getRoomRow();
    if (!row) return;
    this.setPlayerConnected(playerId, false, row);
    const freshRow = this.getRoomRow()!;
    this.broadcastRoomOrState(freshRow);
  }

  // ── Storage helpers ──────────────────────────────────────────────────────

  private getRoomRow(): RoomRow | null {
    const rows = this.ctx.storage.sql.exec<RoomRow>('SELECT * FROM room WHERE id = 1').toArray();
    return rows[0] ?? null;
  }

  private getPlayers(): PlayerRow[] {
    return this.ctx.storage.sql
      .exec<PlayerRow>('SELECT * FROM players ORDER BY join_order ASC')
      .toArray();
  }

  private getPlayerByToken(token: string): PlayerRow | null {
    const rows = this.ctx.storage.sql
      .exec<PlayerRow>('SELECT * FROM players WHERE token = ?', token)
      .toArray();
    return rows[0] ?? null;
  }

  private getState(row: RoomRow): GameState | null {
    return row.state ? (JSON.parse(row.state) as GameState) : null;
  }

  /** Persists a new state without touching `rng_state` — use for connection-flag writes. */
  private writeState(state: GameState): void {
    this.ctx.storage.sql.exec('UPDATE room SET state = ? WHERE id = 1', JSON.stringify(state));
  }

  /** Persists a new state alongside the rng cursor that produced it — use after `reduce`/`createGame`. */
  private writeStateAndRng(state: GameState, rngState: number): void {
    this.ctx.storage.sql.exec(
      'UPDATE room SET state = ?, rng_state = ? WHERE id = 1',
      JSON.stringify(state),
      rngState,
    );
  }

  /** Updates connection status: the lobby roster pre-start, `GameState.players` after. */
  private setPlayerConnected(playerId: string, connected: boolean, row: RoomRow): void {
    this.ctx.storage.sql.exec(
      'UPDATE players SET connected = ? WHERE id = ?',
      connected ? 1 : 0,
      playerId,
    );
    if (row.started) {
      const state = this.getState(row);
      if (state) {
        const players = state.players.map((p) => (p.id === playerId ? { ...p, connected } : p));
        this.writeState({ ...state, players });
      }
    }
  }

  private roomMetaFromRow(row: RoomRow): RoomMeta {
    return {
      code: row.code,
      hostId: row.host_id ?? '',
      settings: JSON.parse(row.settings),
      started: !!row.started,
    };
  }

  /** Placeholder `Player` records for the pre-game lobby roster (no `GameState` exists yet). */
  private lobbyPlayerList(row: RoomRow): Player[] {
    const settings: RoomSettings = JSON.parse(row.settings);
    const startIndex = getMap(settings.mapId).startIndex;
    return this.getPlayers().map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      cash: settings.startingCash,
      tileIndex: startIndex,
      inJail: false,
      jailTurns: 0,
      pardonCards: 0,
      bankrupt: false,
      connected: !!p.connected,
    }));
  }

  // ── Socket helpers ───────────────────────────────────────────────────────

  private bindSocket(ws: WebSocket, playerId: string): void {
    const attachment: SocketAttachment = { playerId };
    ws.serializeAttachment(attachment);
  }

  private boundPlayerId(ws: WebSocket): string | null {
    const attachment = ws.deserializeAttachment() as SocketAttachment | null;
    return attachment?.playerId ?? null;
  }

  /** A reconnect token maps to one live socket; close any other one already using it. */
  private closeOtherSocketsFor(playerId: string, keep: WebSocket): void {
    for (const ws of this.ctx.getWebSockets()) {
      if (ws !== keep && this.boundPlayerId(ws) === playerId) {
        try {
          ws.close(4000, 'reconnected from another device');
        } catch {
          // Already closing; nothing to do.
        }
      }
    }
  }

  private sendJoined(ws: WebSocket, playerId: string, token: string, row: RoomRow): void {
    const msg: ServerMessage = { type: 'joined', playerId, token, room: this.roomMetaFromRow(row) };
    ws.send(JSON.stringify(msg));
  }

  private sendError(ws: WebSocket, message: string): void {
    const msg: ServerMessage = { type: 'error', message };
    ws.send(JSON.stringify(msg));
  }

  /** Broadcasts the lobby roster pre-start, or a full state snapshot once the game is running. */
  private broadcastRoomOrState(row: RoomRow): void {
    if (!row.started) {
      this.broadcast({
        type: 'room',
        room: this.roomMetaFromRow(row),
        players: this.lobbyPlayerList(row),
      });
      return;
    }
    const state = this.getState(row);
    if (state) this.broadcast({ type: 'state', state });
  }

  /** Broadcasts via `ctx.getWebSockets()` — never a member array, which vanishes on eviction. */
  private broadcast(message: ServerMessage): void {
    const payload = JSON.stringify(message);
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(payload);
      } catch {
        // Socket is closing/closed; webSocketClose will flip `connected` for it.
      }
    }
  }
}
