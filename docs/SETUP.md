# 🚀 Setup Guide

> **5 minutes — only needed ONCE.** Once deployed, the app works forever.

---

## Step 1: Deploy the Google Apps Script Backend

This is the only "technical" step. It takes 2 minutes.

1. Go to **[script.google.com](https://script.google.com)** (logged into your Google account)
2. Click **+ New Project**
3. Delete any default code, then **copy-paste the entire contents** of [`apps-script/Code.gs`](../apps-script/Code.gs)
4. Click **Deploy → New Deployment**
5. Choose type: **Web App**
6. Set:
   - **Execute as:** `Me` (your Google account)
   - **Who has access:** `Anyone` (the app talks to it from your browser)
7. Click **Deploy**
8. **Authorize** when prompted (Google will ask: _"This app wants to access your Google Drive"_ — this is YOUR script accessing YOUR Drive, which is exactly what you want)
9. **Copy the deployment URL** (looks like `https://script.google.com/macros/s/XXXXX/exec`)

> ⚠️ **Important**: If you ever edit the script code, go to **Deploy → Manage Deployments → Edit** (the pencil icon) → change Version to **New** → Deploy. The URL stays the same.

---

## Step 2: Configure the App

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

---

## Step 3: Open the App

**Option A — Local (fastest for testing):**
```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

**Option B — Deploy to Cloudflare Pages (recommended):**
Free, global CDN, works anywhere with internet. See [Cloudflare Deployment](#-deploy-to-cloudflare-pages--zero-trust) below.

**Option C — Any static hosting:**
The app is a single HTML file + config + manifest + service worker. Host it on Netlify, Vercel, GitHub Pages, Raspberry Pi, or your home server.

---

## Step 4: Start Using It!

The app will:
1. Auto-fetch your Drive data via your Apps Script
2. Show a dashboard with stats
3. Let you **add members/vehicles/properties** directly from the UI — folders are auto-created in Drive
4. Upload documents, set due dates, track renewals
5. Everything syncs to Google Drive in real-time

> 💡 **Pro tip**: You DON'T need to manually create the People/Vehicles/Properties folders in Drive. Just use the "Add Member" / "Add Vehicle" / "Add Property" buttons in the app — it creates the folder structure for you.

---

## 🗂️ Custom Folder Configuration (Optional)

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

The app will now use YOUR folder as the vault root:

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

---

## ☁️ Deploy to Cloudflare Pages + Zero Trust (Free, Secure)

This gives you a **globally-accessible URL** protected by Cloudflare's authentication layer. Your family members can log in from anywhere — no VPN needed.

### Why Cloudflare?
- **Free**: Cloudflare Pages is free for personal use (unlimited bandwidth)
- **Fast**: Global CDN — loads instantly anywhere in the world
- **Secure**: Cloudflare Access adds authentication so only your family can see the app
- **HTTPS**: Automatic SSL certificate

### Part A: Deploy the App

**Method 1: Via GitHub (recommended — auto-deploys on push)**

1. Push your repo (with `vault-config.json`) to a **private** GitHub repository
2. Go to **[dash.cloudflare.com](https://dash.cloudflare.com)** → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select your private repo
4. Configure build:
   - **Build command:** (leave empty — no build step)
   - **Build output directory:** `/` (root)
5. Click **Save and Deploy**
6. Your app is now live at `https://your-project.pages.dev`

> ⚠️ **Important**: Use a **private** GitHub repo since `vault-config.json` contains your script URL and bank details. If your repo is public, use Method 2.

**Method 2: Direct Upload (for public repos)**

1. Create your `vault-config.json` locally
2. Go to **[dash.cloudflare.com](https://dash.cloudflare.com)** → **Workers & Pages** → **Create** → **Pages** → **Upload assets**
3. Drag-and-drop your entire project folder (including `vault-config.json`)
4. Click **Deploy**

### Part B: Add Authentication (Zero Trust Access)

This puts a login screen in front of your app. Only people you approve can see it.

1. Go to **[one.dash.cloudflare.com](https://one.dash.cloudflare.com)** (Cloudflare Zero Trust dashboard)
2. Navigate to **Access → Applications** → **Add an application**
3. Choose **Self-hosted**
4. Configure:
   - **Application name:** `Family Vault`
   - **Application domain:** `your-project.pages.dev` (your Pages URL)
   - **Identity providers:** Choose **Google** (easiest) or **Email OTP** (no account needed)
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

> 💡 **Pro tip**: Free for up to 50 users. Perfect for a family.

### Part C: Custom Domain (Optional)

1. In **Cloudflare Pages** → your project → **Custom domains**
2. Add `vault.yourfamily.com` (or any subdomain)
3. Cloudflare automatically provisions SSL

---

## 🙋 FAQ

**Q: Do I need to enable Google Drive API in Google Cloud Console?**
A: No. The app uses `DriveApp` which is built into every Google Apps Script project. No API activation, no billing, no console setup.

**Q: What permissions does the Apps Script need?**
A: It asks for access to "View and manage files in your Google Drive" — to list files, create folders, and upload files ON YOUR BEHALF. This is YOUR script accessing YOUR Drive.

**Q: Can Google see my documents?**
A: Your files stay in your Google Drive. The script runs under your account and only reads file names/metadata. No data goes to any third party.

**Q: What if I already have files in a different folder structure?**
A: Create the top-level folders (People, Vehicles, Properties, Shared_Documents) and move your existing files into them. Or use the app's "Add Member/Vehicle/Property" buttons and then upload files.

**Q: How do I update the Apps Script after making changes?**
A: Edit the script at script.google.com → Deploy → Manage Deployments → click the pencil icon → Version: New → Deploy. Your URL stays the same.

**Q: Does the app create random files/folders in my Google Drive root?**
A: No. Everything lives inside a single `ParivarVault/` folder (auto-created). Your Drive root is never touched. See [Custom Folder Configuration](#-custom-folder-configuration-optional).

**Q: Can multiple family members use it at the same time?**
A: Yes! Deploy to Cloudflare Pages with Zero Trust. Everyone accesses the same Google Drive data through the same Apps Script.
