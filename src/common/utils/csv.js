import moment from 'moment';
import saveAs from './saveAs';
/**
 * Save table data to CSV
 *
 * @param {Object} data Data to save
 * Should be an object as
 *  {
 *    timeZone: timezone to print properly for date
 *    headers: ['header 1', 'header 2'],    // Optional
 *    v1LegacyUnits: ['°C', 'g']            // Optional
 *    rows: [
 *      { type: 'date', val: new Date() },
 *      { type: 'string', val: 'foo' }
 *      { type: 'number', val: 45.7 }
 *    ],
 *  }
 *
 * Possible type : date, string, number, boolean. If type is
 * undefined, string is presumed
 *
 * NOTES
 *  date value will be outputted as ISO-8601
 *  number value will be outputted with a fixed precision of 2 decimal
 *
 * @param {String} fileName File name [optional]. If present the
 * browser will ask to save this file
 *
 * @returns The csv file content
 */
export default function (data, fileName) {
  // Function to quotes the cell, if it contains a ", a , or other whitespace (except blanks)
  const escapeCSVCell = (cell) => {
    // The type of `cell` parameter must be `string`
    if (!cell) {
      // Ensure we did not receive a falsy param (0, '', null, undefined)
      return '';
    }
    if (typeof cell.replace === 'function'
      && cell.replace(/ /g, '').match(/[\s,"]/)) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return `${cell}`;
  };

  // Format each cell of a row
  const formatRowCells = (row, ignoreTypeCheckForThisRow) => row.map((cell, index) => {
    // Format cell
    let result = cell.val;
    // If this row requires type checkup
    if (!ignoreTypeCheckForThisRow) {
      if (cell.type === 'number' || typeof cell.val === 'number') {
        // This is a cell which value and cell type are `number`
        result = parseFloat(cell.val);
        if (Number.isNaN(result)) {
          result = '';
        } else {
          // TODO: Do not hard code the decimal precision, use a better system
          // See
          //   - https://git.dev.intelia.com/eng/family-compass/compass/issues/403
          //   - https://git.dev.intelia.com/eng/family-compass/compass/issues/548
          result = result.toFixed(2);
        }
      } else if (cell.type === 'string' && typeof cell.val === 'string') {
        // This is a cell which value and cell type are `string`
        result = typeof cell.val === 'string' ? cell.val : '';
      } else if (cell.type === 'date') {
        // This is a cell which value type is `date`
        const d = moment.tz(cell.val, data.timeZone);
        result = d.isValid() ? d.format('YYYY-MM-DD h:mm:ssa z') : '';
      }
    }
    if (result && data.v1LegacyUnit[index]) {
      result += data.v1LegacyUnit[index];
    }
    result = escapeCSVCell(result);
    return result;
  })
    .join(',');

  // Create headers (if required)
  let csvResult = '';
  if (Array.isArray(data.headers)) {
    csvResult = data.headers.map(cell => escapeCSVCell(cell)).join(',');
    csvResult += '\n';
  }
  if (Array.isArray(data.rows)) {
    csvResult += data.rows
      .map((row, index) => {
        // Indicate if this row requires checkup
        const ignoreTypeCheckForThisRow = Array.isArray(data.rowsToIgnoreTypeCheck)
          && (data.rowsToIgnoreTypeCheck.indexOf(index) !== -1);
        const formattedRow = formatRowCells(row, ignoreTypeCheckForThisRow);
        return formattedRow;
      })
      .join('\n');
  }

  // Save file ?
  if (fileName) {
    const blob = new Blob([csvResult], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, fileName);
  }

  // Return result
  return csvResult;
}
