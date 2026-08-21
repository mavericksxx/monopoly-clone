import { useState } from 'react';
import { DEFAULT_SETTINGS, type PlayerId, type Player, type RoomMeta, type RoomSettings } from '../../shared/types';
import { PlayerList } from '../components/PlayerList';
import { SettingsPanel } from '../components/SettingsPanel';

export function Lobby({
  code, status, room, players, myPlayerId, error, onJoin, onUpdateSettings, onStart,
}: {
  code: string;
  status: 'connecting' | 'open' | 'closed';
  room: RoomMeta | null;
  players: readonly Player[];
  myPlayerId: PlayerId | null;
  error: string | null;
  onJoin: (name: string) => void;
  onUpdateSettings: (partial: Partial<RoomSettings>) => void;
  onStart: () => void;
}) {
  const [nameDraft, setNameDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/${code}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be unavailable (older browser, insecure context); the URL is still on screen.
    }
  }

  if (!myPlayerId) {
    return (
      <div className="lobby lobby--join">
        <div className="lobby__card">
          <h2>Join room {code}</h2>
          <form onSubmit={e => { e.preventDefault(); const n = nameDraft.trim(); if (n) onJoin(n); }}>
            <input
              className="input" placeholder="Your name" value={nameDraft} autoFocus maxLength={20}
              onChange={e => setNameDraft(e.target.value)}
            />
            <button className="btn btn--primary" type="submit" disabled={!nameDraft.trim()}>
              {status === 'connecting' ? 'Connecting…' : 'Join'}
            </button>
          </form>
          {error && <p className="lobby__error">{error}</p>}
        </div>
      </div>
    );
  }

  const isHost = room?.hostId === myPlayerId;

  return (
    <div className="lobby">
      <div className="lobby__share">
        <span className="lobby__share-url">{shareUrl}</span>
        <button className="btn" onClick={copyLink}>{copied ? 'Copied!' : 'Copy link'}</button>
      </div>

      <div className="lobby__body">
        <PlayerList players={players} hostId={room?.hostId ?? null} />
        <SettingsPanel settings={room?.settings ?? DEFAULT_SETTINGS} editable={isHost} onChange={onUpdateSettings} />
      </div>

      {isHost ? (
        <button className="btn btn--primary btn--big" onClick={onStart} disabled={players.length < 2}>
          Start game
        </button>
      ) : (
        <p className="lobby__waiting">Waiting for the host to start…</p>
      )}
      {error && <p className="lobby__error">{error}</p>}
    </div>
  );
}
