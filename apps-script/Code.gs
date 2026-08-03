/**
 * ──────────────────────────────────────────────
 * Family Digital Vault — Google Apps Script Backend
 * ──────────────────────────────────────────────
 * 
 * SETUP:
 * 1. Go to https://script.google.com
 * 2. Create a new project, paste this entire file
 * 3. Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone (or "Only myself" if you add auth later)
 * 4. Copy the deployment URL into vault-config.json
 *
 * GOOGLE DRIVE STRUCTURE EXPECTED:
 *   Root/
 *   ├── People/
 *   │   ├── Dad/
 *   │   │   ├── Aadhaar.pdf
 *   │   │   ├── PAN.pdf
 *   │   │   ├── photo.jpg
 *   │   │   └── Insurance_due_2026-12-31.pdf
 *   │   └── Mom/
 *   ├── Vehicles/
 *   │   ├── Car-MH01AB1234/
 *   │   │   ├── RC.pdf
 *   │   │   ├── Insurance_due_2026-06-15.pdf
 *   │   │   └── PUC.pdf
 *   │   └── Bike-MH01XY5678/
 *   ├── Properties/
 *   │   └── Our-Home/
 *   │       ├── Sale_Deed.pdf
 *   │       └── Property_Tax.pdf
 *   └── Shared_Documents/
 *       └── Family_Health_Insurance.pdf
 */

// ═══════════════════════════════════════════════
// CONFIGURATION — Adjust these to match your folders
// ═══════════════════════════════════════════════
const CONFIG = {
  PEOPLE_FOLDER_NAME: "People",
  VEHICLES_FOLDER_NAME: "Vehicles",
  PROPERTIES_FOLDER_NAME: "Properties",
  SHARED_FOLDER_NAME: "Shared_Documents",
};

// ═══════════════════════════════════════════════
// MAIN ENTRY POINT — called by GET requests
// ═══════════════════════════════════════════════
function doGet(e) {
  try {
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

// ═══════════════════════════════════════════════
// BUILD THE FULL VAULT DATA STRUCTURE
// ═══════════════════════════════════════════════
function buildVaultData() {
  const rootFolder = DriveApp.getRootFolder();
  
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
// WRITE OPERATIONS — called by POST requests
// ═══════════════════════════════════════════════

function doPost(e) {
  // ── Optional API Key check ──
  // Set API_KEY in vault-config.json and the app sends it with every POST.
  // If API_KEY is empty below, no auth check is performed.
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
        return jsonResponse(handleUploadFile(e));
      case "deleteFile":
        return jsonResponse(handleDeleteFile(e.parameter));
      case "renameItem":
        return jsonResponse(handleRenameItem(e.parameter));
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

  const root = DriveApp.getRootFolder();
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

  const root = DriveApp.getRootFolder();
  let targetFolder;

  if (parentType === "SHARED") {
    // For shared, we delete a file directly, not a folder
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

  // Move to trash (recoverable) instead of permanent delete
  targetFolder.setTrashed(true);
  return { success: true, message: "Folder '" + folderName + "' moved to trash" };
}

/**
 * Upload a file to a specific sub-folder.
 * Accepts base64-encoded file data via POST body (JSON).
 * @param {Object} e - The full POST event object
 * 
 * Expected JSON body:
 * { action: "uploadFile", parentType: "PEOPLE", folderName: "Dad",
 *   fileName: "doc.pdf", fileData: "<base64>", mimeType: "application/pdf" }
 */
function handleUploadFile(e) {
  // Read JSON body from postData
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return { success: false, error: "Invalid JSON body: " + err.toString() };
  }

  const parentType = payload.parentType;
  const folderName = (payload.folderName || "").trim();
  const fileName = (payload.fileName || "").trim();
  const fileData = payload.fileData;
  const mimeType = payload.mimeType || "application/octet-stream";

  if (!parentType || !folderName || !fileName || !fileData) {
    return { success: false, error: "Missing required fields: parentType, folderName, fileName, fileData" };
  }

  // Sanity check file size (Apps Script web app limit ~6MB, decoded base64 ~4.5MB raw)
  if (fileData.length > 8 * 1024 * 1024) {
    return { success: false, error: "File too large. Maximum ~6 MB per upload." };
  }

  const root = DriveApp.getRootFolder();
  let targetFolder;

  if (parentType === "SHARED") {
    targetFolder = findOrCreateFolder(root, CONFIG.SHARED_FOLDER_NAME);
  } else {
    const configKey = parentType + "_FOLDER_NAME";
    const parentFolderName = CONFIG[configKey];
    if (!parentFolderName) {
      return { success: false, error: "Invalid parentType: " + parentType };
    }
    const parentFolder = findOrCreateFolder(root, parentFolderName);
    targetFolder = findOrCreateFolder(parentFolder, folderName);
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
    return { success: true, message: "File '" + fileName + "' moved to trash" };
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
 * Build a consistent JSON response.
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
