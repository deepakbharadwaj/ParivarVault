# 📋 ParivarVault — Product Backlog

> Welcome, builder! 🛠️ This is the official backlog for ParivarVault. Every item below is a real feature we want to ship. Pick one, claim it, build it, and open a PR — your name goes on the contributors wall. 🎉

ParivarVault's philosophy: **zero-build, zero-dependency, single-file PWA** (`index.html`) + a thin Google Apps Script backend (`apps-script/Code.gs`). Everything you build must respect:

1. 🚫 **No build tools** — vanilla HTML/CSS/JS only, the app must work by opening `index.html` directly.
2. 📱 **Mobile-first** — every feature must work on a phone.
3. 🔒 **Zero-trust** — no user data may ever leave the user's own storage.
4. 🌐 **i18n-ready** — all user-facing strings go through the existing 11-language system.
5. ✅ **Tested** — run `tests/test-runner.html` before opening a PR.

---

## 🗺️ How to pick up an item

1. **Browse the backlog** below and find an item that excites you.
2. **Claim it** — open a GitHub issue titled `PV-00X — <title>` (or comment on the existing issue) saying *"I'd like to work on this"* and tag `@deepakbharadwaj`.
3. **Branch** — `git checkout -b feat/pv-00X-short-name` (e.g. `feat/pv-003-nas-storage`).
4. **Build & test** — follow the acceptance criteria, run `tests/test-runner.html`.
5. **PR** — title format: `feat: pv-00X <short description>`. Link the issue with `Closes #<issue>`.

> 💡 Want to split a large item into smaller shippable phases? Great — propose the split in the issue first, then ship Phase 1 as your first PR.

---

## 📊 Legend

| Term | Meaning |
|---|---|
| 🟦 **Backlog** | Approved feature, nobody is building it yet. **Open for pickup!** |
| 🟨 **In Progress** | Someone claimed it. Issue will say so. |
| 🟩 **Done** | Shipped. Item moves to the Changelog. |
| **P0** | Top roadmap priority — ship next |
| **P1** | High value — should happen soon |
| **P2** | Great-to-have — bigger effort or longer horizon |
| **Effort** | S (days) · M (1–2 weeks) · L (2–4 weeks) · XL (multi-month, phase it) |

---

## 🧩 The Backlog

### PV-001 — 👨‍👩‍👧‍👦 Family Tree & Birthday Timeline

| Field | Value |
|---|---|
| Status | 🟦 Backlog |
| Priority | P1 |
| Effort | L |
| Labels | `enhancement` · `feature` · `help-wanted` · `i18n` |

**🎯 Problem**
Today `People/` is a flat list of members. There's no way to see that Grandpa is Dad's father, that Auntie is Mom's sister, or that someone's birthday is next Tuesday. Birthdays are personal "renewals" nobody tracks — so families keep forgetting them. 💀

**💡 Proposed solution**
- Add a `relations` model to each person (parents, spouse, children — referenced by member ID).
- Render a **family tree view** (pure CSS/SVG — no libraries!) with names, photos, relation labels, and birthdates on each node.
- Feed **birthdates into the existing upcoming-events timeline** on the dashboard, so birthdays appear right next to insurance renewals and PUC expiries.

**✅ Acceptance criteria**
- [ ] Member modal gets optional relation fields (spouse / parent / child) with searchable member picker.
- [ ] Family tree view renders correctly on desktop **and** mobile (responsive or collapsible branches).
- [ ] Birthdays appear in the dashboard timeline with a configurable lookahead (e.g. next 30 days).
- [ ] All strings go through `I18N` with keys added for **all 11 languages** (at minimum English + Hindi + Kannada).
- [ ] Relation data persists across sessions (see technical notes).
- [ ] Tests added in `tests/tests.js` for the tree-building logic.

**🧭 Technical notes**
- Main file: `index.html` — see `Constants`, `State`, `Rendering`, `I18N` modules in the `<script>` section.
- Data persistence options: (a) follow the bank-accounts pattern in `Code.gs` (a JSON file stored in the vault root), or (b) localStorage like medical vitals. Prefer (a) so data survives device changes.
- The timeline already exists in the dashboard rendering — reuse it; don't build a second one.
- A simple algorithm: build an adjacency map from relations, find "root" nodes (people with no parents in the dataset), render top-down.

**🚫 Out of scope**
- Genetic/photo-based tree, multi-family graphs, ancestry imports.

**💬 Open questions**
- How should divorced/remarried relations be modeled? (Propose in the issue.)

---

### PV-002 — 🪪 Document ID Parsing & Copy-to-Clipboard

| Field | Value |
|---|---|
| Status | 🟦 Backlog |
| Priority | P1 |
| Effort | M |
| Labels | `enhancement` · `ux` · `good-first-issue` |

**🎯 Problem**
Filling a form asks for your Aadhaar number. You must open the PDF, zoom in, squint, and retype a 12-digit number without fat-fingering it. Every. Single. Time. 😤

**💡 Proposed solution**
- Store **structured ID metadata** per document: ID type (Aadhaar / PAN / Passport / DL), ID number, name as printed, issue/expiry dates.
- **Copy-to-clipboard button** next to each stored ID (`navigator.clipboard`) with a toast confirmation.
- Phase 1 (MVP): manual entry + smart parsing from filenames (e.g. `PAN_ABCDE1234F.pdf`).
- Phase 2 (stretch): auto-extract from document content — text PDFs via regex, images via lazily-loaded OCR (evaluate `tesseract.js` — must justify the CDN dependency in the PR).

**✅ Acceptance criteria**
- [ ] Per-document "ID details" panel with type-aware validation (PAN regex `[A-Z]{5}[0-9]{4}[A-Z]`, Aadhaar 12 digits, etc.).
- [ ] Copy button per field with visual toast; works offline.
- [ ] IDs searchable from the universal search bar.
- [ ] i18n strings for all 11 languages.
- [ ] Metadata survives Drive re-sync.

**🧭 Technical notes**
- Main file: `index.html` (`Constants` → add `DOC_ID_TYPES` + regex map, `Preview` module for the details panel).
- Backend: metadata can ride on the existing file-description mechanism in `Code.gs`, or a parallel JSON sidecar file — propose in the issue.
- This item **feeds PV-004** — structured IDs are exactly what a chat assistant needs to answer "what's Dad's PAN number?".
- Nice first issue: self-contained, no backend changes needed if you choose the JSON-sidecar approach.

**🚫 Out of scope**
- OCR accuracy guarantees, face-match, liveness checks.

---

### PV-003 — 🏠 NAS / Self-Hosted Storage Provider

| Field | Value |
|---|---|
| Status | 🟦 Backlog |
| Priority | P0 |
| Effort | XL (phase it) |
| Labels | `architecture` · `security` · `help-wanted` |

**🎯 Problem**
Right now ParivarVault depends entirely on Google Drive + Apps Script. Valid feedback from privacy-conscious users: *"I don't put my PII into something I don't own."* A family vault should be able to live on hardware the family owns — a NAS in the living room. 🔐

**💡 Proposed solution**
- Introduce a **storage adapter layer**: a `StorageProvider` interface (`list`, `upload`, `download`, `delete`, `rename`, `metadata`, `updateDueDate`).
  - `Provider A` — Google Apps Script (existing backend, unchanged).
  - `Provider B` — **WebDAV** (Synology, QNAP, and most NAS boxes speak WebDAV natively) or a tiny self-hostable bridge script users drop on their NAS.
- Extend `vault-config.json`:
  ```json
  {
    "storage": {
      "provider": "webdav",          // or "appsScript"
      "webdavUrl": "https://nas.local:5006/vault",
      "username": "…"
    }
  }
  ```
- Suggested phasing: **Phase 1** — adapter interface + config schema + docs; **Phase 2** — WebDAV provider; **Phase 3** — polish (CORS workarounds, setup wizard, migration tool Drive → NAS).

**✅ Acceptance criteria**
- [ ] All CRUD operations work against the chosen provider without touching any third-party server.
- [ ] Existing Google Drive path keeps working exactly as before (no regression).
- [ ] Provider switch is config-only — no code changes for end users.
- [ ] `docs/SETUP.md` gains a "NAS setup" section (Synology/QNAP examples).
- [ ] Tests cover provider-agnostic flows.

**🧭 Technical notes**
- Big one — **talk to the maintainer in the issue before starting**.
- Main files: `index.html` (new `Storage` module), `apps-script/Code.gs` (refactor `doPost` actions behind the interface), `vault-config.example.json`.
- WebDAV from a browser has CORS caveats; document both options (enable CORS on the NAS vs. bridge script) and make the error messages helpful, not scary.
- PV-005 and PV-006 must be built **on top of this abstraction**, so keep the interface future-proof (blobs + metadata, not Drive-specific fields).

**🚫 Out of scope**
- Replacing the PWA itself with a native app; enterprise sync agents.

---

### PV-004 — 💬 Local NLP Chat ("Ask your Vault")

| Field | Value |
|---|---|
| Status | 🟦 Backlog |
| Priority | P2 |
| Effort | XL (phase it) |
| Labels | `ai-ml` · `enhancement` · `research` |

**🎯 Problem**
Universal search is name-based only. You can't ask *"When does Dad's car insurance expire?"* or *"What was Mom's BP in March?"* — you must click around and read files like a caveman. 🦴

**💡 Proposed solution**
A chat panel inside the app that answers questions from **your own data, on your own device**. Suggested phasing:
- **Phase 1 — Metadata Q&A (no AI):** rule-based intent parser over structured data (due dates, IDs from PV-002, vitals, birthdays from PV-001).
- **Phase 2 — Semantic retrieval:** build a local index of document text + metadata; embed with `transformers.js` (feature-flagged, CDN dependency must be justified).
- **Phase 3 — Generative answers:** optional local LLM (e.g. WebLLM) **or** user-supplied API key. Never mandatory.

**✅ Acceptance criteria**
- [ ] Chat UI accessible from the dashboard; mobile-friendly.
- [ ] Phase 1 answers: due-date questions, ID lookups, vitals queries — with clickable sources.
- [ ] **Zero-trust preserved:** by default, no query or document ever leaves the device. Any cloud option is explicit opt-in.
- [ ] Graceful fallback when index isn't ready or feature is disabled.
- [ ] i18n for the chat UI.

**🧭 Technical notes**
- Depends on metadata from **PV-002**, indexing from **PV-006**.
- ⚠️ **Conflict with PV-005:** encrypted documents can't be indexed. Decide scope: when encryption is ON, only unencrypted metadata is searchable — document this clearly.
- Main file: `index.html` (new `Chat` module). Keep any model libs **lazy-loaded** so the base app stays lightweight.
- Index should live client-side (IndexedDB) — no server component.

**🚫 Out of scope**
- Cloud-hosted AI backends, multi-user collaboration.

---

### PV-005 — 🔐 Client-Side Encryption at Rest

| Field | Value |
|---|---|
| Status | 🟦 Backlog |
| Priority | P1 |
| Effort | L |
| Labels | `security` · `enhancement` |

**🎯 Problem**
Documents sit unencrypted in Drive (or a NAS). If someone gains access to that storage, every Aadhaar and PAN card is an open book. For a zero-trust vault, that's a gap. 🕵️

**💡 Proposed solution**
- Optional **vault passphrase**: files are encrypted **on the device before upload** and decrypted only on download.
- Use the browser-native **Web Crypto API** — AES-256-GCM for file blobs, PBKDF2 key derivation from the passphrase. No libraries, no build tools.
- Metadata policy: keep filenames/metadata unencrypted (so navigation works), encrypt file contents. Alternative: offer "hide filenames too" mode — discuss in the issue.

**✅ Acceptance criteria**
- [ ] Vault-level toggle for encryption (per vault, not per file).
- [ ] Upload → download roundtrip decrypts correctly; wrong passphrase fails with a friendly error.
- [ ] Encrypted files still show their normal preview flow after decrypt-on-download.
- [ ] Clear **recovery documentation**: losing the passphrase = losing the data. No backdoors.
- [ ] i18n strings for setup UI.

**🧭 Technical notes**
- Main file: `index.html` (new `Crypto` module wrapping `crypto.subtle`), works on `https://` or `localhost` only (Web Crypto requirement — note this in docs).
- ⚠️ **Conflict with PV-004:** encrypted blobs can't be full-text indexed. Metadata-only chat/search is the accepted trade-off; state it in the PR.
- Build on the **PV-003 storage abstraction** so encryption works for Drive **and** NAS users.
- Great mid-size security PR; self-contained if you keep it provider-agnostic.

**🚫 Out of scope**
- Hardware keys/2FA, per-user sharing of keys.

---

### PV-006 — 🗂️ Universal Document Inbox (NotebookLM-style, self-hosted)

| Field | Value |
|---|---|
| Status | 🟦 Backlog |
| Priority | P2 |
| Effort | XL (phase it) |
| Labels | `enhancement` · `ai-ml` · `help-wanted` |

**🎯 Problem**
The app handles *known* categories (people, vehicles, properties, bank). But life throws **receipts, screenshots, warranty cards, school certificates, doctor prescriptions, random important-looking PDFs** at you. Where do they go? Right now — back into the almirah. 📦

**💡 Proposed solution**
An **"Everything / Inbox"** view where *any* file can be dropped in and stays forever:
- Drag-and-drop / multi-file upload.
- **Auto-tagging** by file type and existing keyword rules (extend the `MEDICAL_KEYWORDS` pattern to receipts, warranties, education, insurance…).
- Optional AI-generated **titles + summaries** for scanned docs (feature-flagged; ties into PV-004's optional AI layer).
- Full-text index for search — the "Google NotebookLM, but open-source, self-hosted, and your data stays yours" promise.

**✅ Acceptance criteria**
- [ ] New "Everything" view with upload, tag, rename, delete.
- [ ] Auto-tag rules + manual tag editing; tags filterable.
- [ ] Universal search includes inbox items (title, tags, extracted text where available).
- [ ] Timeline shows inbox items alongside documents.
- [ ] i18n for all 11 languages.

**🧭 Technical notes**
- Main file: `index.html` (new `Inbox` module), backend: reuse `uploadFile` action in `Code.gs` with a new `Inbox/` folder under the vault root.
- Text extraction: Phase 1 uses filenames + user tags only; Phase 2 adds PDF text extraction (evaluate `pdf.js` — lazy-load + justify) — **this index also powers PV-004 Phase 2**.
- Build provider-agnostically on the **PV-003 storage abstraction**.
- Suggested phasing: upload+tags → auto-tagging → extraction/search → AI summaries.

**🚫 Out of scope**
- Cloud sync of the index, multi-family workspaces.

---

## 🕸️ Feature Dependencies

```
PV-002 (ID metadata) ──────────────┐
PV-006 (index everything) ─────────┼──▶ PV-004 (NLP chat)
                                   │
PV-003 (storage abstraction) ──────┼──▶ PV-005 (encryption)
                                   └──▶ PV-006 (provider-agnostic uploads)

PV-001 (family tree)  — independent, UI-heavy
```

> ⚠️ **PV-005 × PV-004 conflict:** encrypted content cannot be indexed. Accepted trade-off: when encryption is ON, chat/search work on metadata only.

## 🧭 Suggested pickup order

| # | Item | Why first |
|---|---|---|
| 1 | **PV-002** | Medium effort, self-contained, huge daily UX win — perfect first PR 🎯 |
| 2 | **PV-001** | Independent, UI-heavy, fun to build, no backend risk |
| 3 | **PV-005** | Contained security win; builds crypto module future features reuse |
| 4 | **PV-003** | Big architectural unlock — **talk to the maintainer first** |
| 5 | **PV-006** | Large, phase it; unlocks PV-004 |
| 6 | **PV-004** | Largest; lands best after 002 + 006 |

---

## ✅ Definition of Ready (for any backlog item)

- [ ] Problem statement and acceptance criteria are clear.
- [ ] Dependencies noted (see map above).
- [ ] An issue exists on GitHub with the `PV-00X` tag.

## 🏁 Definition of Done

- [ ] All acceptance criteria met.
- [ ] `tests/test-runner.html` passes.
- [ ] Works by opening `index.html` directly (no build step).
- [ ] i18n keys added for all languages where user-facing.
- [ ] Docs updated (`README.md`, `docs/`).
- [ ] PR merged with `Closes #<issue>`.

---

**Questions?** Open a discussion or tag `@deepakbharadwaj` in the issue. Let's build something our parents actually use. 🇮🇳🛡️
