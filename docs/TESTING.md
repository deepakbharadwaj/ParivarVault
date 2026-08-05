# 🧪 Automated Testing

ParivarVault includes an automated test suite to ensure reliability across features.

---

## Running Tests

```bash
# Just open this file in your browser:
open tests/test-runner.html
```

---

## Test Suite Coverage

The test suite covers **10 suites, 50+ assertions**:

| Suite | Tests |
|---|---|
| **Due Date Regex** | Filename parsing, date extraction, clean names |
| **getFileIcon** | PDF, image, unknown mime types |
| **getDocumentFormat** | Aadhaar, PAN, photo detection, fallback |
| **isMedicalFile** | Medical keyword detection (CBC, XRay, Prescription, Vaccine) |
| **categorizeMedicalFile** | Lab vs Prescription vs Vaccine classification |
| **processRenewals** | Expired, warning, safe status; sorting; edge cases |
| **I18N Translation** | English, Hindi, fallback, missing keys |
| **Health Vitals** | CRUD operations, BMI calculation, latest reading |
| **Config Validation** | appsScriptUrl, bank accounts, empty fallbacks |
| **WhatsApp Share URL** | URL construction, encoding, parameter validation |

> ⚠️ **Before pushing any new feature**, run the test suite to make sure nothing is broken.
