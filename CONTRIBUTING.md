# Contributing to ParivarVault

First off, thank you for considering contributing! 🎉

ParivarVault is a community-driven project aimed at helping families (especially in India) manage their important documents and health records digitally. Every contribution matters.

---

## 📋 Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code.

---

## 🚀 How Can I Contribute?

### 🐛 Reporting Bugs
1. Check if the bug is already reported in [Issues](https://github.com/deepakbharadwaj/ParivarVault/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Browser and OS details

### 💡 Suggesting Features
1. Open a feature request issue
2. Describe the problem it solves
3. Suggest implementation approach (optional)
4. Tag it with `enhancement`

### 🎯 Picking from the Backlog
1. Browse [`BACKLOG.md`](BACKLOG.md) — every item has a problem statement, acceptance criteria, and technical notes.
2. Claim an item by opening an issue titled `PV-00X — <title>` and saying you'd like to work on it (tag `@deepakbharadwaj`).
3. Branch as `feat/pv-00X-short-name` and follow the item's acceptance criteria.
4. Reference the item in your PR title: `feat: pv-00X <short description>`.

### 🔧 Pull Requests
1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ParivarVault.git
   ```
3. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes**
5. **Test thoroughly** — open `tests/test-runner.html` and verify all tests pass
6. **Commit** with descriptive messages:
   ```bash
   git commit -m "feat: add dark/light theme toggle"
   ```
7. **Push** and open a PR against `main`

---

## 🏗️ Development Setup

```bash
# Clone
git clone https://github.com/deepakbharadwaj/ParivarVault.git
cd ParivarVault

# Copy config template
cp vault-config.example.json vault-config.json
# Edit vault-config.json with your Apps Script URL (see README.md Step 2)

# Serve locally
python3 -m http.server 8080
# Open http://localhost:8080
```

> 💡 **No Google Drive folder setup needed** — the app auto-creates folders when you use the Add Member/Vehicle/Property buttons in the UI.

```bash
# Run tests (before any PR!)
open tests/test-runner.html
```

---

## 📁 Code Structure

```
index.html          # Single-file PWA app. All HTML, CSS, JS in one file (simplicity first)
├── <style>         # Custom CSS + animations
├── <body>          # HTML structure (sidebar, main content, modals, medical views)
└── <script>        # Application logic
    ├── I18N        # 11-language translation system
    ├── Constants   # PERSON_DOC_TYPES, VEHICLE_DOC_TYPES, MEDICAL_KEYWORDS, etc.
    ├── State       # appState object
    ├── Init        # initApp(), syncVaultData(), mergeMedicalI18N()
    ├── Rendering   # renderAll(), renderDashboard(), renderMedicalList(), etc.
    ├── Medical     # Health vitals CRUD (localStorage), medical file detection
    ├── Navigation  # navigate(), showView(), openMemberDetail()
    ├── Preview     # previewFile(), closeModal(), downloadFile()
    ├── WhatsApp    # shareViaWhatsApp()
    └── Search      # searchInput event listener
```

---

## 🎨 Design Guidelines

1. **Keep it single-file** — The philosophy is zero-build, zero-dependency. Anyone can open `index.html` and it works.
2. **Mobile-first** — All features must work on mobile screens.
3. **Glassmorphism dark theme** — Maintain the existing design language.
4. **No framework** — Vanilla JS only. No React, Vue, etc.
5. **Accessibility** — Use semantic HTML, ARIA labels where needed.

---

## ✅ PR Checklist

- [ ] Backlog item ID (e.g. `PV-003`) referenced in the PR description, if applicable
- [ ] Code works when opening `index.html` directly in a browser
- [ ] Run `tests/test-runner.html` — all tests pass ✅
- [ ] No new CDN dependencies (or justified in PR description)
- [ ] Tested on mobile and desktop
- [ ] No `vault-config.json` or sensitive data committed
- [ ] Descriptive PR title and description
- [ ] Screenshots for UI changes

---

## 🏷️ Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Usage |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | CSS/UI changes (no logic change) |
| `refactor:` | Code restructuring |
| `security:` | Security improvements |
| `i18n:` | Internationalization |
| `test:` | Adding or updating tests |

Example: `feat: add emergency contact card section`

---

## 🌟 Recognition

All contributors will be listed in the README. Significant contributors may be added as project maintainers.

---

**Thank you for making ParivarVault better for families everywhere!** 🇮🇳
