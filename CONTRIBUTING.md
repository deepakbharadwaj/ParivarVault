# Contributing to Family Digital Vault

First off, thank you for considering contributing! 🎉

Family Digital Vault is a community-driven project aimed at helping families (especially in India) manage their important documents digitally. Every contribution matters.

---

## 📋 Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code.

---

## 🚀 How Can I Contribute?

### 🐛 Reporting Bugs
1. Check if the bug is already reported in [Issues](https://github.com/YOUR_USERNAME/family-digital-vault/issues)
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

### 🔧 Pull Requests
1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/family-digital-vault.git
   ```
3. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes**
5. **Test thoroughly** — open `index.html` and test all views
6. **Commit** with descriptive messages:
   ```bash
   git commit -m "feat: add dark/light theme toggle"
   ```
7. **Push** and open a PR against `main`

---

## 🏗️ Development Setup

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/family-digital-vault.git
cd family-digital-vault

# Copy config template
cp vault-config.example.json vault-config.json

# Serve locally
python3 -m http.server 8080
# or
npx serve .

# Open http://localhost:8080
```

---

## 📁 Code Structure

```
index.html          # Single-file app. All HTML, CSS, JS in one file (by design — simplicity first)
├── <style>         # Custom CSS + animations
├── <body>          # HTML structure (sidebar, main content, modals)
└── <script>        # Application logic
    ├── Constants   # PERSON_DOC_TYPES, VEHICLE_DOC_TYPES, etc.
    ├── State       # appState object
    ├── Init        # initApp(), syncVaultData()
    ├── Rendering   # renderAll(), renderDashboard(), renderMembersList(), etc.
    ├── Navigation  # navigate(), showView(), openMemberDetail()
    ├── Preview     # previewFile(), closeModal(), downloadFile()
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

- [ ] Code works when opening `index.html` directly in a browser
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

Example: `feat: add emergency contact card section`

---

## 🌟 Recognition

All contributors will be listed in the README. Significant contributors may be added as project maintainers.

---

**Thank you for making Family Digital Vault better for families everywhere!** 🇮🇳
