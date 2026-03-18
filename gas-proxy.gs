/**
 * Google Apps Script — JSON API proxy for Work Efficiency Analytics
 *
 * Setup:
 *  1. Open the Google Sheet → Extensions → Apps Script
 *  2. Paste this entire file into Code.gs
 *  3. Deploy → New deployment → Web app
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  4. Copy the deployment URL and paste it into the website on first visit
 */

const SHEET_ID = '11XtHJBHXzxLB6nAK4J4TCY1NIsFGCvj6vuIFJ9L3v-U';
const SKIP_TABS = ['Overview'];

function doGet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheets = ss.getSheets();
  const members = {};
  const memberNames = [];

  for (const sheet of sheets) {
    const name = sheet.getName();
    if (SKIP_TABS.includes(name)) continue;

    // Friendly display name
    const displayName = name.replace(/ dễ thương nhất trên đời/, '');
    memberNames.push(displayName);

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) continue;

    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const dateRaw = row[0];
      if (!dateRaw) continue; // skip empty rows

      // Normalize date to ISO (YYYY-MM-DD)
      let isoDate = '';
      if (dateRaw instanceof Date) {
        isoDate = Utilities.formatDate(dateRaw, ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
      } else {
        // Handle "2/3/2026" or "02-03-2026" (d/m/y)
        const s = String(dateRaw).replace(/-/g, '/');
        const parts = s.split('/');
        if (parts.length === 3) {
          const d = parts[0].padStart(2, '0');
          const m = parts[1].padStart(2, '0');
          const y = parts[2];
          isoDate = y + '-' + m + '-' + d;
        }
      }
      if (!isoDate) continue;

      const toNum = (v) => {
        if (typeof v === 'number') return v;
        if (!v) return 0;
        return parseFloat(String(v).replace(',', '.')) || 0;
      };

      rows.push({
        date: isoDate,
        task: String(row[1] || ''),
        description: String(row[2] || ''),
        startTime: String(row[3] || ''),
        endTime: String(row[4] || ''),
        hours: toNum(row[5]),
        dayTotal: toNum(row[6]),
        week: String(row[7] || ''),
        weekTotal: toNum(row[8]),
        weekdayTotal: toNum(row[9]),
        weekendTotal: toNum(row[10]),
        weekCounted: toNum(row[11])
      });
    }
    members[displayName] = rows;
  }

  const output = JSON.stringify({ members, memberNames });
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
}
