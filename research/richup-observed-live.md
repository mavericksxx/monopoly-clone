# richup.io — Live Observation (Primary Source)

**Method:** Captured directly from https://richup.io by the orchestrating session using browser automation on
**2026-08-20**. A private room was created via the landing page's "Create a private game" button
(room URL `https://richup.io/room/oo144`), and the lobby's Game settings panel, board preview, and
DOM state were read directly.

**Confidence:** Everything in this file is **VERIFIED — observed first-hand in the live product**, unless a line
says otherwise. This file outranks any search-derived claim in the other research files. Where another file
disagrees with this one, this one wins.

**Caveat:** Observed on one date, on the **Classic** map, in a **private** room, pre-game-start. Defaults for
public/quick-play rooms were not checked, and in-game behavior (rent resolution, auctions, trades, card text)
was not observed because the game was never started with a second player.

---

## 1. Site surface

| Item | Observed value |
|---|---|
| Title tag | `Richup.io: Monopoly Alternative 🎲 - Free Online Board Game` |
| Tagline | "Rule the economy" |
| Landing CTAs | nickname textbox → **Play**; plus **All rooms**, **Create a private game** |
| Header | **Store**, **Login** (login optional — guest play by nickname works) |
| Footer links | Blog, Terms & Conditions, Privacy, Cookies |
| Disclaimer | "Richup is not responsible for content created by players." |
| Discord | `https://discord.gg/r6uJ6bq8ZH` (linked from in-room header) |
| Room URL shape | `https://richup.io/room/<5-char-id>` e.g. `/room/oo144` |

### Landing-page "How to play" copy (verbatim)
> All players start with $1500.
> On your turn, roll the dice to move forward.
> Got doubles? You'll have another turn!
> Purchase valuable properties and grow your financial empire.
> Once you own a property, other players will pay rent when they land on it.
> Own a full property set? Start building houses and hotels.
> Players will pay you a large amount of money when they land on properties with buildings.
> Build hotels to maximize income and make other players lose their money.
> Be rich. Get richer. Do not bankrupt.

---

## 2. Game settings panel — EXACT labels, types, and observed defaults

This is the authoritative toggle list. Labels and descriptions are **verbatim**. Defaults are the `aria-checked`
/ `value` attributes read from the DOM of a freshly created **private** room.

### Section: "Game settings"

| Setting | Description (verbatim) | Type | Default | Range |
|---|---|---|---|---|
| **Maximum players** | "How many players can join the game" | select | `4` | 2,3,4,5,6,7,8 |
| **Private room** | "Private rooms can be accessed using the room URL only" | toggle | **ON** | — (ON because room was created via "Create a private game") |
| **Allow bots to join** `Beta` | "Bots will join the game based on availability" | toggle | **OFF** | — |
| **Board map** | "Change map tiles, properties and stacks" | picker | `Classic` | see §4 |

### Section: "Gameplay rules"

| Setting | Description (verbatim) | Type | Default |
|---|---|---|---|
| **x2 rent on full-set properties** | "If a player owns a full property set, the base rent payment will be doubled" | toggle | **OFF** |
| **Vacation cash** | "If a player lands on Vacation, all collected money from taxes and bank payments will be earned" | toggle | **OFF** |
| **Auction** | "If someone skips purchasing the property landed on, it will be sold to the highest bidder" | toggle | **OFF** |
| **Don't collect rent while in prison** | "Rent will not be collected when landing on properties whose owners are in prison" | toggle | **OFF** |
| **Mortgage** | "Mortgage properties to earn 50% of their cost, but you won't get paid rent when players land on them" | toggle | **OFF** |
| **Even build** | "Houses and hotels must be built up and sold off evenly within a property set" | toggle | **ON** |
| **Starting cash** | "Adjust how much money players start the game with" | select | `$1500` | $500, $1000, $1500, $2000, $2500, $3000 |
| **Randomize player order** | "Randomly reorder players at the beginning of the game" | toggle | **ON** |

> ### The headline finding
> **Three rules that are mandatory in official Monopoly ship OFF by default in richup.io:**
> **`x2 rent on full-set properties`**, **`Auction`**, and **`Mortgage`**.
> A default richup game therefore has **no rent doubling on unimproved monopolies, no auction when a player
> declines to buy, and no mortgaging at all.** `Even build` is the one official restriction that is on by default.
>
> For the clone this means: the *default* rule set is deliberately simplified/faster, and full-fidelity Monopoly
> is an opt-in configuration. Model every one of these as a first-class game-config flag from day one — they are
> not cosmetic, they change the economy.

**Not present** in the settings panel (i.e. richup does NOT expose these as options — do not invent them):
turn timer, game speed, double-GO-money, snake-eyes bonus, jail-fee amount, house/hotel supply limits,
free first property, time-limited/score-based win condition, trade toggle.

### Other observed lobby strings
- `"Waiting for players..."`, `"waiting for the game to start..."`, `"Joined room oo144"`
- `"The room is full."` → offers **Spectate game** / **Return to lobby** → **spectating is supported**
- `"This room is exclusive for logged-in users"` → **Login to join** → a **logged-in-only room mode exists**
- `"Connection lost — Make sure your internet connection is stable."` → reconnect handling exists
- `"Only game players can send chat messages"` → **spectators cannot chat**
- `"Change team"` (a hidden/inactive toggle in the DOM) → **a team/2v2 mode appears to exist or is planned**
- Loading tip: `"On the computer, click CTRL anytime to find yourself on the board"`

---

## 3. Player appearance (tokens)

Chosen from a 12-swatch grid before joining; a **"Get more appearances"** link goes to `/store/player-appearance`
(cosmetic monetization). Observed default palette, in grid order:

`#C0DA5A` `#FFC73F` `#FF843F` `#C34848` `#5A99DA` `#7FE7F5` `#009688` `#73E85D` `#9A6E5E` `#C63FA2` `#FF7CA0` `#7F5ADA`

Tokens render as round blob avatars with eyes, not as Monopoly-style pewter pieces.

---

## 4. Board maps

Four maps offered in the "Board Maps" browser, each with a **Preview**:

| Map | Tier |
|---|---|
| **Classic** | Free |
| **Mr. Worldwide** | Premium |
| **Death Valley** | Premium |
| **Lucky Wheel** | Premium |

"Change map tiles, properties and stacks" — note **"stacks"**, implying the Surprise/Treasure card decks differ
per map, not just the tiles. Only Classic was inspected in detail.

---

## 5. The Classic board — all 40 tiles, VERIFIED from the in-app board preview

Read directly off the rendered board and confirmed with zoomed screenshots of all four sides.
Layout note: richup renders **START at top-left** and the board runs **clockwise**.

| # | Name | Type | Group | Price |
|---|---|---|---|---|
| 0 | START | go | — | — |
| 1 | Salvador | property | Brazil 🇧🇷 | $60 |
| 2 | Treasure | community_chest | — | — |
| 3 | Rio | property | Brazil 🇧🇷 | $60 |
| 4 | Earnings Tax | tax | — | **%10** |
| 5 | TLV Airport | airport (railroad) | airports | $200 |
| 6 | Tel Aviv | property | Israel 🇮🇱 | $100 |
| 7 | Haifa | property | Israel 🇮🇱 | $110 |
| 8 | **Surprise** | chance | — | — |
| 9 | Jerusalem | property | Israel 🇮🇱 | $120 |
| 10 | In Prison / Passing by | jail | — | — |
| 11 | Venice | property | Italy 🇮🇹 | $130 |
| 12 | Power Company | utility | utilities | $150 |
| 13 | Milan | property | Italy 🇮🇹 | $140 |
| 14 | Rome | property | Italy 🇮🇹 | $160 |
| 15 | MUC Airport | airport (railroad) | airports | $200 |
| 16 | Frankfurt | property | Germany 🇩🇪 | $180 |
| 17 | Treasure | community_chest | — | — |
| 18 | Munich | property | Germany 🇩🇪 | $190 |
| 19 | Berlin | property | Germany 🇩🇪 | $200 |
| 20 | Vacation | free_parking | — | — |
| 21 | Shenzhen | property | China 🇨🇳 | $210 |
| 22 | Surprise | chance | — | — |
| 23 | Beijing | property | China 🇨🇳 | $220 |
| 24 | Shanghai | property | China 🇨🇳 | $240 |
| 25 | CDG Airport | airport (railroad) | airports | $200 |
| 26 | Lyon | property | France 🇫🇷 | $260 |
| 27 | **Water Company** | utility | utilities | $150 |
| 28 | Toulouse | property | France 🇫🇷 | $270 |
| 29 | Paris | property | France 🇫🇷 | $280 |
| 30 | Go to prison | go_to_jail | — | — |
| 31 | Liverpool | property | UK 🇬🇧 | $290 |
| 32 | Manchester | property | UK 🇬🇧 | $300 |
| 33 | Treasure | community_chest | — | — |
| 34 | London | property | UK 🇬🇧 | $320 |
| 35 | JFK Airport | airport (railroad) | airports | $200 |
| 36 | Surprise | chance | — | — |
| 37 | San Francisco | property | USA 🇺🇸 | $360 |
| 38 | Premium Tax | tax | — | **$75** |
| 39 | New York | property | USA 🇺🇸 | $400 |

### Structural deviations from the standard Hasbro board — VERIFIED

These are real and load-bearing. Do **not** assume richup is a straight reskin of the standard board.

1. **Chance ("Surprise") sits at index 8, not 7.** Richup's first colour group after the airport is
   Tel Aviv (6) / Haifa (7) / Jerusalem (9) — the light-blues occupy 6, 7, 9 and the Chance tile is at 8.
   Standard Monopoly has Chance at 7 and light-blues at 6, 8, 9.
   → This directly changes any "Go back 3 spaces" logic and all landing-frequency maths.
2. **Water Company sits at index 27, not 28.** Richup's yellow-equivalent (France) is Lyon (26) /
   Toulouse (28) / Paris (29), with the utility wedged at 27. Standard has Water Works at 28 and the
   yellows at 26, 27, 29.
3. **Prices differ within several groups.** Richup uses strictly ascending prices inside every group,
   where Hasbro repeats a price in four of them:

   | Group | Hasbro | richup |
   |---|---|---|
   | 2nd group (light blue / Israel) | 100, 100, 120 | **100, 110, 120** |
   | 3rd group (pink / Italy) | 140, 140, 160 | **130, 140, 160** |
   | 4th group (orange / Germany) | 180, 180, 200 | **180, 190, 200** |
   | 5th group (red / China) | 220, 220, 240 | **210, 220, 240** |
   | 6th group (yellow / France) | 260, 260, 280 | **260, 270, 280** |
   | 7th group (green / UK) | 300, 300, 320 | **290, 300, 320** |
   | 8th group (blue / USA) | 350, 400 | **360, 400** |

   Only group 1 (60/60) matches Hasbro. Group 2 differs too: richup 100/**110**/120 vs Hasbro 100/100/120.
   Airports $200 and utilities $150 match.
4. **Taxes:** index 4 is "Earnings Tax" shown as **%10** (a straight 10%, with no $200 flat alternative
   offered on the tile). Index 38 is "Premium Tax" at a flat **$75** (Hasbro's modern Luxury Tax is $100;
   $75 matches older printings).
5. **Free Parking is named "Vacation"** and, with the `Vacation cash` toggle, is a first-class supported
   house rule rather than a dead square.
6. **Railroads are "Airports"** and are themed as real airport codes (TLV, MUC, CDG, JFK).

### Terminology map — VERIFIED

| Hasbro | richup.io |
|---|---|
| GO | **START** |
| Chance | **Surprise** (pink `?`) |
| Community Chest | **Treasure** (orange chest) |
| Free Parking | **Vacation** (palm-island icon) |
| Jail / Just Visiting | **In Prison / Passing by** |
| Go To Jail | **Go to prison** (skull-and-crossbones icon) |
| Railroad | **Airport** |
| Electric Company | **Power Company** |
| Water Works | **Water Company** |
| Income Tax | **Earnings Tax** |
| Luxury Tax | **Premium Tax** |
| Colour group | **property set** |

**Property naming scheme:** real-world **cities grouped by country**, each tile badged with that country's flag.
Progression by country: Brazil → Israel → Italy → Germany → China → France → UK → USA. This is how richup avoids
Hasbro's trademarked street names entirely, and it is a scheme the clone can safely adopt with *different* cities.

### NOT captured (still open)
Rent tables per property, house/hotel build costs, mortgage values, the number and text of Surprise/Treasure
cards, jail fee, and GO/START salary were **not** observable from the lobby — they require an in-progress game
with two players, or clicking individual tiles in-game. Treat any rent numbers from other research files as
**assumed-standard-Monopoly and UNCONFIRMED for richup**, especially given that base prices already deviate.

---

## 6. Technical observations — VERIFIED

| Aspect | Observation |
|---|---|
| Frontend | **TanStack Router / TanStack Start** (`window.__TSR_ROUTER__`, `__TSS_START_OPTIONS__`) |
| Validation | **Zod** (`__zod_globalConfig`, `__zod_globalRegistry`) present in the client bundle |
| Error tracking | **Sentry** (`window.__SENTRY__`) |
| Analytics | **PostHog** (`window.__RICHUP_CONFIG__.posthogKey`), plus Google Tag Manager |
| Bot protection | **Cloudflare Turnstile** (`/turnstile/v0/api.js`) |
| CDN / hosting | Cloudflare (`beacon.min.js`, Turnstile) |
| Main bundle | single ~1.16 MB JS bundle (`/index.<hash>.js`) |
| REST API | mounted at `/api/*`; confirmed live: `/api/push/public-key`, `/api/announcements`. Unknown paths return `404 {"error":"Not found"}` |
| Push | Web Push is wired up (`/api/push/public-key`) — browser notifications for your turn |
| PWA | `/icons/icon-192.png` — installable web app |
| Font | Nunito (variable weight, self-hosted) |
| Ads | AdInPlay (`api.adinplay.com`) — an `advertisement` slot sits in the left sidebar |
| Game transport | **Board/game state is NOT in the JS bundle** — the string "Salvador" does not appear anywhere in `/index.<hash>.js`. Map and rule data are served from the backend at runtime, almost certainly over a realtime socket. A `WebSocket` constructor patch installed after page load captured nothing, which is consistent with the socket being opened once during module init and held open. |

**Implication for the clone:** richup is server-authoritative. The board definition, rule config, and all game
state live on the server and stream to a thin client. Build the same way — never trust the client for dice,
money, or ownership.

---

## 7. Monetization & accounts — VERIFIED

- **Guest play works** — a nickname is enough; no signup required to create or join a room.
- **Store** exists (`/store/player-appearance`) selling **player appearances**.
- **Premium board maps** (Mr. Worldwide, Death Valley, Lucky Wheel) are paid; Classic is free.
- **Ads** are served in-page (AdInPlay).
- **Logged-in-only rooms** are a supported room mode.

---

## 8. What a follow-up live session should capture

1. Start a real 2-player game (or enable bots) and record: START salary, jail fee, per-property rent tables,
   house/hotel costs, mortgage values.
2. Photograph/transcribe the full **Surprise** and **Treasure** decks as they come up.
3. Observe auction UI (needs `Auction` toggled ON), trade UI, and the manage-property UI.
4. Test disconnect/reconnect and what happens to an AFK player — is there a turn timer at all?
5. Preview the three premium maps to see how far the tile/"stack" changes go.
6. Check whether `Maximum players` above 4 changes anything structurally.

---

## 9. ADDENDUM — Complete Classic board with exact rent tables (VERIFIED, primary source)

Captured after joining the room, by reading the **React component props of all 40 rendered board tiles**
(`block` / `city` prop: `{name, type, price, countryId, rentPrices, housePrice, hotelPrice}`) and cross-checked
against the in-app property tooltips ("when / get / with rent / with one house / … / with a hotel").
This is richup's own client state, not a transcription — it supersedes §5's price-only table and every
assumed-standard rent number elsewhere in this research set.

### richup's type vocabulary (exact strings from its own data model)

| `type` | Meaning | Count |
|---|---|---|
| `corner` | Start, Prison, Vacation, Go to prison | 4 |
| `city` | buildable property | 22 |
| `airport` | railroad equivalent | 4 |
| `company` | utility equivalent | 2 |
| `bonus` | Treasure, Surprise, and **both taxes** | 8 |

Note that **taxes are typed `bonus`**, the same type as the card tiles — richup does not model tax as its own
tile type. Colour groups are `countryId` strings: `brazil`, `israel`, `italy`, `germany`, `china`, `france`,
`united-kingdom`, `united-states-of-america`.

Rent levels are keyed `0`–`5`: `0` = base rent (unimproved), `1`–`4` = 1–4 houses, `5` = hotel.
`housePrice === hotelPrice` for every property, i.e. the hotel is level 5 and costs one more house-increment
on top of four houses — same shape as Hasbro.

### Full board

| # | Name | Type | Country | Price | Rent | 1H | 2H | 3H | 4H | Hotel | House/Hotel cost |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Start | corner | — | — | — | — | — | — | — | — | — |
| 1 | Salvador | city | brazil | 60 | 2 | 10 | 30 | 90 | 150 | 240 | 50 |
| 2 | Treasure | bonus | — | — | — | — | — | — | — | — | — |
| 3 | Rio | city | brazil | 60 | 4 | 20 | 60 | 190 | 330 | 460 | 50 |
| 4 | Earnings Tax | bonus | — | 10% | — | — | — | — | — | — | — |
| 5 | TLV Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 6 | Tel Aviv | city | israel | 100 | 6 | 30 | 90 | 260 | 380 | 540 | 50 |
| 7 | Haifa | city | israel | 110 | 6 | 30 | 90 | 280 | 400 | 560 | 50 |
| 8 | Surprise | bonus | — | — | — | — | — | — | — | — | — |
| 9 | Jerusalem | city | israel | 120 | 8 | 40 | 110 | 300 | 460 | 610 | 50 |
| 10 | Prison | corner | — | — | — | — | — | — | — | — | — |
| 11 | Venice | city | italy | 130 | 10 | 50 | 140 | 440 | 600 | 740 | 100 |
| 12 | Power Company | company | — | 150 | multiplier — see below | | | | | | — |
| 13 | Milan | city | italy | 140 | 10 | 50 | 160 | 460 | 630 | 760 | 100 |
| 14 | Rome | city | italy | 160 | 12 | 60 | 180 | 500 | 700 | 900 | 100 |
| 15 | MUC Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 16 | Frankfurt | city | germany | 180 | 14 | 70 | 190 | 540 | 760 | 950 | 100 |
| 17 | Treasure | bonus | — | — | — | — | — | — | — | — | — |
| 18 | Munich | city | germany | 190 | 15 | 70 | 210 | 560 | 760 | 960 | 100 |
| 19 | Berlin | city | germany | 200 | 15 | 80 | 220 | 600 | 780 | 1000 | 100 |
| 20 | Vacation | corner | — | — | — | — | — | — | — | — | — |
| 21 | Shenzhen | city | china | 210 | 18 | 90 | 240 | 680 | 850 | 1000 | 150 |
| 22 | Surprise | bonus | — | — | — | — | — | — | — | — | — |
| 23 | Beijing | city | china | 220 | 20 | 90 | 260 | 710 | 900 | 1100 | 150 |
| 24 | Shanghai | city | china | 240 | 20 | 100 | 290 | 740 | 920 | 1100 | 150 |
| 25 | CDG Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 26 | Lyon | city | france | 260 | 20 | 100 | 320 | 800 | 950 | 1100 | 150 |
| 27 | Water Company | company | — | 150 | multiplier — see below | | | | | | — |
| 28 | Toulouse | city | france | 270 | 20 | 120 | 350 | 825 | 1000 | 1150 | 150 |
| 29 | Paris | city | france | 280 | 25 | 120 | 350 | 850 | 1000 | 1200 | 150 |
| 30 | Go to prison | corner | — | — | — | — | — | — | — | — | — |
| 31 | Liverpool | city | united-kingdom | 290 | 25 | 120 | 380 | 850 | 1050 | 1250 | 200 |
| 32 | Manchester | city | united-kingdom | 300 | 26 | 140 | 400 | 950 | 1150 | 1300 | 200 |
| 33 | Treasure | bonus | — | — | — | — | — | — | — | — | — |
| 34 | London | city | united-kingdom | 320 | 30 | 140 | 440 | 1000 | 1200 | 1400 | 200 |
| 35 | JFK Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 36 | Surprise | bonus | — | — | — | — | — | — | — | — | — |
| 37 | San Francisco | city | usa | 360 | 35 | 180 | 550 | 1150 | 1350 | 1525 | 200 |
| 38 | Premium Tax | bonus | — | $75 | — | — | — | — | — | — | — |
| 39 | New York | city | usa | 400 | 50 | 200 | 600 | 1400 | 1700 | 2000 | 200 |

**Airport rent is a flat table `[25, 50, 100, 200]` indexed by how many airports the owner holds** — identical
to Hasbro's railroad ladder.

**Utilities carry no `rentPrices` array at all** — only `price: 150`. Their rent is therefore computed by a
server-side multiplier rule that is not present in client state. The exact multipliers (Hasbro uses 4× the dice
roll for one utility, 10× for both) are **UNVERIFIED for richup**.

### Copy-pasteable JSON

```json
[
  {"index":0,"name":"Start","type":"corner"},
  {"index":1,"name":"Salvador","type":"city","country":"brazil","price":60,"rents":[2,10,30,90,150,240],"house_price":50,"hotel_price":50},
  {"index":2,"name":"Treasure","type":"bonus","subtype":"treasure_card"},
  {"index":3,"name":"Rio","type":"city","country":"brazil","price":60,"rents":[4,20,60,190,330,460],"house_price":50,"hotel_price":50},
  {"index":4,"name":"Earnings Tax","type":"bonus","subtype":"tax","tax_percent":10},
  {"index":5,"name":"TLV Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":6,"name":"Tel Aviv","type":"city","country":"israel","price":100,"rents":[6,30,90,260,380,540],"house_price":50,"hotel_price":50},
  {"index":7,"name":"Haifa","type":"city","country":"israel","price":110,"rents":[6,30,90,280,400,560],"house_price":50,"hotel_price":50},
  {"index":8,"name":"Surprise","type":"bonus","subtype":"surprise_card"},
  {"index":9,"name":"Jerusalem","type":"city","country":"israel","price":120,"rents":[8,40,110,300,460,610],"house_price":50,"hotel_price":50},
  {"index":10,"name":"Prison","type":"corner","subtype":"jail"},
  {"index":11,"name":"Venice","type":"city","country":"italy","price":130,"rents":[10,50,140,440,600,740],"house_price":100,"hotel_price":100},
  {"index":12,"name":"Power Company","type":"company","price":150,"rents":null},
  {"index":13,"name":"Milan","type":"city","country":"italy","price":140,"rents":[10,50,160,460,630,760],"house_price":100,"hotel_price":100},
  {"index":14,"name":"Rome","type":"city","country":"italy","price":160,"rents":[12,60,180,500,700,900],"house_price":100,"hotel_price":100},
  {"index":15,"name":"MUC Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":16,"name":"Frankfurt","type":"city","country":"germany","price":180,"rents":[14,70,190,540,760,950],"house_price":100,"hotel_price":100},
  {"index":17,"name":"Treasure","type":"bonus","subtype":"treasure_card"},
  {"index":18,"name":"Munich","type":"city","country":"germany","price":190,"rents":[15,70,210,560,760,960],"house_price":100,"hotel_price":100},
  {"index":19,"name":"Berlin","type":"city","country":"germany","price":200,"rents":[15,80,220,600,780,1000],"house_price":100,"hotel_price":100},
  {"index":20,"name":"Vacation","type":"corner","subtype":"free_parking"},
  {"index":21,"name":"Shenzhen","type":"city","country":"china","price":210,"rents":[18,90,240,680,850,1000],"house_price":150,"hotel_price":150},
  {"index":22,"name":"Surprise","type":"bonus","subtype":"surprise_card"},
  {"index":23,"name":"Beijing","type":"city","country":"china","price":220,"rents":[20,90,260,710,900,1100],"house_price":150,"hotel_price":150},
  {"index":24,"name":"Shanghai","type":"city","country":"china","price":240,"rents":[20,100,290,740,920,1100],"house_price":150,"hotel_price":150},
  {"index":25,"name":"CDG Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":26,"name":"Lyon","type":"city","country":"france","price":260,"rents":[20,100,320,800,950,1100],"house_price":150,"hotel_price":150},
  {"index":27,"name":"Water Company","type":"company","price":150,"rents":null},
  {"index":28,"name":"Toulouse","type":"city","country":"france","price":270,"rents":[20,120,350,825,1000,1150],"house_price":150,"hotel_price":150},
  {"index":29,"name":"Paris","type":"city","country":"france","price":280,"rents":[25,120,350,850,1000,1200],"house_price":150,"hotel_price":150},
  {"index":30,"name":"Go to prison","type":"corner","subtype":"go_to_jail"},
  {"index":31,"name":"Liverpool","type":"city","country":"united-kingdom","price":290,"rents":[25,120,380,850,1050,1250],"house_price":200,"hotel_price":200},
  {"index":32,"name":"Manchester","type":"city","country":"united-kingdom","price":300,"rents":[26,140,400,950,1150,1300],"house_price":200,"hotel_price":200},
  {"index":33,"name":"Treasure","type":"bonus","subtype":"treasure_card"},
  {"index":34,"name":"London","type":"city","country":"united-kingdom","price":320,"rents":[30,140,440,1000,1200,1400],"house_price":200,"hotel_price":200},
  {"index":35,"name":"JFK Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":36,"name":"Surprise","type":"bonus","subtype":"surprise_card"},
  {"index":37,"name":"San Francisco","type":"city","country":"united-states-of-america","price":360,"rents":[35,180,550,1150,1350,1525],"house_price":200,"hotel_price":200},
  {"index":38,"name":"Premium Tax","type":"bonus","subtype":"tax","tax_amount":75},
  {"index":39,"name":"New York","type":"city","country":"united-states-of-america","price":400,"rents":[50,200,600,1400,1700,2000],"house_price":200,"hotel_price":200}
]
```

### How richup's economy differs from Hasbro's — now quantified

richup's rents are **not** Hasbro's numbers with new names. Every group was re-tuned. Representative comparisons:

| Property (richup / Hasbro equivalent) | richup rents | Hasbro rents |
|---|---|---|
| Rio / Baltic Ave | 4, 20, 60, **190, 330, 460** | 4, 20, 60, 180, 320, 450 |
| Tel Aviv / Oriental Ave | 6, 30, 90, **260, 380, 540** | 6, 30, 90, 270, 400, 550 |
| Haifa / Vermont Ave | 6, 30, 90, **280, 400, 560** | 6, 30, 90, 270, 400, 550 |
| Jerusalem / Connecticut Ave | 8, 40, 110, **300, 460, 610** | 8, 40, 100, 300, 450, 600 |
| Venice / St. Charles Pl | **10, 50, 140, 440, 600, 740** | 10, 50, 150, 450, 625, 750 |
| Munich / Tennessee Ave | **15, 70, 210, 560, 760, 960** | 14, 70, 200, 550, 750, 950 |
| Shenzhen / Kentucky Ave | **18, 90, 240, 680, 850, 1000** | 18, 90, 250, 700, 875, 1050 |
| San Francisco / Park Place | **35, 180, 550, 1150, 1350, 1525** | 35, 175, 500, 1100, 1300, 1500 |
| New York / Boardwalk | 50, 200, 600, **1400, 1700, 2000** | 50, 200, 600, 1400, 1700, 2000 |

Only Boardwalk's ladder survives unchanged. Everything else is nudged, and the direction is inconsistent
(some up, some down), which is consistent with a deliberate rebalance rather than a transcription drift.

**Take-away for the clone:** do not seed your database from a Monopoly rent table and rename the tiles.
richup's board is its own balance pass on top of a Hasbro-shaped skeleton. Either use the numbers above
(they are richup's, and copying a *rent table* is far safer ground than copying names or card text) or do
your own pass — but pick one deliberately.

---

## 10. Negative evidence — three constants that are NOT recoverable from the client

Both shipped bundles (`index.BAOd0zsy.js`, 1.16 MB; `assets/GamePageContent-DcbcEFrO.js`, 769 KB) were
downloaded and grepped for every plausible identifier. Results:

| Searched for | Hits |
|---|---|
| `passStart`, `startBonus`, `goMoney`, `salary` | **0** (the one `salary` hit is a word in a nickname-generator list) |
| `prisonFee`, `payToLeave`, `bail` | **0** (the `bail` hits are Sentry's "bailing to window.fetch") |
| `multiplier`, `diceMultiplier`, `companyRent`, `rentMultiplier` | **0** |

So richup's **START salary**, **prison-release fee**, and **company (utility) rent multipliers** are all
server-side and cannot be recovered without playing a live game to the point where each fires. They are
genuine gaps, not oversights — do not let any file state a value for them.

Two identifiers that *are* present and are worth knowing:
- **`prisonBlockIndex`** — the jail tile index is a per-map value, not a hardcoded 10. Model it as map data.
- **`prisonVisits`** — per-player stat tracking, i.e. richup records jail visits for the end-game stats screen.
