// =============================================================================
// LevelUp Northeast 2026 — EXHIBITOR REGISTRATION (Form 2)
// =============================================================================
// Deploy this as a Google Apps Script web app bound to a NEW Google Sheet
// (separate from the visitor-form sheet). Steps to deploy:
//
//   1. Create a new Google Sheet for exhibitor registrations.
//   2. Add the column headers in COL_HEADERS (below) as the first row of
//      the sheet — order matters and must match `newRow`.
//   3. Extensions → Apps Script → paste this entire file.
//   4. Deploy → New deployment → Web app
//        - Execute as: Me
//        - Who has access: Anyone
//   5. Copy the resulting Web app URL into the frontend's `.env` file as
//      VITE_FORM_ENDPOINT.
//
// IDs use prefix IDGES2026_03 so they never collide with the visitor form's
// IDGES2026_02 prefix.
//
// Dedupe key: Company GST → fallback to PAN. (Two staff from the same
// exhibitor would otherwise hit a dedupe wall on email/phone.)
// =============================================================================

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
  const SHEET_NAME = 'Sheet1';
  const ID_PREFIX = 'IDGES2026_03';
  const IMGBB_API_KEY = '0d0400b9fba6a8da721082770cf003bb';

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'Server is busy, please try again.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(SHEET_NAME);
    const p = e.parameter;

    // Dedupe by GST (fallback PAN). Column indices below MUST match
    // COL_HEADERS / newRow order.
    const COL_GST_INDEX = 12;
    const COL_PAN_INDEX = 13;

    const data = sheet.getDataRange().getValues();
    const newGst = (p.gstNo || "").toString().trim().toUpperCase();
    const newPan = (p.panNo || "").toString().trim().toUpperCase();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
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

    const randomFourDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const uniqueID = ID_PREFIX + randomFourDigits;
    const timestamp = new Date();

    var companySealUrl = "";
    if (p.companySeal && p.companySeal.indexOf("data:") === 0) {
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

    if (p.email) {
      sendConfirmationEmail(p.email, p.companyName || p.signatoryName || "Exhibitor", uniqueID);
    }

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

// One-time helper: run this from the Apps Script editor to write the column
// headers into row 1 of the bound sheet. Then never run it again.
function setupHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  sheet.getRange(1, 1, 1, COL_HEADERS.length).setValues([COL_HEADERS]);
  sheet.setFrozenRows(1);
}

function sendConfirmationEmail(userEmail, companyName, userID) {
  const subject = "LevelUp Northeast 2026 — Exhibitor Registration Received";

  const bannerUrl = "https://forms.sportskeyz.com/email-banner.jpg";

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; font-size: 14px;">

      <div style="text-align: center; margin-bottom: 25px;">
        <img src="${bannerUrl}" alt="LevelUp Northeast" style="width: 100%; max-width: 600px; height: auto; border-radius: 4px;" />
      </div>

      <p style="margin-bottom: 15px;">Dear <strong>${companyName}</strong>,</p>

      <p style="margin-bottom: 25px;">Thank you for registering as an exhibitor for <strong>LevelUp Northeast 2026!</strong> We have received your space booking application.</p>

      <p style="margin-bottom: 5px;">
        Your Exhibitor Registration ID: <strong style="font-size: 16px; color: #000;">${userID}</strong>
      </p>
      <p style="margin-top: 0; color: #666; font-size: 13px; margin-bottom: 25px;">
        (Please keep this ID handy for all future communication, payment reconciliation, and on-site setup.)
      </p>

      <p style="font-weight: bold; margin-bottom: 10px;">What's Next?</p>
      <ul style="padding-left: 20px; margin-top: 0;">
        <li style="margin-bottom: 8px;">
          The LevelUp Northeast Secretariat will review your application and revert with payment instructions, stall allocation, and setup logistics.
        </li>
        <li style="margin-bottom: 8px;">
          Visit our website for event updates and important announcements:<br>
          <a href="https://levelupnortheast.in/" style="color: #0033cc; text-decoration: none;">https://levelupnortheast.in/</a>
        </li>
        <li style="margin-bottom: 8px;">
          For questions, reach out at <a href="mailto:northeast@cii.in" style="color: #0033cc; text-decoration: none;">northeast@cii.in</a> or to the Secretariat coordinator listed in the General Exhibitor Rules. Quote your Exhibitor ID for faster assistance.
        </li>
      </ul>

      <p style="margin-bottom: 5px;">We look forward to hosting you at LevelUp Northeast 2026!</p>

      <p style="margin-top: 20px;">
        Regards,<br>
        <strong>Team LevelUp</strong>
      </p>
    </div>
  `;

  MailApp.sendEmail({ to: userEmail, subject: subject, htmlBody: htmlBody });
}
