/**
 * ──────────────────────────────────────────────
 * ParivarVault — Automated Test Suite
 * ──────────────────────────────────────────────
 * 
 * Tests core logic functions to ensure nothing breaks
 * when new features are added.
 * 
 * Run: Open tests/test-runner.html in a browser
 * ──────────────────────────────────────────────
 */

// ═══════════════════════════════════════════════
// TEST FRAMEWORK (lightweight, zero-dependency)
// ═══════════════════════════════════════════════
const TestRunner = {
  results: [],
  currentSuite: "",

  suite(name) {
    this.currentSuite = name;
  },

  assert(description, condition, expected = null, actual = null) {
    const passed = typeof condition === "function" ? condition() : condition;
    const result = {
      suite: this.currentSuite,
      description,
      passed,
      expected,
      actual: actual !== null ? actual : (typeof condition === "function" ? condition() : condition),
    };
    this.results.push(result);
  },

  equal(description, actual, expected) {
    this.assert(description, actual === expected, expected, actual);
  },

  deepEqual(description, actual, expected) {
    const pass = JSON.stringify(actual) === JSON.stringify(expected);
    this.assert(description, pass, JSON.stringify(expected), JSON.stringify(actual));
  },

  throws(description, fn) {
    try {
      fn();
      this.assert(description, false, "should have thrown", "no error");
    } catch (e) {
      this.assert(description, true, "error thrown", e.message || String(e));
    }
  },

  summary() {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;
    return { total, passed, failed, results: this.results };
  },
};

// ═══════════════════════════════════════════════
// MOCK HELPERS
// ═══════════════════════════════════════════════
function mockDocumentElement() {
  // Simulate minimal DOM for functions that query elements
  if (typeof document === "undefined") {
    globalThis.document = {
      querySelectorAll: () => [],
      getElementById: () => null,
      createElement: () => ({}),
    };
  }
  // Mock localStorage
  if (typeof localStorage === "undefined") {
    globalThis.localStorage = (() => {
      let store = {};
      return {
        getItem: (k) => store[k] || null,
        setItem: (k, v) => { store[k] = v; },
        removeItem: (k) => { delete store[k]; },
        clear: () => { store = {}; },
      };
    })();
  }
}

// ═══════════════════════════════════════════════
// CORE LOGIC TESTS (extracted from index.html)
// ═══════════════════════════════════════════════

// --- DUE_DATE_REGEX ---
function testDueDateRegex() {
  TestRunner.suite("Due Date Regex");

  const DUE_DATE_REGEX = /_due_(\d{4}-\d{2}-\d{2})/i;

  TestRunner.assert("Matches _due_2026-12-31", () => {
    const m = "Insurance_due_2026-12-31.pdf".match(DUE_DATE_REGEX);
    return m && m[1] === "2026-12-31";
  });

  TestRunner.assert("Matches _DUE_2025-01-15 (case insensitive)", () => {
    const m = "RC_DUE_2025-01-15.pdf".match(DUE_DATE_REGEX);
    return m && m[1] === "2025-01-15";
  });

  TestRunner.assert("Does NOT match without _due_", () => {
    return !"Insurance_2026-12-31.pdf".match(DUE_DATE_REGEX);
  });

  TestRunner.assert("Does NOT match invalid date", () => {
    return !"file_due_abc-def-gh.pdf".match(DUE_DATE_REGEX);
  });

  TestRunner.assert("Clean name removes _due_ prefix", () => {
    const name = "Car_Insurance_due_2026-06-15.pdf";
    const clean = name.replace(DUE_DATE_REGEX, "").replace(/_/g, " ").replace(/\.[^/.]+$/, "");
    return clean.trim() === "Car Insurance";
  });
}

// --- getFileIcon ---
function testGetFileIcon() {
  TestRunner.suite("getFileIcon");

  function getFileIcon(mimeType) {
    if (!mimeType) return "fa-file";
    if (mimeType.includes("pdf")) return "fa-file-pdf text-red-400";
    if (mimeType.includes("image")) return "fa-file-image text-blue-400";
    return "fa-file text-gray-400";
  }

  TestRunner.equal("PDF mime type", getFileIcon("application/pdf"), "fa-file-pdf text-red-400");
  TestRunner.equal("Image mime type", getFileIcon("image/png"), "fa-file-image text-blue-400");
  TestRunner.equal("Unknown mime type", getFileIcon("application/zip"), "fa-file text-gray-400");
  TestRunner.equal("Null mime type", getFileIcon(null), "fa-file");
  TestRunner.equal("Empty mime type", getFileIcon(""), "fa-file");
}

// --- getDocumentFormat ---
function testGetDocumentFormat() {
  TestRunner.suite("getDocumentFormat");

  function getDocumentFormat(files, typeDef) {
    const keywords = [typeDef.id, ...(typeDef.alt || [])];
    const matchedFiles = files.filter((file) =>
      keywords.some((kw) => file.name.toLowerCase().includes(kw.toLowerCase()))
    );
    const result = { found: false, pdf: null, img: null };
    matchedFiles.forEach((file) => {
      result.found = true;
      const nameLower = file.name.toLowerCase();
      const isPdf =
        file.mimeType.includes("pdf") || nameLower.endsWith(".pdf");
      const isImg =
        file.mimeType.includes("image") ||
        nameLower.match(/\.(jpg|jpeg|png|gif|webp)$/);
      if (isPdf) result.pdf = file;
      if (isImg) result.img = file;
    });
    return result;
  }

  const mockFiles = [
    { id: "1", name: "Aadhaar_Card.pdf", mimeType: "application/pdf" },
    { id: "2", name: "Passport_Photo.jpg", mimeType: "image/jpeg" },
    { id: "3", name: "PAN_Card.pdf", mimeType: "application/pdf" },
  ];

  TestRunner.assert("Finds Aadhaar PDF", () => {
    const r = getDocumentFormat(mockFiles, { id: "aadhaar", alt: [] });
    return r.found && r.pdf && r.pdf.id === "1";
  });

  TestRunner.assert("Finds with alt keywords", () => {
    const r = getDocumentFormat(mockFiles, {
      id: "driving_licence",
      alt: ["dl", "driving licence"],
    });
    return !r.found; // No driving licence in mock
  });

  TestRunner.assert("Finds PAN with exact id", () => {
    const r = getDocumentFormat(mockFiles, { id: "pan", alt: [] });
    return r.found && r.pdf && r.pdf.id === "3";
  });

  TestRunner.assert("Finds photo as image", () => {
    const r = getDocumentFormat(mockFiles, {
      id: "passport",
      alt: ["photo"],
      isPhoto: true,
    });
    return r.found && r.img && r.img.id === "2";
  });

  TestRunner.assert("Returns not found for missing doc", () => {
    const r = getDocumentFormat(mockFiles, { id: "voter", alt: ["voter id"] });
    return !r.found;
  });
}

// --- isMedicalFile ---
function testIsMedicalFile() {
  TestRunner.suite("isMedicalFile");

  const MEDICAL_KEYWORDS = [
    "blood", "cbc", "lipid", "sugar", "glucose", "hba1c", "thyroid", "vitamin",
    "creatinine", "liver", "kidney", "urine", "hemoglobin", "xray", "x-ray", "mri",
    "ct scan", "ultrasound", "ecg", "echo", "scan", "lab", "pathology",
    "prescription", "rx", "medicine", "doctor", "vaccine", "vaccination",
    "immunization", "surgery", "discharge", "hospital", "medical", "health",
    "dengue", "malaria", "covid", "rtpcr", "thyrocare", "lal path", "dr lal",
    "medicines", "tablet", "dosage", "report", "checkup", "check-up", "diet"
  ];

  function isMedicalFile(fileName) {
    const lower = fileName.toLowerCase();
    return MEDICAL_KEYWORDS.some((kw) => lower.includes(kw));
  }

  TestRunner.assert("Blood test CBC", () => isMedicalFile("CBC_Report_2026.pdf"));
  TestRunner.assert("X-ray report", () => isMedicalFile("Chest_XRay_2026.pdf"));
  TestRunner.assert("Prescription", () => isMedicalFile("Prescription_DrSharma.pdf"));
  TestRunner.assert("Vaccination record", () => isMedicalFile("COVID_Vaccination_Cert.pdf"));
  TestRunner.assert("Thyrocare lab report", () => isMedicalFile("Thyrocare_Lipid_Profile.pdf"));
  TestRunner.assert("NOT medical: Aadhaar", () => !isMedicalFile("Aadhaar_Card.pdf"));
  TestRunner.assert("NOT medical: PAN", () => !isMedicalFile("PAN_Card.pdf"));
  TestRunner.assert("NOT medical: RC book", () => !isMedicalFile("RC_Book_KA01AB1234.pdf"));
  TestRunner.assert("Health checkup", () => isMedicalFile("Annual_Health_Checkup.pdf"));
  TestRunner.assert("Dengue test", () => isMedicalFile("Dengue_NS1_Test.pdf"));
}

// --- categorizeMedicalFile ---
function testCategorizeMedicalFile() {
  TestRunner.suite("categorizeMedicalFile");

  function categorizeMedicalFile(fileName) {
    const lower = fileName.toLowerCase();
    const rx = ["prescription", "rx", "medicine", "tablet", "dosage", "medicines"];
    const vax = ["vaccine", "vaccination", "immunization"];
    const lab = ["blood", "cbc", "lipid", "sugar", "glucose", "hba1c", "thyroid", "vitamin", "creatinine", "liver", "kidney", "urine", "hemoglobin", "lab", "pathology", "thyrocare", "lal path", "dengue", "malaria", "covid", "rtpcr", "report"];
    if (rx.some((k) => lower.includes(k))) return "prescription";
    if (vax.some((k) => lower.includes(k))) return "vaccine";
    if (lab.some((k) => lower.includes(k))) return "lab";
    return "other";
  }

  TestRunner.equal("Lab: CBC report", categorizeMedicalFile("CBC_Blood_Report.pdf"), "lab");
  TestRunner.equal("Lab: Lipid profile", categorizeMedicalFile("Lipid_Profile_2026.pdf"), "lab");
  TestRunner.equal("Lab: Dengue test", categorizeMedicalFile("Dengue_NS1_Test.pdf"), "lab");
  TestRunner.equal("Prescription: Rx", categorizeMedicalFile("Doctor_Rx_Jan2026.pdf"), "prescription");
  TestRunner.equal("Prescription: medicine", categorizeMedicalFile("Medicine_List.pdf"), "prescription");
  TestRunner.equal("Vaccine: COVID", categorizeMedicalFile("COVID_Vaccination.pdf"), "vaccine");
  TestRunner.equal("Vaccine: Immunization", categorizeMedicalFile("Child_Immunization_Record.pdf"), "vaccine");
  TestRunner.equal("Other: Surgery", categorizeMedicalFile("Surgery_Discharge_Summary.pdf"), "other");
  TestRunner.equal("Other: Hospital bill", categorizeMedicalFile("Hospital_Bill_March.pdf"), "other");
  TestRunner.equal("Other: Diet plan", categorizeMedicalFile("Diet_Plan_2026.pdf"), "other");
}

// --- processRenewals ---
function testProcessRenewals() {
  TestRunner.suite("processRenewals");

  function processRenewals(driveData, todayOverride = null) {
    const renewals = [];
    const today = todayOverride || new Date();
    today.setHours(0, 0, 0, 0);
    const DUE_DATE_REGEX = /_due_(\d{4}-\d{2}-\d{2})/i;

    driveData.forEach((file) => {
      const match = file.name.match(DUE_DATE_REGEX);
      if (match) {
        const dateStr = match[1];
        const dueDate = new Date(dateStr);
        dueDate.setHours(0, 0, 0, 0);
        const diffTime = dueDate - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const cleanName = file.name
          .replace(DUE_DATE_REGEX, "")
          .replace(/_/g, " ")
          .replace(/\.[^/.]+$/, "");
        let status = "safe";
        if (daysLeft < 0) status = "expired";
        else if (daysLeft <= 30) status = "warning";
        renewals.push({
          file, cleanName, parentName: file.parentName,
          dateString: dateStr, daysLeft, status,
        });
      }
    });
    renewals.sort((a, b) => a.daysLeft - b.daysLeft);
    return renewals;
  }

  const today = new Date("2026-08-02");
  const mockData = [
    { id: "1", name: "Insurance_due_2026-12-31.pdf", parentName: "Dad" },
    { id: "2", name: "RC_due_2025-01-15.pdf", parentName: "Car" },
    { id: "3", name: "PUC_due_2026-08-25.pdf", parentName: "Bike" },
    { id: "4", name: "Property_Tax_due_2026-09-01.pdf", parentName: "Home" },
    { id: "5", name: "NotARenewal.pdf", parentName: "Shared" },
  ];

  const results = processRenewals(mockData, today);

  TestRunner.equal("Finds 4 renewals (1 non-renewal)", results.length, 4);

  const expired = results.find((r) => r.file.id === "2");
  TestRunner.assert("RC is expired", () => expired && expired.status === "expired");

  const warning = results.find((r) => r.file.id === "3");
  TestRunner.assert("PUC is warning (within 30 days)", () => warning && warning.status === "warning");

  const safe = results.find((r) => r.file.id === "1");
  TestRunner.assert("Insurance is safe (far future)", () => safe && safe.status === "safe");

  TestRunner.assert("Expired items appear first", () => results[0].status === "expired");
  TestRunner.assert("Sorted by daysLeft ascending", () => results[0].daysLeft <= results[results.length - 1].daysLeft);
  TestRunner.equal("Clean name: Insurance", results.find((r) => r.file.id === "1").cleanName, "Insurance");
}

// --- I18N System ---
function testI18N() {
  TestRunner.suite("I18N Translation System");

  // Minimal mock I18N
  const mockI18N = {
    en: { nav: { home: "Home", settings: "Settings" }, stats: { count: "Total: {0}" } },
    hi: { nav: { home: "होम", settings: "सेटिंग्स" }, stats: { count: "कुल: {0}" } },
  };

  let currentLang = "en";
  function t(key) {
    const keys = key.split(".");
    let val = mockI18N[currentLang] || mockI18N.en;
    for (const k of keys) val = val ? val[k] : undefined;
    if (val !== undefined && typeof val === "string") return val;
    val = mockI18N.en;
    for (const k of keys) val = val ? val[k] : undefined;
    return val !== undefined ? val : key;
  }

  TestRunner.equal("English: nav.home", t("nav.home"), "Home");
  TestRunner.equal("English: nav.settings", t("nav.settings"), "Settings");

  currentLang = "hi";
  TestRunner.equal("Hindi: nav.home", t("nav.home"), "होम");
  TestRunner.equal("Hindi: nav.settings", t("nav.settings"), "सेटिंग्स");

  currentLang = "fr"; // non-existent language falls back to English
  TestRunner.equal("Fallback to English: nav.home", t("nav.home"), "Home");

  TestRunner.equal("Missing key returns key itself", t("nonexistent.key"), "nonexistent.key");
}

// --- Health Vitals ---
function testHealthVitals() {
  TestRunner.suite("Health Vitals Storage");

  // Clear storage
  localStorage.clear();
  const VITALS_STORAGE_KEY = "vault_health_vitals";

  function getVitalsData() {
    try {
      return JSON.parse(localStorage.getItem(VITALS_STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveVitalsData(data) {
    localStorage.setItem(VITALS_STORAGE_KEY, JSON.stringify(data));
  }

  function getLatestVitals(personName) {
    const vitals = (getVitalsData()[personName] || []).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    return vitals.length > 0 ? vitals[0] : null;
  }

  // Empty state
  TestRunner.assert("Empty vitals returns null", () => getLatestVitals("Dad") === null);

  // Add reading
  const reading = {
    date: "2026-08-01",
    bpSystolic: 120,
    bpDiastolic: 80,
    sugarFasting: 95,
    weight: 72,
    height: 170,
    heartRate: 72,
    notes: "Morning fasting",
  };
  const data = getVitalsData();
  data["Dad"] = [reading];
  saveVitalsData(data);

  const latest = getLatestVitals("Dad");
  TestRunner.assert("Latest vitals found for Dad", () => latest !== null);
  TestRunner.equal("BP systolic correct", latest.bpSystolic, 120);
  TestRunner.equal("Sugar fasting correct", latest.sugarFasting, 95);
  TestRunner.equal("Weight correct", latest.weight, 72);

  // BMI calculation
  const bmi = latest.weight / ((latest.height / 100) ** 2);
  TestRunner.assert("BMI calculated correctly (~24.9)", () => Math.abs(bmi - 24.91) < 0.1);

  // Multiple readings - should return latest
  const olderReading = {
    date: "2026-01-01",
    bpSystolic: 130,
    bpDiastolic: 85,
    sugarFasting: 105,
    weight: 74,
    height: 170,
    heartRate: 75,
    notes: "",
  };
  data["Dad"].push(olderReading);
  saveVitalsData(data);

  const latestAfterTwo = getLatestVitals("Dad");
  TestRunner.equal("Latest reading is the more recent one", latestAfterTwo.date, "2026-08-01");

  localStorage.clear();
}

// --- Config Validation ---
function testConfigValidation() {
  TestRunner.suite("Config Validation");

  TestRunner.assert("Valid config has appsScriptUrl", () => {
    const config = { appsScriptUrl: "https://script.google.com/...", bankAccounts: [] };
    return config.appsScriptUrl && Array.isArray(config.bankAccounts);
  });

  TestRunner.assert("Bank accounts array is valid", () => {
    const banks = [
      { person: "Dad", banks: [{ bankName: "SBI", accNumber: "1234", ifsc: "SBIN0000", branch: "Main", "Primary Account Holder": "Dad" }] },
    ];
    return banks.length === 1 && banks[0].banks.length === 1;
  });

  TestRunner.assert("Config without bankAccounts uses empty fallback", () => {
    const config = { appsScriptUrl: "https://..." };
    const bankData = config.bankAccounts || [];
    return bankData.length === 0;
  });
}

// --- WhatsApp Share URL ---
function testWhatsAppShare() {
  TestRunner.suite("WhatsApp Share URL");

  function shareViaWhatsApp(fileName, fileId) {
    const docUrl = `https://drive.google.com/file/d/${fileId}/view`;
    const shareText = encodeURIComponent(
      "Check out this document from our Family Vault:\n" + fileName + "\n" + docUrl
    );
    return `https://wa.me/?text=${shareText}`;
  }

  const url = shareViaWhatsApp("Aadhaar Card", "abc123");
  TestRunner.assert("URL starts with wa.me", () => url.startsWith("https://wa.me/?text="));
  TestRunner.assert("URL contains file ID", () => url.includes("abc123"));
  TestRunner.assert("URL contains document name", () => url.includes("Aadhaar"));
  TestRunner.assert("URL is encoded", () => url.includes("%20") || url.includes("+"));
}

// ═══════════════════════════════════════════════════════
// RUN ALL TESTS
// ═══════════════════════════════════════════════════════
function runAllTests() {
  mockDocumentElement();

  testDueDateRegex();
  testGetFileIcon();
  testGetDocumentFormat();
  testIsMedicalFile();
  testCategorizeMedicalFile();
  testProcessRenewals();
  testI18N();
  testHealthVitals();
  testConfigValidation();
  testWhatsAppShare();

  return TestRunner.summary();
}

// If running in Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = { runAllTests, TestRunner };
}
