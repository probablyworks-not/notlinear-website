const SHEET_ID = '1u4EmwGTws2g2CJo_A_kowx7poOCyVnRoLOsvhQfnuMg';

function doPost(e) {
  const reply = value => ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
  let lock;
  try {
    const body = JSON.parse(e.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty('WAITLIST_SECRET');
    if (!secret) return reply({ok: false, code: 'SECRET_NOT_CONFIGURED'});
    if (body.secret !== secret) return reply({ok: false, code: 'SECRET_MISMATCH'});
    const email = String(body.email || '').trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /^[=+\-@]/.test(email)) {
      return reply({ok: false});
    }
    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    const book = SpreadsheetApp.openById(SHEET_ID);
    const sheet = book.getSheets().find(s => s.getSheetId() === 0);
    if (!sheet) return reply({ok: false, code: 'TAB_NOT_FOUND'});
    if (sheet.getLastRow() === 0) sheet.appendRow(['Datetime', 'Email']);
    const headers = sheet.getRange(1, 1, 1, 2).getValues()[0];
    if (headers[0] !== 'Datetime' || headers[1] !== 'Email') return reply({ok: false, code: 'HEADERS_INCORRECT'});
    const count = sheet.getLastRow() - 1;
    const duplicate = count > 0 && sheet.getRange(2, 2, count, 1).getValues()
      .some(row => String(row[0]).trim().toLowerCase() === email);
    if (!duplicate) {
      const timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
      const row = sheet.getLastRow() + 1;
      sheet.getRange(row, 1, 1, 2).setNumberFormat('@').setValues([[timestamp, email]]);
      SpreadsheetApp.flush();
    }
    return reply({ok: true});
  } catch (_) {
    return reply({ok: false, code: 'SHEET_WRITE_FAILED'});
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}
