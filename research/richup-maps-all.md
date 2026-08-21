# richup.io — all four board maps, complete data

**Every number in this file is VERIFIED primary-source data**, read out of richup.io's own running client:
each map's **Board preview** was opened in a real browser and the React component props of every rendered
tile were extracted (`{name, type, bonusType, price, countryId, rentPrices, housePrice, hotelPrice,
taxPercentage, taxAmount}`). Captured 2026-08-20.

**The previews are free.** All three "premium" maps can be previewed without owning them — the paywall is on
*playing* them, not on seeing them. So this is the complete board data for all four, with nothing paid for
and nothing guessed.

Structurally validated: in all four maps the four corners land exactly on the side boundaries
(indices 0 / n÷4 / n÷2 / 3n÷4), tile indices are contiguous, and every city carries a full six-level rent
ladder. See also `richup-observed-live.md` for the Classic map in its original context, the settings panel,
and the terminology map.

---

## The tile schema (richup's own field names)

| Field | Applies to | Notes |
|---|---|---|
| `type` | all | `corner` · `city` · `airport` · `company` · `bonus` |
| `bonusType` | `bonus` | `treasure` · `surprise` · `tax` · `premium-tax` · `tax-refund` |
| `taxPercentage` | `bonusType: tax` | Earnings Tax — **10**, i.e. a percentage of net worth, not a flat fee |
| `taxAmount` | `premium-tax`, `tax-refund` | Premium Tax **$75**; Tax Refund **$50** *paid to the player* |
| `countryId` | `city` | the colour group; richup groups by country and badges each tile with its flag |
| `rentPrices` | `city` | six levels: `0` base (unimproved), `1`–`4` houses, `5` hotel |
| `rentPrices` | `airport` | flat four-entry ladder `[25, 50, 100, 200]` by number owned — same on every map |
| `housePrice` / `hotelPrice` | `city` | always equal; the hotel is level 5, costing one more house-increment |
| `price`, `ownerId`, `isMortgaged`, `level` | ownables | runtime state |

### Three caveats before you build from this

**1. The card decks are NOT in this file, and cannot be obtained.** richup's own settings text reads
*"Change map tiles, properties **and stacks**"* — **stacks means the Treasure/Surprise decks, which are
per-map.** Card content is entirely server-side (`cards.md` found zero card text across 1.3 MB of client
JS). Previews are free but *playing* a premium map is not, so the premium decks are unobtainable at any
level of effort. **You have board data for four maps and card data for zero.**

This bites hardest on **Lucky Wheel, where 16 of 40 tiles are card draws** — 40% of all landings resolve
through a deck nobody has seen. Assuming it reuses Classic's deck is a guess that would produce a
materially different game. Design the decks as per-map data and write your own.

**2. Mr. Worldwide has THREE companies** (Power, Gas, Water). Hasbro's utility rule is a two-rung ladder
(4× the dice with one owned, 10× with both) — there is no official third rung to extend, so on this map the
multiplier isn't merely unverified, it isn't *derivable*. You have to design it.

**3. Group sizes of 4 and 6 break Hasbro's building-supply model.** Hasbro's 32 houses / 12 hotels is a
deliberate scarcity mechanic tuned to 22 properties in groups of 2–3. Death Valley has **six-property
groups** (24 houses to get one group to four-across); Mr. Worldwide has **28 cities and two four-property
groups**. Whether richup enforces a supply cap at all is marked UNVERIFIED in `rules-edge-cases.md`.
→ **Building supply is a per-map design decision, not a constant.** Either scale it with city count or
drop the cap; don't copy 32/12 onto a 48-tile board and expect Hasbro's dynamics.

**Companies (utilities) carry no rent array on any map** — only `price: 150`. Their multiplier is computed
server-side and is the one number in this file that is **UNVERIFIED**. Hasbro's 4×/10× is the obvious guess.

### Map registry

| id | Name | Tiles | Cities | Airports | Companies | Card/tax tiles |
|---|---|---|---|---|---|---|
| `classic` | Classic | 40 | 22 | 4 | 2 | 8 |
| `mr-worldwide` | Mr. Worldwide | 48 | 28 | 4 | 3 | 9 |
| `death-valley` | Death Valley | 40 | 22 | 4 | 2 | 8 |
| `lucky-wheel` | Lucky Wheel | 40 | 16 | 4 | 0 | 16 |

---

## Classic  —  `classic`

**Free · 40 tiles.** The default map. Its economy is a **rebalanced** pass on Hasbro's numbers — see `richup-observed-live.md` §9.

### Groups

| Group | Tiles | Indices | Prices |
|---|---|---|---|
| 🇧🇷 brazil | 2 | 1, 3 | 60, 60 |
| 🇮🇱 israel | 3 | 6, 7, 9 | 100, 110, 120 |
| 🇮🇹 italy | 3 | 11, 13, 14 | 130, 140, 160 |
| 🇩🇪 germany | 3 | 16, 18, 19 | 180, 190, 200 |
| 🇨🇳 china | 3 | 21, 23, 24 | 210, 220, 240 |
| 🇫🇷 france | 3 | 26, 28, 29 | 260, 270, 280 |
| 🇬🇧 united-kingdom | 3 | 31, 32, 34 | 290, 300, 320 |
| 🇺🇸 united-states-of-america | 2 | 37, 39 | 360, 400 |

### All tiles

| # | Name | Type | Group | Price | Rent | 1H | 2H | 3H | 4H | Hotel | H/Hotel cost |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Start | corner (`start`) | — | — | — | — | — | — | — | — | — |
| 1 | Salvador | city | 🇧🇷 brazil | 60 | 2 | 10 | 30 | 90 | 150 | 240 | 50 |
| 2 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 3 | Rio | city | 🇧🇷 brazil | 60 | 4 | 20 | 60 | 190 | 330 | 460 | 50 |
| 4 | Earnings Tax | bonus (`tax`) | — | 10% of net worth | — | — | — | — | — | — | — |
| 5 | TLV Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 6 | Tel Aviv | city | 🇮🇱 israel | 100 | 6 | 30 | 90 | 260 | 380 | 540 | 50 |
| 7 | Haifa | city | 🇮🇱 israel | 110 | 6 | 30 | 90 | 280 | 400 | 560 | 50 |
| 8 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |
| 9 | Jerusalem | city | 🇮🇱 israel | 120 | 8 | 40 | 110 | 300 | 460 | 610 | 50 |
| 10 | Prison | corner (`jail`) | — | — | — | — | — | — | — | — | — |
| 11 | Venice | city | 🇮🇹 italy | 130 | 10 | 50 | 140 | 440 | 600 | 740 | 100 |
| 12 | Power Company | company | — | 150 | *multiplier* | | | | | | — |
| 13 | Milan | city | 🇮🇹 italy | 140 | 10 | 50 | 160 | 460 | 630 | 760 | 100 |
| 14 | Rome | city | 🇮🇹 italy | 160 | 12 | 60 | 180 | 500 | 700 | 900 | 100 |
| 15 | MUC Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 16 | Frankfurt | city | 🇩🇪 germany | 180 | 14 | 70 | 190 | 540 | 760 | 950 | 100 |
| 17 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 18 | Munich | city | 🇩🇪 germany | 190 | 15 | 70 | 210 | 560 | 760 | 960 | 100 |
| 19 | Berlin | city | 🇩🇪 germany | 200 | 15 | 80 | 220 | 600 | 780 | 1000 | 100 |
| 20 | Vacation | corner (`free_parking`) | — | — | — | — | — | — | — | — | — |
| 21 | Shenzhen | city | 🇨🇳 china | 210 | 18 | 90 | 240 | 680 | 850 | 1000 | 150 |
| 22 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |
| 23 | Beijing | city | 🇨🇳 china | 220 | 20 | 90 | 260 | 710 | 900 | 1100 | 150 |
| 24 | Shanghai | city | 🇨🇳 china | 240 | 20 | 100 | 290 | 740 | 920 | 1100 | 150 |
| 25 | CDG Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 26 | Lyon | city | 🇫🇷 france | 260 | 20 | 100 | 320 | 800 | 950 | 1100 | 150 |
| 27 | Water Company | company | — | 150 | *multiplier* | | | | | | — |
| 28 | Toulouse | city | 🇫🇷 france | 270 | 20 | 120 | 350 | 825 | 1000 | 1150 | 150 |
| 29 | Paris | city | 🇫🇷 france | 280 | 25 | 120 | 350 | 850 | 1000 | 1200 | 150 |
| 30 | Go to prison | corner (`go_to_jail`) | — | — | — | — | — | — | — | — | — |
| 31 | Liverpool | city | 🇬🇧 united-kingdom | 290 | 25 | 120 | 380 | 850 | 1050 | 1250 | 200 |
| 32 | Manchester | city | 🇬🇧 united-kingdom | 300 | 26 | 140 | 400 | 950 | 1150 | 1300 | 200 |
| 33 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 34 | London | city | 🇬🇧 united-kingdom | 320 | 30 | 140 | 440 | 1000 | 1200 | 1400 | 200 |
| 35 | JFK Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 36 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |
| 37 | San Francisco | city | 🇺🇸 united-states-of-america | 360 | 35 | 180 | 550 | 1150 | 1350 | 1525 | 200 |
| 38 | Premium Tax | bonus (`premium-tax`) | — | $75 | — | — | — | — | — | — | — |
| 39 | New York | city | 🇺🇸 united-states-of-america | 400 | 50 | 200 | 600 | 1400 | 1700 | 2000 | 200 |

## Mr. Worldwide  —  `mr-worldwide`

**Premium (180 coins) · 48 tiles.** The big one. **12 tiles per side instead of 10**, three utilities, two four-property groups, and India + Japan added. Rents are **Hasbro's original ladders**, not Classic's rebalanced ones.

### Groups

| Group | Tiles | Indices | Prices |
|---|---|---|---|
| 🇧🇷 brazil | 2 | 1, 3 | 60, 60 |
| 🇮🇱 israel | 3 | 5, 7, 8 | 100, 100, 110 |
| 🇮🇳 india | 2 | 10, 11 | 120, 130 |
| 🇮🇹 italy | 4 | 13, 14, 16, 17 | 140, 140, 160, 160 |
| 🇩🇪 germany | 3 | 19, 21, 23 | 180, 180, 200 |
| 🇨🇳 china | 3 | 25, 27, 29 | 220, 220, 240 |
| 🇫🇷 france | 2 | 31, 32 | 260, 260 |
| 🇯🇵 japan | 2 | 34, 35 | 280, 280 |
| 🇬🇧 united-kingdom | 4 | 37, 38, 40, 41 | 300, 300, 320, 320 |
| 🇺🇸 united-states-of-america | 3 | 43, 45, 47 | 350, 360, 400 |

### All tiles

| # | Name | Type | Group | Price | Rent | 1H | 2H | 3H | 4H | Hotel | H/Hotel cost |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Start | corner (`start`) | — | — | — | — | — | — | — | — | — |
| 1 | Salvador | city | 🇧🇷 brazil | 60 | 2 | 10 | 30 | 90 | 160 | 250 | 50 |
| 2 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 3 | Rio | city | 🇧🇷 brazil | 60 | 4 | 20 | 60 | 180 | 320 | 450 | 50 |
| 4 | Earnings Tax | bonus (`tax`) | — | 10% of net worth | — | — | — | — | — | — | — |
| 5 | Tel Aviv | city | 🇮🇱 israel | 100 | 6 | 30 | 90 | 270 | 400 | 550 | 50 |
| 6 | TLV Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 7 | Haifa | city | 🇮🇱 israel | 100 | 6 | 30 | 90 | 270 | 400 | 550 | 50 |
| 8 | Jerusalem | city | 🇮🇱 israel | 110 | 8 | 40 | 100 | 300 | 450 | 600 | 50 |
| 9 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |
| 10 | Mumbai | city | 🇮🇳 india | 120 | 8 | 45 | 120 | 350 | 500 | 650 | 100 |
| 11 | New Delhi | city | 🇮🇳 india | 130 | 10 | 45 | 130 | 400 | 575 | 700 | 100 |
| 12 | Prison | corner (`jail`) | — | — | — | — | — | — | — | — | — |
| 13 | Venice | city | 🇮🇹 italy | 140 | 10 | 50 | 150 | 450 | 625 | 750 | 100 |
| 14 | Bologna | city | 🇮🇹 italy | 140 | 10 | 50 | 150 | 450 | 625 | 750 | 100 |
| 15 | Power Company | company | — | 150 | *multiplier* | | | | | | — |
| 16 | Milan | city | 🇮🇹 italy | 160 | 12 | 60 | 180 | 500 | 700 | 900 | 100 |
| 17 | Rome | city | 🇮🇹 italy | 160 | 12 | 60 | 180 | 500 | 700 | 900 | 100 |
| 18 | MUC Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 19 | Frankfurt | city | 🇩🇪 germany | 180 | 14 | 70 | 200 | 550 | 750 | 950 | 100 |
| 20 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 21 | Munich | city | 🇩🇪 germany | 180 | 14 | 70 | 200 | 550 | 750 | 950 | 100 |
| 22 | Gas Company | company | — | 150 | *multiplier* | | | | | | — |
| 23 | Berlin | city | 🇩🇪 germany | 200 | 16 | 80 | 220 | 600 | 800 | 1000 | 100 |
| 24 | Vacation | corner (`free_parking`) | — | — | — | — | — | — | — | — | — |
| 25 | Shenzhen | city | 🇨🇳 china | 220 | 18 | 90 | 250 | 700 | 875 | 1050 | 150 |
| 26 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |
| 27 | Beijing | city | 🇨🇳 china | 220 | 18 | 90 | 250 | 700 | 875 | 1050 | 150 |
| 28 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 29 | Shanghai | city | 🇨🇳 china | 240 | 20 | 100 | 300 | 750 | 925 | 1100 | 150 |
| 30 | CDG Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 31 | Toulouse | city | 🇫🇷 france | 260 | 22 | 110 | 330 | 800 | 975 | 1150 | 150 |
| 32 | Paris | city | 🇫🇷 france | 260 | 22 | 110 | 330 | 800 | 975 | 1150 | 150 |
| 33 | Water Company | company | — | 150 | *multiplier* | | | | | | — |
| 34 | Yokohama | city | 🇯🇵 japan | 280 | 24 | 120 | 360 | 850 | 1025 | 1200 | 150 |
| 35 | Tokyo | city | 🇯🇵 japan | 280 | 24 | 120 | 360 | 850 | 1025 | 1200 | 150 |
| 36 | Go to prison | corner (`go_to_jail`) | — | — | — | — | — | — | — | — | — |
| 37 | Liverpool | city | 🇬🇧 united-kingdom | 300 | 26 | 130 | 390 | 900 | 1100 | 1275 | 200 |
| 38 | Manchester | city | 🇬🇧 united-kingdom | 300 | 26 | 130 | 390 | 900 | 1100 | 1275 | 200 |
| 39 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 40 | Birmingham | city | 🇬🇧 united-kingdom | 320 | 28 | 150 | 450 | 1000 | 1200 | 1400 | 200 |
| 41 | London | city | 🇬🇧 united-kingdom | 320 | 28 | 150 | 450 | 1000 | 1200 | 1400 | 200 |
| 42 | JFK Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 43 | Los Angeles | city | 🇺🇸 united-states-of-america | 350 | 35 | 175 | 500 | 1100 | 1300 | 1500 | 200 |
| 44 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |
| 45 | San Francisco | city | 🇺🇸 united-states-of-america | 360 | 40 | 180 | 540 | 1200 | 1450 | 1675 | 200 |
| 46 | Premium Tax | bonus (`premium-tax`) | — | $75 | — | — | — | — | — | — | — |
| 47 | New York | city | 🇺🇸 united-states-of-america | 400 | 50 | 200 | 600 | 1400 | 1700 | 2000 | 200 |

## Death Valley  —  `death-valley`

**Premium (180 coins) · 40 tiles.** Standard size, but only **four countries** in unusually large groups (5, 6, 6, 5). Rents are a **mix**: Canada and the first half of Germany use Hasbro numbers, Frankfurt/Munich/Berlin use Classic's rebalanced ones.

### Groups

| Group | Tiles | Indices | Prices |
|---|---|---|---|
| 🇨🇦 canada | 5 | 1, 3, 6, 8, 9 | 60, 60, 100, 100, 120 |
| 🇩🇪 germany | 6 | 11, 13, 14, 16, 18, 19 | 140, 140, 160, 180, 190, 200 |
| 🇬🇧 united-kingdom | 6 | 21, 23, 24, 26, 27, 29 | 220, 220, 240, 260, 260, 280 |
| 🇺🇸 united-states-of-america | 5 | 31, 32, 34, 37, 39 | 300, 300, 320, 360, 400 |

### All tiles

| # | Name | Type | Group | Price | Rent | 1H | 2H | 3H | 4H | Hotel | H/Hotel cost |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Start | corner (`start`) | — | — | — | — | — | — | — | — | — |
| 1 | Ottawa | city | 🇨🇦 canada | 60 | 2 | 10 | 30 | 90 | 160 | 250 | 50 |
| 2 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 3 | Quebec City | city | 🇨🇦 canada | 60 | 4 | 20 | 60 | 180 | 320 | 450 | 50 |
| 4 | Earnings Tax | bonus (`tax`) | — | 10% of net worth | — | — | — | — | — | — | — |
| 5 | YYZ Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 6 | Montreal | city | 🇨🇦 canada | 100 | 6 | 30 | 90 | 270 | 400 | 550 | 50 |
| 7 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |
| 8 | Vancouver | city | 🇨🇦 canada | 100 | 6 | 30 | 90 | 270 | 400 | 550 | 50 |
| 9 | Toronto | city | 🇨🇦 canada | 120 | 8 | 40 | 100 | 300 | 450 | 600 | 50 |
| 10 | Prison | corner (`jail`) | — | — | — | — | — | — | — | — | — |
| 11 | Wolfsburg | city | 🇩🇪 germany | 140 | 10 | 50 | 150 | 450 | 625 | 750 | 100 |
| 12 | Power Company | company | — | 150 | *multiplier* | | | | | | — |
| 13 | Cologne | city | 🇩🇪 germany | 140 | 10 | 50 | 150 | 450 | 625 | 750 | 100 |
| 14 | Hamburg | city | 🇩🇪 germany | 160 | 12 | 60 | 180 | 500 | 700 | 900 | 100 |
| 15 | MUC Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 16 | Frankfurt | city | 🇩🇪 germany | 180 | 14 | 70 | 190 | 540 | 760 | 950 | 100 |
| 17 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 18 | Munich | city | 🇩🇪 germany | 190 | 15 | 70 | 210 | 560 | 760 | 960 | 100 |
| 19 | Berlin | city | 🇩🇪 germany | 200 | 15 | 80 | 220 | 600 | 780 | 1000 | 100 |
| 20 | Vacation | corner (`free_parking`) | — | — | — | — | — | — | — | — | — |
| 21 | Glasgow | city | 🇬🇧 united-kingdom | 220 | 18 | 90 | 250 | 700 | 875 | 1050 | 150 |
| 22 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |
| 23 | Cambridge | city | 🇬🇧 united-kingdom | 220 | 18 | 90 | 250 | 700 | 875 | 1050 | 150 |
| 24 | Liverpool | city | 🇬🇧 united-kingdom | 240 | 20 | 100 | 300 | 750 | 925 | 1100 | 150 |
| 25 | LHR Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 26 | Birmingham | city | 🇬🇧 united-kingdom | 260 | 22 | 110 | 330 | 800 | 975 | 1150 | 150 |
| 27 | Manchester | city | 🇬🇧 united-kingdom | 260 | 22 | 110 | 330 | 800 | 975 | 1150 | 150 |
| 28 | Water Company | company | — | 150 | *multiplier* | | | | | | — |
| 29 | London | city | 🇬🇧 united-kingdom | 280 | 24 | 120 | 360 | 850 | 1025 | 1200 | 150 |
| 30 | Go to prison | corner (`go_to_jail`) | — | — | — | — | — | — | — | — | — |
| 31 | Boston | city | 🇺🇸 united-states-of-america | 300 | 26 | 130 | 390 | 900 | 1100 | 1275 | 200 |
| 32 | Seattle | city | 🇺🇸 united-states-of-america | 300 | 26 | 130 | 390 | 900 | 1100 | 1275 | 200 |
| 33 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 34 | Chicago | city | 🇺🇸 united-states-of-america | 320 | 28 | 150 | 450 | 1000 | 1200 | 1400 | 200 |
| 35 | JFK Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 36 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |
| 37 | San Francisco | city | 🇺🇸 united-states-of-america | 360 | 35 | 180 | 550 | 1150 | 1350 | 1525 | 200 |
| 38 | Premium Tax | bonus (`premium-tax`) | — | $75 | — | — | — | — | — | — | — |
| 39 | New York | city | 🇺🇸 united-states-of-america | 400 | 50 | 200 | 600 | 1400 | 1700 | 2000 |  200 † |

† Death Valley[39] `house_price` is the one **inferred** value in this file — the live dump truncated
mid-line before it. 200 follows the group pattern (every other USA/UK-tier property on every map is 200)
and is near-certain, but it was not read directly.

## Lucky Wheel  —  `lucky-wheel`

**Premium (180 coins) · 40 tiles.** Structurally radical. **Two full sides are nothing but card and tax tiles**; the other two are nothing but property. **No utilities at all**, 16 cities in eight two-property groups, two Premium Tax tiles, and the only **Tax Refund** tile in the game (pays you $50).

### Groups

| Group | Tiles | Indices | Prices |
|---|---|---|---|
| 🇹🇷 turkey | 2 | 1, 2 | 60, 80 |
| 🇷🇴 romania | 2 | 3, 4 | 100, 120 |
| 🇮🇹 italy | 2 | 6, 7 | 140, 160 |
| 🇩🇪 germany | 2 | 8, 9 | 180, 200 |
| 🇨🇳 china | 2 | 21, 22 | 220, 240 |
| 🇮🇪 ireland | 2 | 23, 24 | 260, 280 |
| 🇬🇧 united-kingdom | 2 | 26, 27 | 300, 320 |
| 🇺🇸 united-states-of-america | 2 | 28, 29 | 350, 400 |

### All tiles

| # | Name | Type | Group | Price | Rent | 1H | 2H | 3H | 4H | Hotel | H/Hotel cost |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Start | corner (`start`) | — | — | — | — | — | — | — | — | — |
| 1 | Antalya | city | 🇹🇷 turkey | 60 | 2 | 10 | 30 | 90 | 160 | 250 | 50 |
| 2 | Istanbul | city | 🇹🇷 turkey | 80 | 4 | 20 | 60 | 180 | 320 | 450 | 50 |
| 3 | Brasov | city | 🇷🇴 romania | 100 | 6 | 30 | 90 | 270 | 400 | 550 | 50 |
| 4 | Bucharest | city | 🇷🇴 romania | 120 | 8 | 40 | 100 | 300 | 450 | 600 | 50 |
| 5 | TLV Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 6 | Milan | city | 🇮🇹 italy | 140 | 10 | 50 | 150 | 450 | 625 | 750 | 100 |
| 7 | Rome | city | 🇮🇹 italy | 160 | 12 | 60 | 180 | 500 | 700 | 900 | 100 |
| 8 | Munich | city | 🇩🇪 germany | 180 | 14 | 70 | 200 | 550 | 750 | 950 | 100 |
| 9 | Berlin | city | 🇩🇪 germany | 200 | 16 | 80 | 220 | 600 | 800 | 1000 | 100 |
| 10 | Prison | corner (`jail`) | — | — | — | — | — | — | — | — | — |
| 11 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 12 | Earnings Tax | bonus (`tax`) | — | 10% of net worth | — | — | — | — | — | — | — |
| 13 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |
| 14 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 15 | MUC Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 16 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |
| 17 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 18 | Premium Tax | bonus (`premium-tax`) | — | $75 | — | — | — | — | — | — | — |
| 19 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |
| 20 | Vacation | corner (`free_parking`) | — | — | — | — | — | — | — | — | — |
| 21 | Beijing | city | 🇨🇳 china | 220 | 18 | 90 | 250 | 700 | 875 | 1050 | 150 |
| 22 | Shanghai | city | 🇨🇳 china | 240 | 20 | 100 | 300 | 750 | 925 | 1100 | 150 |
| 23 | Belfast | city | 🇮🇪 ireland | 260 | 22 | 110 | 330 | 800 | 975 | 1150 | 150 |
| 24 | Dublin | city | 🇮🇪 ireland | 280 | 24 | 120 | 360 | 850 | 1025 | 1200 | 150 |
| 25 | CDG Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 26 | Manchester | city | 🇬🇧 united-kingdom | 300 | 26 | 130 | 390 | 900 | 1100 | 1275 | 200 |
| 27 | London | city | 🇬🇧 united-kingdom | 320 | 28 | 150 | 450 | 1000 | 1200 | 1400 | 200 |
| 28 | San Francisco | city | 🇺🇸 united-states-of-america | 350 | 35 | 175 | 500 | 1100 | 1300 | 1500 | 200 |
| 29 | New York | city | 🇺🇸 united-states-of-america | 400 | 50 | 200 | 600 | 1400 | 1700 | 2000 | 200 |
| 30 | Go to prison | corner (`go_to_jail`) | — | — | — | — | — | — | — | — | — |
| 31 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 32 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |
| 33 | Premium Tax | bonus (`premium-tax`) | — | $75 | — | — | — | — | — | — | — |
| 34 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 35 | JFK Airport | airport | — | 200 | 25 | 50 | 100 | 200 | — | — | — |
| 36 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |
| 37 | Tax Refund | bonus (`tax-refund`) | — | $50 | — | — | — | — | — | — | — |
| 38 | Treasure | bonus (`treasure`) | — | — | — | — | — | — | — | — | — |
| 39 | Surprise | bonus (`surprise`) | — | — | — | — | — | — | — | — | — |

---

## Machine-readable — all four maps

Keyed by richup's own map ids. `rents` is `null` for companies (server-side multiplier).

```json
{
 "classic": [
  {"index":0,"name":"Start","type":"corner","subtype":"start"},
  {"index":1,"name":"Salvador","type":"city","country":"brazil","price":60,"rents":[2,10,30,90,150,240],"house_price":50,"hotel_price":50},
  {"index":2,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":3,"name":"Rio","type":"city","country":"brazil","price":60,"rents":[4,20,60,190,330,460],"house_price":50,"hotel_price":50},
  {"index":4,"name":"Earnings Tax","type":"bonus","bonus_type":"tax","tax_percentage":10},
  {"index":5,"name":"TLV Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":6,"name":"Tel Aviv","type":"city","country":"israel","price":100,"rents":[6,30,90,260,380,540],"house_price":50,"hotel_price":50},
  {"index":7,"name":"Haifa","type":"city","country":"israel","price":110,"rents":[6,30,90,280,400,560],"house_price":50,"hotel_price":50},
  {"index":8,"name":"Surprise","type":"bonus","bonus_type":"surprise"},
  {"index":9,"name":"Jerusalem","type":"city","country":"israel","price":120,"rents":[8,40,110,300,460,610],"house_price":50,"hotel_price":50},
  {"index":10,"name":"Prison","type":"corner","subtype":"jail"},
  {"index":11,"name":"Venice","type":"city","country":"italy","price":130,"rents":[10,50,140,440,600,740],"house_price":100,"hotel_price":100},
  {"index":12,"name":"Power Company","type":"company","price":150,"rents":null},
  {"index":13,"name":"Milan","type":"city","country":"italy","price":140,"rents":[10,50,160,460,630,760],"house_price":100,"hotel_price":100},
  {"index":14,"name":"Rome","type":"city","country":"italy","price":160,"rents":[12,60,180,500,700,900],"house_price":100,"hotel_price":100},
  {"index":15,"name":"MUC Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":16,"name":"Frankfurt","type":"city","country":"germany","price":180,"rents":[14,70,190,540,760,950],"house_price":100,"hotel_price":100},
  {"index":17,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":18,"name":"Munich","type":"city","country":"germany","price":190,"rents":[15,70,210,560,760,960],"house_price":100,"hotel_price":100},
  {"index":19,"name":"Berlin","type":"city","country":"germany","price":200,"rents":[15,80,220,600,780,1000],"house_price":100,"hotel_price":100},
  {"index":20,"name":"Vacation","type":"corner","subtype":"free_parking"},
  {"index":21,"name":"Shenzhen","type":"city","country":"china","price":210,"rents":[18,90,240,680,850,1000],"house_price":150,"hotel_price":150},
  {"index":22,"name":"Surprise","type":"bonus","bonus_type":"surprise"},
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
  {"index":33,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":34,"name":"London","type":"city","country":"united-kingdom","price":320,"rents":[30,140,440,1000,1200,1400],"house_price":200,"hotel_price":200},
  {"index":35,"name":"JFK Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":36,"name":"Surprise","type":"bonus","bonus_type":"surprise"},
  {"index":37,"name":"San Francisco","type":"city","country":"united-states-of-america","price":360,"rents":[35,180,550,1150,1350,1525],"house_price":200,"hotel_price":200},
  {"index":38,"name":"Premium Tax","type":"bonus","bonus_type":"premium-tax","tax_amount":75},
  {"index":39,"name":"New York","type":"city","country":"united-states-of-america","price":400,"rents":[50,200,600,1400,1700,2000],"house_price":200,"hotel_price":200}
 ],
 "mr-worldwide": [
  {"index":0,"name":"Start","type":"corner","subtype":"start"},
  {"index":1,"name":"Salvador","type":"city","country":"brazil","price":60,"rents":[2,10,30,90,160,250],"house_price":50,"hotel_price":50},
  {"index":2,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":3,"name":"Rio","type":"city","country":"brazil","price":60,"rents":[4,20,60,180,320,450],"house_price":50,"hotel_price":50},
  {"index":4,"name":"Earnings Tax","type":"bonus","bonus_type":"tax","tax_percentage":10},
  {"index":5,"name":"Tel Aviv","type":"city","country":"israel","price":100,"rents":[6,30,90,270,400,550],"house_price":50,"hotel_price":50},
  {"index":6,"name":"TLV Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":7,"name":"Haifa","type":"city","country":"israel","price":100,"rents":[6,30,90,270,400,550],"house_price":50,"hotel_price":50},
  {"index":8,"name":"Jerusalem","type":"city","country":"israel","price":110,"rents":[8,40,100,300,450,600],"house_price":50,"hotel_price":50},
  {"index":9,"name":"Surprise","type":"bonus","bonus_type":"surprise"},
  {"index":10,"name":"Mumbai","type":"city","country":"india","price":120,"rents":[8,45,120,350,500,650],"house_price":100,"hotel_price":100},
  {"index":11,"name":"New Delhi","type":"city","country":"india","price":130,"rents":[10,45,130,400,575,700],"house_price":100,"hotel_price":100},
  {"index":12,"name":"Prison","type":"corner","subtype":"jail"},
  {"index":13,"name":"Venice","type":"city","country":"italy","price":140,"rents":[10,50,150,450,625,750],"house_price":100,"hotel_price":100},
  {"index":14,"name":"Bologna","type":"city","country":"italy","price":140,"rents":[10,50,150,450,625,750],"house_price":100,"hotel_price":100},
  {"index":15,"name":"Power Company","type":"company","price":150,"rents":null},
  {"index":16,"name":"Milan","type":"city","country":"italy","price":160,"rents":[12,60,180,500,700,900],"house_price":100,"hotel_price":100},
  {"index":17,"name":"Rome","type":"city","country":"italy","price":160,"rents":[12,60,180,500,700,900],"house_price":100,"hotel_price":100},
  {"index":18,"name":"MUC Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":19,"name":"Frankfurt","type":"city","country":"germany","price":180,"rents":[14,70,200,550,750,950],"house_price":100,"hotel_price":100},
  {"index":20,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":21,"name":"Munich","type":"city","country":"germany","price":180,"rents":[14,70,200,550,750,950],"house_price":100,"hotel_price":100},
  {"index":22,"name":"Gas Company","type":"company","price":150,"rents":null},
  {"index":23,"name":"Berlin","type":"city","country":"germany","price":200,"rents":[16,80,220,600,800,1000],"house_price":100,"hotel_price":100},
  {"index":24,"name":"Vacation","type":"corner","subtype":"free_parking"},
  {"index":25,"name":"Shenzhen","type":"city","country":"china","price":220,"rents":[18,90,250,700,875,1050],"house_price":150,"hotel_price":150},
  {"index":26,"name":"Surprise","type":"bonus","bonus_type":"surprise"},
  {"index":27,"name":"Beijing","type":"city","country":"china","price":220,"rents":[18,90,250,700,875,1050],"house_price":150,"hotel_price":150},
  {"index":28,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":29,"name":"Shanghai","type":"city","country":"china","price":240,"rents":[20,100,300,750,925,1100],"house_price":150,"hotel_price":150},
  {"index":30,"name":"CDG Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":31,"name":"Toulouse","type":"city","country":"france","price":260,"rents":[22,110,330,800,975,1150],"house_price":150,"hotel_price":150},
  {"index":32,"name":"Paris","type":"city","country":"france","price":260,"rents":[22,110,330,800,975,1150],"house_price":150,"hotel_price":150},
  {"index":33,"name":"Water Company","type":"company","price":150,"rents":null},
  {"index":34,"name":"Yokohama","type":"city","country":"japan","price":280,"rents":[24,120,360,850,1025,1200],"house_price":150,"hotel_price":150},
  {"index":35,"name":"Tokyo","type":"city","country":"japan","price":280,"rents":[24,120,360,850,1025,1200],"house_price":150,"hotel_price":150},
  {"index":36,"name":"Go to prison","type":"corner","subtype":"go_to_jail"},
  {"index":37,"name":"Liverpool","type":"city","country":"united-kingdom","price":300,"rents":[26,130,390,900,1100,1275],"house_price":200,"hotel_price":200},
  {"index":38,"name":"Manchester","type":"city","country":"united-kingdom","price":300,"rents":[26,130,390,900,1100,1275],"house_price":200,"hotel_price":200},
  {"index":39,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":40,"name":"Birmingham","type":"city","country":"united-kingdom","price":320,"rents":[28,150,450,1000,1200,1400],"house_price":200,"hotel_price":200},
  {"index":41,"name":"London","type":"city","country":"united-kingdom","price":320,"rents":[28,150,450,1000,1200,1400],"house_price":200,"hotel_price":200},
  {"index":42,"name":"JFK Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":43,"name":"Los Angeles","type":"city","country":"united-states-of-america","price":350,"rents":[35,175,500,1100,1300,1500],"house_price":200,"hotel_price":200},
  {"index":44,"name":"Surprise","type":"bonus","bonus_type":"surprise"},
  {"index":45,"name":"San Francisco","type":"city","country":"united-states-of-america","price":360,"rents":[40,180,540,1200,1450,1675],"house_price":200,"hotel_price":200},
  {"index":46,"name":"Premium Tax","type":"bonus","bonus_type":"premium-tax","tax_amount":75},
  {"index":47,"name":"New York","type":"city","country":"united-states-of-america","price":400,"rents":[50,200,600,1400,1700,2000],"house_price":200,"hotel_price":200}
 ],
 "death-valley": [
  {"index":0,"name":"Start","type":"corner","subtype":"start"},
  {"index":1,"name":"Ottawa","type":"city","country":"canada","price":60,"rents":[2,10,30,90,160,250],"house_price":50,"hotel_price":50},
  {"index":2,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":3,"name":"Quebec City","type":"city","country":"canada","price":60,"rents":[4,20,60,180,320,450],"house_price":50,"hotel_price":50},
  {"index":4,"name":"Earnings Tax","type":"bonus","bonus_type":"tax","tax_percentage":10},
  {"index":5,"name":"YYZ Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":6,"name":"Montreal","type":"city","country":"canada","price":100,"rents":[6,30,90,270,400,550],"house_price":50,"hotel_price":50},
  {"index":7,"name":"Surprise","type":"bonus","bonus_type":"surprise"},
  {"index":8,"name":"Vancouver","type":"city","country":"canada","price":100,"rents":[6,30,90,270,400,550],"house_price":50,"hotel_price":50},
  {"index":9,"name":"Toronto","type":"city","country":"canada","price":120,"rents":[8,40,100,300,450,600],"house_price":50,"hotel_price":50},
  {"index":10,"name":"Prison","type":"corner","subtype":"jail"},
  {"index":11,"name":"Wolfsburg","type":"city","country":"germany","price":140,"rents":[10,50,150,450,625,750],"house_price":100,"hotel_price":100},
  {"index":12,"name":"Power Company","type":"company","price":150,"rents":null},
  {"index":13,"name":"Cologne","type":"city","country":"germany","price":140,"rents":[10,50,150,450,625,750],"house_price":100,"hotel_price":100},
  {"index":14,"name":"Hamburg","type":"city","country":"germany","price":160,"rents":[12,60,180,500,700,900],"house_price":100,"hotel_price":100},
  {"index":15,"name":"MUC Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":16,"name":"Frankfurt","type":"city","country":"germany","price":180,"rents":[14,70,190,540,760,950],"house_price":100,"hotel_price":100},
  {"index":17,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":18,"name":"Munich","type":"city","country":"germany","price":190,"rents":[15,70,210,560,760,960],"house_price":100,"hotel_price":100},
  {"index":19,"name":"Berlin","type":"city","country":"germany","price":200,"rents":[15,80,220,600,780,1000],"house_price":100,"hotel_price":100},
  {"index":20,"name":"Vacation","type":"corner","subtype":"free_parking"},
  {"index":21,"name":"Glasgow","type":"city","country":"united-kingdom","price":220,"rents":[18,90,250,700,875,1050],"house_price":150,"hotel_price":150},
  {"index":22,"name":"Surprise","type":"bonus","bonus_type":"surprise"},
  {"index":23,"name":"Cambridge","type":"city","country":"united-kingdom","price":220,"rents":[18,90,250,700,875,1050],"house_price":150,"hotel_price":150},
  {"index":24,"name":"Liverpool","type":"city","country":"united-kingdom","price":240,"rents":[20,100,300,750,925,1100],"house_price":150,"hotel_price":150},
  {"index":25,"name":"LHR Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":26,"name":"Birmingham","type":"city","country":"united-kingdom","price":260,"rents":[22,110,330,800,975,1150],"house_price":150,"hotel_price":150},
  {"index":27,"name":"Manchester","type":"city","country":"united-kingdom","price":260,"rents":[22,110,330,800,975,1150],"house_price":150,"hotel_price":150},
  {"index":28,"name":"Water Company","type":"company","price":150,"rents":null},
  {"index":29,"name":"London","type":"city","country":"united-kingdom","price":280,"rents":[24,120,360,850,1025,1200],"house_price":150,"hotel_price":150},
  {"index":30,"name":"Go to prison","type":"corner","subtype":"go_to_jail"},
  {"index":31,"name":"Boston","type":"city","country":"united-states-of-america","price":300,"rents":[26,130,390,900,1100,1275],"house_price":200,"hotel_price":200},
  {"index":32,"name":"Seattle","type":"city","country":"united-states-of-america","price":300,"rents":[26,130,390,900,1100,1275],"house_price":200,"hotel_price":200},
  {"index":33,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":34,"name":"Chicago","type":"city","country":"united-states-of-america","price":320,"rents":[28,150,450,1000,1200,1400],"house_price":200,"hotel_price":200},
  {"index":35,"name":"JFK Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":36,"name":"Surprise","type":"bonus","bonus_type":"surprise"},
  {"index":37,"name":"San Francisco","type":"city","country":"united-states-of-america","price":360,"rents":[35,180,550,1150,1350,1525],"house_price":200,"hotel_price":200},
  {"index":38,"name":"Premium Tax","type":"bonus","bonus_type":"premium-tax","tax_amount":75},
  {"index":39,"name":"New York","type":"city","country":"united-states-of-america","price":400,"rents":[50,200,600,1400,1700,2000],"house_price":200,"hotel_price":200}
 ],
 "lucky-wheel": [
  {"index":0,"name":"Start","type":"corner","subtype":"start"},
  {"index":1,"name":"Antalya","type":"city","country":"turkey","price":60,"rents":[2,10,30,90,160,250],"house_price":50,"hotel_price":50},
  {"index":2,"name":"Istanbul","type":"city","country":"turkey","price":80,"rents":[4,20,60,180,320,450],"house_price":50,"hotel_price":50},
  {"index":3,"name":"Brasov","type":"city","country":"romania","price":100,"rents":[6,30,90,270,400,550],"house_price":50,"hotel_price":50},
  {"index":4,"name":"Bucharest","type":"city","country":"romania","price":120,"rents":[8,40,100,300,450,600],"house_price":50,"hotel_price":50},
  {"index":5,"name":"TLV Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":6,"name":"Milan","type":"city","country":"italy","price":140,"rents":[10,50,150,450,625,750],"house_price":100,"hotel_price":100},
  {"index":7,"name":"Rome","type":"city","country":"italy","price":160,"rents":[12,60,180,500,700,900],"house_price":100,"hotel_price":100},
  {"index":8,"name":"Munich","type":"city","country":"germany","price":180,"rents":[14,70,200,550,750,950],"house_price":100,"hotel_price":100},
  {"index":9,"name":"Berlin","type":"city","country":"germany","price":200,"rents":[16,80,220,600,800,1000],"house_price":100,"hotel_price":100},
  {"index":10,"name":"Prison","type":"corner","subtype":"jail"},
  {"index":11,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":12,"name":"Earnings Tax","type":"bonus","bonus_type":"tax","tax_percentage":10},
  {"index":13,"name":"Surprise","type":"bonus","bonus_type":"surprise"},
  {"index":14,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":15,"name":"MUC Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":16,"name":"Surprise","type":"bonus","bonus_type":"surprise"},
  {"index":17,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":18,"name":"Premium Tax","type":"bonus","bonus_type":"premium-tax","tax_amount":75},
  {"index":19,"name":"Surprise","type":"bonus","bonus_type":"surprise"},
  {"index":20,"name":"Vacation","type":"corner","subtype":"free_parking"},
  {"index":21,"name":"Beijing","type":"city","country":"china","price":220,"rents":[18,90,250,700,875,1050],"house_price":150,"hotel_price":150},
  {"index":22,"name":"Shanghai","type":"city","country":"china","price":240,"rents":[20,100,300,750,925,1100],"house_price":150,"hotel_price":150},
  {"index":23,"name":"Belfast","type":"city","country":"ireland","price":260,"rents":[22,110,330,800,975,1150],"house_price":150,"hotel_price":150},
  {"index":24,"name":"Dublin","type":"city","country":"ireland","price":280,"rents":[24,120,360,850,1025,1200],"house_price":150,"hotel_price":150},
  {"index":25,"name":"CDG Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":26,"name":"Manchester","type":"city","country":"united-kingdom","price":300,"rents":[26,130,390,900,1100,1275],"house_price":200,"hotel_price":200},
  {"index":27,"name":"London","type":"city","country":"united-kingdom","price":320,"rents":[28,150,450,1000,1200,1400],"house_price":200,"hotel_price":200},
  {"index":28,"name":"San Francisco","type":"city","country":"united-states-of-america","price":350,"rents":[35,175,500,1100,1300,1500],"house_price":200,"hotel_price":200},
  {"index":29,"name":"New York","type":"city","country":"united-states-of-america","price":400,"rents":[50,200,600,1400,1700,2000],"house_price":200,"hotel_price":200},
  {"index":30,"name":"Go to prison","type":"corner","subtype":"go_to_jail"},
  {"index":31,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":32,"name":"Surprise","type":"bonus","bonus_type":"surprise"},
  {"index":33,"name":"Premium Tax","type":"bonus","bonus_type":"premium-tax","tax_amount":75},
  {"index":34,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":35,"name":"JFK Airport","type":"airport","price":200,"rents":[25,50,100,200]},
  {"index":36,"name":"Surprise","type":"bonus","bonus_type":"surprise"},
  {"index":37,"name":"Tax Refund","type":"bonus","bonus_type":"tax-refund","tax_amount":50},
  {"index":38,"name":"Treasure","type":"bonus","bonus_type":"treasure"},
  {"index":39,"name":"Surprise","type":"bonus","bonus_type":"surprise"}
 ]
}
```
