# CLAUDE.md — LevelUp Northeast 2026 / Exhibitor Registration (Form 2)

This is the **second** registration form for LevelUp Northeast 2026. Form 1
(visitor / general registration) lives in a separate repo:
`https://github.com/stutisict22-hue/levelup-registration.git`. This project was
forked from that codebase to reuse the brand identity and submission pipeline,
then rebuilt around the exhibitor-specific contract form.

## Purpose

Captures registrations from **exhibitors** renting a stall at the venue —
based on the printed Space Booking Contract Form provided by the client. The
form mirrors that contract:

- Exhibitor (company) details
- Exhibits + Group Companies (dynamic lists)
- Founder + Delegates (dynamic delegate list)
- Profile of Organisation (200-word textarea)
- Catalogue Advertisement (multi-select with prices)
- Stall Booking (single-select stall size with prices, **selection only — no
  payment processing**)
- Acknowledgement: View & Accept General Exhibitor Rules modal,
  Signatory Name + Designation + Signature, Company Seal upload

## Tech stack

- **Frontend:** React 18 + Vite + Tailwind CSS, dark esports theme,
  responsive single-page (no separate mobile fork — collapses to single column
  on small screens)
- **Backend:** Google Apps Script web app + Google Sheets (separate sheet
  from Form 1) + ImgBB for company-seal image hosting
- **No real DB / no auth** — Apps Script writes rows to a Sheet, dedupes by
  Company GST (fallback PAN), generates a unique exhibitor ID, sends a
  confirmation email via `MailApp`

## Project layout

```
.
├── apps-script-template.js   ← Paste into the new Google Sheet's Apps Script
├── index.html                ← Vite entry, sets <title>
├── package.json
├── public/                   ← Brand assets (logos, backgrounds, banners)
│   ├── Level Up Logo.png
│   ├── Level Up transparent final.png
│   ├── White.png             ← Header logo (used)
│   ├── CII Logo.png
│   ├── background-1.png      ← Desktop background
│   ├── mobile-background.jpg ← Mobile background (via media query)
│   ├── email-banner.{jpg,png}
│   └── …
├── src/
│   ├── main.jsx              ← React mount
│   ├── App.jsx               ← Renders <Main /> from page/index.jsx
│   ├── page/
│   │   ├── index.jsx         ← The whole form: state, sections, submit, modals
│   │   └── index.css         ← Tailwind + page background media query
│   ├── components/
│   │   ├── FormInput.jsx        ← Reusable text input
│   │   ├── SectionCard.jsx      ← Section wrapper (dark header bar + body)
│   │   ├── DynamicList.jsx      ← Add/remove rows (exhibits, group cos, delegates)
│   │   ├── StallSelector.jsx    ← Radio cards with prices
│   │   ├── CatalogueAdGroup.jsx ← Checkbox group with prices
│   │   ├── WordCountTextarea.jsx← 200-word textarea + live counter
│   │   └── RulesModal.jsx       ← General Exhibitor Rules modal (accept/decline)
│   ├── services/
│   │   ├── formService.js    ← Submission + stallOptions + catalogueAdOptions
│   │   ├── exhibitorRules.js ← The 26 rules rendered inside RulesModal
│   │   └── imageCompressor.js
│   └── styles/globals.css
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── .env.example              ← Copy to .env, fill VITE_FORM_ENDPOINT
├── .gitignore
└── rules.txt                 ← Original raw rules text from the client
```

## Backend setup (when you're ready to deploy)

1. **Create a new Google Sheet** for exhibitor registrations (separate from
   the visitor sheet — intentional).
2. Open **Extensions → Apps Script** → paste the entire contents of
   `apps-script-template.js` → Save.
3. From the Apps Script editor, run the one-off helper `setupHeaders()` once
   to write the column header row into the sheet (and freeze it). Don't run
   it again afterwards.
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the resulting **Web app URL**.
6. In this project, copy `.env.example` to `.env` and paste the URL into
   `VITE_FORM_ENDPOINT`.
7. Restart the dev server (`npm run dev`) so Vite picks up the env var.
8. Submit a test entry from the form and verify the row appears in the sheet
   and the confirmation email arrives.

The Apps Script:
- Holds a script lock during writes to avoid race conditions
- **Dedupes by Company GST (fallback PAN)** — two staff from the same
  exhibitor company won't clash. Indices defined at the top of `doPost`; if
  you change `COL_HEADERS` order, update them.
- Generates IDs of the form `IDGES2026_03XXXX` (Form 1 uses `_02`)
- Uploads the company-seal base64 image to ImgBB and stores the URL
- Sends a confirmation email via `MailApp` with the exhibitor ID
- Returns `{ result: 'success' | 'error', id?, message? }` to the frontend

## Form sections (matches the printed contract)

| # | Section | Notes |
|---|---|---|
| 1 | Exhibitor Details | Company, address, GST/PAN, memberships |
| 2 | Exhibit Details | Dynamic list, min 1, "+ Add" |
| 3 | Group Companies | Dynamic list |
| 4 | Founder Details | Name / Designation / Email / Mobile |
| 5 | Delegates | Dynamic list of delegate rows |
| 6 | Profile of Organisation | Textarea, hard 200-word cap, live counter |
| 7 | Catalogue Advertisement | Optional multi-select w/ prices |
| 8 | Stall Booking | Single-select stall size w/ prices (saved only, no payment) |
| 9 | Acknowledgement | View & Accept rules modal → unlocks Submit; signatory + seal upload |

## Validation rules

Required fields (red asterisk in UI, blocks submit):

- All Exhibitor Details except Phone, Website, CII/IDGS Membership No
- **Either GST OR PAN** must be filled (custom cross-field check)
- Founder: Name + Email
- Org Profile (non-empty)
- Stall Size selection
- Signatory Name, Designation, Signature
- Company Seal image
- Rules accepted (the Submit button is also disabled until accepted)

Email regex + phone regex live in `formService.validateEmail` / `validatePhone`.
Org profile is **hard-capped at 200 words** (typing past the limit is a no-op).

## Rules modal behaviour

- Triggered by the "View & Accept Rules" button in the Acknowledgement section
- Renders all 26 rules from `src/services/exhibitorRules.js` in a scrollable
  modal at z-index 600
- "Decline" closes the modal without changing state
- "I Accept" closes the modal AND sets `formData.agreedToRules = true`
- Submit button is `disabled` until `agreedToRules` is true
- Once accepted, the trigger button shows "✓ Accepted — View Rules" in green
  (re-clicking lets the user re-read; it cannot un-accept)

## Local dev

```bash
npm install
npm run dev      # Vite dev server (Vite prints the URL — usually http://localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Serve the production build locally
```

## What was inherited / changed / discarded vs Form 1

**Inherited (kept verbatim):**
- Brand identity: dark theme, Level Up + CII logos, neon accents, fonts
- `FormInput` component
- `imageCompressor.js`
- Submission/email pipeline pattern (script lock → dedupe → ImgBB → append → email)

**Changed:**
- ID prefix `_02` → `_03`
- Dedupe key: email+phone → GST/PAN
- Single profile-photo upload → company-seal upload in Acknowledgement
- Layout: pixel-positioned 1366px desktop + separate mobile fork →
  **one responsive page** with stacked section cards. Mobile background
  swapped via media query in `src/page/index.css`.
- `formService.js`: visitor-form fields → exhibitor schema; new option
  exports for stalls and catalogue ads
- `apps-script-template.js`: complete rewrite of column layout (41 columns)

**Discarded:**
- `src/components/mobile/*` (Register, Header, AvatarUpload, FormField) — no
  longer needed; the responsive page covers both
- `src/components/FormDropdown.jsx`, `FormCheckboxGroup.jsx` — replaced by
  the purpose-built `StallSelector` / `CatalogueAdGroup` / `RulesModal`
- Form 1 fields that don't apply: `category`, `attendingProgram`,
  `preferredDays`, `membershipAffiliation`, the indemnity terms paragraph

## Conventions / things to know

- **Section cards** all use the same `<SectionCard title="...">` wrapper —
  dark navy header bar + light grey body. Add a new section by dropping
  another card into `<main>` in `src/page/index.jsx`.
- **Dynamic lists** use the generic `<DynamicList>` — pass `simple` for
  single-input rows or a custom `renderRow` for compound rows (see Delegates).
- **Stall + Ad option lists** live in `src/services/formService.js` so they
  can be edited without touching JSX. The `id` field is what gets stored in
  the sheet; `label` / `subLabel` / `price` are display only.
- **Rules content** lives in `src/services/exhibitorRules.js`. Each rule is
  `{ title, body }` — body supports plain newlines (rendered with
  `whitespace-pre-line`).
- The form POSTs as `multipart/form-data`. Field names in
  `formService.submitRegistration` **must match** the parameter names read in
  `apps-script-template.js` (`p.companyName`, `p.gstNo`, etc.). When adding a
  field: update `submitRegistration`, the Apps Script `newRow`, and
  `COL_HEADERS` together.
- ImgBB API key is the same one inherited from Form 1 (free tier). Rotate to
  a project-owned key if exhibitor traffic scales.

## Pending / open

- [ ] Visual verification in browser. The build compiles and validation logic
      is complete, but the new responsive layout has not been eyeballed in a
      real browser yet — run `npm run dev` and walk through the form before
      sharing the URL with anyone.
- [ ] Decide on a destination GitHub repo — this project is currently NOT a
      git repo.
- [ ] If client confirms they don't want the Company Seal upload, remove the
      `companySeal*` state in `src/page/index.jsx`, the seal block in
      `formService.js`, and the `Company Seal URL` column from
      `apps-script-template.js`.
