import type { GameAction, GameMap, GameState, PlayerId } from '../../shared/types';

/**
 * Shows the buttons that make sense for the current phase. This is UI
 * gating only — final legality is always decided by the engine, and an
 * illegal action just comes back as a `ServerMessage` of type `error`.
 */
export function ActionBar({
  map, state, myPlayerId, onAction,
}: {
  map: GameMap;
  state: GameState;
  myPlayerId: PlayerId;
  onAction: (action: GameAction) => void;
}) {
  const me = state.players.find(p => p.id === myPlayerId);
  const currentPlayerId = state.turnOrder[state.currentPlayerIndex];
  const isMyTurn = currentPlayerId === myPlayerId;

  if (state.phase === 'GAME_OVER') {
    const winnerName = state.players.find(p => p.id === state.winner)?.name ?? 'Someone';
    return <div className="action-bar"><p className="action-bar__over">{winnerName} won the game.</p></div>;
  }

  if (!me || me.bankrupt) {
    return <div className="action-bar" />;
  }

  if (state.phase === 'RESOLVING_DEBT') {
    if (state.debt?.debtor !== myPlayerId) {
      return <div className="action-bar"><p className="action-bar__waiting">Waiting for debt to be settled…</p></div>;
    }
    return (
      <div className="action-bar">
        <p className="action-bar__waiting">
          You owe ${state.debt.amount}. Sell buildings to cover it.
        </p>
        <BuildingControls map={map} state={state} myPlayerId={myPlayerId} onAction={onAction} />
        <button className="btn btn--danger" onClick={() => onAction({ type: 'declare_bankruptcy' })}>
          Declare bankruptcy
        </button>
      </div>
    );
  }

  if (!isMyTurn) {
    const currentName = state.players.find(p => p.id === currentPlayerId)?.name ?? '…';
    return <div className="action-bar"><p className="action-bar__waiting">Waiting for {currentName}…</p></div>;
  }

  return (
    <div className="action-bar">
      {state.phase === 'AWAITING_ROLL' && (
        <>
          {me.inJail && (
            <>
              <button className="btn" onClick={() => onAction({ type: 'pay_jail_fee' })}>
                Pay ${state.settings.jailFee} fee
              </button>
              {me.pardonCards > 0 && (
                <button className="btn" onClick={() => onAction({ type: 'use_pardon' })}>Use pardon card</button>
              )}
            </>
          )}
          <button className="btn btn--primary" onClick={() => onAction({ type: 'roll' })}>Roll</button>
        </>
      )}
      {state.phase === 'AWAITING_BUY' && (
        <>
          <button className="btn btn--primary" onClick={() => onAction({ type: 'buy' })}>Buy</button>
          <button className="btn" onClick={() => onAction({ type: 'decline_buy' })}>Decline</button>
        </>
      )}
      {(state.phase === 'AWAITING_ROLL' || state.phase === 'AWAITING_END_TURN') && (
        <BuildingControls map={map} state={state} myPlayerId={myPlayerId} onAction={onAction} />
      )}
      {state.phase === 'AWAITING_END_TURN' && (
        <button className="btn btn--primary" onClick={() => onAction({ type: 'end_turn' })}>End turn</button>
      )}
      <button className="btn btn--danger btn--small" onClick={() => onAction({ type: 'declare_bankruptcy' })}>
        Concede
      </button>
    </div>
  );
}

function BuildingControls({
  map, state, myPlayerId, onAction,
}: {
  map: GameMap;
  state: GameState;
  myPlayerId: PlayerId;
  onAction: (action: GameAction) => void;
}) {
  const myCities = map.tiles.filter((tile, i) => tile.type === 'city' && state.tiles[i]?.owner === myPlayerId);
  if (myCities.length === 0) return null;

  return (
    <div className="building-controls">
      {myCities.map((tile) => {
        const ownership = state.tiles[tile.index];
        if (!ownership || tile.type !== 'city') return null;
        return (
          <div key={tile.index} className="building-controls__row">
            <span className="building-controls__name">{tile.name}</span>
            {ownership.hotel ? (
              <button className="btn btn--small" onClick={() => onAction({ type: 'sell_hotel', tileIndex: tile.index })}>
                Sell hotel
              </button>
            ) : (
              <>
                <button className="btn btn--small" onClick={() => onAction({ type: 'buy_house', tileIndex: tile.index })}>
                  +House
                </button>
                {ownership.houses > 0 && (
                  <button className="btn btn--small" onClick={() => onAction({ type: 'sell_house', tileIndex: tile.index })}>
                    -House
                  </button>
                )}
                {ownership.houses === 4 && (
                  <button className="btn btn--small" onClick={() => onAction({ type: 'buy_hotel', tileIndex: tile.index })}>
                    +Hotel
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
