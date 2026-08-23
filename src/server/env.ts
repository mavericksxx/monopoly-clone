import type { Room } from './room';

export interface Env {
  ROOM: DurableObjectNamespace<Room>;
  ASSETS: Fetcher;
  /**
   * How long a disconnected player keeps their lobby seat, in ms. Unset in production
   * (defaults to two minutes); a local driver overrides it to a few seconds to exercise
   * the sweep alarm: `wrangler dev --var LOBBY_GRACE_MS:5000`.
   */
  LOBBY_GRACE_MS?: string;
}
