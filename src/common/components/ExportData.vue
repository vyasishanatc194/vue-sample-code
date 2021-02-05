<!-- Component to export data table to CSV or Excel format -->
<template>
  <div>
    <!-- Behave as dropdown button when multiple choices are enabled -->
    <q-btn-dropdown
      v-if='isSingleMode === false'
      :disable='enabled === false'
      ref="btnExportTo"
      color="primary"
      anchor="top right"
      dropdown-icon="keyboard_arrow_down"
    >
      <template v-slot:label>
        <uil-export size="1.2rem" />
        &nbsp;&nbsp;
        <span class="text-capitalize">{{ $t('common.components.export.name') }}</span>
      </template>
      <q-list>
        <q-item clickable v-close-popup v-for="n in exportOptions"
          :key="`${n.reportType}_${n.value}`"
          @click.native="notifyExport(n.value, n.reportType)">
          <q-item-section>
            <q-item-label>
              {{ n.label }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <!-- Behave as single button when single option is set to the right index -->
    <q-btn
      v-if='isSingleMode'
      color="primary"
      @click.native="notifyExport(exportOptions[option].value, exportOptions[option].reportType)">
      {{ exportOptions[option].labelSingleMode }}
    </q-btn>
  </div>
</template>

<script>
import _ from 'lodash';
import utilSaveAs from 'src/common/utils/saveAs';
import utilCSV from 'src/common/utils/csv';
import xlsxPopulate from 'xlsx-populate';
import { mapState, mapGetters } from 'vuex';
import moment from 'moment';
import { UilExport } from '@iconscout/vue-unicons';

const reportTypes = {
  basic: 'basic',
  liveHaulReport: 'liveHaulReport',
  feedDeliveryScheduleReport: 'feedDeliveryScheduleReport',
};

const typeValueFormat = {
  Number: '0.00',
  String: '@',
  Date: 'YYYY/MM/DD hh:mm',
};

/**
 * Get the width of a cell once its content is converted to a string representation.
 * @param {number|string} cellValue The value of a cell
 * @param {string} cellExportType Type of cell in which it is exported
 * @returns {number} The required width, in characters, to render the cell's value
 */
function getCellWidth(cellValue, cellExportType) {
  const minStringLength = 0;
  // Make sure the cellValue is valid
  if (typeof cellValue === 'undefined' || cellValue === null) {
    return minStringLength;
  }
  // Make sure the value is a valid date
  if (cellExportType === 'date'
    && moment(cellValue, typeValueFormat.Date).isValid() === true) {
    return moment(cellValue).format(typeValueFormat.Date).length;
  }
  return cellValue.toString().length;
}

export default {
  name: 'export-data',
  components: {
    UilExport,
  },
  data() {
    return {
      // Table export options
      exportOptions: [
        {
          label: this.$t('common.components.export.csv'),
          value: 'csv',
          labelSingleMode: this.$t('common.components.export.downloadCSV'),
          reportType: reportTypes.basic,
        },
        {
          label: this.$t('common.components.export.xls'),
          value: 'xlsx',
          labelSingleMode: this.$t('common.components.export.downloadExcel'),
          reportType: reportTypes.basic,
        },
        {
          label: this.$t('common.components.export.liveHaulPlanningReport'),
          value: 'xlsx',
          labelSingleMode: this.$t('common.components.export.downloadLiveHaulPlanningReport'),
          reportType: reportTypes.liveHaulReport,
        },
        {
          label: this.$t('common.components.export.feedDeliveryScheduleReport'),
          value: 'xlsx',
          labelSingleMode: this.$t('common.components.export.downloadFeedDeliveryScheduleReport'),
          reportType: reportTypes.feedDeliveryScheduleReport,
        },
      ],
      extension: '',
    };
  },
  props: {
    reportTypes,
    // File name used to build the generated output file
    fileName: String,
    // Sheet name used to identify the name of the sheet in excel file
    sheetName: {
      required: true,
      type: String,
    },
    // Title name
    titleName: String,
    // The component enabled state
    enabled: Boolean,
    // Specify export option index in single mode
    // Multiple options mode if set to -1
    option: {
      type: Number,
      default: -1,
    },
  },
  computed: {
    ...mapState('user', ['userId', 'timeZone']),
    ...mapGetters('user', ['getFullName']),
    isSingleMode() {
      return this.option !== -1;
    },
  },
  methods: {
    /** Adjust the width of columns according to the length of their content
     * @param {Array<object>} exportedColumns The exported columns definition
     * [
     *  {
     *    align: "left",
     *    export: { type: 'string' },
     *    field: 'poultryCurve0",
     *    ...
     *  },
     *  {...},
     *  ...
     * ]
     * @param {object} range The range of data uses to adjust the width
    */
    $adjustAllColumnWidth(exportedColumns, range) {
      // Get an 2D array of all data in the range
      const rangeValueList = range.value();
      // Make sure the range is not empty
      if (Array.isArray(rangeValueList) === false || rangeValueList.length < 1) {
        return;
      }
      // Set the width of all columns based on the widest cell found
      exportedColumns.forEach((column, columnIndex) => {
        // Create an array of all width of cells in this column
        const columnCellWidthList = rangeValueList
          .map(row => getCellWidth(row[columnIndex], column.export.type));
        // Get the widest cell in the column
        const maxCellWidth = Math.max(...columnCellWidthList);
        // Set the width of the column
        range.sheet().column(columnIndex + 1).width(maxCellWidth);
      });
    },
    exportXLSX(columns, rows) {
      // Export to an xlsx document
      xlsxPopulate.fromBlankAsync()
        .then((workbook) => {
          // Create sheet
          const sheet = workbook.activeSheet().name(this.sheetName);

          // Apply a specific number format to all columns
          columns.forEach((column, columnIndex) => {
            let numberFormat = typeValueFormat.String;
            if (column.export.type === 'number') {
              // Set the format with decimal number
              numberFormat = typeValueFormat.Number;
            } else if (column.export.type === 'date') {
              // Set the format to a date format
              numberFormat = typeValueFormat.Date;
            }
            // Set the column format
            sheet.column(columnIndex + 1)
              .style('numberFormat', numberFormat);
          });

          // Print title
          let iCurrentRowIdx = 1;
          sheet
            .range(sheet.cell(iCurrentRowIdx, 1), sheet.cell(iCurrentRowIdx, columns.length))
            .merged(true)
            .style('bold', true)
            .style('fontSize', 20)
            .style('verticalAlignment', 'center')
            .style('numberFormat', typeValueFormat.String)
            .value('Compass');
          sheet.row(iCurrentRowIdx).height(30);
          iCurrentRowIdx += 1;

          // Print user name
          sheet
            .range(sheet.cell(iCurrentRowIdx, 1), sheet.cell(iCurrentRowIdx, 3))
            .merged(true)
            .style('bold', true)
            .style('numberFormat', typeValueFormat.String)
            .value(this.$t('common.components.export.userName'));
          sheet
            .range(sheet.cell(iCurrentRowIdx, 4), sheet.cell(iCurrentRowIdx, columns.length))
            .merged(true)
            .style('horizontalAlignment', 'left')
            .style('numberFormat', typeValueFormat.String)
            .value(this.getFullName);
          iCurrentRowIdx += 1;

          // Print date
          sheet
            .range(sheet.cell(iCurrentRowIdx, 1), sheet.cell(iCurrentRowIdx, 3))
            .merged(true)
            .style('bold', true)
            .style('numberFormat', typeValueFormat.String)
            .value(this.$t('common.components.export.date'));
          sheet
            .range(sheet.cell(iCurrentRowIdx, 4), sheet.cell(iCurrentRowIdx, columns.length))
            .merged(true)
            .style('numberFormat', typeValueFormat.Date)
            .style('horizontalAlignment', 'left')
            .value(new Date());
          iCurrentRowIdx += 1;

          // Print report timezone
          sheet
            .range(sheet.cell(iCurrentRowIdx, 1), sheet.cell(iCurrentRowIdx, 3))
            .merged(true)
            .style('bold', true)
            .style('numberFormat', typeValueFormat.String)
            .value(this.$t('common.components.export.reportTimezone'));
          sheet
            .range(sheet.cell(iCurrentRowIdx, 4), sheet.cell(iCurrentRowIdx, columns.length))
            .merged(true)
            .style('horizontalAlignment', 'left')
            .style('numberFormat', typeValueFormat.String)
            .value(moment.tz.guess(true));
          iCurrentRowIdx += 1;

          // Print report title
          sheet
            .range(sheet.cell(iCurrentRowIdx, 1), sheet.cell(iCurrentRowIdx, columns.length))
            .merged(true)
            .style('bold', true)
            .style('fontSize', 16)
            .style('horizontalAlignment', 'left')
            .style('verticalAlignment', 'center')
            .style('numberFormat', typeValueFormat.String)
            .value(this.titleName);
          sheet.row(iCurrentRowIdx).height(20);
          iCurrentRowIdx += 1;

          // Print all header rows
          for (let c = 0; c < columns.length; c += 1) {
            sheet
              .cell(iCurrentRowIdx, c + 1)
              .style('fill', {
                type: 'gradient',
                gradientType: 'linear',
                stops: [
                  { position: 0, color: '3d7dcb' },
                  { position: 1, color: '395ae1' },
                ],
              })
              .style('fontColor', 'ffffff')
              .style('bold', true)
              .style('numberFormat', typeValueFormat.String)
              .value(columns[c].label);
          }

          // Print all rows
          _(rows).forEach((row, rIdx) => {
            for (let c = 0; c < columns.length; c += 1) {
              const col = columns[c];
              let val = row[col.field];

              if (col.export.type === 'number') {
                val = Number.parseFloat(val, 10);
                if (Number.isNaN(val)) {
                  val = null;
                }
              } else if (col.export.type === 'date') {
                val = new Date(val);
                // Make sure the date object is not invalid
                if (moment(val).isValid() === false) {
                  val = null;
                }
              }
              sheet.cell(iCurrentRowIdx + rIdx + 1, c + 1)
                .value(val);
            }
          });

          const dataTableRange = sheet.range(
            // Get the top left cell of the excel table
            sheet.cell(iCurrentRowIdx, 1),
            // Get the bottom right cell of the excel table
            sheet.cell(iCurrentRowIdx + rows.length, columns.length),
          );
          // Add columns filter to the data table
          dataTableRange.autoFilter();
          // Set the width of all columns based on the widest found
          this.$adjustAllColumnWidth(columns, dataTableRange);

          // Write to file.
          return workbook.outputAsync().then((blob) => {
            utilSaveAs(blob, `${new Date().toISOString()}-${this.fileName}.${this.extension}`);
          });
        })
        .catch((err) => {
          this.$q.notify({
            color: 'negative',
            message: err.message || err,
            icon: 'report_problem',
          });
        });
    },
    exportCSV(columns, rows, timeZone, rowsToIgnoreTypeCheck) {
      const rowsToExport = rows.reduce((acc, row, index) => {
        const arr = [];
        const ignoreThisRow = _(rowsToIgnoreTypeCheck).indexOf(index) !== -1;
        for (let c = 0; c < columns.length; c += 1) {
          const col = columns[c];
          let val = row[col.field];
          if (!ignoreThisRow && col.export.type === 'date') {
            val = new Date(val);
          }
          arr.push({
            type: col.export.type,
            val,
          });
        }
        acc.push(arr);
        return acc;
      }, []);

      // Export them to csv
      utilCSV({
        headers: columns.map(c => c.v1LegacyName || c.label),
        rows: rowsToExport,
        rowsToIgnoreTypeCheck,
        timeZone,
        v1LegacyUnit: columns.map(c => c.v1LegacyUnit),
      }, `${new Date().toISOString()}-${this.fileName}.${this.extension}`);
    },
    notifyExport(extension, reportType) {
      // Holds specified extension
      this.extension = extension;
      // Notify exporting event waiting for data to be injected
      this.$emit('onExport', { reportType, extension });
    },
    /**
     * Runs the export using provided data
     *
     * @param {Array} columns table columns
     * @param {Array} rows table rows
     * @param {String} timeZone time zone to display on date
     * @param {Array} rowsToIgnoreTypeCheck row indexes which don't require type checkup
     *    due to the artifacts introduced by v1 requirements, which we must avoid
     *    in future version
     */
    doExport(columns, rows, timeZone, rowsToIgnoreTypeCheck) {
      // Export according to the extension
      if (this.extension === 'xlsx') {
        this.exportXLSX(columns, rows);
      } else if (this.extension === 'csv') {
        let fixrowsToIgnoreTypeCheck = [];
        if (rowsToIgnoreTypeCheck) {
          fixrowsToIgnoreTypeCheck = rowsToIgnoreTypeCheck;
        }
        this.exportCSV(columns, rows, timeZone, fixrowsToIgnoreTypeCheck);
      }
      if (!this.isSingleMode) {
        this.$refs.btnExportTo.hide();
      }
    },
  },
};
</script>

<style />
