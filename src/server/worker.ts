/**
 * Worker entry point. Routes REST + WebSocket-upgrade traffic to the per-room Durable
 * Object (one DO per room, id derived from the room code via `idFromName`); everything
 * else falls through to the static client assets binding.
 */
import type { Env } from './env';

export { Room } from './room';

/** Unambiguous, URL-safe, human-shareable — no O/0/I/1. */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;
const CODE_ALLOCATION_ATTEMPTS = 5;

const CODE_PATTERN = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

function generateRoomCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let code = '';
  for (const byte of bytes) {
    code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  }
  return code;
}

/**
 * Room codes are case-insensitive to type but stored/looked-up uppercase, since
 * `idFromName` is a literal string key: `idFromName("abc123") !== idFromName("ABC123")`.
 * Also rejects anything that isn't a well-formed code before it ever touches the DO
 * namespace — `env.ROOM.get(...)` is cheap, but any RPC call on the stub runs the DO's
 * constructor (a SQLite `CREATE TABLE` write), so a malformed/garbage path segment must
 * never reach that point.
 */
function normalizeRoomCode(raw: string): string | null {
  const code = raw.toUpperCase();
  return CODE_PATTERN.test(code) ? code : null;
}

async function handleCreateRoom(env: Env): Promise<Response> {
  for (let attempt = 0; attempt < CODE_ALLOCATION_ATTEMPTS; attempt++) {
    const code = generateRoomCode();
    const stub = env.ROOM.get(env.ROOM.idFromName(code));
    const { created } = await stub.init(code);
    if (created) return Response.json({ code });
  }
  return Response.json({ error: 'could not allocate a room code, try again' }, { status: 503 });
}

async function handleRoomRequest(
  request: Request,
  env: Env,
  code: string,
  isWebSocket: boolean,
): Promise<Response> {
  const stub = env.ROOM.get(env.ROOM.idFromName(code));

  if (isWebSocket) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }
    return stub.fetch(request);
  }

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }
  const meta = await stub.getMeta();
  if (!meta) return Response.json({ error: 'room not found' }, { status: 404 });
  return Response.json(meta);
}

const ROOM_PATH = /^\/api\/rooms\/([^/]+)(\/ws)?$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/rooms') {
      return handleCreateRoom(env);
    }

    const match = ROOM_PATH.exec(url.pathname);
    if (match) {
      const code = normalizeRoomCode(match[1]!);
      if (!code) return Response.json({ error: 'room not found' }, { status: 404 });
      const isWebSocket = match[2] === '/ws';
      return handleRoomRequest(request, env, code, isWebSocket);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
