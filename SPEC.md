# v1 spec — rules the engine implements

Derived from `research/rules-edge-cases.md` §7 (30 numbered decisions). Only the ~13 that
gate the playable core are settled here; the rest concern auctions, trades and mortgage,
which are **v2**. Numbers below are §7's numbering.

## Scope

**In v1:** rooms + share link · roll/move/buy/rent · houses + hotels · jail · bankruptcy · win.
**Out of v1:** auctions, mortgage, double-rent-on-full-set, trades, bots, teams, turn clock.

The three out-of-scope *rules* still exist as `RoomSettings` flags (richup ships all three OFF
by default, so a default v1 game is rule-complete). The engine **rejects** actions for them.

## Settled decisions

| # | Decision |
|---|---|
| 1–3 | **Rent auto-collects** inside landing resolution. No claim window, no forfeiture, no decline. |
| 4 | **`RESOLVING_DEBT` is an explicit blocking phase.** Nobody rolls until it clears. The debtor may sell buildings (v1 has no mortgage/trade). |
| 5 | **Auto-declare bankruptcy** when `maxLiquidationValue() < debt`; also expose a voluntary `declare_bankruptcy` action. Two entry points, one settlement routine. |
| 6 | **No rollback.** Building sales made during `RESOLVING_DEBT` stand; the creditor receives the resulting cash. |
| 12 | **Asset mutation is gated.** Buying/selling buildings is legal only on your own turn in `AWAITING_ROLL`, `AWAITING_END_TURN`, or when you are the debtor in `RESOLVING_DEBT`. Never between a roll and its resolution. |
| 13 | **Multi-creditor debt pays in turn order** starting from the player to the debtor's left (`Debt.queued`). You go bankrupt to the first creditor you cannot fully pay; later creditors get nothing. |
| 17 | Buyers of remaining houses have priority over hotel-breakers. A hotel breaks into 4 houses **only if the bank holds 4**; otherwise the only legal move is selling hotels across the whole group. |
| 18 | **Building supply is finite: 32 houses / 12 hotels.** `unlimitedBuildings` is an off-by-default toggle. A hotel purchase returns exactly 4 houses to the pool. |
| 21 | v1 has **no turn clock**. Disconnect sets `player.connected = false` and nothing else — the turn stays theirs. (Turn clock is v2.) |
| 27 | **Resolve the debt before moving the token.** Landing resolution completes, including any `RESOLVING_DEBT` excursion, before a forced move to jail. Debt amounts are snapshotted when incurred. |
| 28 | **Earnings Tax is 10% of net worth** (richup's rule), where net worth = cash + printed price of every property owned + purchase price of every building. The START salary is already in hand when tax resolves. `netWorthForTax()` is a separate function from any endgame valuation. |
| 29 | **Win = last player standing.** No timed mode in v1. |
| 30 | **Voluntary concession allowed**, routed through bankruptcy-to-Bank with `creditor = Bank` forced, so conceding cannot gift a leader. |

## Constants the research could not recover from richup

richup keeps these server-side; grepping both bundles found no identifier for any of them
(`research/README.md`, "What nobody could verify"). These are our choices, not observations:

| Constant | v1 value | Basis |
|---|---|---|
| START salary | **$200** | Hasbro |
| Jail release fee | **$50** | Hasbro |
| Company rent multiplier | **4× / 10× / 20×** dice | Hasbro's two rungs; the 20× third rung is invented for Mr. Worldwide's third company, which has no Hasbro analogue |
| Card decks | our own | richup's are server-side and per-map; see §IP |

## Jail

Three ways out, checked in this order when the player is in jail at the start of their turn:
pay the fee · use a Pardon card · roll doubles. After **three** failed turns the player pays
the fee and moves. Rent is still collected while in jail unless `noRentInPrison` is on.

## Building rules

- Build only on a **complete country group** you own with no member mortgaged.
- `evenBuild` (default ON): a house may only be added to the tile with the fewest houses in
  the group, and removed from the tile with the most.
- Houses go 0→4, then a hotel replaces 4 houses.
- Selling returns **half** the purchase price.
- Group sizes are **2, 3, 4, 5 or 6** depending on map — read `map.countrySizes`, never assume 3.
  (Verified from the data: Death Valley is four groups of 5, 6, 6, 5.)

## Rent

- **City:** `rents[0]` bare · `rents[n]` with n houses · `rents[5]` with a hotel.
  With `doubleRentOnFullSet` on (v2, default off), `rents[0]` doubles when the owner holds the
  whole group undeveloped.
- **Airport:** `rents[ownedCount - 1]`, flat.
- **Company:** `diceTotal × settings.companyRentMultipliers[ownedCount - 1]`.
- No rent on a mortgaged property, or from a bankrupt owner.

## IP

Do not use the word "Monopoly" in any user-facing string, Hasbro's property names, Hasbro's
exact card text, or its board artwork. Mechanics are not protectable; the specific expression
is. Card decks are written fresh from the *effects* catalogued in `research/cards.md`.

## Determinism

The engine is a pure function: `reduce(map, state, playerAction, rng) → { state, events }`.
It performs no I/O, reads no clock, and calls no global `Math.random`. All randomness arrives
through an injected `rng: () => number`, so a game can be replayed from a seed and an action log.

## Module API (pinned — lanes build against these signatures)

```ts
// src/data/maps/index.ts
export function getMap(id: MapId): GameMap;
export const MAPS: Record<MapId, GameMap>;

// src/data/cards/index.ts
export function getDeck(deck: DeckId): Card[];
export function getCard(id: string): Card;

// src/engine/index.ts
export function createGame(map, players: {id,name,color}[], settings, rng): GameState;
export function reduce(map, state, pa: PlayerAction, rng): { state: GameState; events: GameEvent[] };
export function legalActions(map, state, playerId): GameAction[];
```
