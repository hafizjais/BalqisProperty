# Content & Component Guide — Where to Change What

A quick reference for updating the site yourself. Paths are relative to the project root (`BalqisProperty/`).

**Two kinds of content on this site:**
- **Property listings** → live in **Airtable**, not in the code. Edit there, changes appear on the site within ~5 minutes.
- **Everything else** (branding, text, colors, contact info, calculators) → lives in the **code files** below. Edit the file, save, and if `npm run dev` is running you'll see it update immediately; for the live site you'll need to redeploy.

---

## 🖼️ Profile photo (Nurul Balqis)

| What | File |
|---|---|
| The actual photo | `public/agent-balqis.png` — replace this file (keep the same filename) |
| Where it's used | Automatically appears on the homepage hero and the About page — no code change needed once you swap the file |

## 📞 Contact info (WhatsApp, Telegram, Instagram)

**File:** `src/lib/constants.ts`

```ts
export const WHATSAPP_NUMBER = "60182656367";
export const INSTAGRAM_HANDLE = "balqismjproperty";
export const TELEGRAM_URL = "https://t.me/balqismjrental";
```
Change these once here and every WhatsApp button, Telegram button, and Instagram link across the whole site updates automatically.

## 🎨 Colors / theme

| What | File |
|---|---|
| Color values (hex codes) | `tailwind.config.ts` — look for `espresso`, `mocha`, `copper`, `sand`, `cream`, `warm-grey`, `graphite`, `ink`, `truffle` |
| Same values again (CSS variables) | `src/app/globals.css` — must match `tailwind.config.ts` |

Current palette: teal `#01757A` (primary/nav), orange `#E57734` (CTAs/badges), cream `#F8EBCF` (backgrounds), deep brown `#3E2922` (text/footer), peach `#F6C0A6` (borders), taupe (secondary text).

## 🔤 Fonts

**File:** `src/app/layout.tsx` — loads Playfair Display (headings) + Inter (body) via `next/font/google`. Change the font names here to swap typefaces sitewide.

## 🏠 Homepage

**File:** `src/app/page.tsx`
- "Why Johor Bahru?" — the 3 selling points (RTS Link, Iskandar Malaysia, Affordable Prices) — edit the `whyJB` array
- WhatsApp CTA band text ("Not sure where to start?")

**File:** `src/components/sections/HeroSection.tsx`
- Hero headline, subtitle, eyebrow text ("BalqisMJ Property · Johor Bahru")
- Trust stats row (Transactions / Years Experience / Specialist) — edit the `stats` array
- Hero button labels

**File:** `src/components/sections/CategoryCards.tsx`
- The 3 category cards (Buy / Shop Lot / Land) — titles, taglines, links

## 🧭 Navigation bar

**File:** `src/components/layout/Navbar.tsx`
- Menu links and the Commercial hover dropdown (Shop Lot / Land) — edit the `links` array

## 🦶 Footer

**File:** `src/components/layout/Footer.tsx`
- Quick links, JB areas list shown, contact details, copyright text

## 📍 List of Johor Bahru areas (used in filters + footer)

**File:** `src/lib/constants.ts` — the `JB_AREAS` array. Add/remove areas here and they update everywhere the area filter appears (Buy, Commercial pages).

## 🧮 Property calculators (Buy page)

**Folder:** `src/components/calculators/`

| Calculator | File | What you can tune |
|---|---|---|
| Loan Instalment | `LoanCalculator.tsx` | Default interest rate, tenure range, down payment minimum |
| Stamp Duty | `StampDutyCalculator.tsx` | The MOT stamp duty brackets/rates, first-time buyer exemption threshold |
| Legal Fees | `LegalFeesCalculator.tsx` | Solicitor scale-fee brackets, disbursement estimate |
| Affordability Checker | `AffordabilityChecker.tsx` | DSR percentage (currently 70%), financing assumption (90%) |

These are based on current Malaysian regulations — only change the numbers if the actual government/bank rates change.

## 👤 About page

**File:** `src/app/about/page.tsx`
- Bio paragraph, REN license number (currently a placeholder — search for `REN _______`)
- Stats row, property types handled, credentials section (also a placeholder)

## ✉️ Contact page

**File:** `src/components/pages/ContactClient.tsx`
- Response time text, inquiry type dropdown options, embedded map (currently shows JB city centre)

## 🔍 SEO (page titles & descriptions)

Each page file has an `export const metadata = { title, description }` block near the top:
- `src/app/page.tsx` (homepage)
- `src/app/buy/page.tsx`, `src/app/commercial/page.tsx`, `.../shop-lot/page.tsx`, `.../land/page.tsx`
- `src/app/about/page.tsx`, `src/app/contact/page.tsx`

## 🗺️ Sitemap

**File:** `src/app/sitemap.ts` — add a new entry here if you ever add a brand-new page/route (not needed for new property listings, those aren't separate routes in the sitemap).

## 🖥️ WhatsApp floating button (bottom-right, every page)

**File:** `src/components/layout/WhatsAppFAB.tsx`

---

## 🏘️ Property listings — Airtable, not code

**Base:** the "BalqisMJ Property" base → your listings table.

| Field | What it controls |
|---|---|
| `id` | Unique identifier — **required** for a listing to appear at all |
| `title`, `price`, `subType`, `bedrooms`, `bathrooms`, `carPark`, `builtUpSqft`, `landSqft` | Card & detail page basics |
| `listingType` | `sale` (only type currently in use) |
| `status pemilikan` | Tenure (Freehold/Leasehold) |
| `status lot tanah` | Lot status (Bumiputera/Non Bumi/International/Malay Reserved) |
| `furnishing`, `status`, `description`, `address`, `area`, `city` | Detail page content |
| `mapEmbedUrl` | Paste the full `<iframe>` snippet from Google Maps → Share → Embed a map |
| `images` | Upload photos directly as attachments — first photo = cover photo everywhere |
| `featured` | Checkbox — ticked listings show in the homepage's Featured Listings section |

**Sorting:** listings appear oldest → newest by when the row was created in Airtable, so a brand-new row always lands at the bottom automatically — no extra step needed.

**Categorization:** a listing lands under **Buy**, **Shop Lot**, or **Land** automatically based on words in `subType` (e.g. "Shop Lot", "Land" for those; anything else defaults to Buy). No manual category field to set.

---

## ⚙️ Environment variables (Airtable connection)

**File:** `.env.local` (not committed to git — see `.env.example` for the template)

```
AIRTABLE_PAT=...
AIRTABLE_BASE_ID=...
AIRTABLE_TABLE_ID=...
```
Only touch this if you switch to a different Airtable base/table, or need to rotate the access token.
