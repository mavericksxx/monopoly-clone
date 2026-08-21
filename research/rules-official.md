# Official Hasbro Monopoly Rules — Implementable Reference

Lane: core gameplay mechanics from the official Hasbro/Parker Brothers rulebooks.
Companion files (other agents): board/property data, edge cases & bankruptcy depth, richup.io behaviour.

## How to read this file

Every rule statement carries a tag:

| Tag | Meaning |
|---|---|
| `[OFFICIAL]` | Printed in a Hasbro/Parker Brothers rulebook. Source cited inline. |
| `[RICHUP-DEFAULT]` | richup.io's out-of-the-box behaviour (not my lane — noted only where I am certain and flagged for the richup agent to confirm). |
| `[RICHUP-TOGGLE]` | An option richup.io exposes in the lobby (not my lane). |
| `[HOUSE-RULE]` | Common but **not** in any Hasbro rulebook. Kept in its own section. |

Anything I could not source is written as **UNVERIFIED** in bold. Nothing here is filled in from memory without that mark.

## Primary sources

All four are Hasbro-published rulebooks for the **US board**. I could not obtain a genuine UK-board (Old Kent Road / Mayfair / Super Tax) Hasbro rulebook — see AMBIGUITIES.

| Ref | Document | Printing / code | URL |
|---|---|---|---|
| `[R1997]` | *MONOPOLY — Parker Brothers Real Estate Trading Game* | 40009-I-Rev 2, © 1935…1997 | https://www.hasbro.com/common/instruct/monins.pdf |
| `[R2007]` | *MONOPOLY Property Trading Game* (Classic Rules + Speed Die) | 00009-1, © 2004, 2007 Hasbro | https://www.hasbro.com/common/instruct/00009.pdf |
| `[R2021]` | *MONOPOLY* Game Guide (EN/FR) | C1009, © 1935, 2021 Hasbro | https://instructions.hasbro.com/api/download/C1009_en-gb_monopoly-game.pdf (page: https://instructions.hasbro.com/en-gb/instruction/monopoly-game) |
| `[R2025]` | *MONOPOLY* Game Guide, Classic w/ Storage Tray | G0009, © 1935, 2025 Hasbro | https://instructions.hasbro.com/api/download/G0009_en-us_monopoly-board-game-classic-game-with-storage-tray-and-larger-tokens-family-games-8.pdf (page: https://instructions.hasbro.com/en-us/instruction/monopoly-board-game-classic-game-with-storage-tray-and-larger-tokens-family-games-8) |

`[R1997]` and `[R2007]` are the long-form "classic" rulebook (essentially identical text). `[R2021]` and `[R2025]` are the modern rewritten Game Guide, which **changes several rules**. Where they differ, both readings are given.

> **If you implement only one edition:** implement `[R2025]`/`[R2021]` (the modern Game Guide) as the base ruleset, because its auction procedure, rent-forfeit window and Income Tax are unambiguous and match what most online clones (richup.io included) do — then add the classic `[R1997]` variants as toggles. Every divergence is tabulated in AMBIGUITIES & EDITION DIFFERENCES at the bottom.

---

## 1. Object of the game

- `[OFFICIAL]` The object is to become the wealthiest player through buying, renting and selling property. `[R1997]`, `[R2007]` — https://www.hasbro.com/common/instruct/monins.pdf
- `[OFFICIAL]` Modern restatement: "If you're the last player with money when all other players have gone bankrupt, you win." `[R2025]` — https://instructions.hasbro.com/en-us/instruction/monopoly-board-game-classic-game-with-storage-tray-and-larger-tokens-family-games-8

## 2. Players and components

*All rows in this table are `[OFFICIAL]` unless a cell says otherwise; sources are given in the column headers or footnotes below the table.*

| Item | Classic `[R1997]`/`[R2007]` | Modern `[R2025]`/`[R2021]` |
|---|---|---|
| Players | **2 to 8** (title page of `[R2007]`) | **2 to 6** (cover of `[R2025]`) |
| Age | 8+ | 8+ |
| Dice | 2 (`[R2007]` says "3 dice" only because that box includes the optional **Speed Die**) | 2 |
| Tokens | one per player | 8 tokens supplied |
| Title Deed cards | one per property | 28 |
| Chance cards | — | 16 |
| Community Chest cards | — | 16 |
| Houses | **32** | **32** |
| Hotels | **12** | **12** |

- `[OFFICIAL]` House/hotel counts are hard supply limits, not flavour — see §11 Building shortages. `[R1997]`
- `[OFFICIAL]` Two or more tokens may rest on the same space at the same time. `[R1997]`

## 3. Setup

- `[OFFICIAL]` Place Chance and Community Chest decks facedown on their board spaces (shuffled, per `[R2025]`). `[R1997]`, `[R2025]`
- `[OFFICIAL]` Each player chooses one token and places it on **GO**. `[R2025]` (classic `[R1997]` places tokens on GO at the start of play)
- `[OFFICIAL]` Each player is given **$1,500**. `[R1997]`, `[R2007]`, `[R2025]`
- `[OFFICIAL]` All remaining money and equipment goes to the Bank. `[R1997]`

### Starting cash breakdown — the two official breakdowns both total $1,500

*All rows in this table are `[OFFICIAL]` unless a cell says otherwise; sources are given in the column headers or footnotes below the table.*

| Denomination | Classic `[R1997]` / `[R2007]` | Modern `[R2025]` (verified from the printed money diagram) |
|---|---|---|
| $500 | 2 | 2 |
| $100 | 2 | 2 |
| $50 | 2 | 3 |
| $20 | 6 | 4 |
| $10 | 5 | 4 |
| $5 | 5 | 5 |
| $1 | 5 | 5 |
| **Total** | **$1,500** | **$1,500** |

Implementation note: denominations only matter if you model physical bills. For a web clone, track an integer balance and ignore the breakdown (richup.io does).

### Turn order

- `[OFFICIAL]` Classic: starting with the Banker, each player throws the dice; highest total starts. `[R1997]`
- `[OFFICIAL]` Modern: each player rolls both dice, highest roller starts. `[R2025]`
- `[OFFICIAL]` Play then passes **to the left** (clockwise around the table); tokens move **clockwise** around the board (in the direction of the arrow). `[R1997]`, `[R2025]`
- **UNVERIFIED**: no rulebook I found specifies a tie-break procedure for the opening roll. Implement re-roll among tied players.

## 4. The Banker and the Bank

- `[OFFICIAL]` Select as Banker a player who will also make a good **Auctioneer**. `[R1997]`
- `[OFFICIAL]` A Banker who also plays must keep personal funds separate from the Bank's. `[R1997]`, `[R2025]`
- `[OFFICIAL]` When **more than five** people play, the Banker may elect to act only as Banker and Auctioneer (i.e. not play). `[R1997]`
- `[OFFICIAL]` The Bank holds: all money not held by players, all unsold Title Deed cards, and all houses and hotels prior to purchase. `[R1997]`, `[R2025]`
- `[OFFICIAL]` The Bank pays salaries and bonuses; sells and auctions properties; sells houses and hotels; loans money on mortgages. `[R1997]`
- `[OFFICIAL]` The Bank collects all taxes, fines, loans, interest, and property prices. `[R1997]`
- `[OFFICIAL]` **The Bank never "goes broke."** If it runs out of money the Banker issues more on ordinary paper. Implementation: bank cash is unbounded. `[R1997]`
- `[OFFICIAL]` "Remember, being the Banker doesn't give you the right to steal!" — i.e. the Banker has no special economic privileges. `[R2025]`

## 5. Turn sequence (exact order)

`[OFFICIAL]` The modern guide states the turn as a numbered procedure `[R2025]`:

1. **Roll both dice.**
2. **Move** your token clockwise that number of spaces.
3. **Resolve the space you landed on** (buy/auction, pay rent, draw a card, pay tax, Go To Jail, etc.).
4. If you rolled **doubles**, roll again and take another turn (see §6). Otherwise your turn ends; **pass the dice to the left**.

Post-move / off-turn actions that are legal but are not part of the numbered sequence:

- `[OFFICIAL]` **Building**: "As soon as you get a color set, you can start buying Houses (**you don't have to wait for your turn**)." `[R2025]` — so building is legal at any time, including during another player's turn. Classic wording: "you may buy and erect at any time as many houses as your judgement and financial standing will allow." `[R1997]`
- `[OFFICIAL]` **Selling buildings back to the Bank**: "at any time." `[R1997]`
- `[OFFICIAL]` **Mortgaging**: unimproved properties can be mortgaged "at any time"; "Once you own a property, you can mortgage it at any time to raise money." `[R1997]`, `[R2025]`
- `[OFFICIAL]` **Trading**: "You can buy, sell, or trade property and Get Out of Jail Free cards with other players **at any time**." `[R2025]`
- `[OFFICIAL]` **Bidding in auctions**: any player may bid, and auction bidding "doesn't need to follow turn order." `[R2025]`

Practical ordering for an implementation: allow build/mortgage/unmortgage/sell/trade as free actions gated only by a "resolve the mandatory obligation first" rule (you must settle rent/tax/debt before ending your turn), which is what the debt-resolution section implies (`[R2025]` "HELP! I CAN'T PAY!").

## 6. Doubles

- `[OFFICIAL]` On doubles: move the sum of the two dice as usual, resolve the landed space fully (all privileges and penalties apply), then **retain the dice and throw again**. `[R1997]`, `[R2007]`, `[R2025]`
- `[OFFICIAL]` **Three doubles in succession → jail immediately.** "If you roll doubles 3 times in a row, you must immediately go to Jail! **Do not complete your third turn.**" `[R2025]`, `[R2021]` — the classic wording is "move your token immediately to the space marked 'In Jail'" `[R1997]`.
  - Implementation: on the third consecutive doubles roll, do **not** move the token to the rolled destination and do **not** resolve that space. Send directly to Jail. The modern guide is explicit; the classic rulebook is silent on whether you move first, so cite `[R2025]` for this behaviour.
- `[OFFICIAL]` Doubles rolled **to get out of Jail** do **not** grant an extra turn: "even though you had thrown doubles, you do not take another turn." `[R1997]`; modern: "Use the roll to move, and that's the end of your turn." `[R2025]`
- `[OFFICIAL]` The doubles counter resets between turns (it only counts doubles thrown "in succession" within one player's turn). `[R1997]` — implied by "three times in succession".
- `[OFFICIAL]` Being sent to Jail ends your turn, so a doubles chain is terminated by going to Jail by any route. `[R1997]` ("Your turn ends when you are sent to Jail.")

## 7. Passing GO

- `[OFFICIAL]` "Each time a player's token **lands on or passes over** GO, **whether by throwing the dice or drawing a card**, the Banker pays him/her a **$200** salary." `[R1997]`, `[R2007]`, `[R2025]`
- `[OFFICIAL]` The $200 is paid **only once each time around the board** — but a card that sends you to GO after you already passed it pays a **second** $200: e.g. pass GO on the dice, land 2 past it on Community Chest (or 7 past it on Chance), draw "Advance to GO", and collect $200 for passing plus another $200 for reaching GO by the card. `[R1997]`, `[R2007]`
- `[OFFICIAL]` **Going to Jail never pays GO**: "When you are sent to Jail you cannot collect your $200 salary in that move since, regardless of where your token is on the board, you must move it directly into Jail." `[R1997]`; modern: "Move your token to the In Jail space immediately! Do not collect $200 for passing GO." `[R2025]`
- **UNVERIFIED**: the rulebooks do not state whether a card that moves you *backwards* past GO costs you $200. Standard practice is that it does not (you only collect on landing/passing forward). Implement: no payment, no charge, on backward movement.
- Implementation summary: pay $200 when the token's forward path crosses index 0, or when the token stops on GO — except on any movement whose destination is Jail-by-being-sent.

## 8. Buying property

- `[OFFICIAL]` "Whenever you land on an unowned property you may buy that property from the Bank at its **printed price**." You receive the Title Deed card and place it faceup in front of you. `[R1997]`
- `[OFFICIAL]` Modern phrasing makes the obligation explicit: "When you land on an unowned street, railroad, or utility, **you must buy it or auction it**." `[R2025]` — i.e. declining does not simply pass; the auction is mandatory.
- `[OFFICIAL]` The three property types are **streets** (in colour sets), **railroads**, and **utilities**. `[R2025]`

### 8.1 Auction — classic procedure `[R1997]`, `[R2007]`

- `[OFFICIAL]` If the lander does not wish to buy, **the Banker sells it at auction to the highest bidder**.
- `[OFFICIAL]` **Any player may bid, including the player who declined** to buy at the printed price.
- `[OFFICIAL]` **"Bidding may start at any price."** (Including below the printed price — this is the classic rule.)
- `[OFFICIAL]` The winning bidder pays the **Bank** the amount of the bid **in cash** and receives the Title Deed card.

### 8.2 Auction — modern procedure `[R2025]`, `[R2021]` (more implementable)

- `[OFFICIAL]` The Banker **must** auction it.
- `[OFFICIAL]` Any player can bid, **including the player that landed on the space**.
- `[OFFICIAL]` **Bidding starts at $10**, and anyone can raise by **as little as $1**.
- `[OFFICIAL]` **You do not need to follow turn order.**
- `[OFFICIAL]` The Banker **ends the auction when no player is willing to increase the bid**.
- `[OFFICIAL]` The highest bidder **pays the Bank**.
- `[OFFICIAL]` **If no one wants to bid, that's fine — no one pays anything and the Title Deed stays with the Bank.** (This is the answer to "what if the auction gets no bids"; the classic rulebook does not address it.)

Implementable auction spec (modern): minimum opening bid $10; minimum increment $1; open bidding, no turn order; auction closes when no player raises (implement as a countdown timer or an explicit "pass" from every other player); winner pays the Bank in cash; property remains unowned and unsold if there are zero bids. Bidders must be able to pay in cash — implied by "The buyer pays the Bank the amount of the bid **in cash**" `[R1997]`; whether a player may raise cash mid-auction by mortgaging is **UNVERIFIED**.

## 9. Rent

- `[OFFICIAL]` "When you land on property owned by another player, the owner collects rent from you **in accordance with the list printed on its Title Deed card**." `[R1997]`
- `[OFFICIAL]` **Rent must be asked for, or it is forfeited.** Modern: "There's no such thing as rent immunity, but if the owner doesn't ask for rent **before the next player rolls the dice**, you don't have to pay!" `[R2025]`, `[R2021]`. Classic: "The owner may not collect the rent if he/she fails to ask for it **before the second player following throws the dice**." `[R1997]`, `[R2007]`. **These windows differ — pick one; see AMBIGUITIES.**
- `[OFFICIAL]` **Double rent on unimproved lots of a complete colour group**: an owner holding all Title Deeds in a colour group "may then charge **double rent** for unimproved properties in that colour group." `[R1997]`; modern: "You can double the rent for those streets!" `[R2025]`
- `[OFFICIAL]` The doubling applies to **unmortgaged** properties **even if another property in that colour group is mortgaged**. `[R1997]`, `[R2007]`. Modern restates it: "Rent cannot be collected on properties that are mortgaged. However, **the increased rent level can be collected on the unmortgaged streets in a colour set**." `[R2025]`
- `[OFFICIAL]` The double-rent bonus **still applies to the unimproved lots of a complete group even after you have built on other lots in that group**: "The owner still collects double rent from an opponent who lands on the unimproved properties of his/her complete colour group." `[R1997]`
- `[OFFICIAL]` **No rent can be collected on a mortgaged property.** A mortgaged Title Deed is placed **facedown** in front of the owner. `[R1997]`, `[R2025]`
- `[OFFICIAL]` Once any house stands on a lot, rent comes from the Title Deed's "Rent with N houses"/"Rent with Hotel" row instead of the doubled base rent — implied by the printed rent ladder on each Title Deed. `[R2025]` (Title Deed images reproduced in the guide, e.g. Kentucky Avenue: rent $18, with colour set $36, 1 house $90, 2 $250, 3 $700, 4 $875, hotel $1,050; houses/hotel cost $150 each). Full board data is another agent's lane.

### 9.1 Railroads

- `[OFFICIAL]` "Pay rent based on the **number of railroads the owner has**." `[R2025]`

*All rows in this table are `[OFFICIAL]` unless a cell says otherwise; sources are given in the column headers or footnotes below the table.*

| Railroads owned by that owner | Rent |
|---|---|
| 1 | $25 |
| 2 | $50 |
| 3 | $100 |
| 4 | $200 |

Source: `[R2025]` / `[R2021]` game guide and the Reading Railroad Title Deed reproduced there — https://instructions.hasbro.com/en-us/instruction/monopoly-board-game-classic-game-with-storage-tray-and-larger-tokens-family-games-8

- `[OFFICIAL]` The railroad tier is **not** doubled by "owning the set" in the colour-group sense; the ladder above already is the mechanism. `[R2025]`
- `[OFFICIAL]` A mortgaged railroad still counts toward the tier for the owner's other, unmortgaged railroads: "The increased rent on unmortgaged railroads and utilities may be collected in the same way" (i.e. the same way as the colour-set rule that survives a mortgaged sibling). `[R2025]`, `[R2021]`

### 9.2 Utilities

- `[OFFICIAL]` "Roll the dice to determine rent. If the owner has **1 utility, rent is 4× the dice roll**. If the owner has **2 utilities, rent is 10× the dice roll**." `[R2025]`, `[R2021]`
- **UNVERIFIED — implementation fork.** Which dice roll the multiplier applies to is genuinely ambiguous in the sources: `[R2025]`'s literal wording is "**Roll the dice** to determine rent," which reads as a **fresh** roll, whereas the classic Title Deed's "4 times **amount shown on dice**" reads as the roll that **brought the payer to the space**. In normal (non-card) play, common practice is the arriving roll. See AMBIGUITIES row 15. The mortgaged-sibling rule above applies either way. `[R2025]`
- `[OFFICIAL]` With the optional Speed Die in play, "use the **sum of all three dice** when determining how much to pay on a utility. Note: the Bus and Mr. Monopoly are valued at 0." `[R2007]`

### 9.3 Card-driven rent multipliers

The rulebooks do not print the Chance/Community Chest card texts. The two multiplier cards are, in the classic US deck (**secondary source, not Hasbro** — flag for the cards agent to confirm against a card scan):

| Card | Effect |
|---|---|
| "Advance to the nearest **Railroad**. If unowned, you may buy it from the Bank. If owned, **pay owner twice the rental** to which they are otherwise entitled." | Doubles the railroad ladder value, e.g. 3 railroads owned → $200 |
| "Advance token to nearest **Utility**. If unowned, you may buy it from the Bank. If owned, **throw dice and pay owner a total ten times the amount thrown**." | Flat **10×** a fresh dice throw, regardless of whether the owner holds 1 or 2 utilities |

Secondary source: https://www.monopolyland.com/list-monopoly-chance-community-chest-cards/ and https://monopoly.fandom.com/wiki/Chance — **not** a Hasbro document. The important implementable detail is that the utility card overrides the normal 4×/10× rule with a flat 10× on a **new** dice throw, and the railroad card doubles the ladder rent — both are card effects, not property rules.

- `[OFFICIAL]` Chance/Community Chest handling: "take the top card from the deck indicated, follow the instructions and **return the card facedown to the bottom of the deck**." `[R1997]`, `[R2025]`
- `[OFFICIAL]` The **"Get Out of Jail Free"** card is the exception: it is **held until used**, then returned to the bottom of its deck. `[R1997]`, `[R2025]`
- `[OFFICIAL]` A held Get Out of Jail Free card **may be sold to another player at any time at a mutually agreed price**. `[R1997]`; modern: it may be traded like property. `[R2025]`

## 10. Building houses and hotels

### 10.1 Preconditions

- `[OFFICIAL]` You may buy houses only when you **own all the properties in a colour group**. `[R1997]`, `[R2025]`
- `[OFFICIAL]` **You cannot build on a colour set if any street in that set is mortgaged.** `[R2025]`, `[R2021]` (classic implies it via "When all the properties of a colour group are no longer mortgaged, the owner may begin to buy back houses at full price" `[R1997]`)
- `[OFFICIAL]` The price per house is printed on the Title Deed for the property being improved. `[R1997]`, `[R2025]`
- `[OFFICIAL]` Payment goes to the **Bank**. `[R2025]`
- `[OFFICIAL]` Timing: any time, **including not on your turn** — "you don't have to wait for your turn." `[R2025]`; classic "at any time as many houses as your judgement and financial standing will allow." `[R1997]`

### 10.2 The EVEN BUILD rule

- `[OFFICIAL]` "You must build evenly, i.e., **you cannot erect more than one house on any one property of any colour group until you have built one house on every property of that group**. You may then begin on the second row of houses, and so on, **up to a limit of four houses to a property**. For example, you cannot build three houses on one property if you have only one house on another property of that group." `[R1997]`, `[R2007]`
- `[OFFICIAL]` Modern restatement: "**You must build evenly.** You cannot build a second House on a street until you've built one on each street in the set. You can only have 4 Houses on a street." `[R2025]`
- Implementation: a build on lot L in group G is legal iff `houses(L) == min(houses(x) for x in G)` and `houses(L) < 4` and no lot in G is mortgaged and the group is wholly owned. The maximum spread across a group is 1.
- `[OFFICIAL]` The first house may be placed on **any one** of the group's properties; the next house must go on an unimproved property of **this or any other complete colour group you own**. `[R1997]`

### 10.3 Hotels

- `[OFFICIAL]` "When a player has **four houses on each property of a complete colour group**, he/she may buy a hotel from the Bank and erect it on any property of the colour group. He/she **returns the four houses** from that property to the Bank and **pays the price for the hotel** as shown on the Title Deed card." `[R1997]`
- `[OFFICIAL]` **Only one hotel may be erected on any one property**, and once a hotel is there you cannot add more houses. `[R1997]`, `[R2025]`
- `[OFFICIAL]` The Title Deeds print the hotel cost as "Hotels cost $X each (**plus 4 houses**)" — i.e. the hotel price equals the house price, and the four houses are surrendered on top. `[R2025]` (e.g. Mediterranean Avenue: houses $50 each, hotels $50 each plus 4 houses; Kentucky Avenue: $150/$150; St. James Place: $100/$100)
- Even-build applies to hotels too: since a hotel requires 4 houses on **each** property of the group, and the group is at 4/4/4 before the first hotel, hotels are then bought one at a time; the spread rule keeps hotel counts within one of each other (a hotel counts as five houses for evenness — see §11).

### 10.4 Building supply limits and shortages

- `[OFFICIAL]` The Bank holds exactly **32 houses** and **12 hotels**. `[R1997]`, `[R2025]`
- `[OFFICIAL]` "When the Bank has no houses to sell, players wishing to build **must wait** for some player to return or sell his/her houses to the Bank before building." `[R1997]`; modern: "**No buildings left?** You can't buy any until someone sells theirs back." `[R2025]`
- `[OFFICIAL]` **Shortage auction**: "If there are a limited number of houses and hotels available and **two or more players wish to buy more than the Bank has, the houses or hotels must be sold at auction to the highest bidder**." `[R1997]`
- `[OFFICIAL]` Modern shortage-auction procedure with numbers: "If multiple players want to buy the last House or Hotel, the Banker must auction it. **Bids start at $10, and anyone can increase the bid by as little as $1.** You don't need to follow turn order. **Payment goes to the Bank.**" `[R2025]`, `[R2021]`
- `[OFFICIAL]` "**You cannot swap buildings with, nor sell buildings to, another player.**" `[R2025]` (classic: buildings are excluded from private sales `[R1997]`)
- Implementation consequence: the 32/12 caps create the real "housing shortage" strategy. Upgrading a group to hotels **releases 20 houses** back to the Bank; buying hotels when houses are scarce is a deliberate blocking move.

## 11. Selling buildings back to the Bank

- `[OFFICIAL]` "Houses and hotels may be sold back to the Bank **at any time** for **one-half the price paid for them**." `[R1997]`
- `[OFFICIAL]` Modern: "**Sell Houses** to the Bank for **half the cost**. Houses must be sold **evenly** across the colour set." `[R2025]`
- `[OFFICIAL]` "**All houses on one colour group must be sold one by one, evenly, in reverse of the manner in which they were erected.**" `[R1997]` — the even-sell rule mirrors even-build: sell only from a lot with the maximum house count in its group.
- `[OFFICIAL]` **Hotels**: "All hotels on one colour group may be **sold at once**, or they may be sold **one house at a time (one hotel equals five houses)**, evenly, in reverse of the manner in which they were erected." `[R1997]`
- `[OFFICIAL]` Modern hotel sell-back: "**Sell Hotels** to the Bank for **half the cost, and exchange them immediately for 4 Houses**." `[R2025]` — i.e. the modern rule converts a hotel to 4 houses (subject to house supply), where the classic rule lets you cash a hotel out entirely at once. **These differ — see AMBIGUITIES.**
- Implementation: sell-back price = floor(purchase price / 2); with standard board prices all house/hotel costs are even multiples of $50 so no rounding arises.
- `[OFFICIAL]` Buildings can **never** be sold or traded to another player, only back to the Bank. `[R1997]`, `[R2025]`

## 12. Mortgages

*All rows in this table are `[OFFICIAL]` unless a cell says otherwise; sources are given in the column headers or footnotes below the table.*

| Quantity | Rule | Source |
|---|---|---|
| Mortgage value | Printed on each Title Deed; equal to **half the printed purchase price** on the standard board | `[R1997]` ("The mortgage value is printed on each Title Deed card"); the half-price relationship is board data — verify against the property table |
| Unmortgage cost | **Mortgage value + 10% interest** | `[R1997]`, `[R2025]` ("pay the unmortgage cost to the Bank (mortgage value +10%)" `[R2021]`) |
| Transfer of a mortgaged property (trade/sale) | New owner either unmortgages immediately (principal + 10%), **or** pays the Bank **10% now** and keeps the mortgage, paying principal **+ another 10%** when lifting it later | `[R1997]`, `[R2025]` |

- `[OFFICIAL]` **Unimproved** properties can be mortgaged at any time. Before an **improved** property can be mortgaged, **all buildings on all properties of its colour group** must be sold back to the Bank at half price. `[R1997]`, `[R2025]`
- `[OFFICIAL]` To mortgage: turn the Title Deed **facedown** and collect the mortgage value (printed on the back) from the Bank. `[R1997]`, `[R2025]`
- `[OFFICIAL]` **No rent can be collected on mortgaged properties or utilities**, but rent **can** be collected on the unmortgaged properties in the same group — at the increased (colour-set / railroad-tier) level. `[R1997]`, `[R2025]`
- `[OFFICIAL]` **No building on a colour group if any property in it is mortgaged.** `[R2025]`; classic: houses may be bought back at full price only "when all the properties of a colour group are no longer mortgaged." `[R1997]`
- `[OFFICIAL]` The mortgagor **retains possession**; no other player can seize the property by paying off the Bank. `[R1997]`
- `[OFFICIAL]` A mortgaged property **may be sold/traded to another player at any agreed price**. `[R1997]`, `[R2025]`
- `[OFFICIAL]` Transfer detail, classic wording: "If you are the new owner, you may lift the mortgage at once if you wish by paying off the mortgage plus 10% interest to the Bank. If the mortgage is **not** lifted at once, **you must pay the Bank 10% interest when you buy the property**, and if you lift the mortgage later you must pay the Bank **an additional 10% interest as well as the amount of the mortgage**." `[R1997]`
  - So the "keep it mortgaged" path costs **20% of the mortgage value in total interest** across the two payments, versus 10% if lifted immediately. Model both branches.
- `[OFFICIAL]` Modern wording of the same rule: the new owner may "**Immediately** pay the Bank the unmortgage cost listed on the Title Deed card **OR wait** to pay to unmortgage the property on a later turn." `[R2025]`; `[R2021]` spells out the fee: "Repay the mortgage (pay the Bank the unmortgage cost). **Or** keep the mortgage (just pay the Bank **10% of the mortgage value now**)."
- `[OFFICIAL]` Money can be loaned to a player **only by the Bank, and only by mortgaging property. No player may borrow from or lend money to another player.** `[R1997]`, `[R2007]`

## 13. Trading and private sales

- `[OFFICIAL]` "Unimproved properties, railroads and utilities (**but not buildings**) may be sold to any player as a **private transaction for any amount the owner can get**." `[R1997]`
- `[OFFICIAL]` "**No property can be sold to another player if buildings are standing on any properties of that colour group.** Any buildings so located must be sold back to the Bank before the owner can sell any property of that colour group." `[R1997]`; modern: "You must sell all buildings on a colour set to the Bank before you can sell or trade a street." `[R2025]`
- `[OFFICIAL]` Modern: "You can buy, sell, or trade **property and Get Out of Jail Free cards** with other players **at any time**." Property can be traded for **cash, other property, and/or Get Out of Jail Free cards**; the amount is decided by the players making the deal. `[R2025]`
- `[OFFICIAL]` Trading is legal **while you are in Jail**. `[R2025]`
- Not tradeable per the rulebooks: buildings, and any promise of future consideration (immunity deals and loans are explicitly disallowed by MISCELLANEOUS `[R1997]` and by the modern anti-house-rule panel `[R2025]`).

## 14. Jail

### 14.1 The three ways in

- `[OFFICIAL]` (1) Your token lands on the space marked **"Go To Jail"**; (2) you **draw a card** marked "Go to Jail"; (3) you **throw doubles three times in succession**. `[R1997]`, `[R2007]`
- `[OFFICIAL]` **Being sent to Jail ends your turn immediately.** `[R1997]`, `[R2025]`
- `[OFFICIAL]` **No $200 for passing GO** when sent to Jail, regardless of where your token was. `[R1997]`, `[R2025]`
- `[OFFICIAL]` Landing on the Jail space in the ordinary course of play is **"Just Visiting"**: no penalty, and you move on normally next turn. `[R1997]`, `[R2025]`

### 14.2 The ways out

Classic `[R1997]`, `[R2007]` lists **four**:

1. **Throwing doubles on any of your next three turns.** If you succeed you immediately move forward the number of spaces shown by the doubles throw — and **you do not take another turn** despite having thrown doubles.
2. **Using a "Get Out of Jail Free" card** if you have one.
3. **Purchasing a "Get Out of Jail Free" card from another player** and playing it.
4. **Paying a fine of $50** before you roll the dice on either of your next two turns.

- `[OFFICIAL]` "**If you do not throw doubles by your third turn, you must pay the $50 fine.** You then get out of Jail and immediately move forward the number of spaces shown by your throw." `[R1997]`, `[R2007]` — the fine is mandatory on the third failed attempt, not optional; you still move with that third roll.

Modern `[R2025]`, `[R2021]` compresses it to **three options**, with tighter timing:

1. **Pay $50 at the start of your next turn**, then roll and move as normal.
2. **Use a Get Out of Jail Free card at the start of your next turn** (you may have it or buy one from another player). Put the card at the bottom of the appropriate deck, then roll and move.
3. **Roll doubles on your next turn.** If you do, you're free — use the roll to move, and **that's the end of your turn**. You can use up to **3 turns** to try for doubles. **If you don't roll doubles by your third turn in Jail, pay $50 and use your last roll to move.**

- Implementation: track `jailTurns` 0..3. On each jailed turn the player chooses pay-$50 / play-GOJF / attempt-doubles **before** rolling. On a successful doubles roll: move by the roll, no extra turn. On the third failed attempt: force payment of $50 (raise cash by mortgaging/selling if needed; if impossible → bankruptcy path), then move by that third roll.
- `[OFFICIAL]` The $50 fine is paid to the **Bank** (the Bank "collects all taxes, fines, loans and interest"). `[R1997]`
- `[OFFICIAL]` The classic rulebook also permits paying the fine **before rolling on either of your next two turns** — i.e. an early voluntary exit on turn 1 or 2 — while the modern guide phrases it as "at the start of your next turn." Functionally the same option each jailed turn.

### 14.3 What you can still do while in Jail

- `[OFFICIAL]` "Even though you are in Jail, you may **buy and sell property, buy and sell houses and hotels, and collect rents**." `[R1997]`, `[R2007]`
- `[OFFICIAL]` Modern: "You can still **collect rent, bid during auctions, buy Houses and Hotels, mortgage, and trade** while you are in Jail." `[R2025]`
- So: jail restricts **movement only**. All economic actions remain legal, including bidding in auctions (explicit in `[R2025]`).

## 15. Free Parking

- `[OFFICIAL]` "A player landing on this place **does not receive any money, property or reward of any kind**. This is just a 'free' resting place." `[R1997]`, `[R2007]`
- `[OFFICIAL]` Modern: "**Relax! Nothing happens.** You don't get money for landing on Free Parking. **It makes the game longer!**" `[R2025]`, `[R2021]`
- The popular pot/jackpot variant is **not official** — see §19 HOUSE RULES, kept separate.

## 16. Taxes

*All rows in this table are `[OFFICIAL]` unless a cell says otherwise; sources are given in the column headers or footnotes below the table.*

| Space | Current official (2008+ US board, `[R2021]`/`[R2025]` verified from the printed board tiles) | Older US rulebook wording `[R1997]`/`[R2007]` |
|---|---|---|
| **Income Tax** (space 4, between Baltic Avenue and Reading Railroad — index per secondary source https://www.monopolyland.com/monopoly-income-tax-rules/ ; confirm with the board-data agent) | **Pay $200 flat.** The tile reads "INCOME TAX $200"; the guide says "Pay the Bank the amount shown on the space." | "You have two options: you may estimate your tax at **$200** and pay the Bank, **or** you may pay **10% of your total worth** to the Bank." |
| **Luxury Tax** (space 38, between Park Place and Boardwalk — index **UNVERIFIED** against a Hasbro document; confirm with the board-data agent) | **Pay $100 flat.** The tile reads "LUXURY TAX $100". | Not discussed in the rulebook text at all; older US boards printed **$75**. |

- `[OFFICIAL]` Classic 10% option, exact definition of total worth: "**all your cash on hand, printed prices of mortgaged and unmortgaged properties, and cost price of all buildings you own**." `[R1997]`, `[R2007]`
- `[OFFICIAL]` "**You must decide which option you will take before you add up your total worth.**" `[R1997]` — the decision is made blind; an implementation must not show the computed 10% figure before the choice.
- `[OFFICIAL]` The Short Game variant flattens it: "The penalty for landing on 'Income Tax' is a flat **$200**." `[R1997]`
- `[OFFICIAL]` All tax money goes to the **Bank**. `[R1997]` ("The Bank collects all taxes, fines, loans and interest")
- Board-tile amounts verified by rendering page 2 of `[R2021]` (C1009), which reproduces both tiles at legible size: LUXURY TAX **$100**, INCOME TAX **$200**.
- Secondary corroboration that US Luxury Tax was **$75** before the 2008 board redesign and that the 10% Income Tax option was dropped at the same time: https://www.monopolyland.com/monopoly-luxury-tax/ and https://www.monopolyland.com/monopoly-income-tax-rules/ — **not** Hasbro documents.

## 17. Bankruptcy and winning (brief — see the edge-cases file for depth)

- `[OFFICIAL]` **Definition**: "You are declared bankrupt if you **owe more than you can pay** either to another player or to the Bank." `[R1997]`
- `[OFFICIAL]` Before declaring bankruptcy you must first try to raise money by **selling buildings back to the Bank and/or mortgaging properties**. `[R2025]` ("HELP! I CAN'T PAY! 1. Try to raise money … 2. If you're still in debt, you are bankrupt and out of the game!")
- `[OFFICIAL]` **Debt to another player**: turn over everything of value to that player. Buildings are returned to the **Bank** for **half** the price paid, and that cash goes to the creditor. Mortgaged properties transfer to the creditor, who **must at once pay the Bank 10% interest** on each, then may pay the principal now or hold and pay interest again later when lifting. `[R1997]`, `[R2025]`
- `[OFFICIAL]` **Debt to the Bank**: turn over all assets to the Bank. The Bank **immediately auctions all property so taken, except buildings**. Modern adds: "Any mortgages are canceled" and "All your properties must immediately be put up for auction"; Get Out of Jail Free cards return to the bottom of their deck. `[R1997]`, `[R2025]`
- `[OFFICIAL]` "A bankrupt player must **immediately retire from the game**." `[R1997]`
- `[OFFICIAL]` **Winning**: "**The last player left in the game wins.**" `[R1997]`; modern: "The remaining players keep playing until there is only one person left in the game. That player is the winner!" `[R2025]`
- Note: the **Short Game** and **Time Limit Game** variants replace this with a richest-player-wins scoring (see §18).

## 18. Other official content in the rulebooks

### 18.1 Miscellaneous rules `[R1997]`, `[R2007]`

- `[OFFICIAL]` Money can be loaned to a player **only by the Bank**, and then only by mortgaging property. **No player may borrow from or lend money to another player.**
- `[OFFICIAL]` The Bank never goes broke (§4).
- `[OFFICIAL]` A Get Out of Jail Free card may be sold between players at any mutually agreeable price (§9.3).

### 18.2 Optional official variant — SPEED DIE `[R2007]` (third die included in some boxes)

- `[OFFICIAL]` Each player gets an **extra $1,000** at setup (total $2,500).
- `[OFFICIAL]` A player does **not** use the Speed Die until they have **landed on or passed GO** for the first time; from then on they use it every turn. Players therefore start using it at different times.
- `[OFFICIAL]` Roll the Speed Die together with the two white dice. Faces: **1, 2, 3**, **Bus**, **Mr. Monopoly**.
  - **1/2/3**: add that number to the two-white-dice total.
  - **Bus**: move the value of **one die, the other die, or the sum** — your choice.
  - **Mr. Monopoly**: first move the sum of the two white dice and fully resolve that space; **then** — if the Bank still holds unsold property, advance to the **next property the Bank still holds** and buy it if you wish, otherwise auction it; if the Bank holds no property, advance to the **next property on which you will owe another player money**.
- `[OFFICIAL]` **Only the white dice count for doubles**; the Speed Die is ignored for doubles.
- `[OFFICIAL]` **Three-of-a-kind on all three dice** → move anywhere you want on the board.
- `[OFFICIAL]` If you are sent to Jail during your move (Go To Jail space, or three doubles), your turn is over and you do not use the Speed Die that turn.
- `[OFFICIAL]` Use the **white dice only** when rolling to get out of Jail.
- `[OFFICIAL]` Use the **sum of all three dice** for utility rent; Bus and Mr. Monopoly count as **0**.

### 18.3 Optional official variant — SHORT GAME (60–90 minutes) `[R1997]`

Five changed rules:

1. `[OFFICIAL]` During setup the Banker shuffles and deals **three Title Deed cards to each player, free** (no payment to the Bank).
2. `[OFFICIAL]` Only **three houses** (instead of four) on each lot of a complete colour group are needed before buying a hotel. **Hotel rent is unchanged.** Turn-in value is still half the purchase price, which here is one house less than normal.
3. `[OFFICIAL]` Jail: you must exit on your **next** turn by GOJF card, doubles, or $50 — and unlike the standard rules you may **try for doubles and, failing, pay the $50 on the same turn**.
4. `[OFFICIAL]` Income Tax is a **flat $200**.
5. `[OFFICIAL]` **End of game: the game ends when one player goes bankrupt.** Remaining players value their assets: cash; lots/utilities/railroads at **board price**; mortgaged property at **half board price**; houses at **purchase price**; hotels at **purchase price including the value of the three houses turned in**. **Richest player wins.**

### 18.4 Optional official variant — TIME LIMIT GAME `[R1997]`

- `[OFFICIAL]` Agree a definite finishing time before starting; the richest player at that time wins.
- `[OFFICIAL]` Before starting, the Banker shuffles, cuts and deals **two Title Deeds to each player**, and players **immediately pay the Bank the printed price** of the properties dealt to them.

## 19. HOUSE RULES — NOT OFFICIAL (kept separate on purpose)

Hasbro prints an explicit anti-house-rule panel in the current guide, headed "**YOUR GAME, OUR RULES!** House rules could be making your MONOPOLY game longer!" `[R2025]` — https://instructions.hasbro.com/en-us/instruction/monopoly-board-game-classic-game-with-storage-tray-and-larger-tokens-family-games-8

The three it names:

- `[HOUSE-RULE]` **Free Parking jackpot** — "Never put cash in the middle of the board; you don't get a bonus for landing on Free Parking!" The common variant pools fines/taxes (and sometimes a fixed $500) on Free Parking and pays it to whoever lands there. **Explicitly contradicted by** `[R1997]`/`[R2025]` (§15).
- `[HOUSE-RULE]` **Skipping the auction** — "Always auction when someone doesn't want to buy the property they've landed on." Letting a declined property simply stay with the Bank without an auction is the single most common deviation and it materially changes game length and balance.
- `[HOUSE-RULE]` **Player-to-player loans and rent-immunity deals** — "Never loan money to other players or make deals not to charge each other rent." Contradicted by MISCELLANEOUS `[R1997]`.

Other widespread house rules with **no** rulebook basis (list them as toggles if you support house rules at all; none are in any source I read — treat each as **UNVERIFIED as official**, which is precisely the point):

- `[HOUSE-RULE]` Double salary ($400) for landing exactly on GO.
- `[HOUSE-RULE]` No rent collected while the owner is in Jail.
- `[HOUSE-RULE]` No auctions of any kind; unwanted property stays unowned.
- `[HOUSE-RULE]` Unlimited/looser building — ignoring even-build, or building without the full colour set.
- `[HOUSE-RULE]` Snake eyes / triples bonuses.
- `[HOUSE-RULE]` Starting with more than $1,500, or dealing out properties at setup (note: dealing properties **is** official — but only inside the Short Game and Time Limit Game variants, §18.3/§18.4).

## 20. AMBIGUITIES & EDITION DIFFERENCES

Implementers must pick one reading for each row. My recommendation column assumes a richup.io-style online clone.

*This table is comparative, not assertive: every cell restates a rule already tagged `[OFFICIAL]` and sourced in the section above it. The Recommendation column is my engineering judgement, not a rule — it carries no tag.*

| # | Rule | Classic rulebook `[R1997]` (1997) / `[R2007]` | Modern Game Guide `[R2021]` (2021) / `[R2025]` (2025) | Recommendation |
|---|---|---|---|---|
| 1 | Player count | **2–8** | **2–6** | Support 2–8; the cap is a physical-token limit, not a mechanic |
| 2 | Starting bill breakdown | 2/2/2/6/5/5/5 ($500→$1) | 2/2/3/4/4/5/5 | Irrelevant — track an integer balance |
| 3 | **Rent-forfeit window** | Forfeited if not asked for **before the second player following throws the dice** | Forfeited if not asked for **before the next player rolls the dice** | Auto-collect rent and expose "manual rent" as a toggle; if implementing manual, use the modern one-turn window. (Whether auto-collect is richup.io's default is `[RICHUP-DEFAULT]` **UNVERIFIED** — confirm with the richup agent.) |
| 4 | **Auction floor** | "**Bidding may start at any price**" (can open below printed price) | Opens at **$10**, minimum raise **$1**, no turn order, Banker closes when nobody raises | Modern — it is a complete, implementable protocol |
| 5 | **Auction with no bids** | Not addressed | **Nobody pays, property stays with the Bank** | Modern |
| 6 | **Income Tax** | **$200 or 10% of total worth**, chosen before totalling | **Flat amount printed on the space = $200** | Flat $200; offer the 10% option as a toggle if you want the older feel |
| 7 | **Luxury Tax** | Not in rulebook text; pre-2008 US boards printed **$75** | **$100** (printed on the tile, verified in `[R2021]`) | $100 |
| 8 | Jail fine timing | "$50 **before you roll on either of your next two turns**"; mandatory on the third failed turn | "**$50 at the start of your next turn**"; mandatory after the third failed turn | Same in practice: offer pay/GOJF/roll at the start of each jailed turn; force payment after the third failed roll |
| 9 | Ways out of Jail | **Four** (the fourth is buying a GOJF card from another player and playing it) | **Three** (buying a card is folded into option 2) | Identical behaviour; implement buy-then-play as a trade + card use |
| 10 | **Hotel sell-back** | A hotel may be cashed out at once, **or** sold one house at a time (**one hotel = five houses**) | "Sell Hotels to the Bank for half the cost, and **exchange them immediately for 4 Houses**" | Modern (hotel → 4 houses), but you must handle the case where fewer than 4 houses remain in the Bank — **UNVERIFIED** how Hasbro resolves that; classic's "one hotel = five houses" downgrade path is the safer fallback |
| 11 | Three-doubles jail: is the third move made? | Silent ("move your token immediately to In Jail") | Explicit: "**Do not complete your third turn**" | Modern — do not move, do not resolve the third destination |
| 12 | Building timing | "at any time" | "**you don't have to wait for your turn**" | Allow off-turn building |
| 13 | Bankruptcy to the Bank | All property auctioned by the Bank (buildings excepted) | Same, plus "**any mortgages are canceled**" and GOJF cards return to the deck | Modern — mortgage cancellation is a meaningful clarification |
| 14 | Currency / board | US board, $ | US board, $ | — |
| 15 | **Utility rent: which dice roll?** | Title Deed: "4 times **amount shown on dice**" → the arriving roll | Guide: "**Roll the dice** to determine rent" → reads as a fresh roll | Use the **arriving roll** for normal landings; use a **fresh roll** only for the "advance to nearest Utility" card (which is a flat 10× regardless). **UNVERIFIED** — no source settles it |

### Regional editions

- **No genuine UK-board Hasbro rulebook was obtainable.** `instructions.hasbro.com/en-gb/instruction/monopoly-game` and `/en-in/instruction/monopoly-game` both serve product **C1009**, which is a **US/Canada English–French guide with US street names** (Illinois Avenue, Reading Railroad, Luxury Tax, Hasbro Pawtucket RI address). Verified by grepping the extracted PDF text: zero occurrences of "Mayfair", "Old Kent", or "Super Tax".
- **UK board differences (secondary sources — treat as UNVERIFIED against a Hasbro document):**
  - The UK board's space 38 is "**SUPER TAX £100**" rather than "Luxury Tax", sitting between Park Lane and Mayfair. Source: https://www.monopolyland.com/monopoly-super-tax/
  - The UK board's Income Tax has "**always** been a flat **£200**"; the "$200 or 10%" option was a US-only rule and was never in the UK edition. Source: https://www.monopolyland.com/monopoly-income-tax-rules/
  - The same source states the **original 1935 US** Income Tax was **$300**, and that the US **Luxury Tax rose from $75 to $100 in the 2008** board redesign, which is also when the 10% Income Tax option was dropped. Source: https://www.monopolyland.com/monopoly-luxury-tax/
  - All other core mechanics (jail, even build, mortgage +10%, 32 houses / 12 hotels, $1,500 start, $200 GO) are believed identical between US and UK editions — **UNVERIFIED** for the UK edition specifically.
- Chance / Community Chest **card texts** are not printed in any of the four rulebooks. The two multiplier cards in §9.3 come from secondary sources and must be confirmed by the cards/board-data agent.

## 21. Open items for other agents

- **Board data agent**: property prices, rent ladders, house costs per colour group, mortgage values, and the exact 40-space layout. This file only reproduces the handful of Title Deeds printed in the Hasbro guides (Kentucky Ave, Mediterranean Ave, St. James Place, Reading Railroad, Illinois Ave $240, Electric Company / Water Works $150, Connecticut $120, Vermont $100, Oriental $100).
- **Cards agent**: full 16 Chance / 16 Community Chest decks, and confirmation of the railroad "twice the rental" and utility "ten times amount thrown" wordings.
- **Edge-cases agent**: bankruptcy settlement order, simultaneous debts, cash-raising forced sales, auction-during-bankruptcy, and what happens when a player owes more than one creditor.
- **richup.io agent**: which of the AMBIGUITIES rows richup implements, and which are lobby toggles. Every rule in this file is `[OFFICIAL]` unless tagged otherwise; none of the `[RICHUP-*]` tags have been applied here because that is not my lane.
