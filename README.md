# BalqisMJ Property — Johor Bahru Property Agent Website

Professional property agent website for **Nurul Balqis** (BalqisMJ Property), built with **Next.js 14 App Router**, Tailwind CSS, and a **Google Sheet** as the single source of truth for listings. No database, no auth, no CMS.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Connect your Google Sheet

1. Open your listings spreadsheet in Google Sheets.
2. Click **Share → General access → Anyone with the link → Viewer**.
3. Copy the **sheet ID** from the URL — the long string between `/d/` and `/edit`:
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit#gid=0`
4. Paste it into `.env.local`:

```
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_SHEET_GID=0
```

`GOOGLE_SHEET_GID` is the tab id from `#gid=...` in the URL — keep `0` if your listings are on the first tab. Restart `npm run dev` after changing `.env.local`.

## Sheet format

Row 1 must be the header row. Column order doesn't matter — the site reads columns by name:

| Column | Example / allowed values |
| --- | --- |
| `id` | `prop-001` — unique, no spaces. **Must match the photo folder name** (see below) |
| `title` | `Double Storey Terrace, Taman Mount Austin` |
| `listingType` | `sale`, `rent`, `room-rent` |
| `propertyType` | `residential`, `commercial`, `land` |
| `subType` | `Terrace`, `Condo`, `Shophouse`, `SoHo`… |
| `price` | `550000` (RM; monthly amount for rentals) |
| `bedrooms` / `bathrooms` / `carPark` | Numbers only |
| `builtUpSqft` / `landSqft` | Numbers only |
| `tenure` | `Freehold`, `Leasehold` |
| `furnishing` | `Unfurnished`, `Partially Furnished`, `Fully Furnished` |
| `status` | `available` (default), `sold`, `rented` |
| `featured` | `TRUE` → shows in Featured Listings on the landing page |
| `isNew` | `TRUE` → "New" badge |
| `amenities` | Comma-separated: `Air-Conditioning, WiFi, Attached Bathroom` |
| `description` | Long text; line breaks are rendered |
| `postedDate` | Used for "Newest" sorting (e.g. `2026-07-05`) |
| `area` | One of the JB areas (Mount Austin, Skudai, Tebrau…) |
| `city` / `state` | Defaults to `Johor Bahru` / `Johor` |
| `address` | Shown on the detail page |
| `mapEmbedUrl` | Google Maps **embed** URL (Share → Embed a map → copy the `src`) |
| `coverImage`, `image2`…`image20` | Image paths (e.g. `/photos/prop-001/cover.jpg`) or full URLs. First filled cell = cover. If all are empty, photos fall back to the `public/photos/<id>/` folder |

Rows with an empty `id`/`title`, or an `id` containing `(` (instruction rows), are ignored.

Changes in the sheet appear on the site within **5 minutes** (ISR cache) — no redeploy needed.

## Property photos

Put each property's photos in `public/photos/<id>/` where `<id>` matches the sheet's `id` column:

```
public/photos/prop-001/cover.jpg     ← "cover.*" is always shown first
public/photos/prop-001/photo_2.jpg
public/photos/prop-002/…
```

A manifest is rebuilt automatically on every `npm run dev` / `npm run build` (or manually via `npm run photos:manifest`). The sheet's image columns take priority; the folder manifest is the fallback when they're empty.

To (re)generate the sheet rows from the photo folders, run `node scripts/generate-sheet-data.mjs` — it writes `sheet_data.csv` (54 properties, up to 20 images each) which you can import into Google Sheets via **File → Import → Upload → Replace current sheet**.

> **Agent photo:** `public/agent-balqis.png` — replace with the real photo of Balqis.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing page — category hub, featured listings |
| `/buy` | For-sale listings + 4 Malaysian calculators (loan, stamp duty, legal fees, affordability) |
| `/rent-house` | Full unit rentals |
| `/rent-room` | Room rentals |
| `/commercial` | Commercial & industrial (sale + rent) |
| `/listings/[id]` | Property detail (SEO/Open Graph from listing data) |
| `/about` · `/contact` | Agent profile · WhatsApp contact form |

## Deploy on Vercel

1. Push this folder to GitHub.
2. Import the repo in Vercel.
3. Add `GOOGLE_SHEET_ID` and `GOOGLE_SHEET_GID` in **Project Settings → Environment Variables**.
4. Deploy — done. Sheet edits auto-refresh on the site every 5 minutes without redeployment. (New **photos** require a redeploy, since they ship with the site.)
