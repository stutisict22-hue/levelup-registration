// =============================================================================
// LevelUp Northeast 2026 — EXHIBITOR REGISTRATION (Form 2)
// =============================================================================
// Standalone Apps Script. Writes to Sheet2 of the shared LevelUp registrations
// spreadsheet. Sheet1 belongs to Form 1 (visitor flow) — never touched.
// Confirmation emails are intentionally disabled for the exhibitor flow.
//
// REQUIRED — Script Properties (set via Apps Script editor → Project Settings
// → Script Properties → Add script property):
//   IMGBB_API_KEY   ImgBB API key used for company-seal image uploads.
//                   Without it, seal uploads silently no-op (URL stays empty).
//
// Spreadsheet (Sheet2):
// https://docs.google.com/spreadsheets/d/15WGl4Ze6S-MM0NnifACpRvmIlAa3-hD3FCC8GR38Kjw/edit?gid=112949094#gid=112949094
//
// IDs use prefix IDGES2026_03 with a 4-digit random suffix; collisions are
// avoided by checking against existing IDs in the sheet at insert time.
//
// Dedupe key: Company GST → fallback PAN. (Two staff from the same exhibitor
// would otherwise hit a dedupe wall on email/phone.)
// =============================================================================

const SHEET_ID = '15WGl4Ze6S-MM0NnifACpRvmIlAa3-hD3FCC8GR38Kjw';
const SHEET_NAME = 'Sheet2';

const COL_HEADERS = [
  "Timestamp",
  "Exhibitor ID",
  "Company Name",
  "Address",
  "City",
  "State",
  "Pin Code",
  "Country",
  "Mobile",
  "Phone",
  "Email",
  "Website",
  "GST No",
  "PAN No",
  "CII Membership No",
  "IDGS Membership No",
  "Exhibits",
  "Group Companies",
  "Founder Name",
  "Founder Designation",
  "Founder Email",
  "Founder Mobile",
  "Delegates",
  "Org Profile (200w)",
  "Catalogue Ads",
  "Stall Size",
  "Selected Room IDs",
  "Selected Rooms Detail",
  "Total Sqft",
  "Total Price (INR)",
  "Selected Rooms JSON",
  "Bank Draft No",
  "Bank Draft Date",
  "Payment Currency",
  "Payment Amount",
  "Contract Date",
  "Signatory Name",
  "Signatory Designation",
  "Signature",
  "Rules Accepted",
  "Company Seal URL",
];

function doPost(e) {
  const ID_PREFIX = 'IDGES2026_03';
  const IMGBB_API_KEY = PropertiesService
    .getScriptProperties()
    .getProperty('IMGBB_API_KEY');

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'Server is busy, please try again.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const doc = SpreadsheetApp.openById(SHEET_ID);
    const sheet = doc.getSheetByName(SHEET_NAME);
    const p = e.parameter;

    // Dedupe by GST (fallback PAN). Indices are 0-based and MUST match
    // COL_HEADERS / newRow positions for "Exhibitor ID", "GST No", "PAN No".
    const COL_ID_INDEX = 1;
    const COL_GST_INDEX = 12;
    const COL_PAN_INDEX = 13;

    const data = sheet.getDataRange().getValues();
    const newGst = (p.gstNo || "").toString().trim().toUpperCase();
    const newPan = (p.panNo || "").toString().trim().toUpperCase();

    // Single pass: collect existing IDs (for collision check) and look for
    // GST/PAN dedupe at the same time.
    const existingIds = new Set();
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      existingIds.add((row[COL_ID_INDEX] || "").toString().trim());

      const existingGst = (row[COL_GST_INDEX] || "").toString().trim().toUpperCase();
      const existingPan = (row[COL_PAN_INDEX] || "").toString().trim().toUpperCase();

      if ((newGst !== "" && existingGst === newGst) ||
          (newPan !== "" && existingPan === newPan)) {
        return ContentService.createTextOutput(JSON.stringify({
          'result': 'error',
          'message': 'Duplicate Found: This GST / PAN is already registered for an exhibitor.'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Generate a 4-digit suffix that's not already in the sheet. With ~500
    // submissions and a 10k-ID space, the birthday paradox makes a naive
    // single draw collide ~22% of the time — so retry on collision.
    let uniqueID;
    do {
      const randomFourDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      uniqueID = ID_PREFIX + randomFourDigits;
    } while (existingIds.has(uniqueID));

    const timestamp = new Date();

    var companySealUrl = "";
    if (p.companySeal && p.companySeal.indexOf("data:") === 0 && IMGBB_API_KEY) {
      var base64Data = p.companySeal.split(",")[1];
      var fileName = p.companySealName || ((p.companyName || "exhibitor") + "_seal.png");

      var imgbbResponse = UrlFetchApp.fetch("https://api.imgbb.com/1/upload", {
        method: "post",
        payload: {
          key: IMGBB_API_KEY,
          image: base64Data,
          name: fileName.split(".")[0]
        }
      });

      var imgbbResult = JSON.parse(imgbbResponse.getContentText());
      if (imgbbResult.success) {
        companySealUrl = imgbbResult.data.url;
      }
    }

    // Order MUST match COL_HEADERS above.
    const newRow = [
      timestamp,
      uniqueID,
      p.companyName,
      p.address,
      p.city,
      p.state,
      p.pinCode,
      p.country,
      p.mobile,
      p.phone,
      p.email,
      p.website,
      p.gstNo,
      p.panNo,
      p.ciiMembershipNo,
      p.idgsMembershipNo,
      p.exhibits,
      p.groupCompanies,
      p.founderName,
      p.founderDesignation,
      p.founderEmail,
      p.founderMobile,
      p.delegates,
      p.orgProfile,
      p.catalogueAds,
      p.stallSize,
      p.selectedRoomIds,
      p.selectedRoomsDetail,
      p.totalSqft,
      p.totalPrice,
      p.selectedRoomsJson,
      p.bankDraftNo,
      p.bankDraftDate,
      p.paymentCurrency,
      p.paymentAmount,
      p.contractDate,
      p.signatoryName,
      p.signatoryDesignation,
      p.signature,
      p.rulesAccepted,
      companySealUrl
    ];

    sheet.appendRow(newRow);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'id': uniqueID }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'message': e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// One-time helper: run from the Apps Script editor to write the column
// headers into row 1 of Sheet2 (and freeze it). Don't run again afterwards.
function setupHeaders() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  sheet.getRange(1, 1, 1, COL_HEADERS.length).setValues([COL_HEADERS]);
  sheet.setFrozenRows(1);
}
