function doPost(e) {
  const SHEET_NAME = 'Sheet1';
  const ID_PREFIX = 'IDGES2026_02';
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

    const COL_EMAIL_INDEX = 5;
    const COL_PHONE_INDEX = 6;

    const data = sheet.getDataRange().getValues();
    const newEmail = (p.email || "").toString().trim().toLowerCase();
    const newPhone = (p.phone || "").toString().trim();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const existingEmail = (row[COL_EMAIL_INDEX] || "").toString().trim().toLowerCase();
      const existingPhone = (row[COL_PHONE_INDEX] || "").toString().trim();

      if ((newEmail !== "" && existingEmail === newEmail) ||
          (newPhone !== "" && existingPhone === newPhone)) {
        return ContentService.createTextOutput(JSON.stringify({
          'result': 'error',
          'message': 'Duplicate Found: This Email or Phone is already registered.'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    const randomFourDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const uniqueID = ID_PREFIX + randomFourDigits;
    const timestamp = new Date();

    var profileImageUrl = "";
    if (p.profileImage && p.profileImage.indexOf("data:") === 0) {
      var base64Data = p.profileImage.split(",")[1];
      var fileName = p.profileImageName || (p.firstName + ".png");

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
        profileImageUrl = imgbbResult.data.url;
      }
    }

    const newRow = [
      timestamp,
      uniqueID,
      p.firstName,
      p.middleName,
      p.lastName,
      p.email,
      p.phone,
      p.designation,
      p.orgType,
      p.orgName,
      p.city,
      p.programInterests,
      p.category,
      p.membership,
      p.preferredDays,
      profileImageUrl
    ];

    sheet.appendRow(newRow);

    const fullNameForEmail = p.middleName
      ? `${p.firstName} ${p.middleName} ${p.lastName}`
      : `${p.firstName} ${p.lastName}`;

    if (p.email) {
      sendConfirmationEmail(p.email, fullNameForEmail, uniqueID);
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

function sendConfirmationEmail(userEmail, userName, userID) {
  const subject = "Welcome to LevelUp Northeast!";

  const bannerUrl = "https://forms.sportskeyz.com/email-banner.jpg";

  const androidLink = "https://play.google.com/store/apps/details?id=app.sportskeyz";
  const iosAppLink = "https://apps.apple.com/in/app/sportskeyz-sports-identity-hub/id6502113018";

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; font-size: 14px;">

      <div style="text-align: center; margin-bottom: 25px;">
        <img src="${bannerUrl}" alt="LevelUp Northeast" style="width: 100%; max-width: 600px; height: auto; border-radius: 4px;" />
      </div>

      <p style="margin-bottom: 15px;">Dear <strong>${userName}</strong>,</p>

      <p style="margin-bottom: 25px;">Thank you for registering for <strong>LevelUp Northeast!</strong> We're excited to have you on board.</p>

      <p style="margin-bottom: 5px;">
        Your Registration ID: <strong style="font-size: 16px; color: #000;">${userID}</strong>
      </p>
      <p style="margin-top: 0; color: #666; font-size: 13px; margin-bottom: 25px;">
        (Please keep this ID handy for all future communication and event access.)
      </p>

      <p style="font-weight: bold; margin-bottom: 10px;">What's Next?</p>
      <ul style="padding-left: 20px; margin-top: 0;">
        <li style="margin-bottom: 8px;">
          Visit our website for event updates, schedules, and important announcements:<br>
          <a href="https://levelupnortheast.in/" style="color: #0033cc; text-decoration: none;">https://levelupnortheast.in/</a>
        </li>

        <li style="margin-bottom: 8px;">
          Download our app for real-time updates and exclusive access:
          <a href="${androidLink}" style="color: #0033cc; font-weight: bold; text-decoration: none;">Download on Android</a>
          &nbsp;&nbsp;
          <a href="${iosAppLink}" style="color: #0033cc; font-weight: bold; text-decoration: none;">Download on iOS</a>
        </li>

        <li style="margin-bottom: 8px;">
          Check your inbox regularly for further instructions regarding participation, and event logistics.
        </li>
      </ul>

      <p style="margin-top: 25px;">
        If you have any questions, feel free to reach out to us at <a href="mailto:northeast@cii.in" style="color: #0033cc; text-decoration: none;">northeast@cii.in</a> and mention your Registration ID for faster assistance.
      </p>

      <p style="margin-bottom: 5px;">We look forward to seeing you at LevelUp Northeast!</p>

      <p style="margin-top: 20px;">
        Regards,<br>
        <strong>Team LevelUp</strong>
      </p>
    </div>
  `;

  MailApp.sendEmail({ to: userEmail, subject: subject, htmlBody: htmlBody });
}
