# Open issues — playtest round 1

Filed from the first real two-player playtest on the deployed build
(https://boardclone.parthkohale.workers.dev). Nine issues: four are rules bugs in the
engine, five are UI gaps where the engine already does the right thing but the player
cannot see or reach it.

The frozen contract for all of this already landed in `src/shared/types.ts` — see
[Contract changes](#contract-changes-already-applied) at the bottom. **`src/shared/types.ts`
is read-only for everyone working these issues.** If a fix seems to need a further change
there, stop and report it.

Every fix's success criteria are `npx tsc --noEmit` clean and `npx vitest run` green.
**Do not run `npm run smoke`** — `scripts/smoke.mjs` points at the deployed Worker, so it
tests production, not your working tree. Smoke runs once, from the main thread, after deploy.

---

## Status — all nine fixed

| # | Issue | Where it landed |
|---|---|---|
| 1 | Prison fee ends the turn | `reducer.ts` |
| 2 | Reachable bankruptcy button | `ActionBar.tsx` |
| 3 | Log in the board centre, capped and scrolling | `Board.tsx`, `Game.tsx`, `styles.css` |
| 4 | Drawn card shows its text | `EventLog.tsx`, `Board.tsx` |
| 5 | Landing on START pays 300 | `landing.ts` |
| 6 | Vacation pot accumulates and pays out | `state.ts`, `landing.ts`, `debt.ts`, `reducer.ts` |
| 7 | Dice animate on a real roll | `Board.tsx`, `styles.css` |
| 8 | Bigger tokens, animated between tiles | `Board.tsx`, `styles.css` |
| 9 | Vacation costs the next turn | `landing.ts`, `debt.ts` |

Verified: `tsc --noEmit` clean, 93/93 vitest, `vite build` clean, and `node scripts/smoke.mjs
http://localhost:8787` 6/6 against a local `wrangler dev` — the first time this project has
been run locally rather than against production.

### Found while fixing these — not on the original list

- **`scripts/smoke.mjs` had a race that only production latency was hiding.** It attached a
  listener per wait, so the two-player roster broadcast — which the server sends in the same
  tick it answers the join — arrived before the script was listening for it. Every wait now
  scans a per-client buffer. It failed 100% of the time against `wrangler dev` and would
  eventually have flaked against production.
- **A missing setting would have turned a player's cash into `NaN`.** Room settings persist
  as one JSON blob, and `room.ts` cast it straight to `RoomSettings`. Any room created before
  `landOnStartBonus` existed would have read `undefined`, and the first `cash + undefined` on
  landing at START poisons that balance for the rest of the game. Defaults are now merged on
  read, in both `settingsOf` and `getState` (the state carries its own settings snapshot, so
  a game already in flight had the same hazard).
- **The card popup never went away.** Its dismissal timer was cleared by the effect cleanup,
  which re-runs on every `events` change — and a card's own effect emits `paid`/`moved` in
  the very next broadcast. The timers now live in refs and are cleared only on unmount. The
  dice tumble had the same defect. Caught by looking at the running page, not by any test.
- **Backward movement onto START** pays `landOnStartBonus` without `startSalary`, because the
  backward branch suppresses the salary by design. Left alone: it is unreachable on all four
  shipped maps — a card can only be drawn from a bonus tile, and `startIndex + 3` (the only
  backward card is -3) is a city on every one of them. Re-check if a map ever puts a card
  tile three after START.
- **`fullgame.test.ts` needed a new seed.** Seed `20260821` stopped reaching `GAME_OVER`
  inside the step cap. A 60-seed A/B scan put convergence at 22/60 under the old rules and
  19/60 under the new — a small shift, not a collapse — so the seed was swapped, not the
  rules. The cash-conservation and building-conservation invariants never broke at any point
  in the scan.

## Engine rules

### 1. Paying the prison fee should end the turn

**Now:** `handlePayJailFee` (`src/engine/reducer.ts`) frees the player and leaves
`phase: 'AWAITING_ROLL'`, so they immediately roll and move on the same turn.

**Want:** paying $50 gets you out of prison and *ends your turn*. No extra "End turn" click —
the engine advances the turn itself and emits `turn_ended`.

**Open question (not in scope — do not implement):** `use_pardon` has the identical shape and
currently also leaves you able to roll. The user reported only the paid case, so the pardon
card keeps its current behaviour and the two are now asymmetric. Worth confirming next playtest.

**Tradeoff to be aware of:** building is gated on `AWAITING_ROLL`/`AWAITING_END_TURN` for the
current player (`canMutateAssetsNormally`). Auto-advancing the turn on payment means a player
who pays their way out gets no build window that turn.

---

### 5. Landing exactly on START pays 300, not 200

**Now:** the corner branch of `resolveLanding` (`src/engine/landing.ts`) is a no-op for
`start`. `walkForward` reports `passedStart: true` when you land on it, so you get
`startSalary` (200) and nothing more.

**Want:** passing over START keeps paying `startSalary`. Coming to rest exactly on START pays
`startSalary + settings.landOnStartBonus` — 300 at defaults.

**Why a flat setting and not a ratio:** richup's bundle carries no start-bonus identifier at
all (`research/README.md:152`), so the relationship between the salary and the landing bonus
is genuinely unknown. A derived `startSalary * 1.5` would silently pay 750 to anyone who
configures a 500 salary. `landOnStartBonus` is a literal, defaulting to 100.

Emit the bonus as its own `paid` event with `reason: 'start_bonus'`, separate from the
`start_salary` event — the log should show both legs.

---

### 6. Vacation cash is declared but never collected or paid out

**Now:** `GameState.vacationPot` exists and is initialised to 0. **Nothing ever adds to it and
nothing ever pays it out.** The `vacationCash` setting is inert.

**Want:** when `settings.vacationCash` is on, money paid *to the bank* pools in `vacationPot`,
and a player landing on the `free_parking` corner collects the whole pot (pot resets to 0).
Emit `{ type: 'paid', from: null, to: playerId, amount: pot, reason: 'vacation_pot' }`. Skip
the payout entirely when the pot is 0.

**Which payments feed the pot.** richup's own wording is "all collected money from taxes and
bank payments". Decision — taxes, fees and card charges go in; buying things does not:

| In | Out |
|----|-----|
| `earnings_tax`, `premium_tax` | `bought_property` (`handleBuy`) |
| `jail_fee` (both paths, see below) | house/hotel purchases (`src/engine/buildings.ts`) |
| `card` (negative-amount cards), `repairs` | |
| a `debt` settled with `creditor === null` | |

Enumerate every site that moves cash to the bank rather than patching one — there are at
least six, and two of them do not go through `chargeOrDebt`:

1. `chargeOrDebt(..., creditor = null)` in `landing.ts`
2. `trySettleOrBankrupt` in `debt.ts`, when `debt.creditor === null`
3. `handlePayJailFee` in `reducer.ts` — direct `updatePlayer`
4. the third-failed-attempt branch of `handleRoll` in `reducer.ts` — direct `updatePlayer`
5. `handleBuy` — **excluded**, but confirm the exclusion is deliberate
6. `buildings.ts` purchases — **excluded**, but confirm the exclusion is deliberate

When `vacationCash` is off, the pot stays 0 and nothing changes.

---

### 9. Landing on Vacation should cost the player their next turn

**Now:** the `free_parking` corner does nothing at all.

**Want:** landing on Vacation sets `skipTurns = 1` on that player. When the turn would come
round to a player with `skipTurns > 0`, decrement it and pass to the next player instead,
emitting `{ type: 'turn_skipped', playerId }`.

This is why `Player.skipTurns` is now in the contract. `advanceTurn` (`src/engine/debt.ts`)
currently returns state only, with no events — it will need to report the skips it performed
so its two callers (`handleEndTurn`, `settleBankruptcy`) can put them in the log.

Guard against the degenerate case: if every remaining player has `skipTurns > 0`, decrement
and land on someone rather than looping forever.

**Evidence:** `research/richup-vs-monopoly-diff.md:57` documents a per-player
`suspendedTurnsRemaining` map on richup's vacation corner and a dedicated predicate reading
it — labelled Medium confidence there, now confirmed by play.

---

### Where the three landing rules live

Issues 5, 6 and 9 are all one code site — the corner branch of `resolveLanding`:

```ts
if (tile.type === 'corner') {
  if (tile.subtype === 'go_to_jail') return sendToJail(map, state, playerId, 'tile', events);
  return finish(state, events);   // ← 5, 6 and 9 all belong here
}
```

Patch it there, **not** in `moveForwardAndResolve`. Every landing path funnels through
`resolveLanding` — `moveForwardAndResolve`, `move_to`, and both branches of `move_relative`.
The one exception is `move_to_nearest`, which jumps straight to `resolveOwnable`, and it only
ever targets airports and companies, so it can never land on START or Vacation. Patching the
mover instead of the resolver would miss every card-driven move.

**Existing tests will break, and that is correct.** `src/engine/turn.test.ts` encodes the old
prison-fee rule. Update the assertions that encode a rule this document changes, and add one
new test per new rule. Do not delete a test to make the suite green.

---

## UI

### 2. There is no reachable bankruptcy button

**Now:** `ActionBar` renders "Concede" only at the very bottom of the *current player's own
turn* branch. Three early returns fire before it — `!isMyTurn`, `RESOLVING_DEBT` when you are
not the debtor, and `!me || me.bankrupt`. Meanwhile `legalActions` returns
`declare_bankruptcy` for every non-bankrupt player in every non-terminal phase. **The engine
allows it, the UI hides it.**

**Want:** a clearly labelled bankruptcy button available to any non-bankrupt player in any
non-terminal phase, rendered outside the early returns. Label it "Bankrupt", and put a
confirmation step in front of it — it ends that player's game and is irreversible.

Do not use a `window.confirm()`: a native modal blocks the browser event loop and would break
the socket. An inline two-step ("Bankrupt" → "Are you sure?") is enough.

---

### 3. Move the log to the centre of the board and cap it

**Now:** `EventLog` lives in the left rail, renders the last 100 events, and grows without
a visible bound.

**Want:** the log moves into `board__center`, the way richup does it. Fixed height, newest
entry at the top, scrolls inside its own box, and entries past the bottom edge are clipped —
the page itself must never grow or scroll because of it.

The centre now has to hold the dice, the phase label, the log, and the vacation pot when it
is non-zero. That is one layout, one owner.

---

### 4. "drew a surprise card" does not say what the card did

**Now:** `EventLog` formats `card_drawn` as `"${name} drew a ${deck} card."` and stops. The
event carries `cardId` and `getCard(cardId)` (`src/data/cards`) returns the full text — the
client simply never looks it up.

**Want:** the log line carries the card's actual text. On top of that, show the drawn card in
the centre of the board for a few seconds so the player who drew it cannot miss it.

The card's effect already emits its own follow-up events (`paid`, `moved`, `jailed`…), so the
consequence is in the log — what is missing is the cause.

---

### 7. Dice do not animate

**Now:** `Die` in `Board.tsx` renders the final pips instantly. A roll appears as a silent
value change; with two players it is easy to miss that anything happened.

**Want:** a short tumble/settle animation on the dice when a new roll arrives, ending on the
authoritative face values from `state.lastRoll`. The animation is decoration only — it must
never be the thing that decides which face shows, and a client that joins mid-game must
render the current roll without replaying anything.

---

### 8. Player tokens are 8px and do not move visibly

**Now:** `.token` is `width: 8px; height: 8px` (`styles.css:289`), stacked in a corner of the
tile. At board scale that is nearly invisible, and a token changing tiles is an instant jump
with nothing to follow.

**Want:** a substantially bigger token carrying the player's colour and something identifying
(initial or icon), and a visible animated transition when it moves between tiles. Multiple
tokens on one tile still have to be individually distinguishable, and it has to hold up on
the 48-tile boards, not just the 40-tile one.

The `moved` event carries `from` and `to`, so the path is available if the animation wants it.

---

## Contract changes (already applied)

Landed in the main thread before any of the above, so both lanes build against the same names:

| Change | File |
|---|---|
| `Player.skipTurns: number` — turns to sit out, set by landing on Vacation | `src/shared/types.ts` |
| `RoomSettings.landOnStartBonus: number` — default `100`, paid on top of `startSalary` when landing exactly on START | `src/shared/types.ts` |
| `GameEvent` gains `{ type: 'turn_skipped'; playerId }` | `src/shared/types.ts` |
| `landOnStartBonus` added to the settings whitelist | `src/server/protocol.ts` |

New `paid` reasons — no type change needed, `reason` is a free string: `start_bonus`,
`vacation_pot`.

`createGame` must initialise `skipTurns: 0`, and every `Player` fixture in the test suites
needs the field.

## Not filed here

Carried over, still open, nobody is working them: the Home and Lobby screens are unstyled
relative to the game shell; auctions, mortgage, double-rent, trades, bots, teams and the turn
clock are all deferred to v2.
