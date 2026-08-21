# Monopoly Board Data (US Standard) + richup.io Naming

Machine-consumable reference for the board. Numbers verified against at least two
independent sources; discrepancies noted inline.

## Sources verified against

| # | Source | URL | Used for |
|---|--------|-----|----------|
| S1 | falstad.com "Monopoly Rents" (reproduction of a removed Wikipedia table) | https://www.falstad.com/monopoly.html | Full 22-street price / rent / house-cost / mortgage table |
| S2 | `theyoungastros/vanilla-js-monopoly` `js/board.json` | https://raw.githubusercontent.com/theyoungastros/vanilla-js-monopoly/master/js/board.json | Independent 40-space ordering + rent arrays + group hex colors |
| S3 | Hasbro official Monopoly instructions (PDF, text-extracted) | https://www.hasbro.com/common/instruct/monins.pdf | Starting cash breakdown, 32 houses / 12 hotels, mortgage rule, Income Tax |
| S4 | Hasbro official Monopoly instructions, Speed Die edition | https://www.hasbro.com/common/instruct/00009.pdf | Contents line ("32 houses, 12 hotels"), corroborates S3 |
| S5 | Hasbro customer-service FAQ "How much money comes in a Monopoly game?" | https://hasbro-new.custhelp.com/app/answers/detail/a_id/69/ | Bill counts per denomination, $20,580 total |
| S6 | monopolyland.com rent rules | https://www.monopolyland.com/monopoly-rent-rules/ | Railroad rent ladder, utility 4x/10x rule |
| S7 | Greasy Fork userscript 534514 "Richup.io Name & Flag Replacer (Lithuanian Cities)" | https://greasyfork.org/scripts/534514/code/script.user.js | richup tile names — now corroboration only, superseded by S11 |
| S8 | Greasy Fork userscript 552804 "Richup.io Name & Flag Replacer (German Cities)" | https://greasyfork.org/scripts/552804/code/script.user.js | Independent confirmation of the same richup tile names — corroboration only, superseded by S11 |
| S9 | richup.io Open Graph board render `og_image.png` | https://richup.io/og_image.png | richup tile ORDER on 4 board edges — corroboration only, superseded by S11 (its two order deviations were confirmed correct) |
| S10 | richup.io client bundle `index.BAOd0zsy.js` | https://richup.io/index.BAOd0zsy.js | richup default starting cash `const r2e=1500`, options `[500,1000,1500,2000,2500,3000]` |
| **S11** | **Live capture of richup.io Classic map, 2026-08-20** — in-app board preview + React props of all 40 rendered tiles (`{name, type, price, countryId, rentPrices, housePrice, hotelPrice}`), cross-checked against in-app property tooltips | richup.io (private room, Classic map) | **PRIMARY SOURCE for §6.** Complete richup board: names, tile order, prices, rent arrays, house/hotel costs, type vocabulary. Supersedes S7–S9 wherever they disagree. Written up in full at `research/richup-observed-live.md` §5, §9 |

**S1 and S2 agree on every one of the 132 rent numbers.** No discrepancy between them.

**Discrepancy note (secondary sources only):** WebFetch summaries of
`monopolyland.com/monopoly-properties-list-with-prices/` and `diceanddeeds.com`
reported Mediterranean Ave 2-houses = $20 and Park Place 2-houses = $600. Both S1
and S2 give **$30** and **$500** respectively, matching the printed Title Deeds.
Use $30 / $500. The secondary numbers are treated as summarizer error.

---

## 1. All 40 board spaces (US standard), board index order

Prices in dollars. `—` = not applicable.

| index | name | type | color group | price | rent (base) | 1 house | 2 | 3 | 4 | hotel | house cost | mortgage |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Go | go | — | — | — | — | — | — | — | — | — | — |
| 1 | Mediterranean Avenue | property | brown | 60 | 2 | 10 | 30 | 90 | 160 | 250 | 50 | 30 |
| 2 | Community Chest | community_chest | — | — | — | — | — | — | — | — | — | — |
| 3 | Baltic Avenue | property | brown | 60 | 4 | 20 | 60 | 180 | 320 | 450 | 50 | 30 |
| 4 | Income Tax | tax | — | — | 200 | — | — | — | — | — | — | — |
| 5 | Reading Railroad | railroad | — | 200 | 25 | — | — | — | — | — | — | 100 |
| 6 | Oriental Avenue | property | light_blue | 100 | 6 | 30 | 90 | 270 | 400 | 550 | 50 | 50 |
| 7 | Chance | chance | — | — | — | — | — | — | — | — | — | — |
| 8 | Vermont Avenue | property | light_blue | 100 | 6 | 30 | 90 | 270 | 400 | 550 | 50 | 50 |
| 9 | Connecticut Avenue | property | light_blue | 120 | 8 | 40 | 100 | 300 | 450 | 600 | 50 | 60 |
| 10 | Jail / Just Visiting | jail | — | — | — | — | — | — | — | — | — | — |
| 11 | St. Charles Place | property | pink | 140 | 10 | 50 | 150 | 450 | 625 | 750 | 100 | 70 |
| 12 | Electric Company | utility | — | 150 | see §3 | — | — | — | — | — | — | 75 |
| 13 | States Avenue | property | pink | 140 | 10 | 50 | 150 | 450 | 625 | 750 | 100 | 70 |
| 14 | Virginia Avenue | property | pink | 160 | 12 | 60 | 180 | 500 | 700 | 900 | 100 | 80 |
| 15 | Pennsylvania Railroad | railroad | — | 200 | 25 | — | — | — | — | — | — | 100 |
| 16 | St. James Place | property | orange | 180 | 14 | 70 | 200 | 550 | 750 | 950 | 100 | 90 |
| 17 | Community Chest | community_chest | — | — | — | — | — | — | — | — | — | — |
| 18 | Tennessee Avenue | property | orange | 180 | 14 | 70 | 200 | 550 | 750 | 950 | 100 | 90 |
| 19 | New York Avenue | property | orange | 200 | 16 | 80 | 220 | 600 | 800 | 1000 | 100 | 100 |
| 20 | Free Parking | free_parking | — | — | — | — | — | — | — | — | — | — |
| 21 | Kentucky Avenue | property | red | 220 | 18 | 90 | 250 | 700 | 875 | 1050 | 150 | 110 |
| 22 | Chance | chance | — | — | — | — | — | — | — | — | — | — |
| 23 | Indiana Avenue | property | red | 220 | 18 | 90 | 250 | 700 | 875 | 1050 | 150 | 110 |
| 24 | Illinois Avenue | property | red | 240 | 20 | 100 | 300 | 750 | 925 | 1100 | 150 | 120 |
| 25 | B. & O. Railroad | railroad | — | 200 | 25 | — | — | — | — | — | — | 100 |
| 26 | Atlantic Avenue | property | yellow | 260 | 22 | 110 | 330 | 800 | 975 | 1150 | 150 | 130 |
| 27 | Ventnor Avenue | property | yellow | 260 | 22 | 110 | 330 | 800 | 975 | 1150 | 150 | 130 |
| 28 | Water Works | utility | — | 150 | see §3 | — | — | — | — | — | — | 75 |
| 29 | Marvin Gardens | property | yellow | 280 | 24 | 120 | 360 | 850 | 1025 | 1200 | 150 | 140 |
| 30 | Go To Jail | go_to_jail | — | — | — | — | — | — | — | — | — | — |
| 31 | Pacific Avenue | property | green | 300 | 26 | 130 | 390 | 900 | 1100 | 1275 | 200 | 150 |
| 32 | North Carolina Avenue | property | green | 300 | 26 | 130 | 390 | 900 | 1100 | 1275 | 200 | 150 |
| 33 | Community Chest | community_chest | — | — | — | — | — | — | — | — | — | — |
| 34 | Pennsylvania Avenue | property | green | 320 | 28 | 150 | 450 | 1000 | 1200 | 1400 | 200 | 160 |
| 35 | Short Line | railroad | — | 200 | 25 | — | — | — | — | — | — | 100 |
| 36 | Chance | chance | — | — | — | — | — | — | — | — | — | — |
| 37 | Park Place | property | dark_blue | 350 | 35 | 175 | 500 | 1100 | 1300 | 1500 | 200 | 175 |
| 38 | Luxury Tax | tax | — | — | 100 | — | — | — | — | — | — | — |
| 39 | Boardwalk | property | dark_blue | 400 | 50 | 200 | 600 | 1400 | 1700 | 2000 | 200 | 200 |

Notes on the two tax squares:
- **Income Tax (4) = $200 flat** in current (2008+) US editions. Pre-2008 rules
  (S3, S4) offer a choice: pay $200 **or** 10% of total worth. S3 line 236 also
  states the flat-$200 variant. (The S4 text-extraction reads "$900"; that is an
  OCR artifact of "$200" — do not use it.)
- **Luxury Tax (38) = $100** in current US editions; **$75** in pre-2008 editions.
  Marked as $100 above. UNVERIFIED against a Hasbro primary source; the $75→$100
  change is asserted by monopolyland.com only.
- Mortgage values above are the printed Title Deed values (S1). They equal
  `floor(price / 2)` for every space, which is also the Hasbro rule (S3):
  "any mortgaged property... is valued at one-half the price printed on the board."
  Railroad ($100) and utility ($75) mortgage values are derived from that rule,
  not read off S1 (S1 covers the 22 streets only).
- Unmortgage cost = mortgage value + 10% interest (S3).

---

## 2. Same data as JSON

```json
[
  {"index": 0, "name": "Go", "type": "go", "color_group": null, "price": null, "rent": null, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": null, "tax_amount": null},
  {"index": 1, "name": "Mediterranean Avenue", "type": "property", "color_group": "brown", "price": 60, "rent": 2, "rent_1_house": 10, "rent_2_houses": 30, "rent_3_houses": 90, "rent_4_houses": 160, "rent_hotel": 250, "house_cost": 50, "mortgage_value": 30, "tax_amount": null},
  {"index": 2, "name": "Community Chest", "type": "community_chest", "color_group": null, "price": null, "rent": null, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": null, "tax_amount": null},
  {"index": 3, "name": "Baltic Avenue", "type": "property", "color_group": "brown", "price": 60, "rent": 4, "rent_1_house": 20, "rent_2_houses": 60, "rent_3_houses": 180, "rent_4_houses": 320, "rent_hotel": 450, "house_cost": 50, "mortgage_value": 30, "tax_amount": null},
  {"index": 4, "name": "Income Tax", "type": "tax", "color_group": null, "price": null, "rent": null, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": null, "tax_amount": 200},
  {"index": 5, "name": "Reading Railroad", "type": "railroad", "color_group": null, "price": 200, "rent": 25, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": 100, "tax_amount": null},
  {"index": 6, "name": "Oriental Avenue", "type": "property", "color_group": "light_blue", "price": 100, "rent": 6, "rent_1_house": 30, "rent_2_houses": 90, "rent_3_houses": 270, "rent_4_houses": 400, "rent_hotel": 550, "house_cost": 50, "mortgage_value": 50, "tax_amount": null},
  {"index": 7, "name": "Chance", "type": "chance", "color_group": null, "price": null, "rent": null, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": null, "tax_amount": null},
  {"index": 8, "name": "Vermont Avenue", "type": "property", "color_group": "light_blue", "price": 100, "rent": 6, "rent_1_house": 30, "rent_2_houses": 90, "rent_3_houses": 270, "rent_4_houses": 400, "rent_hotel": 550, "house_cost": 50, "mortgage_value": 50, "tax_amount": null},
  {"index": 9, "name": "Connecticut Avenue", "type": "property", "color_group": "light_blue", "price": 120, "rent": 8, "rent_1_house": 40, "rent_2_houses": 100, "rent_3_houses": 300, "rent_4_houses": 450, "rent_hotel": 600, "house_cost": 50, "mortgage_value": 60, "tax_amount": null},
  {"index": 10, "name": "Jail / Just Visiting", "type": "jail", "color_group": null, "price": null, "rent": null, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": null, "tax_amount": null},
  {"index": 11, "name": "St. Charles Place", "type": "property", "color_group": "pink", "price": 140, "rent": 10, "rent_1_house": 50, "rent_2_houses": 150, "rent_3_houses": 450, "rent_4_houses": 625, "rent_hotel": 750, "house_cost": 100, "mortgage_value": 70, "tax_amount": null},
  {"index": 12, "name": "Electric Company", "type": "utility", "color_group": null, "price": 150, "rent": null, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": 75, "tax_amount": null},
  {"index": 13, "name": "States Avenue", "type": "property", "color_group": "pink", "price": 140, "rent": 10, "rent_1_house": 50, "rent_2_houses": 150, "rent_3_houses": 450, "rent_4_houses": 625, "rent_hotel": 750, "house_cost": 100, "mortgage_value": 70, "tax_amount": null},
  {"index": 14, "name": "Virginia Avenue", "type": "property", "color_group": "pink", "price": 160, "rent": 12, "rent_1_house": 60, "rent_2_houses": 180, "rent_3_houses": 500, "rent_4_houses": 700, "rent_hotel": 900, "house_cost": 100, "mortgage_value": 80, "tax_amount": null},
  {"index": 15, "name": "Pennsylvania Railroad", "type": "railroad", "color_group": null, "price": 200, "rent": 25, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": 100, "tax_amount": null},
  {"index": 16, "name": "St. James Place", "type": "property", "color_group": "orange", "price": 180, "rent": 14, "rent_1_house": 70, "rent_2_houses": 200, "rent_3_houses": 550, "rent_4_houses": 750, "rent_hotel": 950, "house_cost": 100, "mortgage_value": 90, "tax_amount": null},
  {"index": 17, "name": "Community Chest", "type": "community_chest", "color_group": null, "price": null, "rent": null, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": null, "tax_amount": null},
  {"index": 18, "name": "Tennessee Avenue", "type": "property", "color_group": "orange", "price": 180, "rent": 14, "rent_1_house": 70, "rent_2_houses": 200, "rent_3_houses": 550, "rent_4_houses": 750, "rent_hotel": 950, "house_cost": 100, "mortgage_value": 90, "tax_amount": null},
  {"index": 19, "name": "New York Avenue", "type": "property", "color_group": "orange", "price": 200, "rent": 16, "rent_1_house": 80, "rent_2_houses": 220, "rent_3_houses": 600, "rent_4_houses": 800, "rent_hotel": 1000, "house_cost": 100, "mortgage_value": 100, "tax_amount": null},
  {"index": 20, "name": "Free Parking", "type": "free_parking", "color_group": null, "price": null, "rent": null, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": null, "tax_amount": null},
  {"index": 21, "name": "Kentucky Avenue", "type": "property", "color_group": "red", "price": 220, "rent": 18, "rent_1_house": 90, "rent_2_houses": 250, "rent_3_houses": 700, "rent_4_houses": 875, "rent_hotel": 1050, "house_cost": 150, "mortgage_value": 110, "tax_amount": null},
  {"index": 22, "name": "Chance", "type": "chance", "color_group": null, "price": null, "rent": null, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": null, "tax_amount": null},
  {"index": 23, "name": "Indiana Avenue", "type": "property", "color_group": "red", "price": 220, "rent": 18, "rent_1_house": 90, "rent_2_houses": 250, "rent_3_houses": 700, "rent_4_houses": 875, "rent_hotel": 1050, "house_cost": 150, "mortgage_value": 110, "tax_amount": null},
  {"index": 24, "name": "Illinois Avenue", "type": "property", "color_group": "red", "price": 240, "rent": 20, "rent_1_house": 100, "rent_2_houses": 300, "rent_3_houses": 750, "rent_4_houses": 925, "rent_hotel": 1100, "house_cost": 150, "mortgage_value": 120, "tax_amount": null},
  {"index": 25, "name": "B. & O. Railroad", "type": "railroad", "color_group": null, "price": 200, "rent": 25, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": 100, "tax_amount": null},
  {"index": 26, "name": "Atlantic Avenue", "type": "property", "color_group": "yellow", "price": 260, "rent": 22, "rent_1_house": 110, "rent_2_houses": 330, "rent_3_houses": 800, "rent_4_houses": 975, "rent_hotel": 1150, "house_cost": 150, "mortgage_value": 130, "tax_amount": null},
  {"index": 27, "name": "Ventnor Avenue", "type": "property", "color_group": "yellow", "price": 260, "rent": 22, "rent_1_house": 110, "rent_2_houses": 330, "rent_3_houses": 800, "rent_4_houses": 975, "rent_hotel": 1150, "house_cost": 150, "mortgage_value": 130, "tax_amount": null},
  {"index": 28, "name": "Water Works", "type": "utility", "color_group": null, "price": 150, "rent": null, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": 75, "tax_amount": null},
  {"index": 29, "name": "Marvin Gardens", "type": "property", "color_group": "yellow", "price": 280, "rent": 24, "rent_1_house": 120, "rent_2_houses": 360, "rent_3_houses": 850, "rent_4_houses": 1025, "rent_hotel": 1200, "house_cost": 150, "mortgage_value": 140, "tax_amount": null},
  {"index": 30, "name": "Go To Jail", "type": "go_to_jail", "color_group": null, "price": null, "rent": null, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": null, "tax_amount": null},
  {"index": 31, "name": "Pacific Avenue", "type": "property", "color_group": "green", "price": 300, "rent": 26, "rent_1_house": 130, "rent_2_houses": 390, "rent_3_houses": 900, "rent_4_houses": 1100, "rent_hotel": 1275, "house_cost": 200, "mortgage_value": 150, "tax_amount": null},
  {"index": 32, "name": "North Carolina Avenue", "type": "property", "color_group": "green", "price": 300, "rent": 26, "rent_1_house": 130, "rent_2_houses": 390, "rent_3_houses": 900, "rent_4_houses": 1100, "rent_hotel": 1275, "house_cost": 200, "mortgage_value": 150, "tax_amount": null},
  {"index": 33, "name": "Community Chest", "type": "community_chest", "color_group": null, "price": null, "rent": null, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": null, "tax_amount": null},
  {"index": 34, "name": "Pennsylvania Avenue", "type": "property", "color_group": "green", "price": 320, "rent": 28, "rent_1_house": 150, "rent_2_houses": 450, "rent_3_houses": 1000, "rent_4_houses": 1200, "rent_hotel": 1400, "house_cost": 200, "mortgage_value": 160, "tax_amount": null},
  {"index": 35, "name": "Short Line", "type": "railroad", "color_group": null, "price": 200, "rent": 25, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": 100, "tax_amount": null},
  {"index": 36, "name": "Chance", "type": "chance", "color_group": null, "price": null, "rent": null, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": null, "tax_amount": null},
  {"index": 37, "name": "Park Place", "type": "property", "color_group": "dark_blue", "price": 350, "rent": 35, "rent_1_house": 175, "rent_2_houses": 500, "rent_3_houses": 1100, "rent_4_houses": 1300, "rent_hotel": 1500, "house_cost": 200, "mortgage_value": 175, "tax_amount": null},
  {"index": 38, "name": "Luxury Tax", "type": "tax", "color_group": null, "price": null, "rent": null, "rent_1_house": null, "rent_2_houses": null, "rent_3_houses": null, "rent_4_houses": null, "rent_hotel": null, "house_cost": null, "mortgage_value": null, "tax_amount": 100},
  {"index": 39, "name": "Boardwalk", "type": "property", "color_group": "dark_blue", "price": 400, "rent": 50, "rent_1_house": 200, "rent_2_houses": 600, "rent_3_houses": 1400, "rent_4_houses": 1700, "rent_hotel": 2000, "house_cost": 200, "mortgage_value": 200, "tax_amount": null}
]
```

Key notes for consumers of the JSON:
- `rent` on a `railroad` is the 1-railroad-owned rent; use §3 for the ladder.
- `rent` on a `utility` is `null`; utility rent is a dice-multiplier rule, see §3.
- `tax_amount` is present on every object and is non-null only on the two `tax`
  spaces (indices 4 and 38). The `rent` field is `null` on tax
  spaces — read `tax_amount`, not `rent`, for the amount owed. The markdown table
  above folds `tax_amount` into its "rent (base)" column for compactness.
- A property with no houses but whose owner holds the **complete color group**
  charges **2 x base rent**. That doubling is a rule, not a table column.
  S3, verbatim: "the owner may then charge double rent for unimproved properties
  in that color-group" and "The owner still collects double rent from an opponent
  who lands on the unimproved properties of his/her complete color-group."
  The doubling applies only to unmortgaged, unimproved properties.

---

## 3. Railroads and utilities

### Railroad rent ladder (S1, S2, S6 — all agree)

| railroads owned by the same player | rent |
|---|---|
| 1 | 25 |
| 2 | 50 |
| 3 | 100 |
| 4 | 200 |

Price 200 each, mortgage 100 each, no houses/hotels. As JSON:

```json
{"railroad_price": 200, "railroad_mortgage": 100, "railroad_rent_by_count": {"1": 25, "2": 50, "3": 100, "4": 200}}
```

### Utility rent rule (S1, S6 — agree)

- Owner holds **1** utility: rent = **4 x** the sum of the two dice just rolled.
- Owner holds **both** utilities: rent = **10 x** the dice sum.
- Range with 2d6: 1 utility → 8..48; 2 utilities → 20..120.
- Price 150 each, mortgage 75 each.
- Edge case (UNVERIFIED here, and card text is another lane's scope): the Chance
  card "Advance token to nearest Utility" is commonly printed as "throw dice and
  pay owner a total ten times the amount thrown", i.e. 10x even if the owner holds
  only one utility. Not found in S3/S6 — confirm against the Chance deck before
  implementing.

```json
{"utility_price": 150, "utility_mortgage": 75, "utility_rent_multiplier_by_count": {"1": 4, "2": 10}, "utility_rent_basis": "sum_of_two_dice"}
```

---

## 4. Money

### Starting cash: $1,500 per player

Exact bill breakdown, quoted verbatim from Hasbro's official instructions (S3):
"Each player is given $1500 divided as follows: 2 each of $500's, $100's and
$50's; 6 $20's; 5 each of $10's, $5's and $1's." S4 gives the identical
breakdown (its text extraction is OCR-garbled but structurally the same).

| denomination | count | subtotal |
|---|---|---|
| $500 | 2 | 1000 |
| $100 | 2 | 200 |
| $50 | 2 | 100 |
| $20 | 6 | 120 |
| $10 | 5 | 50 |
| $5 | 5 | 25 |
| $1 | 5 | 5 |
| **total** | **27 bills** | **$1,500** |

```json
{"starting_cash": 1500, "starting_bills": {"500": 2, "100": 2, "50": 2, "20": 6, "10": 5, "5": 5, "1": 5}}
```

### Full denomination set

`[1, 5, 10, 20, 50, 100, 500]` — seven denominations (S5). Modern "Ultimate Banking"/electronic editions have no bills at
all — out of scope here.

### Total money supplied with the set

Hasbro (S5) for standard editions: **30 bills of each of the 7 denominations**,
**total $20,580**.

| denomination | count | subtotal |
|---|---|---|
| $500 | 30 | 15,000 |
| $100 | 30 | 3,000 |
| $50 | 30 | 1,500 |
| $20 | 30 | 600 |
| $10 | 30 | 300 |
| $5 | 30 | 150 |
| $1 | 30 | 30 |
| **total** | **210 bills** | **$20,580** |

Bank holdings at game start = `20580 - (1500 * player_count)`:

| players | bank holds |
|---|---|
| 2 | 17,580 |
| 3 | 16,080 |
| 4 | 14,580 |
| 5 | 13,080 |
| 6 | 11,580 |
| 7 | 10,080 |
| 8 | 8,580 |

Older US editions shipped a different bill mix totalling **$15,140**
(UNVERIFIED — no primary source found; widely repeated but not confirmed against
Hasbro). For a digital clone the bank is effectively unlimited anyway: "The Bank
never goes broke. If the Bank runs out of money, the Banker may issue as much
more as may be needed" (S3).

```json
{"denominations": [500, 100, 50, 20, 10, 5, 1], "bills_of_each_denomination": 30, "total_money_in_set": 20580, "bank_is_unlimited": true}
```

---

## 5. Building supply

- **32 houses**
- **12 hotels**

Both stated in the Contents line of Hasbro's official instructions:
S4 "Contents: Gameboard, 3 dice, tokens, 32 houses, 12 hotels..." and
S3 "The equipment consists of a board, 2 dice, tokens, 32 houses and 12 hotels."

```json
{"houses_available": 32, "hotels_available": 12, "max_houses_per_property": 4, "houses_returned_when_hotel_built": 4}
```

Supply matters mechanically: when the Bank has no houses left, players must wait
for one to be returned; if demand exceeds supply the Bank auctions them (S3).
Building must be even across a color group (`evenBuild`).

---

## 6. RICHUP BOARD NAMING

**Superseded by a primary-source capture. Full table lives elsewhere — do not
re-derive it from this file.**

> **Canonical richup board data: `research/richup-observed-live.md` §5 and §9.**
> That file has all 40 tiles with exact prices, six-level rent arrays, house/hotel
> costs, `countryId` groups and a copy-pasteable JSON array. Section 9 also carries
> a richup-vs-Hasbro rent comparison table.

Source: **live capture of richup.io Classic map, 2026-08-20, via in-app board
preview + React props** (`{name, type, price, countryId, rentPrices, housePrice,
hotelPrice}` read off all 40 rendered tiles, cross-checked against the in-app
property tooltips). This is richup's own client state. **VERIFIED.** It replaces
everything this lane previously inferred from marketing renders and userscripts;
where the two disagree, the live capture wins.

Only the **Classic** map (free) was captured. Three more maps exist — Mr.
Worldwide, Death Valley, Lucky Wheel — all premium/paid, all uncaptured.

### The four findings that matter for implementation

**1. Tile order differs from the standard board — in exactly two places.**

| index | standard board | richup Classic |
|---|---|---|
| 7 | Chance | Haifa (city) |
| 8 | Vermont Avenue (light blue) | Surprise (card) |
| 27 | Ventnor Avenue (yellow) | Water Company |
| 28 | Water Works (utility) | Toulouse (city) |

So richup's light-blue equivalent (**Israel**) sits at **6, 7, 9** with the card
tile at **8**; its yellow equivalent (**France**) sits at **26, 28, 29** with the
company at **27**. Every other index matches the standard board slot-for-slot.
*(This independently confirms the two deviations this lane had read off richup's
`og_image.png` render and flagged as medium-confidence — they were correct.)*

**2. Prices differ. richup breaks every repeated Hasbro price into a strictly
ascending sequence.**

| group | richup prices | Hasbro equivalent |
|---|---|---|
| Brazil (brown) | 60, 60 | 60, 60 — unchanged |
| Israel (light blue) | 100, 110, 120 | 100, 100, 120 |
| Italy (pink) | 130, 140, 160 | 140, 140, 160 |
| Germany (orange) | 180, 190, 200 | 180, 180, 200 |
| China (red) | 210, 220, 240 | 220, 220, 240 |
| France (yellow) | 260, 270, 280 | 260, 260, 280 |
| United Kingdom (green) | 290, 300, 320 | 300, 300, 320 |
| USA (dark blue) | 360, 400 | 350, 400 |
| Airports | 200 each | 200 each — unchanged |
| Companies | 150 each | 150 each — unchanged |

Brazil is the only group that keeps a repeated price. Every other group where
Hasbro prints the same price twice is nudged apart in richup.

**3. Rents differ — every group was re-tuned, in both directions.** Examples:

| richup tile / Hasbro equivalent | richup rents | Hasbro rents |
|---|---|---|
| Rio / Baltic Avenue | 4, 20, 60, **190, 330, 460** | 4, 20, 60, 180, 320, 450 |
| Venice / St. Charles Place | 10, 50, **140, 440, 600, 740** | 10, 50, 150, 450, 625, 750 |
| San Francisco / Park Place | 35, **180, 550, 1150, 1350, 1525** | 35, 175, 500, 1100, 1300, 1500 |
| New York / Boardwalk | 50, 200, 600, 1400, 1700, 2000 | identical — the only unchanged ladder |

Some rents go up, some down: this is a deliberate rebalance, not transcription
drift. House/hotel cost is still 50 / 100 / 150 / 200 by group pair, same as
Hasbro, and `hotelPrice === housePrice` for every property.

> **Implementation warning:** do NOT seed a richup-style board by taking §1/§2 of
> this file and renaming the tiles. Sections 1–5 and 7 of this file are the
> **Hasbro standard board** and are correct as such. For richup parity, use the
> numbers in `richup-observed-live.md` §9.

**4. Airports and companies.** Airports use a flat ladder `[25, 50, 100, 200]`
indexed by the number of airports the owner holds — identical to Hasbro's
railroad rent ladder (see §3 above). Companies carry **no rent array in client
state at all** (only `price: 150`), so their multiplier is computed server-side
and remains **genuinely UNVERIFIED for richup**. Hasbro's 4x / 10x dice rule
(§3) is the obvious guess but is not confirmed for richup.

### richup's own type vocabulary

`corner` (4) · `city` (22) · `airport` (4) · `company` (2) · `bonus` (8) = 40.

*(Counting note: `richup-observed-live.md` §9 lists `city` as 28 in its prose
table; its own JSON array has 22 `city` tiles, and 4+22+4+2+8 = 40. 28 is the
count of **purchasable** tiles — 22 cities + 4 airports + 2 companies — which is
also Hasbro's 28 title deeds. Use 22 for `city`.)*

Note the modelling choice: **both taxes are typed `bonus`**, the same type as the
card tiles. richup has no dedicated tax tile type. Groups are `countryId` strings:
`brazil`, `israel`, `italy`, `germany`, `china`, `france`, `united-kingdom`,
`united-states-of-america`. The naming scheme is real cities grouped by country,
each tile badged with a national flag.

### Terminology map (VERIFIED)

| standard Monopoly | richup |
|---|---|
| GO | Start |
| Chance | Surprise |
| Community Chest | Treasure |
| Free Parking | Vacation |
| Jail / Just Visiting | Prison — "In Prison" / "Passing by" |
| Go To Jail | Go to prison |
| Railroad | Airport |
| Electric Company | Power Company |
| Water Works | Water Company |
| Income Tax ($200 flat) | **Earnings Tax — 10%**, shown as `%10` |
| Luxury Tax ($100) | **Premium Tax — $75** |
| colour group | property set |

City names, by group: Brazil — Salvador, Rio · Israel — Tel Aviv, Haifa,
Jerusalem · Italy — Venice, Milan, Rome · Germany — Frankfurt, Munich, Berlin ·
China — Shenzhen, Beijing, Shanghai · France — Lyon, Toulouse, Paris · UK —
Liverpool, Manchester, London · USA — San Francisco, New York. Airports: TLV,
MUC, CDG, JFK.

### Still open for richup

- Company (utility) rent multipliers — not in client state.
- The three premium maps (Mr. Worldwide, Death Valley, Lucky Wheel).
- Per-group display colours (hex) — not captured; §7 below is Hasbro's palette.

## 7. Color groups

Hex values are the ones used across the widely-copied digital board palette (S2);
they are close to, but not officially certified as, Hasbro's print colors. These
are the **standard Hasbro** groups — richup's per-group display colours were not
captured (see §6).

| group key | display name | member indices | count | hex | house cost | monopoly rent multiplier (undeveloped) |
|---|---|---|---|---|---|---|
| brown | Brown / Dark Purple | 1, 3 | 2 | `#955436` | 50 | 2x |
| light_blue | Light Blue | 6, 8, 9 | 3 | `#AAE0FA` | 50 | 2x |
| pink | Pink / Magenta | 11, 13, 14 | 3 | `#D93A96` | 100 | 2x |
| orange | Orange | 16, 18, 19 | 3 | `#F7941D` | 100 | 2x |
| red | Red | 21, 23, 24 | 3 | `#ED1B24` | 150 | 2x |
| yellow | Yellow | 26, 27, 29 | 3 | `#FEF200` | 150 | 2x |
| green | Green | 31, 32, 34 | 3 | `#1FB25A` | 200 | 2x |
| dark_blue | Dark Blue | 37, 39 | 2 | `#0072BB` | 200 | 2x |

```json
{
  "brown":      {"indices": [1, 3],        "hex": "#955436", "house_cost": 50},
  "light_blue": {"indices": [6, 8, 9],     "hex": "#AAE0FA", "house_cost": 50},
  "pink":       {"indices": [11, 13, 14],  "hex": "#D93A96", "house_cost": 100},
  "orange":     {"indices": [16, 18, 19],  "hex": "#F7941D", "house_cost": 100},
  "red":        {"indices": [21, 23, 24],  "hex": "#ED1B24", "house_cost": 150},
  "yellow":     {"indices": [26, 27, 29],  "hex": "#FEF200", "house_cost": 150},
  "green":      {"indices": [31, 32, 34],  "hex": "#1FB25A", "house_cost": 200},
  "dark_blue":  {"indices": [37, 39],      "hex": "#0072BB", "house_cost": 200}
}
```

Non-colored purchasables: railroads at 5, 15, 25, 35; utilities at 12, 28.

S2 renders brown as `#955438`; `#955436` is the more commonly cited value. The
one-digit difference is visually imperceptible — pick either.
