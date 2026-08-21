# Richup.io — Rule Set and Configurable Game Settings

**Researched:** 2026-08-20. **Lane:** richup.io's own rules and settings (not generic Monopoly).

## Tag key
- `[RICHUP-DEFAULT]` — richup's out-of-the-box behavior.
- `[RICHUP-TOGGLE]` — a user-configurable room option.
- `[OFFICIAL]` — matches the Hasbro/standard rule.
- `UNVERIFIED` — no source; treat as guesswork.

## How this was obtained (read this first)

richup.io is a client-rendered SPA. Plain fetches of its routes return the app shell, so
route-level scraping produced almost nothing (`/how-to-play` → **HTTP 404**; `/info` →
returned the generic SPA shell with no rules text). Searching the open web for richup
settings returned only low-quality game-portal reblogs with no specifics.

**The real source is richup.io's own JavaScript bundle**, which contains the room-settings
defaults object and its validation schema as literal values. Everything in Section A marked
with a bundle citation is read directly out of shipped code, not inferred and not recalled.
This is the strongest possible source short of opening the UI.

> **Bundle URLs are content-hashed and will 404 after richup's next deploy.** To re-verify,
> re-fetch `https://richup.io/` and read the `<link rel="modulepreload">` tags in `<head>`
> for the current hashes.

---

## A. Game creation / room settings

### A.1 The defaults object (verbatim from the bundle)

Source: `https://richup.io/index.BAOd0zsy.js` (fetched 2026-08-20), minified identifier `sEe`:

```js
{ maxPlayers: 4, canBotsJoin: true, isPrivate: false, onlyUsers: false,
  payDoubleRentWhenOwnFullSet: false, vacationCash: false, auction: false,
  noRentPaymentsWhileInPrison: false, mortgage: false, startingCash: 1500,
  evenBuild: true, shufflePlayerOrder: true, teams: { enabled: false } }
```

Adjacent allowed-value tables in the same file:

```js
const Xme = [2,3,4,5,6];                        // base maxPlayers
const Jme = [...Xme, ...Yme];                   // + map-gated extras
const t2e = [500,1e3,1500,2e3,2500,3e3];        // allowed startingCash (exponent
const r2e = 1500;                               // notation as shipped; = 1000/2000/3000
```

### A.2 The full settings table

Every row's key, type, and default is from the bundle above. The **Label** column is the
internal key unless a UI string was actually found — I did **not** invent display labels.

| Key | Type | Default | Allowed values | Mechanical effect | Tag |
|---|---|---|---|---|---|
| `startingCash` | enum(number) | `1500` | 500, 1000, 1500, 2000, 2500, 3000 | Cash each player begins with. **Double-sourced:** the constant `r2e=1500` in the main bundle *and* the shipped UI string "All players start with $1500." in the Lobby chunk. Strongest single claim in this file. | `[RICHUP-TOGGLE]`, default `[OFFICIAL]` |
| `maxPlayers` | enum(number) | `4` | 2–6; 7 and 8 only on a specific map (see A.4) | Player-slot cap. | `[RICHUP-TOGGLE]` |
| `isPrivate` | boolean | `false` | true/false | Private room joinable by link instead of listed publicly. | `[RICHUP-TOGGLE]` |
| `canBotsJoin` | boolean | `true` | true/false | Whether bots may fill the room. **Bots are on by default.** | `[RICHUP-TOGGLE]` |
| `onlyUsers` | boolean | `false` | true/false | Restricts the room to logged-in accounts (excludes guests). *Effect is inferred from the key name plus a `participant-account-linked` event — the name is verified, the exact semantics are not.* | `[RICHUP-TOGGLE]` |
| `shufflePlayerOrder` | boolean | `true` | true/false | Randomizes turn order. **On by default.** | `[RICHUP-TOGGLE]` |
| `evenBuild` | boolean | `true` | true/false | Enforces even building across a color set. **On by default**, matching the standard rule. | `[RICHUP-TOGGLE]`, default `[OFFICIAL]` |
| `auction` | boolean | `false` | true/false | Auction a property when the player who lands on it declines to buy. **OFF by default — a deliberate deviation from the official rule, where auctions are mandatory.** | `[RICHUP-TOGGLE]` |
| `mortgage` | boolean | `false` | true/false | Enables mortgaging. **OFF by default** — another deviation; mortgaging is standard in the official game. | `[RICHUP-TOGGLE]` |
| `payDoubleRentWhenOwnFullSet` | boolean | `false` | true/false | Double rent on unimproved properties in a complete color set. **OFF by default** — deviation; this is the official rule. | `[RICHUP-TOGGLE]` |
| `vacationCash` | boolean | `false` | true/false | The Free-Parking-style pot: collected money accumulates and is paid to whoever lands on Vacation. **OFF by default.** This is a house rule, not an official one. | `[RICHUP-TOGGLE]` |
| `noRentPaymentsWhileInPrison` | boolean | `false` | true/false | A jailed owner collects no rent. **OFF by default.** UI label confirmed verbatim as **"Don't collect rent while in prison"**. House rule, not official. | `[RICHUP-TOGGLE]` |
| `teams` | object | `{enabled:false}` | `{enabled:false}` or `{enabled:true, balanceStartCash:boolean}` | Team play; `balanceStartCash` evens starting cash across teams. Default team count is 2. | `[RICHUP-TOGGLE]` |
| `mapId` | string | *not present in defaults* | `"classic"` + owned/unlocked map ids | Selects the board. Default is **UNVERIFIED** (see A.4). | `[RICHUP-TOGGLE]` |

### A.3 Settings that do not exist AS ROOM SETTINGS — sourced negative

> **Scope of this refutation:** these are refuted as *room-level configuration*, i.e. keys the
> `update-game-room` payload will accept. That is a real, sourced negative for the settings
> panel. It is not a claim that the underlying mechanic is absent everywhere in the product.

The room-update schema in the same bundle is:

```js
jt({ isPrivate, maxPlayers, canBotsJoin, onlyUsers, shufflePlayerOrder, startingCash,
     auction, evenBuild, payDoubleRentWhenOwnFullSet, noRentPaymentsWhileInPrison,
     mortgage, vacationCash, teams, mapId }).strict();
```

`.strict()` is Zod's reject-unknown-keys mode. The server therefore accepts **exactly these
14 keys and nothing else**. That makes the following a refutation, not merely a failure to find:

- **Turn timer / time limit** — not a room setting. `[RICHUP-DEFAULT]`
- **Bot difficulty levels** — do not exist. Bots are one boolean. `[RICHUP-DEFAULT]`
- **Allow deals / trades toggle** — no such key, so trading is not host-configurable. That
  trading *exists* is evidenced separately by a loading tip ("trade with other players before
  you sell properties"), not by the schema. `[RICHUP-DEFAULT]`
- **House / hotel supply limits** — not configurable. `[RICHUP-DEFAULT]`
- **Game speed** — not a setting. (Checked: the `speedy` tokens in the Lobby chunk are the
  Emotion CSS-in-JS `isSpeedy` stylesheet flag, unrelated to gameplay.) `[RICHUP-DEFAULT]`
- **Start-in-jail** — not a setting. `[RICHUP-DEFAULT]`
- **Tiered / multi-level double-rent variants** — only the single boolean exists. `[RICHUP-DEFAULT]`

**Design takeaway:** richup ships with `evenBuild` and `shufflePlayerOrder` as the *only*
two booleans defaulting to true. Auction, mortgage, double-rent, vacation cash, and
no-rent-in-prison are **all off out of the box**. A default richup game is markedly simpler
and faster than an official game — no auctions, no mortgages, no monopoly rent bonus.

### A.4 Maps

From the bundle:

```js
const Hme = { "6289420d8e44343ae5eb4b22":"mr-worldwide",
              "62cb385f36cbccd7e0fbd3c1":"death-valley",
              "62cc5d0636cbccd7e0fbd3c2":"lucky-wheel" };
const Gme = ["classic"];
const Zme = Object.values(Hme);
const Vme = [...Gme, ...Zme];          // full valid mapId set
const xN  = { "6276ab519dd516c1aec96ae1": [7,8] };   // map-gated extra player slots
```

- Four board maps exist: **classic, mr-worldwide, death-valley, lucky-wheel**. `[RICHUP-TOGGLE]`
- The store chunk has a **`board-maps`** category, so non-classic maps are **purchasable
  items**, not free toggles. `[RICHUP-TOGGLE]`
- The 7–8 player slots are unlocked by owning one specific map whose ObjectID
  (`6276ab519dd516c1aec96ae1`) is **not** among the three named above. I grepped all three
  downloaded bundles: it appears **exactly once, only in `xN`**, and never in the store
  chunk. So which map it is cannot be resolved from the client. Unresolved.
- The default `mapId` is absent from the defaults object; `classic` being the default is a
  reasonable inference from `Gme` being listed separately, but is **UNVERIFIED**.

---

## B. Mechanical deviations and naming

All from `index.BAOd0zsy.js` type guards and constants:

- Card decks are named **`["treasure","surprise"]`** — confirming *treasure* = Community
  Chest and *surprise* = Chance. `[RICHUP-DEFAULT]`
- Corner types are **`prison`**, **`vacation`**, **`go-to-prison`** — so Jail is "prison"
  and Free Parking is "vacation". `[RICHUP-DEFAULT]`
- Property block types are **`city`**, **`airport`**, **`company`**, **`bonus`** — i.e.
  railroads are *airports* and utilities are *companies*. `[RICHUP-DEFAULT]`
- Currency in-game is plain **`$`**, as in the standard game (a loading tip references
  "Starting Cash to 500$"). `[OFFICIAL]`
- Board geometry is data-driven: a `boardConfig` carries `prisonBlockIndex` and
  `vacationBlockIndex` rather than hardcoded positions — which is why multiple maps work. `[RICHUP-DEFAULT]`
- **Votekick** exists (not an official mechanic): threshold is
  `Math.ceil((humanPlayerCount + 1) / 2)` votes. Bots are excluded from the count. `[RICHUP-DEFAULT]`
- **Chess-clock time system**, not a per-turn timer: events `grant-clock-time`,
  `request-clock-time`, `clock-time-requested`, `clock-time-granted`. A player can *ask*
  opponents for more time and they grant it. Actual durations are **UNVERIFIED**. `[RICHUP-DEFAULT]`
- Other room events: `host-kick-player`, `mute-player`, `do-bankrupt` (declare bankruptcy),
  `room-restart`, `update-player-appearance`. `[RICHUP-DEFAULT]`

---

## C. Bots

- Bots are controlled by a single boolean `canBotsJoin`, **default true**. `[RICHUP-TOGGLE]`
- **No bot-difficulty setting exists at the room level** — `update-game-room` is `.strict()`
  and accepts no difficulty key. `[RICHUP-DEFAULT]`
- **However, this does not rule out bot tiering.** The `join-game` payload is a *different*
  schema: `jt({name, bot: Ct().optional(), captchaToken})`. `bot` is an optional **string**,
  and its accepted values are **UNVERIFIED** — it could be a bot name, a persona id, or a
  difficulty tier. Do not conclude from this file that bots are untiered. `[RICHUP-DEFAULT]`
- Participants carry `isBot`; bots are excluded from the votekick quorum. `[RICHUP-DEFAULT]`
- A loading tip says "Ramp up your skills by practicing with bots", positioning them as
  practice opponents. `[RICHUP-DEFAULT]`
- **Whether bots trade, bid in auctions, or build is UNVERIFIED.** Bot AI runs server-side;
  none of its logic is in the client bundle. This must be determined by observation.

---

## D. Economy / meta

All from `store-wPYSxZ2J.js` and `index.BAOd0zsy.js`:

- **Accounts:** optional. The game is playable as a guest ("No sign up or download is
  required" — richup.io meta description). Login unlocks purchases and coin collection. `[RICHUP-DEFAULT]`
- **Currency: "Richup Coins"** — a soft currency. Tip string: "Sign in to collect coins and
  enhance your experience". Strings include "You don't have enough Coins." and "Login to
  purchase more coins." `[RICHUP-DEFAULT]`
- **Store categories: `board-maps` and `player-appearance`** — boards and cosmetics. `[RICHUP-DEFAULT]`
- **Real-money monetization:** PayPal SDK plus Braintree credit-card fields ("Pay with
  Credit Card", "To complete the purchase, pay $"). There is a Refund Policy page. `[RICHUP-DEFAULT]`
- **Ads:** two ad networks initialize on load — AdinPlay
  (`api.adinplay.com/libs/aiptag/pub/MNN/richup.io/tag.min.js`) and vlitag
  (`services.vlitag.com`). Ad-loading is wired into the game-loading overlay. `[RICHUP-DEFAULT]`
- **Leaderboard:** a `LeaderboardGraph` chunk ships, so leaderboards/stats exist. Their
  contents are **UNVERIFIED**. `[RICHUP-DEFAULT]`
- **Community:** official **Discord** is the main channel (multiple tips reference it for
  tournaments, strategy, and update announcements). `[RICHUP-DEFAULT]`
- **Moderation:** ban system with expiry ("You are banned from Richup.io", "Your ban will be
  lifted on"), Cloudflare **Turnstile** captcha on join, and a maintenance mode. `[RICHUP-DEFAULT]`
- **Analytics:** Google Tag Manager (`GTM-KD6CN2M`), PostHog, Sentry. `[RICHUP-DEFAULT]`
- **Localization:** a language switcher exists (German unit strings — "Sekunden",
  "Minuten", "Stunden" — are bundled), so richup is multi-language. `[RICHUP-DEFAULT]`
- **Teams mode** exists as a first-class feature with emoji-named default teams (Lion, Tiger,
  Bear, Panda, Fox, Wolf, Raccoon, ...). `[RICHUP-TOGGLE]`

---

## E. Sources

| URL | Fetched | Value |
|---|---|---|
| `https://richup.io/` | 2026-08-20 | HTTP 200. SPA shell; gave the meta description, nav links, and — critically — the `modulepreload` tags naming the JS bundles. |
| `https://richup.io/index.BAOd0zsy.js` | 2026-08-20 | **The single most valuable source.** 1.16 MB main bundle containing the defaults object, allowed-value tables, the strict room-update schema, block/corner type constants, map ids, and event names. Hash will change on redeploy. |
| `https://richup.io/assets/Lobby-D0IgtVfX.js` | 2026-08-20 | 82 KB. Landing-lobby copy (starting cash $1500, basic how-to-play text, Discord links). Did **not** contain the settings panel. |
| `https://richup.io/assets/store-wPYSxZ2J.js` | 2026-08-20 | 22 KB. Confirmed "Richup Coins", `board-maps` / `player-appearance` categories, PayPal + Braintree. |
| `https://richup.io/app-config.js` | 2026-08-20 | HTTP 200 but near-empty — only a PostHog key. No feature flags. |
| `https://richup.io/info` | 2026-08-20 | SPA shell only. Yielded the "independent work, not affiliated with any third-party trademark holder" disclaimer and nothing else. |
| `https://richup.io/how-to-play` | 2026-08-20 | **HTTP 404.** The route in the nav does not resolve to a server-rendered page. |
| `https://richup.io/assets/index-BliZ6Xms.js` | 2026-08-20 | 1 KB stub. No value. |
| Web search (game-portal reblogs: bubbleshooter.net, gamevgames, rocketgames, seeles.ai, etc.) | 2026-08-20 | **No value.** Generic SEO reblogs with zero settings specifics. Confirms the task's premise that richup is poorly covered by search. |

**Not reached:** the live "Create game" UI, the public rooms API, richup's blog/changelog,
Discord announcements, GitHub reverse-engineered clients. GitHub was not searched for
richup API clients — the bundle proved a better primary source and made it unnecessary for
the settings list, but a clone repo could still corroborate server-side bot behavior.

---

## F. Confidence assessment

### Solid — read verbatim from shipped code, safe to build against
- The **complete settings list, every key name, every default value**, and the allowed-value
  tables for `startingCash` and `maxPlayers` (A.1, A.2).
- The **closed set of 14 settings** and therefore the refutations in A.3. The `.strict()`
  schema makes this a genuine negative result, not an absence of evidence.
- **Naming**: treasure/surprise, prison/vacation/go-to-prison, city/airport/company/bonus.
- The four map names, and that maps are store items.
- The votekick quorum formula.
- Store currency, categories, payment providers, ad networks.

### Inference — clearly labeled, verify before relying on
- `onlyUsers` meaning "registered accounts only". Key name is verified; semantics are inferred.
- `classic` being the default `mapId`. Not in the defaults object.
- **Which map grants 7–8 players.** The ObjectID `6276ab519dd516c1aec96ae1` is not among the
  three named maps. It may be an unlisted or promotional map. Unresolved.
- The constant `iEe = 10`, sitting immediately after the defaults object, is **unexplained**.
  I deliberately did not guess what it caps.
- **I observed the `update-game-room` payload, not a room-*creation* payload.** No
  `create-room` socket event appeared in the bundle; creation is likely a REST call I did not
  reach. `sEe` carrying 13 of the same 14 keys makes the enumeration near-certain for
  creation too, but it was not directly observed.

### Genuinely unknown — do not build on these
- **Bot AI behavior**: trading, auction bidding, building strategy. Server-side, invisible
  to the client bundle. This is the biggest gap in the file.
- **The accepted values of the `bot` string on `join-game`** — possibly a hidden difficulty
  or persona system.
- **Clock-time durations** — the mechanism is confirmed, the numbers are not.
- Leaderboard contents, XP/levels, friends system, stats detail.
- The exact **display labels** in the Create-game panel. Only one was recoverable verbatim
  ("Don't collect rent while in prison"). The rest of the table uses internal keys by design.

### What a human should verify by clicking "Create game"
1. The **display label and helper text for each of the 14 settings** — needed for UI parity.
2. Whether **all settings are host-only** and whether any are locked after the game starts.
3. The **default map** and which map unlocks 7–8 players.
4. **Bot behavior** across a full game: do they auction, trade, mortgage, build evenly? And
   whether adding a bot offers any name/persona/difficulty choice (the `bot` string).
5. Whether the settings panel exposes anything the schema rejects (i.e. client-only UI).
6. The clock-time budget shown on screen.
