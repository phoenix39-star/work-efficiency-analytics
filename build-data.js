const fs = require('fs');
const path = require('path');

// Member name mapping
const memberNameMapping = {
  'Phoenix': 'Phoenix',
  'Ivee dễ thương nhất trên đời': 'Ivee',
  'Kashy': 'Kashy',
  'Qui Ti': 'Qui Ti',
  'Hưng': 'Hưng',
  'Kairenz': 'Kairenz'
};

/**
 * Convert comma decimal to regular decimal
 * "2,50" → 2.5
 */
function parseDecimal(value) {
  if (typeof value !== 'string') return value;
  return parseFloat(value.replace(',', '.'));
}

/**
 * Normalize date to yyyy-mm-dd format
 * Handles d/m/yyyy and dd-mm-yyyy formats
 */
function normalizeDate(dateStr) {
  if (!dateStr) return null;

  dateStr = dateStr.trim();

  // Try d/m/yyyy format
  let match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const day = String(match[1]).padStart(2, '0');
    const month = String(match[2]).padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  // Try dd-mm-yyyy format
  match = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (match) {
    const day = String(match[1]).padStart(2, '0');
    const month = String(match[2]).padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  // If already in yyyy-mm-dd format, return as-is
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }

  return null;
}

/**
 * Process a single row of data
 */
function processRow(row) {
  if (!row || row.length === 0) return null;

  // Skip empty rows (where first column is empty)
  const firstCol = row[0];
  if (!firstCol || (typeof firstCol === 'string' && firstCol.trim() === '')) {
    return null;
  }

  return {
    date: normalizeDate(row[0]),
    task: row[1] || '',
    description: row[2] || '',
    startTime: row[3] || '',
    endTime: row[4] || '',
    hours: parseDecimal(row[5]),
    dayTotal: parseDecimal(row[6]),
    week: row[7] || '',
    weekTotal: parseDecimal(row[8]),
    weekdayTotal: parseDecimal(row[9]),
    weekendTotal: parseDecimal(row[10]),
    weekCounted: row[11] || ''
  };
}

/**
 * Main build function
 */
function buildData() {
  // Read raw sheet data
  const rawSheetsPath = path.join(__dirname, 'raw-sheets.json');
  const rawSheets = JSON.parse(fs.readFileSync(rawSheetsPath, 'utf8'));

  const members = {};
  const memberNames = [];

  // Process each sheet (each sheet is a member)
  for (const [sheetName, rows] of Object.entries(rawSheets)) {
    // Map the sheet name to the canonical member name
    const canonicalName = memberNameMapping[sheetName];

    if (!canonicalName) {
      console.warn(`Warning: Unknown member sheet name: "${sheetName}". Skipping.`);
      continue;
    }

    // Skip header row (first row)
    const dataRows = rows.slice(1);

    // Process each row
    const processedRows = [];
    for (const row of dataRows) {
      const processedRow = processRow(row);
      if (processedRow !== null) {
        processedRows.push(processedRow);
      }
    }

    members[canonicalName] = processedRows;
    memberNames.push(canonicalName);
  }

  // Build output object
  const output = {
    members,
    memberNames
  };

  // Write to data.json
  const outputPath = path.join(__dirname, 'data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`Successfully processed ${memberNames.length} members`);
  console.log(`Output written to: ${outputPath}`);
}

// Run the build
buildData();
