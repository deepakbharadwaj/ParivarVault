# Security Policy

## 🔐 Our Commitment

Family Digital Vault is designed with a **zero-trust architecture**. We take the security of your family's documents seriously. This document outlines our security practices and how to report vulnerabilities.

---

## 🏗️ Security Architecture

### Data Flow
```
Your Google Drive → Google Apps Script → Your Browser → localStorage Cache
                                                              ↓
                                              vault-config.json (local file)
```

### Key Principles

| Principle | Implementation |
|---|---|
| **No Backend** | The app has NO server of its own. Zero data passes through third-party infrastructure. |
| **Your Cloud** | All documents live in YOUR Google Drive, accessed via YOUR Google Apps Script. |
| **Bank Data Isolation** | Bank account numbers, IFSC codes exist ONLY in your local `vault-config.json`. Never transmitted. |
| **No Analytics** | No Google Analytics, no tracking pixels, no telemetry. Zero. |
| **No Third-Party API Calls** | Only communicates with Google APIs (Drive + Apps Script). |

---

## ⚠️ What You Must Do

### 1. NEVER commit `vault-config.json`
This file contains your bank details and Apps Script URL. It is in `.gitignore`, but always double-check before committing:
```bash
git status  # Ensure vault-config.json is NOT listed
```

### 2. Restrict Apps Script access
When deploying your Google Apps Script, set:
- **Execute as: Me** (NOT "User accessing the web app")
- **Who has access: Only myself** (or "Anyone" only if you add authentication)

### 3. Secure Deployment

**Recommended: Cloudflare Pages + Zero Trust Access (FREE)**
See [README.md](README.md#-deploy-to-cloudflare-pages--zero-trust-free-secure) for the complete guide. This gives you:
- Global CDN with free HTTPS
- Authentication layer (Google OAuth or Email OTP) — only your approved family members can access
- Free for up to 50 users

**Alternative: Private hosting**
If not using Cloudflare, host on:
- Local machine (`localhost`)
- Home server (Raspberry Pi, NAS) behind VPN
- Private network with HTTP Basic Auth
- Any static host with a reverse proxy that adds authentication

### 4. Use HTTPS
Always serve over HTTPS when accessing remotely. HTTP exposes data in transit.

### 5. Clear cache when sharing devices
The app caches document metadata in `localStorage`. Clear it if you share your device:
```javascript
// In browser console:
localStorage.removeItem("vault_cache_v3");
```

---

## 🐛 Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please [open a private security advisory](https://github.com/deepakbharadwaj/ParivarVault/security/advisories/new) on GitHub.

We will respond within 48 hours and work with you on a fix.

### What to include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Responsible Disclosure:
1. Report the vulnerability privately
2. Allow 90 days for a fix before public disclosure
3. We will credit you in the release notes (unless you prefer anonymity)

---

## ✅ Security Checklist for Deployers

- [ ] `vault-config.json` is NOT in version control
- [ ] Apps Script runs under your account only
- [ ] Hosted on private network or behind auth
- [ ] HTTPS enabled (for remote access)
- [ ] Browser cleared of cache when sharing devices
- [ ] Google Drive sharing settings reviewed
- [ ] Apps Script deployment restricted appropriately

---

## 📦 Dependencies

| Dependency | Source | Risk Mitigation |
|---|---|---|
| Tailwind CSS | CDN (`cdn.tailwindcss.com`) | Can be self-hosted by downloading the CSS |
| Font Awesome | CDN (`cdnjs.cloudflare.com`) | Can be self-hosted |
| Google Fonts | CDN (`fonts.googleapis.com`) | Can be self-hosted |

For maximum privacy, consider self-hosting these assets. See the installation guide in README.

---

## 🔄 Updates

This security policy may be updated. Check back for the latest version.

_Last updated: August 2026_
