---
name: Expo Scanner PWA Implementation
overview: Migrate the existing Vite+React prototype to a Next.js PWA, add a FastAPI backend with image pipeline and Gemini integration, implement real batch photo capture (file input + optional live preview), and persist companies and images with SQLite/Postgres and filesystem (dev) storage so the full flow works on iPhone.
todos: []
isProject: false
---

# Expo Scanner PWA — Implementation Plan

## Current state

- **Frontend**: Single [src/App.tsx](src/App.tsx) — Vite + React + Tailwind. All screens exist: Home (card list + Start Scan), Camera (mock capture + thumbnail strip + Finish), Processing (3 mocked states), Review (preview + edit form), Company Detail. Company type and mock data are in App.tsx. No routing; state-driven screen switching.
- **Backend**: None. `package.json` lists `express`, `better-sqlite3`, `@google/genai` but no server code. [vite.config.ts](vite.config.ts) exposes `GEMINI_API_KEY` to the client — this must move to backend only.
- **Camera**: Capture is mocked (picsum URL on button click). No real file input or `getUserMedia`.
- **Data**: In-memory mock companies only.

---

## 1. Repository structure (monorepo)

Target layout:

- **apps/web** — Next.js 14+ (App Router) PWA
- **apps/api** — FastAPI (Python) backend
- **packages/shared** (optional) — shared TypeScript types / Zod schemas for Company and API contracts; can be added in a later step if you want strict front/back typing
- **uploads** — dev-only directory for stored images (gitignored)

Backend choice: **FastAPI** (Python). Rationale: fast to implement, native async, strong ecosystem for image processing (Pillow, pillow-heif) and Gemini (google-generativeai). Go is viable if you prefer a single binary and no Python runtime; the same API contract and pipeline can be implemented there.

---

## 2. Frontend migration (Vite React → Next.js PWA)

**2.1 Create Next.js app**

- New app under `apps/web` (Create Next App with App Router, TypeScript, Tailwind, no src dir or use src — keep consistent with current).
- Move UI from [src/App.tsx](src/App.tsx) into Next.js:
  - **Routes**: `app/page.tsx` = Home (list + Start Scan); `app/scan/page.tsx` = Camera; `app/scan/processing/page.tsx` = Processing; `app/scan/review/page.tsx` = Review; `app/company/[id]/page.tsx` = Company Detail. Use Next.js navigation and searchParams/route params to pass minimal state (e.g. after scan, redirect to `/scan/review?companyId=...` or pass scan result via client state/context for the first iteration).
  - **Components**: Extract screens into components under `components/` (e.g. `HomeScreen`, `CameraScreen`, `ProcessingScreen`, `ReviewScreen`, `DetailScreen`). Reuse existing Tailwind markup and `Company` type.
  - **State**: Companies list can be fetched from API (GET /companies). For “just finished scan” flow, either pass `companyId` in URL after backend returns it, or use React state/context so Review and Detail get the new company from API by id.
- Remove any reference to `GEMINI_API_KEY` or Vite env from frontend; all Gemini calls happen on the backend.

**2.2 PWA setup**

- **Manifest**: `apps/web/public/manifest.json` — name "Expo Scanner", `display: "standalone"`, `start_url: "/"`, theme_color, background_color, icons (192, 512).
- **Icons**: Generate and place in `public/` (e.g. icon-192.png, icon-512.png).
- **Service worker / offline**: Use `next-pwa` (or Next.js built-in if available) to register a service worker. Minimal “ready” behavior: cache the app shell so the app opens offline; do not implement upload queue or background sync in the first version.
- **Meta**: In root layout, add viewport, theme-color, and `<link rel="manifest" href="/manifest.json">`, plus apple-mobile-web-app-capable and apple-touch-icon for iPhone.

**2.3 UI and i18n**

- Keep **English-only** UI.
- **Material 3**: Either (a) introduce M3 via a small token set (e.g. CSS variables for primary/surface) and keep Tailwind, or (b) keep current Tailwind palette (blue/slate) and align with M3 semantics later. Plan assumes (b) for speed; optional M3 pass later.
- Preserve **mobile-first** layout and **large tap targets** (existing buttons are already adequate).

---

## 3. Camera and batch capture (frontend)

**3.1 Primary: file input**

- In Camera screen, use `**<input type="file" accept="image/*" capture="environment" multiple>`** (hidden, triggered by a visible “Add photo” button or by tapping the capture area). On `change`, read `FileList`, create object URLs for thumbnails, and store `File[]` (or `FileList`) in state.
- Show **thumbnail strip** (existing UI) from object URLs; allow removing a photo (splice from list and revoke URL).
- **“Finish Scan”** builds `FormData`: append each file with key `images[]` (or `images` multiple times). Optionally append `hint_text` if you add a text field. POST to backend `/api/scan` (or `/scan`) via `fetch` with that `FormData`.

**3.2 Optional: live preview (fallback)**

- Try `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`. If supported, show a `<video>` preview and keep a “Capture” button that draws the current frame to a canvas and exports as blob, then adds to the same `File[]` list. If not supported (e.g. some iOS Safari), hide the video and rely only on the file input. Do not block shipment on getUserMedia.

**3.3 Progress and errors**

- Use `fetch` with no `AbortController` for upload; show “Uploading Photos” and a simple progress bar if possible (e.g. `XMLHttpRequest` with `upload.onprogress` if you need progress; otherwise a spinner is acceptable). On success, backend returns `{ companyId, company }` (or similar); then navigate to Processing or directly to Review with the returned data.

---

## 4. Backend API (FastAPI)

**4.1 Endpoint**

- **POST /scan** (or **POST /api/scan**): accepts `multipart/form-data` with:
  - `images`: multiple file parts (or single file part repeated).
  - `hint_text`: optional string.
- Response: JSON with created company and image URLs, e.g. `{ "companyId": "...", "company": { ... } }` so the frontend can show Review and then Detail.

**4.2 Image pipeline (sync or async)**

- Accept HEIC, JPEG, PNG.
- **HEIC → JPEG**: use `pillow-heif` (register and open with Pillow) and save as JPEG.
- **Resize**: max 1600px on the longest side (Pillow `Image.resize` with aspect ratio).
- **Strip EXIF**: save without EXIF (e.g. Pillow save with no exif or strip before save).
- **Compress**: JPEG quality ~80.
- Output: in-memory bytes or temp files to be sent to Gemini and then written to storage (see below).

---

## 5. Gemini integration (backend)

**5.1 Multimodal request**

- Use `google-generativeai` (or REST) with a model that supports multiple images (e.g. `gemini-1.5-flash` or `gemini-1.5-pro`). Build a request with:
  - System or user message: prompt (see below).
  - Multiple image parts (from the processed JPEG bytes).

**5.2 Prompt and JSON schema**

- Prompt (conceptual): “You are given photos from an exhibition booth. Extract only what is clearly visible. Do not invent. Return a single valid JSON object suitable for database storage.”
- Require **JSON-only** output (e.g. “Reply with only the JSON object, no markdown or explanation”). Optionally use Gemini’s structured output / response_mime_type if available (e.g. `application/json`) and a schema.
- **Schema (minimum)** — align with spec and current [Company type](src/App.tsx):
  - `companyName`, `website`, `whatTheyDo` (or `shortDescription`), `productCategories` (array), `emails` (array), `phones` (array), `country`, `city`, `booth`, `confidence` (0–1). Optional: `evidence` (array of field → photo index).
- Backend: parse JSON, validate/sanitize (e.g. strip empty strings, trim, coerce types), map to internal Company shape (e.g. `name` ← `companyName`, `categories` ← `productCategories`). If parsing fails or confidence is very low, still persist minimal record (name/website if present) and attach photos as evidence.

**5.3 Storage after Gemini**

- Create **Company** row (see below).
- Create **ImageAsset** rows (or equivalent) linking to company and stored file paths/URLs.
- Write processed images to **uploads/** (dev) with stable filenames (e.g. `{companyId}_{index}.jpg`). Return URLs like `/uploads/...` or `/api/uploads/...` (served by API or Next.js) so the frontend can display them.

---

## 6. Data persistence

**6.1 Database**

- **SQLite** for local/dev (e.g. `expo.db` in project root or in `apps/api`). **Postgres** for production (connection string from env); switch via env (e.g. `DATABASE_URL`).
- ORM: SQLAlchemy or raw SQL; minimal schema:

**6.2 Schema (conceptual)**

- **companies**: id (PK), name, website, short_description, country, city, booth, emails (JSON array or text), phones (JSON array or text), product_categories (JSON array), confidence, created_at, updated_at. Optional: notes (user-editable).
- **image_assets**: id (PK), company_id (FK), file_path (or storage_url), sort_order, created_at. Optionally: role (e.g. “logo”, “booth”, “product”).

**6.3 Image storage**

- **Dev**: filesystem under `uploads/` (or `apps/api/uploads/`). Serve via FastAPI static mount or a dedicated GET route that checks path and returns file.
- **Prod**: Later, switch to S3-compatible storage; same `image_assets` table can store object keys or full URLs.

---

## 7. End-to-end flow and UX states

**7.1 Scan flow**

1. User taps “Start Scan” → navigate to `/scan` (Camera).
2. User adds 3–4 photos (file input and/or live capture) → thumbnails shown → “Finish Scan”.
3. Frontend shows progress: **Uploading Photos** (progress bar or spinner) → POST /scan.
4. Backend: preprocess images → call Gemini → parse → persist company + images → return companyId + company payload.
5. Frontend: **Calling Gemini API** and **Saving Company** can be a single “Processing” phase (one request); or backend can stream progress (optional). For simplicity: one POST returns when everything is done; frontend shows “Uploading” then “Analyzing with AI” then “Saving” with timers or a single “Processing” step.
6. On response: navigate to **Review** with returned company (e.g. `/scan/review?companyId=...` and fetch company, or pass in client state). Show preview + edit form.
7. **Save** (submit form): PATCH/PUT `/companies/:id` with edited fields. Then navigate to **Company Detail** (`/company/[id]`).
8. **Company Detail**: GET `/companies/:id` to show full company + image gallery. Home list: GET `/companies` and show cards; new company appears at top.

**7.2 Review / Edit**

- After scan, backend already created the company; Review “Save” = **update** (PATCH). Form fields bound to company state; on submit, send only changed fields or full DTO.

**7.3 “Unclear product” case**

- If Gemini returns low confidence or sparse data: save minimal record (name, website if visible) and all photos; no invented categories. Frontend shows what exists; photos remain as evidence in Detail.

---

## 8. API surface (summary)


| Method | Path           | Purpose                                                                                 |
| ------ | -------------- | --------------------------------------------------------------------------------------- |
| POST   | /scan          | Multipart: images[], optional hint_text → create company + image assets, return company |
| GET    | /companies     | List companies (newest first)                                                           |
| GET    | /companies/:id | Company detail + image URLs                                                             |
| PATCH  | /companies/:id | Update company (review save)                                                            |
| GET    | /uploads/:path | Serve stored image (dev)                                                                |


Frontend base URL for API: env `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:8000` in dev).

---

## 9. Definition of Done (checklist)

- Next.js app runs; Home shows company list from API (or empty).
- PWA: manifest + icons; installable; standalone; app opens offline (cached shell).
- Camera: add 3–4 photos via file input (and optionally live capture); thumbnail strip; Finish sends multipart to backend.
- Backend: POST /scan accepts images, runs pipeline (HEIC→JPEG, resize, strip EXIF, quality 80), calls Gemini, parses JSON, validates, saves Company + ImageAssets to DB and filesystem.
- Processing states: Uploading → Analyzing with AI → Saving; then redirect to Review with returned company.
- Review: preview card + edit form; Save updates company via PATCH; then redirect to Company Detail.
- Company Detail: full info + photo gallery; back to Home.
- Home list includes the new company after save.
- English-only UI; mobile-first; large tap targets; Gemini API key only on backend.

---

## 10. Suggested implementation order

1. **Monorepo + API skeleton**: Create `apps/api` (FastAPI), `apps/web` (Next.js). Add GET /companies (empty), GET /companies/:id (404). SQLite + companies table; optional image_assets table.
2. **Image pipeline + POST /scan (no Gemini)**: Accept multipart, run HEIC/resize/EXIF/compress, save to uploads/ and create company row with placeholder name; return company. Verify from frontend.
3. **Gemini**: Add prompt + multimodal call in POST /scan; parse JSON, map to Company, save. Keep “minimal data” path for low confidence.
4. **Frontend migration**: Move screens to Next.js routes and components; replace mock list with GET /companies; wire Camera to POST /scan with FormData; wire Processing to real response; Review PATCH; Detail GET by id.
5. **PWA**: Manifest, icons, service worker, meta tags.
6. **Camera polish**: File input as primary; optional getUserMedia preview and capture; progress/error handling.
7. **E2E pass**: Full flow on iPhone (or Chrome device mode): scan → upload → process → review → save → detail → home list.

