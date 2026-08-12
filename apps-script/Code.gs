/**
 * ──────────────────────────────────────────────
 * Family Digital Vault — Google Apps Script Backend
 * ──────────────────────────────────────────────
 * 
 * SETUP:
 * 1. Go to https://script.google.com
 * 2. Create a new project, paste this entire file
 * 3. (Optional) Set VAULT_ROOT_FOLDER_ID below if you want to use a 
 *    specific existing folder instead of auto-creating "ParivarVault"
 * 4. Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone (or "Only myself" if you add auth later)
 * 5. Copy the deployment URL into vault-config.json
 *
 * 🗂️ FOLDER ISOLATION:
 *   By default, everything goes inside a "ParivarVault" folder created 
 *   in your Drive root. Nothing is ever created directly in root.
 *   To use your own existing folder, set VAULT_ROOT_FOLDER_ID below.
 *
 *   Default structure (auto-created):
 *   My Drive/
 *   └── ParivarVault/
 *       ├── People/
 *       │   ├── Dad/
 *       │   └── Mom/
 *       ├── Vehicles/
 *       │   └── Car-MH01AB1234/
 *       ├── Properties/
 *       │   └── Our-Home/
 *       └── Shared_Documents/
 */

// ═══════════════════════════════════════════════
// CONFIGURATION — Adjust these to match your needs
// ═══════════════════════════════════════════════
const CONFIG = {
  // ── Folder Names ──────────────────────────
  PEOPLE_FOLDER_NAME: "People",
  VEHICLES_FOLDER_NAME: "Vehicles",
  PROPERTIES_FOLDER_NAME: "Properties",
  SHARED_FOLDER_NAME: "Shared_Documents",
  
  // ── Vault Root Folder (FOLDER ISOLATION) ──
  // DEFAULT BEHAVIOR: If left empty (""), a "ParivarVault" folder is 
  //   auto-created in your Drive root. ALL app data goes inside it.
  //   Your Drive root stays clean — nothing is created outside this folder.
  //
  // CUSTOM FOLDER: Set this to the ID of ANY existing folder in your Drive
  //   to use it as the vault root. Find a folder's ID by opening it in 
  //   Drive and copying the string after "/folders/" in the URL.
  //   Example: "1aBc2DeF3gHiJkLmNoPqRsTuVwXyZ"
  VAULT_ROOT_FOLDER_ID: "",
};

// ═══════════════════════════════════════════════
// HELPER: Get the vault root folder
// Uses configured ID if set, otherwise auto-creates
// a "ParivarVault" container. NEVER uses Drive root directly.
// ═══════════════════════════════════════════════
function getVaultRoot() {
  // If user configured a specific folder ID, use it
  if (CONFIG.VAULT_ROOT_FOLDER_ID) {
    try {
      return DriveApp.getFolderById(CONFIG.VAULT_ROOT_FOLDER_ID);
    } catch (e) {
      throw new Error(
        "Configured VAULT_ROOT_FOLDER_ID not found. " +
        "Either the ID is wrong or the folder was deleted. " +
        "Check your Code.gs CONFIG. Folder ID tried: " + 
        CONFIG.VAULT_ROOT_FOLDER_ID
      );
    }
  }
  
  // Default: find or create "ParivarVault" in Drive root
  const driveRoot = DriveApp.getRootFolder();
  const existing = findFolder(driveRoot, "ParivarVault");
  if (existing) return existing;
  
  // Auto-create the container folder
  return driveRoot.createFolder("ParivarVault");
}

// ═══════════════════════════════════════════════
// MAIN ENTRY POINT — called by GET requests
// ═══════════════════════════════════════════════
function doGet(e) {
  try {
    // Handle file download proxy (GET request with action=downloadFile&fileId=...)
    if (e && e.parameter && e.parameter.action === "downloadFile") {
      return handleDownloadFileGet(e.parameter);
    }
    
    const result = buildVaultData();
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: error.toString(),
        stack: error.stack 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Serve a file directly via GET — bypasses Google Drive link-sharing settings.
 * Usage: GET ?action=downloadFile&fileId=DRIVE_FILE_ID
 */
function handleDownloadFileGet(params) {
  var fileId = (params.fileId || "").trim();
  if (!fileId) {
    return ContentService
      .createTextOutput("Missing fileId parameter")
      .setMimeType(ContentService.MimeType.TEXT);
  }
  
  try {
    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    return blob;
  } catch (err) {
    return ContentService
      .createTextOutput("File not found: " + err.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// ═══════════════════════════════════════════════
// BUILD THE FULL VAULT DATA STRUCTURE
// ═══════════════════════════════════════════════
function buildVaultData() {
  const rootFolder = getVaultRoot();
  
  // Find category folders
  const peopleFolder = findFolder(rootFolder, CONFIG.PEOPLE_FOLDER_NAME);
  const vehiclesFolder = findFolder(rootFolder, CONFIG.VEHICLES_FOLDER_NAME);
  const propertiesFolder = findFolder(rootFolder, CONFIG.PROPERTIES_FOLDER_NAME);
  const sharedFolder = findFolder(rootFolder, CONFIG.SHARED_FOLDER_NAME);

  // Build people data
  const people = peopleFolder 
    ? getSubFolders(peopleFolder).map(folder => ({
        name: folder.getName(),
        files: getFilesInFolder(folder)
      }))
    : [];

  // Build vehicles data
  const vehicles = vehiclesFolder 
    ? getSubFolders(vehiclesFolder).map(folder => ({
        name: folder.getName(),
        files: getFilesInFolder(folder)
      }))
    : [];

  // Build properties data
  const properties = propertiesFolder 
    ? getSubFolders(propertiesFolder).map(folder => ({
        name: folder.getName(),
        files: getFilesInFolder(folder)
      }))
    : [];

  // Build shared documents
  const shared = sharedFolder 
    ? getFilesInFolder(sharedFolder) 
    : [];

  // Collect ALL files for search + renewal tracking
  const allFiles = [];
  
  people.forEach(p => {
    p.files.forEach(f => {
      allFiles.push({ ...f, parentName: p.name });
    });
  });
  
  vehicles.forEach(v => {
    v.files.forEach(f => {
      allFiles.push({ ...f, parentName: v.name });
    });
  });
  
  properties.forEach(p => {
    p.files.forEach(f => {
      allFiles.push({ ...f, parentName: p.name });
    });
  });
  
  shared.forEach(f => {
    allFiles.push({ ...f, parentName: 'Shared Documents' });
  });

  return {
    people: people,
    vehicles: vehicles,
    properties: properties,
    shared: shared,
    allFiles: allFiles,
    bankAccounts: getBankAccounts(rootFolder),
    lastSynced: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════

/**
 * Find a folder by name inside a parent folder.
 * Creates the folder if it doesn't exist and createIfMissing is true.
 */
function findFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return null;
}

/**
 * Get all sub-folders inside a folder.
 */
function getSubFolders(parentFolder) {
  const folders = [];
  const iterator = parentFolder.getFolders();
  while (iterator.hasNext()) {
    folders.push(iterator.next());
  }
  return folders;
}

/**
 * Get all files inside a folder (non-trashed, excludes Google Docs/Sheets/Slides).
 * Returns file metadata: id, name, mimeType, size, lastUpdated.
 */
function getFilesInFolder(folder) {
  const files = [];
  const iterator = folder.getFiles();
  
  while (iterator.hasNext()) {
    const file = iterator.next();
    
    // Skip trashed files
    if (file.isTrashed()) continue;
    
    // Skip Google Workspace files (Docs, Sheets, Slides, Forms)
    // These can't be previewed/downloaded as regular files
    const mimeType = file.getMimeType();
    if (mimeType.includes('google-apps')) continue;
    
    // Skip hidden files (starting with .)
    if (file.getName().startsWith('.')) continue;

    files.push({
      id: file.getId(),
      name: file.getName(),
      mimeType: mimeType,
      size: file.getSize(),
      lastUpdated: file.getLastUpdated().toISOString()
    });
  }
  
  // Sort by name for consistent ordering
  files.sort((a, b) => a.name.localeCompare(b.name));
  
  return files;
}

// ═══════════════════════════════════════════════
// BANK ACCOUNTS — stored as .bank_accounts.json inside each person's folder
// The leading dot keeps it hidden from the documents list.
// This way, renaming a person's folder keeps bank data linked automatically.
// ═══════════════════════════════════════════════

const BANK_FILE_NAME = ".bank_accounts.json";

/**
 * Read all bank accounts from each person's folder inside People/.
 * Each person's bank data is stored as .bank_accounts.json in their folder.
 */
function getBankAccounts(rootFolder) {
  var peopleFolder = findFolder(rootFolder, CONFIG.PEOPLE_FOLDER_NAME);
  if (!peopleFolder) return [];
  
  var bankAccounts = [];
  var personFolders = getSubFolders(peopleFolder);
  
  for (var i = 0; i < personFolders.length; i++) {
    var personFolder = personFolders[i];
    var files = personFolder.getFilesByName(BANK_FILE_NAME);
    while (files.hasNext()) {
      var file = files.next();
      if (file.isTrashed()) continue;
      try {
        var content = file.getBlob().getDataAsString();
        var data = JSON.parse(content);
        if (Array.isArray(data.banks)) {
          // Use folder name as person (authoritative — survives renames)
          data.person = personFolder.getName();
          bankAccounts.push(data);
        }
      } catch (e) {
        // Skip malformed JSON files
        continue;
      }
    }
  }
  return bankAccounts;
}

/**
 * Save bank accounts for a person.
 * Creates/overwrites .bank_accounts.json inside the person's folder.
 */
function handleSaveBankAccounts(params) {
  var person = (params.person || "").trim();
  var banksJson = (params.banks || "").trim();
  var email = (params.email || "").trim();
  var phone = (params.phone || "").trim();
  
  if (!person || !banksJson) {
    return { success: false, error: "Missing person name or banks data" };
  }
  
  var root = getVaultRoot();
  var peopleFolder = findOrCreateFolder(root, CONFIG.PEOPLE_FOLDER_NAME);
  var personFolder = findOrCreateFolder(peopleFolder, person);
  
  // Read existing file to preserve fields we're not updating
  var existingEmail = email;
  var existingPhone = phone;
  var existing = personFolder.getFilesByName(BANK_FILE_NAME);
  while (existing.hasNext()) {
    var f = existing.next();
    if (!f.isTrashed()) {
      try {
        var oldContent = f.getBlob().getDataAsString();
        var oldData = JSON.parse(oldContent);
        if (!email) existingEmail = oldData.email || "";
        if (!phone) existingPhone = oldData.phone || "";
      } catch (e) { /* ignore parse errors */ }
    }
    f.setTrashed(true);
  }
  
  // Write new JSON file with email & phone
  var data = {
    person: person,
    email: existingEmail,
    phone: existingPhone,
    banks: JSON.parse(banksJson)
  };
  var blob = Utilities.newBlob(JSON.stringify(data, null, 2), "application/json", BANK_FILE_NAME);
  personFolder.createFile(blob);
  
  return { success: true, person: person };
}

/**
 * Delete bank accounts file for a person.
 */
function handleDeleteBankAccounts(params) {
  var person = (params.person || "").trim();
  if (!person) return { success: false, error: "Missing person name" };
  
  var root = getVaultRoot();
  var peopleFolder = findFolder(root, CONFIG.PEOPLE_FOLDER_NAME);
  if (!peopleFolder) return { success: false, error: "People folder not found" };
  
  var personFolder = findFolder(peopleFolder, person);
  if (!personFolder) return { success: false, error: "Person folder '" + person + "' not found" };
  
  var existing = personFolder.getFilesByName(BANK_FILE_NAME);
  var deleted = false;
  while (existing.hasNext()) {
    existing.next().setTrashed(true);
    deleted = true;
  }
  
  return { success: true, person: person, deleted: deleted };
}

/**
 * Proxy download — returns the raw file content so it can be 
 * shared regardless of Google Drive link-sharing settings.
 */
function handleDownloadFile(params) {
  var fileId = (params.fileId || "").trim();
  if (!fileId) {
    return { success: false, error: "Missing fileId" };
  }
  
  try {
    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    return ContentService
      .createTextOutput(Utilities.base64Encode(blob.getBytes()))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return jsonResponse({ success: false, error: "File not found: " + err.toString() });
  }
}

// ═══════════════════════════════════════════════
// WRITE OPERATIONS — called by POST requests
// ═══════════════════════════════════════════════

function doPost(e) {
  // ── Optional API Key check ──
  const API_KEY = ""; // Set a secret key here if you want extra security
  if (API_KEY && e.parameter.key !== API_KEY) {
    return jsonResponse({ success: false, error: "Unauthorized: invalid API key" });
  }

  try {
    const action = e.parameter.action || "";
    switch (action) {
      case "createFolder":
        return jsonResponse(handleCreateFolder(e.parameter));
      case "deleteFolder":
        return jsonResponse(handleDeleteFolder(e.parameter));
      case "uploadFile":
        return jsonResponse(handleUploadFile(e.parameter));
      case "copyFromDrive":
        return jsonResponse(handleCopyFromDrive(e.parameter));
      case "deleteFile":
        return jsonResponse(handleDeleteFile(e.parameter));
      case "renameItem":
        return jsonResponse(handleRenameItem(e.parameter));
      case "updateDueDate":
        return jsonResponse(handleUpdateDueDate(e.parameter));
      case "renameFolderByName":
        return jsonResponse(handleRenameFolderByName(e.parameter));
      case "saveBankAccounts":
        return jsonResponse(handleSaveBankAccounts(e.parameter));
      case "deleteBankAccounts":
        return jsonResponse(handleDeleteBankAccounts(e.parameter));
      case "downloadFile":
        return handleDownloadFile(e.parameter);
      default:
        return jsonResponse({ success: false, error: "Unknown action: " + action });
    }
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.toString(),
      stack: error.stack
    });
  }
}

/**
 * Create a new sub-folder (member, vehicle, or property).
 * @param {Object} params - { parentType: "PEOPLE"|"VEHICLES"|"PROPERTIES", folderName: string }
 */
function handleCreateFolder(params) {
  const parentType = params.parentType;
  const folderName = (params.folderName || "").trim();

  if (!parentType || !folderName) {
    return { success: false, error: "Missing parentType or folderName" };
  }

  const configKey = parentType + "_FOLDER_NAME";
  const parentFolderName = CONFIG[configKey];
  if (!parentFolderName) {
    return { success: false, error: "Invalid parentType: " + parentType };
  }

  const root = getVaultRoot();
  const parentFolder = findOrCreateFolder(root, parentFolderName);
  
  // Check for duplicate
  const existing = findFolder(parentFolder, folderName);
  if (existing) {
    return { success: false, error: "A folder named '" + folderName + "' already exists" };
  }

  const newFolder = parentFolder.createFolder(folderName);
  return {
    success: true,
    folder: { id: newFolder.getId(), name: newFolder.getName() }
  };
}

/**
 * Delete a sub-folder (member, vehicle, or property) by name.
 * @param {Object} params - { parentType: "PEOPLE"|"VEHICLES"|"PROPERTIES"|"SHARED", folderName: string }
 */
function handleDeleteFolder(params) {
  const parentType = params.parentType;
  const folderName = (params.folderName || "").trim();

  if (!parentType || !folderName) {
    return { success: false, error: "Missing parentType or folderName" };
  }

  const root = getVaultRoot();
  let targetFolder;

  if (parentType === "SHARED") {
    return { success: false, error: "Use deleteFile for shared documents" };
  }

  const configKey = parentType + "_FOLDER_NAME";
  const parentFolderName = CONFIG[configKey];
  if (!parentFolderName) {
    return { success: false, error: "Invalid parentType: " + parentType };
  }

  const parentFolder = findFolder(root, parentFolderName);
  if (!parentFolder) {
    return { success: false, error: "Parent folder '" + parentFolderName + "' not found" };
  }

  targetFolder = findFolder(parentFolder, folderName);
  if (!targetFolder) {
    return { success: false, error: "Folder '" + folderName + "' not found" };
  }

  try {
    targetFolder.setTrashed(true);
    return {
      success: true,
      message: "Folder '" + folderName + "' moved to trash",
      folderName: folderName,
      parentType: parentType
    };
  } catch (err) {
    return { success: false, error: "Failed to move folder to trash: " + err.toString() };
  }
}

/**
 * Resolve the vault destination folder for uploads/copies.
 * @param {string} parentType - PEOPLE|VEHICLES|PROPERTIES|SHARED
 * @param {string} folderName - member/vehicle/property name (or Shared_Documents)
 * @returns {GoogleAppsScript.Drive.Folder|{success:false,error:string}}
 */
function resolveTargetFolder(parentType, folderName) {
  const root = getVaultRoot();
  if (parentType === "SHARED") {
    return findOrCreateFolder(root, CONFIG.SHARED_FOLDER_NAME);
  }
  const configKey = parentType + "_FOLDER_NAME";
  const parentFolderName = CONFIG[configKey];
  if (!parentFolderName) {
    return { success: false, error: "Invalid parentType: " + parentType };
  }
  const parentFolder = findOrCreateFolder(root, parentFolderName);
  return findOrCreateFolder(parentFolder, folderName);
}

/**
 * Extract a Google Drive file ID from a URL or raw ID string.
 * Supports:
 *   https://drive.google.com/file/d/FILE_ID/view
 *   https://drive.google.com/open?id=FILE_ID
 *   https://docs.google.com/document/d/FILE_ID/edit
 *   raw FILE_ID
 */
function parseDriveFileId(input) {
  const raw = (input || "").trim();
  if (!raw) return null;

  // /file/d/ID or /d/ID (Docs/Sheets/etc.)
  let m = raw.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];

  // ?id=FILE_ID or &id=FILE_ID
  m = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) return m[1];

  // Raw Drive file ID (no URL)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(raw)) return raw;

  return null;
}

/**
 * Append _due_YYYY-MM-DD before the file extension (or at the end).
 */
function applyDueDateToFileName(fileName, dueDate) {
  if (!dueDate) return fileName;
  // Strip any existing _due_ date first
  const cleaned = fileName.replace(/_due_\d{4}-\d{2}-\d{2}/i, "");
  const lastDot = cleaned.lastIndexOf(".");
  if (lastDot > 0) {
    return cleaned.substring(0, lastDot) + "_due_" + dueDate + cleaned.substring(lastDot);
  }
  return cleaned + "_due_" + dueDate;
}

/**
 * Upload a file to a specific sub-folder.
 * Accepts base64-encoded file data via URL-encoded POST params.
 * @param {Object} params - e.parameter from doPost
 * 
 * Expected params:
 * { action: "uploadFile", parentType: "PEOPLE", folderName: "Dad",
 *   fileName: "doc.pdf", fileData: "<base64>", mimeType: "application/pdf" }
 */
function handleUploadFile(params) {
  const parentType = params.parentType;
  const folderName = (params.folderName || "").trim();
  const fileName = (params.fileName || "").trim();
  const fileData = params.fileData;
  const mimeType = params.mimeType || "application/octet-stream";

  if (!parentType || !folderName || !fileName || !fileData) {
    return { success: false, error: "Missing required fields: parentType, folderName, fileName, fileData" };
  }

  // Sanity check file size (Apps Script web app limit ~6MB, decoded base64 ~4.5MB raw)
  if (fileData.length > 8 * 1024 * 1024) {
    return { success: false, error: "File too large. Maximum ~6 MB per upload." };
  }

  const targetFolder = resolveTargetFolder(parentType, folderName);
  if (targetFolder && targetFolder.success === false) {
    return targetFolder;
  }

  try {
    const decoded = Utilities.base64Decode(fileData);
    const blob = Utilities.newBlob(decoded, mimeType, fileName);
    const file = targetFolder.createFile(blob);
    return {
      success: true,
      file: {
        id: file.getId(),
        name: file.getName(),
        mimeType: file.getMimeType(),
        size: file.getSize(),
        lastUpdated: file.getLastUpdated().toISOString()
      }
    };
  } catch (err) {
    return { success: false, error: "Failed to save file: " + err.toString() };
  }
}

/**
 * Copy an existing Drive file into a vault sub-folder.
 * Avoids re-uploading bytes from the browser — uses DriveApp.makeCopy.
 *
 * Expected params:
 * { action: "copyFromDrive", parentType: "PEOPLE", folderName: "Dad",
 *   sourceUrlOrId: "https://drive.google.com/file/d/FILE_ID/view",
 *   fileName: "optional-rename.pdf", dueDate: "2026-12-31" }
 */
function handleCopyFromDrive(params) {
  const parentType = params.parentType;
  const folderName = (params.folderName || "").trim();
  const sourceUrlOrId = (params.sourceUrlOrId || "").trim();
  const dueDate = (params.dueDate || "").trim();
  let fileName = (params.fileName || "").trim();

  if (!parentType || !folderName || !sourceUrlOrId) {
    return {
      success: false,
      error: "Missing required fields: parentType, folderName, sourceUrlOrId"
    };
  }

  const fileId = parseDriveFileId(sourceUrlOrId);
  if (!fileId) {
    return {
      success: false,
      error: "Could not parse a Google Drive file ID from the provided link or ID"
    };
  }

  const targetFolder = resolveTargetFolder(parentType, folderName);
  if (targetFolder && targetFolder.success === false) {
    return targetFolder;
  }

  try {
    const source = DriveApp.getFileById(fileId);
    // Folders cannot be copied as documents
    if (source.getMimeType() === MimeType.FOLDER) {
      return { success: false, error: "That link points to a folder. Paste a file link instead." };
    }

    if (!fileName) {
      fileName = source.getName();
    }
    fileName = applyDueDateToFileName(fileName, dueDate);

    const copy = source.makeCopy(fileName, targetFolder);
    return {
      success: true,
      file: {
        id: copy.getId(),
        name: copy.getName(),
        mimeType: copy.getMimeType(),
        size: copy.getSize(),
        lastUpdated: copy.getLastUpdated().toISOString()
      }
    };
  } catch (err) {
    return {
      success: false,
      error: "Failed to copy Drive file (check access / link): " + err.toString()
    };
  }
}

/**
 * Delete a single file by its Drive ID.
 * @param {Object} params - { fileId: string }
 */
function handleDeleteFile(params) {
  const fileId = (params.fileId || "").trim();
  if (!fileId) {
    return { success: false, error: "Missing fileId" };
  }

  try {
    const file = DriveApp.getFileById(fileId);
    const fileName = file.getName();
    file.setTrashed(true);
    return {
      success: true,
      message: "File '" + fileName + "' moved to trash",
      fileId: fileId,
      fileName: fileName
    };
  } catch (err) {
    return { success: false, error: "File not found or access denied: " + err.toString() };
  }
}

/**
 * Rename a folder or file.
 * @param {Object} params - { itemType: "folder"|"file", itemId: string, newName: string }
 */
function handleRenameItem(params) {
  const itemType = params.itemType;
  const itemId = (params.itemId || "").trim();
  const newName = (params.newName || "").trim();

  if (!itemType || !itemId || !newName) {
    return { success: false, error: "Missing itemType, itemId, or newName" };
  }

  try {
    if (itemType === "folder") {
      const folder = DriveApp.getFolderById(itemId);
      const oldName = folder.getName();
      folder.setName(newName);
      return { success: true, oldName: oldName, newName: newName };
    } else if (itemType === "file") {
      const file = DriveApp.getFileById(itemId);
      const oldName = file.getName();
      file.setName(newName);
      return { success: true, oldName: oldName, newName: newName };
    }
    return { success: false, error: "Invalid itemType. Use 'folder' or 'file'" };
  } catch (err) {
    return { success: false, error: "Item not found: " + err.toString() };
  }
}

// ═══════════════════════════════════════════════
// ADDITIONAL HELPERS
// ═══════════════════════════════════════════════

/**
 * Find or create a folder by name inside a parent folder.
 */
function findOrCreateFolder(parentFolder, folderName) {
  const existing = findFolder(parentFolder, folderName);
  if (existing) return existing;
  return parentFolder.createFolder(folderName);
}

/**
 * Update the due date on a file by renaming it.
 * @param {Object} params - { fileId: string, newDueDate: string (YYYY-MM-DD) }
 * If the file already has a _due_YYYY-MM-DD pattern, it replaces it.
 * Otherwise, it appends _due_YYYY-MM-DD before the extension.
 */
function handleUpdateDueDate(params) {
  const fileId = (params.fileId || "").trim();
  const newDueDate = (params.newDueDate || "").trim();

  if (!fileId || !newDueDate) {
    return { success: false, error: "Missing fileId or newDueDate" };
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDueDate)) {
    return { success: false, error: "Invalid date format. Use YYYY-MM-DD" };
  }

  try {
    const file = DriveApp.getFileById(fileId);
    const oldName = file.getName();
    const DUE_DATE_REGEX = /_due_\d{4}-\d{2}-\d{2}/i;
    
    let newName;
    if (DUE_DATE_REGEX.test(oldName)) {
      // Replace existing due date
      newName = oldName.replace(DUE_DATE_REGEX, "_due_" + newDueDate);
    } else {
      // Append new due date before extension
      const lastDot = oldName.lastIndexOf(".");
      if (lastDot > 0) {
        newName = oldName.substring(0, lastDot) + "_due_" + newDueDate + oldName.substring(lastDot);
      } else {
        newName = oldName + "_due_" + newDueDate;
      }
    }
    
    file.setName(newName);
    return { success: true, oldName: oldName, newName: newName };
  } catch (err) {
    return { success: false, error: "File not found or access denied: " + err.toString() };
  }
}

/**
 * Rename a folder by its current name (useful when we know parentType + oldName but not folderId).
 * @param {Object} params - { parentType: "PEOPLE"|"VEHICLES"|"PROPERTIES", oldName: string, newName: string }
 */
function handleRenameFolderByName(params) {
  const parentType = params.parentType;
  const oldName = (params.oldName || "").trim();
  const newName = (params.newName || "").trim();

  if (!parentType || !oldName || !newName) {
    return { success: false, error: "Missing parentType, oldName, or newName" };
  }

  const configKey = parentType + "_FOLDER_NAME";
  const parentFolderName = CONFIG[configKey];
  if (!parentFolderName) {
    return { success: false, error: "Invalid parentType: " + parentType };
  }

  const root = getVaultRoot();
  const parentFolder = findFolder(root, parentFolderName);
  if (!parentFolder) {
    return { success: false, error: "Parent folder '" + parentFolderName + "' not found" };
  }

  const targetFolder = findFolder(parentFolder, oldName);
  if (!targetFolder) {
    return { success: false, error: "Folder '" + oldName + "' not found" };
  }

  // Check for duplicate
  const existingNew = findFolder(parentFolder, newName);
  if (existingNew) {
    return { success: false, error: "A folder named '" + newName + "' already exists" };
  }

  targetFolder.setName(newName);
  return { success: true, oldName: oldName, newName: newName, folderId: targetFolder.getId() };
}

/**
 * Build a consistent JSON response.
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
