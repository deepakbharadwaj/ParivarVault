# 🛡️ ParivarVault — Family Document & Health Manager

> **A self-hosted, zero-trust family document + health records manager powered by your own Google Drive. PWA. Multi-language. Free forever.**
>
> Organize identity documents (Aadhaar, PAN, Passport), vehicle papers, property deeds, bank details, medical records, health vitals — and track renewals — all from a beautiful single-page dashboard. Your data stays in **your** Google Drive. No third-party servers. 🇮🇳

<p align="center">
  <img src="https://img.shields.io/badge/status-active-success" alt="Status" />
  <img src="https://img.shields.io/badge/license-FDVPL%20(personal%20use)-blue" alt="License" />
  <img src="https://img.shields.io/badge/PWA-ready-brightgreen" alt="PWA" />
  <img src="https://img.shields.io/badge/i18n-11%20languages-orange" alt="i18n" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs" />
  <img src="https://img.shields.io/badge/Made%20in-India%20🇮🇳-orange" alt="India" />
</p>

---

## 📸 Features

| Feature | Description |
|---|---|
| 👨‍👩‍👧‍👦 **Family Members** | Store Aadhaar, PAN, Passport, Driving Licence, Voter ID, photos per person |
| 🚗 **Vehicles** | Track RC, Insurance, PUC certificates per vehicle |
| 🏠 **Properties** | Manage Sale Deeds, Property Tax documents |
| 🏦 **Bank Accounts** | Securely store IFSC, account numbers, branch info (local-only, never sent to any server) |
| ⏰ **Renewal Tracking** | Auto-detects `_due_YYYY-MM-DD` in filenames and shows expiry alerts |
| ✏️ **Full CRUD** | Add, edit, rename, delete members/vehicles/properties/documents — all syncs to Drive |
| 📸 **Profile Photos** | Upload photos for any family member; shown as thumbnails throughout the app |
| 🔍 **Universal Search** | Search across all documents instantly |
| 📱 **Responsive PWA** | Install on phone home screen. Works offline with cached data |
| 🎨 **Dark Mode UI** | Glassmorphism design with animated background |
| 🌐 **11 Languages** | English, हिन्दी, বাংলা, తెలుగు, मराठी, தமிழ், اردو, ગુજરાતી, ಕನ್ನಡ, മലയാളം, ଓଡ଼ିଆ |
| 💬 **WhatsApp Share** | One-tap share documents to family WhatsApp groups |
| 🏥 **Medical Vitals** | Track BP, blood sugar, weight, BMI, heart rate per person with history |
| 🔒 **Zero-Trust** | All document data comes from **your** Google Drive via **your** Google Apps Script |

---

## 🏗️ Architecture (How It Works)

```
┌──────────────────────────────────────────────────────┐
│         Your Browser (Phone / Laptop / Tablet)        │
│  ┌──────────────────────────────────────────────┐    │
│  │         Family Digital Vault (index.html)     │    │
│  │  ┌─────────┐  ┌──────────┐  ┌────────────┐  │    │
│  │  │  Config  │  │  Cache   │  │    UI      │  │    │
│  │  │ (local)  │  │(localSt.)│  │ (Tailwind) │  │    │
│  │  └─────────┘  └──────────┘  └────────────┘  │    │
│  └──────────────────┬───────────────────────────┘    │
└─────────────────────┼────────────────────────────────┘
                      │ HTTPS (GET for listing, POST for upload/rename/delete)
                      ▼
┌──────────────────────────────────────────────────────┐
│     Google Apps Script (Runs under YOUR account)      │
│  • Lists files/folders from YOUR Drive               │
│  • Uploads new files (you select from browser)        │
│  • Creates/renames/deletes folders                    │
│  • Returns JSON with file metadata (NOT file content) │
│  • Uses BUILT-IN DriveApp — no API keys needed        │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│                  Your Google Drive                     │
│  ParivarVault/  ← Everything lives inside this folder │
│  ├── People/  Vehicles/  Properties/  Shared_Docs/    │
│  (All folders auto-created when you use the app)      │
└──────────────────────────────────────────────────────┘
```

**Key point**: The app never touches your actual files. It reads file _names and metadata_ from Drive, and shows previews via Google Drive's built-in viewer. Uploads are initiated by YOU selecting files in the browser.

> 🗂️ **Folder isolation**: By default, everything lives inside a `ParivarVault/` folder in your Drive root. Nothing is ever created directly in root. Want to use your own existing folder instead? See [Custom Folder Configuration](#-custom-folder-configuration-optional).

---

## 🚀 Setup (5 minutes — only needed ONCE)

### Step 1: Deploy the Google Apps Script backend

This is the only "technical" step. It takes 2 minutes.

1. Go to **[script.google.com](https://script.google.com)** (logged into your Google account)
2. Click **+ New Project**
3. Delete any default code, then **copy-paste the entire contents** of [`apps-script/Code.gs`](apps-script/Code.gs)
4. Click **Deploy → New Deployment**
5. Choose type: **Web App**
6. Set:
   - **Execute as:** `Me` (your Google account)
   - **Who has access:** `Anyone` (the app talks to it from your browser)
7. Click **Deploy**
8. **Authorize** when prompted (Google will ask: _"This app wants to access your Google Drive"_ — this is YOUR script accessing YOUR Drive, which is exactly what you want)
9. **Copy the deployment URL** (looks like `https://script.google.com/macros/s/XXXXX/exec`)

> ⚠️ **Important**: If you ever edit the script code, go to **Deploy → Manage Deployments → Edit** (the pencil icon) → change Version to **New** → Deploy. The URL stays the same.

#### 🗂️ Custom Folder Configuration (Optional)

By default, the app auto-creates a **`ParivarVault/`** folder in your Drive root and puts everything inside it. Your Drive root stays completely clean.

**To use your own existing folder instead:**

1. Open the folder in Google Drive (drive.google.com)
2. Look at the URL: `https://drive.google.com/drive/folders/1aBc2DeF3gHi...`
3. Copy the string after `/folders/` — that's your folder ID
4. In `apps-script/Code.gs`, find the `CONFIG` section and set:
   ```javascript
   VAULT_ROOT_FOLDER_ID: "1aBc2DeF3gHiJkLmNoPqRsTuVwXyZ",
   ```
5. Re-deploy the script (Manage Deployments → Edit → New version → Deploy)

The app will now use YOUR folder as the vault root. All People/Vehicles/Properties folders go inside it.

```
My Drive/
├── MyImportantDocs/              ← Your existing folder (set as VAULT_ROOT_FOLDER_ID)
│   ├── People/                   ← App creates/uses these inside YOUR folder
│   ├── Vehicles/
│   ├── Properties/
│   └── Shared_Documents/
└── (everything else untouched)   ← App NEVER touches anything outside
```

> 💡 **How to get a folder ID**: Open any folder in Google Drive → the URL looks like `https://drive.google.com/drive/u/0/folders/`**`1AbCdEfGhIjKlMnOpQrStUvWxYz`** → copy the bold part.

### Step 2: Configure the app

```bash
# Clone the repo (or download as ZIP)
git clone https://github.com/deepakbharadwaj/ParivarVault.git
cd ParivarVault

# Create your config file from the template
cp vault-config.example.json vault-config.json
```

Edit `vault-config.json` and replace:
- `appsScriptUrl` → paste your Apps Script URL from Step 1
- `bankAccounts` → (optional) add your family's bank details

```json
{
  "appsScriptUrl": "https://script.google.com/macros/s/YOUR_ID_HERE/exec",
  "bankAccounts": [...]
}
```

> 🔒 `vault-config.json` is in `.gitignore`. It will NEVER be committed to GitHub. Your bank data and script URL stay local.

### Step 3: Open the app

**Option A — Local (fastest for testing):**
```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

**Option B — Deploy to Cloudflare Pages (recommended, see below):**
Free, global CDN, works anywhere with internet.

**Option C — Any static hosting:**
The app is a single HTML file + config + manifest + service worker. Host it on Netlify, Vercel, GitHub Pages, Raspberry Pi, or your home server.

### Step 4: Start using it!

The app will:
1. Auto-fetch your Drive data via your Apps Script
2. Show a dashboard with stats
3. Let you **add members/vehicles/properties** directly from the UI — folders are auto-created in Drive
4. Upload documents, set due dates, track renewals
5. Everything syncs to Google Drive in real-time

> 💡 **Pro tip**: You DON'T need to manually create the People/Vehicles/Properties folders in Drive. Just use the "Add Member" / "Add Vehicle" / "Add Property" buttons in the app — it creates the folder structure for you.

---

## ☁️ Deploy to Cloudflare Pages + Zero Trust (Free, Secure)

This gives you a **globally-accessible URL** protected by Cloudflare's authentication layer. Your family members can log in from anywhere — no VPN needed.

### Why Cloudflare?
- **Free**: Cloudflare Pages is free for personal use (unlimited bandwidth)
- **Fast**: Global CDN — loads instantly anywhere in the world
- **Secure**: Cloudflare Access adds authentication so only your family can see the app
- **HTTPS**: Automatic SSL certificate

### Part A: Deploy the app to Cloudflare Pages

**Method 1: Via GitHub (recommended — auto-deploys on push)**

1. Push your repo (with `vault-config.json`) to a **private** GitHub repository
2. Go to **[dash.cloudflare.com](https://dash.cloudflare.com)** → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select your private repo
4. Configure build:
   - **Build command:** (leave empty — no build step)
   - **Build output directory:** `/` (root)
5. Click **Save and Deploy**
6. Your app is now live at `https://your-project.pages.dev`

> ⚠️ **Important**: Use a **private** GitHub repo since `vault-config.json` contains your script URL and bank details.
>
> If your repo is public, do NOT include `vault-config.json`. Instead, use Method 2 below.

**Method 2: Direct Upload (for public repos)**

1. Create your `vault-config.json` locally (Step 2 above)
2. Go to **[dash.cloudflare.com](https://dash.cloudflare.com)** → **Workers & Pages** → **Create** → **Pages** → **Upload assets**
3. Drag-and-drop your entire project folder (including `vault-config.json`)
4. Click **Deploy**

### Part B: Add authentication with Cloudflare Zero Trust (Access)

This puts a login screen in front of your app. Only people you approve can see it.

1. Go to **[one.dash.cloudflare.com](https://one.dash.cloudflare.com)** (Cloudflare Zero Trust dashboard)
2. Navigate to **Access → Applications** → **Add an application**
3. Choose **Self-hosted**
4. Configure:
   - **Application name:** `Family Vault`
   - **Application domain:** `your-project.pages.dev` (your Pages URL)
   - **Identity providers:** Choose one:
     - **Google** (easiest — family uses their Gmail)
     - **Email OTP** (one-time code sent to email — no account needed)
   - Leave other settings as default
5. Click **Next → Add policy**:
   - **Policy name:** `Family Only`
   - **Action:** `Allow`
   - **Configure rules → Include → Emails:** Add your family members' email addresses
6. Click **Save**

Now when anyone visits your app URL:
1. Cloudflare shows a login page
2. They authenticate (Google login or email OTP)
3. If their email matches your allowlist → they see the Family Vault
4. If not → access denied

> 💡 **Pro tip**: This is free for up to 50 users. Perfect for a family.

### Part C: Custom domain (optional)

If you have a domain on Cloudflare (or any domain), you can use it:
1. In **Cloudflare Pages** → your project → **Custom domains**
2. Add `vault.yourfamily.com` (or any subdomain)
3. Cloudflare automatically provisions SSL

---

## 📋 Document Naming Convention for Renewal Tracking

Add `_due_YYYY-MM-DD` to any filename to auto-track renewals:
```
Insurance_due_2026-12-31.pdf     → Shows "Due in 151 days"
Car_RC_due_2025-01-15.pdf        → Shows "Expired X days ago"
Property_Tax_due_2026-06-01.pdf  → Shows "Due in X days"
```

You can set the due date when uploading a file — the app will prompt you. You can also update the due date anytime from the Renewals page.

---

## 📁 Project Structure

```
ParivarVault/
├── index.html                   # Main PWA app (single HTML file — everything lives here)
├── manifest.json                # PWA manifest for installable app
├── sw.js                        # Service Worker for offline support
├── vault-config.example.json    # Configuration template (copy to vault-config.json)
├── vault-config.json            # YOUR config (gitignored — NEVER commit this!)
├── apps-script/
│   └── Code.gs                  # Google Apps Script backend
├── tests/
│   ├── test-runner.html         # Visual test runner (open in browser)
│   └── tests.js                 # Automated test suite (10 suites, 50+ tests)
├── .gitignore                   # Prevents committing sensitive files
├── LICENSE                      # FDVPL License
├── README.md                    # This file
├── SECURITY.md                  # Security policy
├── CONTRIBUTING.md              # Contribution guidelines
└── CODE_OF_CONDUCT.md           # Community code of conduct
```

---

## 🔒 Security Model

| Principle | Implementation |
|---|---|
| **Zero-Trust** | App has no backend. All data flows: Your Drive → Your Apps Script → Your Browser |
| **Built-in Drive Service** | Uses `DriveApp` (built into Apps Script). No API keys, no OAuth, no console setup |
| **Bank Data Local** | Bank details live in `vault-config.json`. Never sent to any server |
| **Your Credentials** | Apps Script runs under YOUR Google account. You authorize it once |
| **No Telemetry** | Zero analytics, zero tracking, zero external logging |
| **HTTPS Only** | All Google API calls are over HTTPS. Cloudflare provides free SSL |
| **Private by Default** | `.gitignore` keeps your config out of version control |

> ⚠️ **If self-hosting publicly without Cloudflare Access**: Add HTTP Basic Auth or a reverse proxy with authentication. See [SECURITY.md](SECURITY.md).

---

## 🌐 Browser Support

| Browser | Support |
|---|---|
| Chrome / Edge | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Mobile Chrome | ✅ Full |
| Mobile Safari | ✅ Full |

---

## 🧪 Automated Testing

**Before pushing any new feature, run the test suite:**

```bash
# Just open this file in your browser:
open tests/test-runner.html
```

The test suite covers **10 suites, 50+ assertions**:

| Suite | Tests |
|---|---|
| Due Date Regex | Filename parsing, date extraction, clean names |
| getFileIcon | PDF, image, unknown mime types |
| getDocumentFormat | Aadhaar, PAN, photo detection, fallback |
| isMedicalFile | Medical keyword detection (CBC, XRay, Prescription, Vaccine) |
| categorizeMedicalFile | Lab vs Prescription vs Vaccine classification |
| processRenewals | Expired, warning, safe status; sorting; edge cases |
| I18N Translation | English, Hindi, fallback, missing keys |
| Health Vitals | CRUD operations, BMI calculation, latest reading |
| Config Validation | appsScriptUrl, bank accounts, empty fallbacks |
| WhatsApp Share URL | URL construction, encoding, parameter validation |

---

## 🙋 FAQ

**Q: Do I need to enable Google Drive API in Google Cloud Console?**
A: No. The app uses `DriveApp` which is built into every Google Apps Script project. No API activation, no billing account, no console setup needed.

**Q: What permissions does the Apps Script need?**
A: It asks for access to "View and manage files in your Google Drive" — because it needs to list files, create folders, and upload files ON YOUR BEHALF. This is YOUR script accessing YOUR Drive.

**Q: Can Google see my documents?**
A: Your files stay in your Google Drive. The script runs under your account and only reads file names/metadata. No data goes to any third party.

**Q: What if I already have files in a different folder structure?**
A: Create the top-level folders (People, Vehicles, Properties, Shared_Documents) and move your existing files into them. Or use the app's "Add Member/Vehicle/Property" buttons and then upload files.

**Q: How do I update the Apps Script after making changes to Code.gs?**
A: Edit the script at script.google.com → Deploy → Manage Deployments → click the pencil icon → Version: New → Deploy. Your URL stays the same.

**Q: Does the app create random files/folders in my Google Drive root?**
A: No. Everything lives inside a single `ParivarVault/` folder (auto-created). Your Drive root is never touched. You can also configure it to use any existing folder — see [Custom Folder Configuration](#-custom-folder-configuration-optional).

**Q: Can multiple family members use it at the same time?**
A: Yes! Deploy to Cloudflare Pages with Zero Trust (see above). Everyone accesses the same Google Drive data through the same Apps Script.

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📜 License

**Family Digital Vault Public License (FDVPL)** — Free for personal and family use. Commercial SaaS, paid redistribution, and rebranding-for-profit are prohibited without explicit permission.

See [LICENSE](LICENSE) for full terms.

> 💡 **In short**: Use it for your family — free, forever. Don't turn it into a paid SaaS product without talking to us first.

---

## 🇮🇳 Made for Indian Families

Designed with Indian document types in mind:
- **Aadhaar Card** (UIDAI)
- **PAN Card** (Income Tax)
- **Voter ID** (EPIC)
- **Driving Licence**
- **RC Book / Insurance / PUC** for vehicles
- **Property Sale Deed & Tax receipts**

But fully customizable for any country's document types!

---

## ⭐ Star History

If you find this useful, please ⭐ star the repo — it helps other families discover it!
