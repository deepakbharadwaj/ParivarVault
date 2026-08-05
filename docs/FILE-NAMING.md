# 📋 Document Naming Conventions

Organize your files with these naming conventions for automatic categorization and renewal tracking.

---

## 🧠 Auto-Categorization

The app automatically sorts your documents into categories (Aadhaar, PAN, Passport, etc.) based on **keywords in the filename**.

### How Matching Works

| Rule | Example |
|---|---|
| **Case-insensitive** | `pan_card.pdf` = `PAN_Card.pdf` = `Pan Card.jpg` |
| **Whole-word matching for short keywords** (≤3 letters) | `PAN_Card.pdf` ✅ / `Japan_Visa.pdf` ❌ |
| **Substring matching for long keywords** (4+ letters) | `My_Aadhaar_Card.pdf` ✅ / `Aadhaar_Front.pdf` ✅ |

---

## 👤 Identity Documents (per family member)

| Document Type | Include any of these in filename |
|---|---|
| **Aadhaar Card** | `aadhaar`, `aadhar` |
| **PAN Card** | `pan` (as a separate word: `PAN_Card`, `My PAN`, `pancard`) |
| **Passport** | `passport` |
| **Driving Licence** | `driving_licence`, `driving license`, `DL` (as separate word) |
| **Voter ID** | `voter`, `voter id`, `epic` |
| **Photograph** | `photo` |

> 💡 **Examples — files that get auto-categorized:**
> - `Aadhaar_Card_Rajesh.pdf` → Aadhaar Card
> - `PAN_Card_Front.pdf` → PAN Card
> - `Passport_Photo.jpg` → Passport
> - `Driving_Licence_2025.pdf` → Driving Licence
> - `Voter_ID.pdf` → Voter ID
> - `Profile_Photo.jpg` → Photograph
>
> **Examples — files that go to Other Documents:**
> - `Japan_Trip_Visa.pdf` → "pan" is part of "Japan", not a separate word
> - `Middle_School_Cert.pdf` → "dl" is part of "middle", not a separate word
> - `doc_123.pdf` → no recognizable keyword

---

## 🚗 Vehicle Documents

| Document Type | Include any of these in filename |
|---|---|
| **Registration (RC)** | `rc` (as separate word: `RC_Book`, `Car_RC`) |
| **Insurance** | `insurance` |
| **Emission (PUC)** | `puc` (as separate word), `emission` |

---

## 🏠 Property Documents

| Document Type | Include any of these in filename |
|---|---|
| **Sale Deed** | `sale_deed`, `sale deed`, `deed` |
| **Property Tax** | `property_tax`, `tax` (as separate word) |

---

## 🏥 Medical Documents

Files containing any medical keyword (like `blood`, `cbc`, `xray`, `prescription`, `vaccine`, etc.) are automatically shown in the **Medical** section under that family member.

---

## ⏰ Renewal Tracking

Add `_due_YYYY-MM-DD` to any filename to auto-track renewals:

```
Insurance_due_2026-12-31.pdf     → Shows "Due in 151 days"
Car_RC_due_2025-01-15.pdf        → Shows "Expired X days ago"
Property_Tax_due_2026-06-01.pdf  → Shows "Due in X days"
```

You can set the due date when uploading a file — the app will prompt you. You can also update the due date anytime from the Renewals page.

---

## 📌 Rule of Thumb

> **Just name your files with the document type in the filename.** For short abbreviations like PAN, RC, DL, PUC — use them as separate words (underscores, spaces, or hyphens). Everything else just needs to contain the keyword anywhere.

Files that don't match any category appear in **"Other Documents"** — still accessible, just not auto-sorted.
