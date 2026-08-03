# 🛡️ ParivarVault — Family Document & Health Manager

> **A self-hosted, zero-trust family document + health records manager powered by your own Google Drive. PWA. Multi-language. Free forever.**
>
> Organize identity documents, vehicle papers, property deeds, bank details, medical records, health vitals — and track renewals — all from a beautiful single-page dashboard. Your data stays in **your** Google Drive. No third-party servers. 🇮🇳

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
| 🔍 **Universal Search** | Search across all documents instantly |
| 📱 **Responsive** | Works on mobile, tablet, and desktop |
| 🎨 **Dark Mode UI** | Glassmorphism design with animated background |
| 🌐 **Multi-Language** | 11 languages — English, हिन्दी, বাংলা, తెలుగు, मराठी, தமிழ், اردو, ગુજરાતી, ಕನ್ನಡ, മലയാളം, ଓଡ଼ିଆ |
| 📱 **PWA Ready** | Install on phone home screen. Works offline with cached data via Service Worker |
| 💬 **WhatsApp Share** | One-tap share documents to family WhatsApp groups |
| 🔒 **Zero-Trust** | All document data comes from **your** Google Drive via **your** Google Apps Script |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Your Browser                         │
│  ┌──────────────────────────────────────────────┐    │
│  │         Family Digital Vault (index.html)     │    │
│  │  ┌─────────┐  ┌──────────┐  ┌────────────┐  │    │
│  │  │  Config  │  │  Cache   │  │    UI      │  │    │
│  │  │ (local)  │  │(localSt.)│  │ (Tailwind) │  │    │
│  │  └─────────┘  └──────────┘  └────────────┘  │    │
│  └──────────────────┬───────────────────────────┘    │
└─────────────────────┼────────────────────────────────┘
                      │ HTTPS
                      ▼
┌──────────────────────────────────────────────────────┐
│            Google Apps Script (Your Account)           │
│  ┌────────────────────────────────────────────────┐   │
│  │  Lists files from YOUR Google Drive structure   │   │
│  │  Returns JSON with file metadata (not content)  │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│                  Your Google Drive                     │
│  People/  Vehicles/  Properties/  Shared_Documents/   │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (5 minutes)

### Step 1: Clone this repository
```bash
git clone https://github.com/deepakbharadwaj/ParivarVault.git
cd ParivarVault
```

### Step 2: Set up Google Drive folder structure
Create these folders in your Google Drive root:
```
People/
  ├── Dad/
  ├── Mom/
  ├── Child1/
Vehicles/
  ├── Car-MH01AB1234/
  ├── Bike-MH01XY5678/
Properties/
  ├── Our-Home/
Shared_Documents/
```

### Step 3: Set up Google Apps Script
1. Go to **[script.google.com](https://script.google.com)**
2. Click **New Project**
3. Copy the code from [`apps-script/Code.gs`](apps-script/Code.gs) and paste it
4. Click **Deploy → New Deployment**
5. Choose **Web App**
6. Set **Execute as: Me**, **Who has access: Anyone**
7. Click **Deploy** and **copy the URL**

### Step 4: Configure the vault
```bash
cp vault-config.example.json vault-config.json
```
Edit `vault-config.json`:
- Replace `appsScriptUrl` with your Apps Script deployment URL
- Add your family bank account details (optional)

### Step 5: Launch!
Open `index.html` in your browser, or serve it:
```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx serve .
```
Then open **http://localhost:8080**

---

## 📁 Project Structure

```
ParivarVault/
├── index.html                   # Main PWA app (single HTML file)
├── manifest.json                # PWA manifest for installable app
├── sw.js                        # Service Worker for offline support
├── vault-config.example.json    # Configuration template (copy to vault-config.json)
├── apps-script/
│   └── Code.gs                  # Google Apps Script backend code├── tests/
│   ├── test-runner.html         # Visual test runner (open in browser)
│   └── tests.js                 # All test cases (10 suites, 50+ tests)├── .gitignore                   # Prevents committing sensitive files
├── LICENSE                      # FDVPL License (free for personal use)
├── README.md                    # This file
├── SECURITY.md                  # Security policy
└── CONTRIBUTING.md              # Contribution guidelines
```

---

## 🔒 Security Model

| Principle | Implementation |
|---|---|
| **Zero-Trust** | App has no backend of its own. All data flows: Your Drive → Apps Script → Your Browser |
| **Bank Data Local** | Bank account details are read from `vault-config.json` and never sent to any server |
| **Your Credentials** | Apps Script runs under YOUR Google account. No OAuth tokens stored in the app |
| **No Telemetry** | Zero analytics, zero tracking, zero external logging |
| **HTTPS Only** | All Google API calls are over HTTPS |

> ⚠️ **Important**: Host this on a private server or local machine. Do not expose it to the public internet without adding authentication (see Roadmap).

---

## 📋 Document Naming Convention for Renewal Tracking

Add `_due_YYYY-MM-DD` to any filename to auto-track renewals:
```
Insurance_due_2026-12-31.pdf     → Shows "Due in 151 days"
Car_RC_due_2025-01-15.pdf        → Shows "Expired X days ago" 
Property_Tax_due_2026-06-01.pdf  → Shows "Due in X days"
```

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

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 🧪 Automated Testing

**Before pushing any new feature, run the test suite:**

```bash
# Just open this file in your browser:
open tests/test-runner.html
```

The test suite covers **10 test suites, 50+ assertions**:

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

**How to add new tests:** Add a `testXxx()` function in `tests/tests.js` following the existing pattern, then add it to `runAllTests()`.

---

## 🚀 Publishing as Open Source on GitHub

### Step 1: Create a GitHub repository

1. Go to **[github.com/new](https://github.com/new)**
2. Repository name: **`ParivarVault`** (recommended — means "Family Vault" in Hindi)
3. Description: `🏠 Self-hosted family document & health manager for Indian households. PWA. Free forever.`
4. Set to **Public**
5. Do NOT initialize with README (we already have one)

### Step 2: Push your code

```bash
cd /path/to/valutWorkspace

# Initialize git
git init
git add .
git commit -m "🎉 Initial release: ParivarVault — Family Document & Health Manager"

# Add GitHub remote (replace with your username)
git remote add origin https://github.com/YOUR_USERNAME/ParivarVault.git

# Push!
git branch -M main
git push -u origin main
```

### Step 3: Configure GitHub repo settings

After pushing, go to your repo **Settings** → configure:

- [ ] **Topics**: Add `pwa`, `family`, `documents`, `health-tracker`, `india`, `google-drive`, `self-hosted`, `hindi`
- [ ] **Social preview**: Upload a screenshot for the OG image
- [ ] **Branch protection**: Protect `main` branch, require PR reviews
- [ ] **Discussions**: Enable to build a community

### Step 4: Share with the world!

Post on:
- **LinkedIn**: "I open-sourced a free family document manager for Indian households 🇮🇳"
- **Twitter/X**: #OpenSource #India #Privacy
- **Reddit**: r/selfhosted, r/IndiaTech, r/developersIndia
- **Telegram/WhatsApp groups**: Indian tech communities

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
