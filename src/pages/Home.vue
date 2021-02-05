<template>
  <div>
    <title-bar
      :title="$t('home.title')"
    />
    <div class="home-container" v-if='initialized'>
      <!-- START: Tabs -->
      <q-tabs
        v-model="selectedTab"
        align="left"
        inline-label
        dense
        narrow-indicator
        class="bg-white tab-bar left-spacer right-spacer">
        <q-tab v-for="tab in filteredVisibleFilterTagsOptions"
          :key="tab.name"
          :name="tab.name">
          <component v-bind:is="`${tab.icon}`"></component>&nbsp;
          <span class="tab-label">{{ tab.label }}</span>
        </q-tab>
      </q-tabs>
      <!-- END: Tabs -->
      <!-- START: Tab View -->
      <div class="tab-panels left-spacer right-spacer">
        <div class="q-pa-md">
          <div class="row q-col-gutter-x-md q-col-gutter-y-md">
            <!-- START: Search Box -->
            <div class="col-lg-3 col-md-3 col-sm-12 col-100 col-33">
              <input-box
                v-model="filter"
                debounce="500"
                :placeholder="$t('home.search')"
                clearable>
                <template v-slot:prepend>
                  <uil-search size="1rem" slot="prepand-icon" class="prepand-icon" />
                </template>
              </input-box>
            </div>
            <!-- END: Search Box -->
            <!-- START: Search Box -->
            <div class="col-lg-3 col-md-4 col-sm-12 col-50 col-33">
              <select-box
                v-model="selectReportOption"
                :options="reportRowsOptions"
                @input="reportSelected"
                class="truncate-text"
              />
            </div>
            <!-- END: Search Box -->
            <!-- START: Column Visibility Select Box -->
            <div class="col-lg-3 col-md-3 col-sm-12 col-50 col-33">
              <select-box
                options-dense
                v-model="visibleColumns"
                :options="dynamicVisibleColumnOptions"
                :display-value="$t('home.columnVisibility')"
                option-value="name"
                option-label="label"
                emit-value
                map-options
                multiple
                color="primary"
                class="truncate-text">
                <template #before-options>
                  <div slot="before-options">
                    <q-item tag="label"
                      :class="{'select-all-active': isAllColumnSelected}"
                      v-ripple>
                      <q-item-section avatar class="hidden">
                        <q-checkbox
                          v-model="isAllColumnSelected"
                          @input="selectAllColumnVisibility"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('home.selectAll') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item tag="label"
                      :class="{'select-all-active': isAllColumnUnSelected}"
                      v-ripple>
                      <q-item-section avatar class="hidden">
                        <q-checkbox
                          v-model="isAllColumnUnSelected"
                          @input="unSelectAllColumnVisibility"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('home.unSelectAll') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator />
                  </div>
                </template>
              </select-box>
            </div>
            <!-- END: Column Visibility Select Box -->
            <!-- START: Export Button -->
            <div class="col-lg-3 col-md-2
              col-sm-12 row justify-end col-100">
              <export-data class="btn-export col-100"
                :enabled='true'
                @onExport='exportTable'
                :fileName='exportFileName'
                :titleName="$t('home.exportSheetName')"
                :sheetName="$t('home.exportTitle')"
                ref='exportDataRef'/>
            </div>
            <!-- END: Export Button -->
          </div>
          <!-- START: Table -->
          <div class="q-pt-md">
            <q-table
              id="tbReport"
              ref="tbReport"
              row-key="device_id"
              :columns="dynamicColumns"
              :data="rowsData"
              :pagination.sync="pagination"
              :filter="filter"
              :visible-columns="visibleColumns"
              :filter-method="filterTableData"
              flat
              hide-bottom
              class="sticky-header-column">
              <!-- Table row headers -->
              <q-tr slot="header" slot-scope="props" :props="props">
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                    {{col.label}}
                </q-th>
              </q-tr>
              <q-tr slot="body" slot-scope="props" :props="props"
                @click.native="goToSingleDevice(props.row)"
                class="cursor-pointer">
                <q-td v-for="(col) in props.cols" :key="col.name" :props="props">
                  {{ col.value }}
                </q-td>
              </q-tr>
            </q-table>
          </div>
          <!-- END: Table -->
          <!-- START: Pagination -->
          <q-list v-if="!this.$q.loading.isActive">
            <q-item>
              <!-- Rows Per Page -->
              <q-item-section>
                <div class="row-per-page row justify-start">
                  <span class="view-text">{{ $t('home.view') }}</span>
                  <a v-for="row in rowsPerPageOptions"
                    @click="handleRowPerPage(row)"
                    :key="row"
                    :class="isRowPerPageActive(row)">
                    {{ row === 0 ? $t('home.allRows') : row }}
                  </a>
                </div>
              </q-item-section>
              <!-- Pagination -->
              <q-item-section v-if="!isMobileView">
                <div class="row justify-center">
                  <q-pagination
                    v-model="pagination.page"
                    class="paginate"
                    color="gray-8"
                    :max="totalPages"
                    :max-pages="maxPages"
                    :direction-links="true"
                  />
                </div>
              </q-item-section>
              <!-- Show Total Rows -->
              <q-item-section>
                <div class="show-rows row justify-end">
                  {{ showingRowsPerPage }}
                </div>
              </q-item-section>
            </q-item>
            <!-- Mobile Pagination -->
            <q-item v-if="isMobileView" class="pagination-top-spacer">
              <q-item-section class="col-md-12">
                <div class="row justify-center">
                  <q-pagination
                    v-model="pagination.page"
                    class="paginate"
                    color="gray-8"
                    :max="totalPages"
                    :max-pages="maxPages"
                    :direction-links="true"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <!-- END: Pagination -->
        </div>
      </div>
      <!-- END: Tab View -->
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { QSpinnerOval } from 'quasar';
import { mapState, mapActions, mapGetters } from 'vuex';
import {
  UilSearch,
  UilBalanceScale,
  UilTemperature,
  UilChart,
  UilTrees,
  UilClipboardAlt,
  UilSetting,
} from '@iconscout/vue-unicons';
import { FeedUsageIcon, WaterUsageIcon } from 'src/common/custom-icons';
import TitleBar from 'src/common/components/TitleBar';
import InputBox from 'src/common/components/InputBox';
import SelectBox from 'src/common/components/SelectBox';
import ExportData from 'src/common/components/ExportData';
import UtilUnit from 'src/common/utils/unit';
import utilTagFilters from 'src/pages/home/utils/tagfilters';
import misc from 'src/common/utils/misc';
import moment from 'moment-timezone';

// Hold the name of special (ID -> string) tag
const tagIDToString = ['PoultryCurve', 'PoultrySex', 'SiloSex'];

function findPoultryTimeToTargetTagColumn(columns) {
  return columns.find(({ tag }) => tag === 'PoultryTimeToTarget');
}

function findLastUpdateColumn(columns) {
  return columns.find(({ field }) => field === 'lastUpdate');
}

function isCatchDateEstimable(columns) {
  const poultryTimeToTargetColumn = findPoultryTimeToTargetTagColumn(columns);
  const lastUpdateColumn = findLastUpdateColumn(columns);
  return typeof poultryTimeToTargetColumn !== 'undefined'
    && typeof lastUpdateColumn !== 'undefined';
}

function areTheValuesToCalculateTheCatchDateValid(lastUpdate, poultryTimeToTarget) {
  return moment(lastUpdate).isValid() === true
    && Number.isFinite(poultryTimeToTarget) === true;
}

function getSystemUnitFromUnitContextID(unitContextID) {
  return UtilUnit
    .getUnitConverterFromUnitContextID(unitContextID)
    .getSystemUnit();
}

function getMomentJSModifierFromUnitName(unitName) {
  return `${unitName}s`;
}

function convertDateToUnixMilliseconds(date) {
  return moment(date).valueOf();
}

function calculateEstimatedCatchDateInMilliseconds(
  lastUpdateRowValue,
  poultryTimeToTargetRawValue,
  poultryTimeToTargetUnitContextID,
  userTimeZoneName,
) {
  const systemUnit = getSystemUnitFromUnitContextID(poultryTimeToTargetUnitContextID);

  const momentJSModifierName = getMomentJSModifierFromUnitName(systemUnit.name);
  const calculatedEstimatedCatchDate = moment(lastUpdateRowValue)
    .tz(userTimeZoneName)
    .add(poultryTimeToTargetRawValue, momentJSModifierName);

  return convertDateToUnixMilliseconds(calculatedEstimatedCatchDate);
}

function addEstimatedCatchDateToEachDevice(columns, rows, userTimeZoneName) {
  const poultryTimeToTargetColumn = findPoultryTimeToTargetTagColumn(columns);
  const lastUpdateColumn = findLastUpdateColumn(columns);
  return rows
    .reduce((acc, row) => {
      // Extract the lastUpdate value
      const lastUpdateRowValue = row[lastUpdateColumn.field];
      // Extract the poultryTimeToTarget value
      const poultryTimeToTargetRawValue = Number
        .parseFloat(row.rawData[poultryTimeToTargetColumn.field]);

      if (areTheValuesToCalculateTheCatchDateValid(lastUpdateRowValue, poultryTimeToTargetRawValue)
        === false) {
        acc.push({ ...row });
        return acc;
      }
      const estimatedCatchDate = calculateEstimatedCatchDateInMilliseconds(
        lastUpdateRowValue,
        poultryTimeToTargetRawValue,
        poultryTimeToTargetColumn.unitContextID,
        userTimeZoneName,
      );
      acc.push({
        ...row,
        estimatedCatchDate,
      });
      return acc;
    }, []);
}

function sortRowsByEstimatedCatchDate(rows) {
  return _(rows)
    .orderBy('estimatedCatchDate')
    .valueOf();
}

/**
 * Get the 'Estimated Catch Date' field for each devices in the current report
 * @param {Array<object>} columns All columns in the current report
 * @param {Array<object>} rows All rows in the current report
 * @return {Array<object>} Return the rows with the estimatedCatchDate
 */
function getRowsWithEstimatedCatchDate(columns, rows, userTimeZoneName) {
  if (isCatchDateEstimable(columns) === false) {
    return rows;
  }
  const rowsWithEstimatedCatchDate = addEstimatedCatchDateToEachDevice(
    columns,
    rows,
    userTimeZoneName,
  );
  return rowsWithEstimatedCatchDate;
}

export default {
  components: {
    ExportData,
    UilSearch,
    UilBalanceScale,
    UilTemperature,
    UilChart,
    UilTrees,
    UilClipboardAlt,
    UilSetting,
    FeedUsageIcon,
    WaterUsageIcon,
    TitleBar,
    InputBox,
    SelectBox,
  },
  name: 'home',
  data() {
    const that = this;
    return {
      // Tags informations for the tabs filter.
      filterTagInfo: utilTagFilters,
      // Hold the selected report
      selectedReport: '',
      rowsPerPageOptions: [10, 25, 40, 0],
      maxPages: this.isMobileView ? 3 : 6,

      // Report's datatable static columns definition
      staticColumns: [
        {
          label: this.$t('home.datatableColumnEntity'),
          align: 'left',
          name: 'entity',
          field: 'entity',
          sortable: true,
          required: true,
          export: {},
        },
        {
          label: this.$t('home.datatableColumnDevice'),
          align: 'left',
          name: 'device',
          field: 'device',
          sortable: true,
          required: true,
          export: {},
        },
        {
          label: this.$t('home.datatableColumnLastUpdate'),
          align: 'left',
          name: 'lastUpdate',
          field: 'lastUpdate',
          sortable: true,
          required: true,
          format(value) {
            if (_.isFinite(value)) {
              return that.$moment(value).fromNow();
            }
            return that.$t('home.datatableColumnDataNever');
          },
          sort(a, b) {
            return new Date(a) - new Date(b);
          },
          export: {
            type: 'date',
          },
        },
      ],

      // Report's datatable static columns definition
      dynamicColumns: [],

      // Report's datatable data
      rowsData: [],

      // Table options
      allReportVisibleColumn: [],
      pagination: {
        sortBy: 'device',
        page: 1,
        rowsPerPage: 10,
        descending: false,
      },
      totalPages: 1,
      showingRowsPerPage: `${this.$t('home.showing')} 0 - 0 ${this.$t('home.of')} 0`,
      isAllColumnSelected: false,
      isAllColumnUnSelected: false,
      visibleColumns: [],
      filter: '',
      optionsLoaded: false,

      // Width of the page box
      topRowWidth: 0,
      selectReportOption: null,

      // True if table is in full screen mode otherwise false
      visibleFilterTagsOptions: [
        {
          name: 'tagsProduction',
          label: this.$t('home.filterProduction'),
          filterTags: utilTagFilters.tagsProduction,
          icon: 'UilClipboardAlt',
        },
        {
          name: 'tagsPoultryWeight',
          label: this.$t('home.filterPoultryWeight'),
          filterTags: utilTagFilters.tagsPoultryWeight,
          icon: 'UilBalanceScale',
        },
        {
          name: 'tagsFeedUsage',
          label: this.$t('home.filterFeedUsage'),
          filterTags: utilTagFilters.tagsFeedUsage,
          icon: 'FeedUsageIcon',
        },
        {
          name: 'tagsWaterMeter',
          label: this.$t('home.filterWaterMeter'),
          filterTags: utilTagFilters.tagsWaterMeter,
          icon: 'WaterUsageIcon',
        },
        {
          name: 'tagsClimate',
          label: this.$t('home.filterClimate'),
          filterTags: utilTagFilters.tagsClimate,
          icon: 'UilTemperature',
        },
        {
          name: 'tagsScoreCard',
          label: this.$t('home.filterScoreCard'),
          filterTags: utilTagFilters.tagsScoreCard,
          icon: 'UilChart',
        },
        {
          name: 'custom',
          label: this.$t('home.filterCustom'),
          icon: 'UilChart',
        },
      ],
      exportFileName: '',
    };
  },
  computed: {
    ...mapState('user', ['userId', 'timeZone']),
    ...mapState('home', [
      'initialized',
      'listLoading',
      'listLoaded',
      'reportRows',
      'reportData',
      'lastSelectedReport',
      'reportDataLoaded',
      'selectedFilter',
      'listVisibleColumns',
    ]),
    ...mapGetters('user', ['getFullName']),
    selectedReportId() {
      return Number.parseInt(this.selectedReport, 10);
    },
    selectedReportName() {
      const selectedReportObject = _(this.reportRows)
        .find(report => report.report_id === this.selectedReportId);
      return selectedReportObject ? selectedReportObject.report_name : this.$t('home.exportFileName');
    },
    staticVisibleColumnsNames() {
      return this.staticColumns.filter(f => f.required).map(c => c.name);
    },
    columnsToExport() {
      // Gather headers and rows
      const exportableCol = _(this.dynamicColumns)
        .filter(x => typeof x.export !== 'undefined' && this.visibleColumns.includes(x.name))
        .value();
      // Add the static columns to the exported columns.
      // The static columns are not in the visible columns to prevent duplicating the values.
      return _.union(this.staticColumns, exportableCol);
    },
    liveHaulReportColumnsToExport() {
      const tagListToExport = [
        'ProductionDay',
        'PoultryCount',
        'AveragePoultryWeight',
        'PoultryUniformity',
        'PoultryWeightStandardDeviation',
        'PoultryWeightTarget',
        'PoultryTimeToTarget',
        'estimatedCatchDate',
        'PoultryCurve',
        'PoultrySex',
      ];
      const exportTableColumns = this.dynamicColumns
        .filter(column => (
          typeof column.export !== 'undefined'
          && tagListToExport.includes(column.tag) === true
        ));
      // Add the custom column estimatedCatchDate
      exportTableColumns.push({
        export: { type: 'date' },
        field: 'estimatedCatchDate',
        tag: 'estimatedCatchDate',
        label: this.$t('home.estimatedCatchDate'),
      });
      return _(this.staticColumns)
        .union(exportTableColumns)
        // Apply the same order defined in the tagListToExport
        .sortBy(column => tagListToExport.findIndex(columnName => columnName === column.tag))
        .value();
    },
    feedDeliveryScheduleReportColumnsToExport() {
      const tagListToExport = [
        'ProductionDay',
        'PoultryCount',
        'SiloWeight',
        'SiloTimeToEmpty',
        'SiloTimeToEmptyTotal',
        'SiloFeedRequired',
        'SiloConsumption24HTotal',
      ];
      // Filter the columns to export
      const exportTableColumns = this.dynamicColumns
        .filter(column => (
          typeof column.export !== 'undefined'
          && tagListToExport.includes(column.tag) === true
        ));
      // Add all static columns to export
      return _(this.staticColumns).union(exportTableColumns).value();
    },
    reportRowsOptions() {
      // Group the reports/entities by repordt_id and agregate
      // associated entities on the sublabel
      const reports = _(this.reportRows)
        .groupBy(rpt => rpt.report_id)
        .toPairs()
        .map((pair) => {
          const item = {
            label: pair[1][0].report_name,
            sublabel: _(pair[1]).map(r => r.entity_name).join(', '),
            value: pair[0],
          };
          return item;
        })
        .value();
      return reports;
    },
    dynamicColumnsOptional() {
      return this.dynamicColumns.filter(c => !c.required);
    },
    dynamicVisibleColumnOptions() {
      if (this.selectedTab === 'custom') {
        return typeof this.listVisibleColumns[this.selectedTab] !== 'undefined'
          ? this.dynamicColumns.filter(c => !c.required)
          : [];
      }
      return typeof this.listVisibleColumns[this.selectedTab] !== 'undefined'
        ? this.dynamicColumns
          .filter(({ tag }) => this.filterTagInfo[this.selectedTab].includes(tag) === true
            && !tag.required)
        : [];
    },
    // Contain the last selected filter tab name.
    selectedTab: {
      get() {
        return this.selectedFilter;
      },
      set(val) {
        this.$store.commit('home/selectedFilterChanged', {
          selectedTab: val,
        });
        this.visibleColumns = this.getVisibleColumnNameByVisibleColumnId(this.columnsList);
      },
    },
    // Get a list of tag visibleColumnId depending of the selected tab
    columnsList: {
      get() {
        if (this.selectedTab === 'custom') {
          return typeof this.listVisibleColumns[this.selectedTab] !== 'undefined'
            ? this.listVisibleColumns[this.selectedTab]
            : this.dynamicColumns.map(({ visibleColumnId }) => visibleColumnId);
        }
        return typeof this.listVisibleColumns[this.selectedTab] !== 'undefined'
          ? this.listVisibleColumns[this.selectedTab]
          : this.dynamicColumns
            .filter(({ tag }) => this.filterTagInfo[this.selectedTab].includes(tag) === true)
            .map(tagInfo => tagInfo.visibleColumnId);
      },
    },
    /**
     * Filter the available options to filter the visible tags
     * @return {Array<Object>}
     * [
     *   {
     *     name: {string},
     *     label: {string},
     *     filterTags: {Array<String>},
     *   },
     *   {...},
     * ]
     */
    filteredVisibleFilterTagsOptions() {
      return this.visibleFilterTagsOptions
        .filter(tabOption => (
          tabOption.name === 'custom'
          || this.hasFilterTag(tabOption.filterTags) === true
        ));
    },
    isMobileView() {
      return this.$q.screen.sm === true || this.$q.screen.xs === true;
    },
  },
  // Before leaving this page, uninitialize the home store
  beforeRouteLeave(to, from, next) {
    this.unInitialize().then(() => next());
  },
  created() {
    // Initialize the store
    this.initialize(this.userId)
      // Load data from server
      .then(() => this.$store.dispatch('home/getReportList'))
      .then(() => {
        // Load table options from store
        this.allReportVisibleColumn = !_.isEmpty(this.$store.state.home.listVisibleColumn)
          ? this.$store.state.home.listVisibleColumn
          : [];
        this.filter = !_.isEmpty(this.$store.state.home.listFilter)
          ? this.$store.state.home.listFilter
          : '';

        // Try to restore last selected report from user
        // setting or select the first one
        if (Array.isArray(this.reportRows) && this.reportRows.length > 0) {
          this.$nextTick(() => {
            let defaultIdx = (this.lastSelectedReport) ? this.reportRowsOptions
              .findIndex(x => x.value === this.lastSelectedReport.toString()) : -1;
            if (defaultIdx === -1) defaultIdx = 0;
            this.selectReportOption = this.reportRowsOptions[defaultIdx];
            this.reportSelected(this.selectReportOption);
          });
        }

        // Options has been loaded from the store first
        this.optionsLoaded = true;
      })
      .catch((error) => {
        this.$q.notify({
          color: 'negative',
          message: error.message || error,
          icon: 'report_problem',
        });
      });
  },
  methods: {
    ...mapActions('home', ['initialize', 'unInitialize']),
    showLoader() {
      this.$q.loading.show({
        spinner: QSpinnerOval,
        message: this.$t('home.loadingData'),
      });
    },
    hideLoader() {
      this.$q.loading.hide();
    },
    pageCount(rowsData) {
      let totalPages = 1;
      if (this.pagination.rowsPerPage !== 0) {
        totalPages = Math.ceil(rowsData.length / this.pagination.rowsPerPage);
      }
      totalPages = totalPages === 0 ? 1 : totalPages;
      this.totalPages = totalPages;
      return totalPages;
    },
    filterData(lowerTerms, col, row, cellValue) {
      const cellValueInLowercase = (`${cellValue(col, row)}`).toLowerCase();
      const indexOfTerms = cellValueInLowercase.indexOf(lowerTerms);
      const isTermsFound = indexOfTerms !== -1;
      return isTermsFound;
    },
    filterTableData(rows, terms, cols, cellValue) {
      const lowerTerms = terms ? terms.toLowerCase() : '';
      const filterRows = rows.filter(
        row => cols.some(col => this.filterData(lowerTerms, col, row, cellValue)),
      );
      this.pageCount(filterRows);
      this.showRowsPerPage(filterRows);
      return filterRows;
    },
    // From a sensor information, build a data table column label
    getTagNameFromEntry(unitConverter, userUnit, sensor) {
      let res = `${sensor.tag_locale_name} #${sensor.sensor_index}`;
      if (userUnit.symbol.length > 0) {
        res += ` (${userUnit.symbol})`;
      }
      return res;
    },
    $sortTableStringItemPredicate(rowACell, rowBCell) {
      // NaN sort after anything else
      const notAvailableLabel = this.$t('home.na');
      const isANotAvailableLabel = rowACell.localeCompare(notAvailableLabel) === 0;
      const isBNotAvailableLabel = rowBCell.localeCompare(notAvailableLabel) === 0;
      if (isANotAvailableLabel === true && isBNotAvailableLabel === true) {
        return 0;
      }
      if (isANotAvailableLabel === true) {
        return -1;
      }
      if (isBNotAvailableLabel === true) {
        return 1;
      }

      // Strings compare
      return `${rowACell}''`.localeCompare(`${rowBCell}''`);
    },
    $sortTableNumberItemPredicate(rowACell, rowBCell) {
      // Number sorting
      const numA = Number.parseFloat(rowACell);
      const numB = Number.parseFloat(rowBCell);
      const isNumANaN = Number.isNaN(numA) === true;
      const isNumBNaN = Number.isNaN(numB) === true;

      // NaN sort after anything else
      if (isNumANaN === true && isNumBNaN === true) {
        return 0;
      }
      if (isNumANaN === true) {
        return -1;
      }
      if (isNumBNaN === true) {
        return 1;
      }

      // Numbers compare
      return numA - numB;
    },
    organizeReportDataForDataTable(data) {
      // Organize report's data received from server
      // to better work with datatable
      // We get every sorted tag
      if (!data.devices) return;
      const entries = data.devices;
      const tagAndDevices = _(entries)
        .groupBy((entry) => {
          const unitConverter = UtilUnit.getUnitConverterFromUnitContextID(entry.unit_context_id);
          const userUnit = unitConverter.getUserUnit();
          return this.getTagNameFromEntry(unitConverter, userUnit, entry);
        })
        .toPairs()
        .sort((a, b) => {
          const elemA = a[1][0];
          const elemB = b[1][0];
          if (elemA && elemB && elemA.tag_priority - elemB.tag_priority !== 0) {
            return elemA.tag_priority - elemB.tag_priority;
          }
          return a[0].localeCompare(b[0]);
        })
        .filter((tagGroup) => {
          const x = parseInt(tagGroup[1][0].sensor_timestamp, 10);
          return tagGroup[1].length > 0 && _.isFinite(x);
        })
        .value();

      // We want to add columns which aren't tags.
      this.dynamicColumns = _.map(tagAndDevices, (td) => {
        const tag = td[0];
        const devices = td[1];
        const firstDevice = devices[0];
        const unitConverter = UtilUnit.getUnitConverterFromUnitContextID(
          firstDevice.unit_context_id,
        );
        const userUnit = unitConverter.getUserUnit();
        const tagKey = _.camelCase(this.getTagNameFromEntry(unitConverter, userUnit, firstDevice));
        // PoultryCurve, PoultrySex and SiloSex are "text" type columns and must be left aligned.
        // While others, type "numeric" must be aligned right.
        const isIDToStringColumn = tagIDToString.indexOf(firstDevice.tag) !== -1;
        const align = isIDToStringColumn ? 'left' : 'right';
        return {
          label: tag,
          align,
          name: tagKey,
          v1LegacyName: `${firstDevice.tag_locale_name} #${firstDevice.sensor_index}`,
          v1LegacyUnit: userUnit.symbol.length > 0 ? ` ${userUnit.symbol}` : '',
          field: tagKey,
          visibleColumnId: `${firstDevice.tag_id}_${firstDevice.sensor_index}`,
          tag: firstDevice.tag,
          sortable: true,
          unitContextID: unitConverter.getUnitContext().id,
          sort: (a, b) => {
            // Equal items sort equally
            if (a === b) {
              return 0;
            }

            // String compare
            if (isIDToStringColumn === true) {
              return this.$sortTableStringItemPredicate(a, b);
            }

            // Number sorting
            return this.$sortTableNumberItemPredicate(a, b);
          },
          export: {
            type: misc.getTagType(firstDevice.tag),
          },
        };
      });
      // Persist dynamic columns ASAP
      this.$store.commit('home/listReportAvailableColumnsChanged', {
        reportId: this.selectedReportId,
        reportAvailableColumns: this.dynamicColumns.map(dc => dc.visibleColumnId),
      });

      // Merge static and dynamic columns's reports
      this.dynamicColumns = this.staticColumns.concat(this.dynamicColumns);

      // Build datatable row for all device
      this.rowsData = _(entries)
        .groupBy('device_id')
        .toPairs()
        .map((deviceIdGroup) => {
          // We are handling a single device's row in the table
          const device = {};

          // Extract device basic information (entity, name, etc...)
          const values = deviceIdGroup[1];
          const deviceId = deviceIdGroup[0];
          device.entity = _.first(values).entity;
          device.device = _.first(values).device;
          device.deviceId = deviceId;
          device.rawData = {};

          // Compute the last reception date from all sensors of this device.
          // Be aware that if this report does not contains all the sensor of this device, the
          // last reception date may be wrong.
          // TODO:: We should compute the last reception date on the model (database) side, ideally
          //       keeping a column in the device's table.
          device.lastUpdate = _(values)
            .map(v => parseInt(v.sensor_timestamp, 10))
            .max();

          // Go through all sensor's value of this device (columns)
          _(values).each((tagEntry) => {
            // Get tag's name of this sensor
            const unitConverter = UtilUnit.getUnitConverterFromUnitContextID(
              tagEntry.unit_context_id,
            );
            const userUnit = unitConverter.getUserUnit();
            const tagKey = _.camelCase(this.getTagNameFromEntry(unitConverter, userUnit, tagEntry));
            // Set an empty string as default value
            device[tagKey] = '';
            device.rawData[tagKey] = device[tagKey];
            // Interpret special tags
            if (tagEntry.tag === 'PoultryCurve') {
              // Interpret value of 'PoultryCurve' value as string
              const s = _.isObject(data.poultryCurveNames)
                ? data.poultryCurveNames[tagEntry.value] : undefined;
              device[tagKey] = (s === undefined) ? this.$t('home.na') : s;
              device.rawData[tagKey] = device[tagKey];
            } else if (tagEntry.tag === 'PoultrySex' || tagEntry.tag === 'SiloSex') {
              // Interpret value of 'PoultrySex' and 'SiloSex' value as string
              const s = _.isObject(data.poultrySexes)
                ? data.poultrySexes[tagEntry.value].locale_name
                : undefined;
              device[tagKey] = (s === undefined) ? this.$t('home.na') : s;
              device.rawData[tagKey] = device[tagKey];
            } else if (_.isFinite(tagEntry.value)) {
              device[tagKey] = unitConverter.formatValueToUser(tagEntry.value);
              device.rawData[tagKey] = tagEntry.value;
            }
          });
          return device;
        })
        .value();
      this.pageCount(this.rowsData);
      this.showRowsPerPage(this.rowsData);
    },
    handleReportChange(selectedReport) {
      // Handle when report selection changes
      this.showLoader();
      const reportId = Number.parseInt(selectedReport.value, 10);
      this.$store
        .dispatch('home/getReportData', reportId)
        .then(() => {
          // Retreive last known available columns
          const lastKnownDynamicColumns = this.$store
            .state
            .home
            .listAvailableColumns[this.selectedReportId];

          // Organize report data
          this.organizeReportDataForDataTable(this.reportData);

          // Set pagination of this report
          const p = this.$store.state.home.listPagination[this.selectedReportId];
          if (p) {
            this.pagination = p;
          }

          // Set visible columns
          // Filter the column to reduce the chance to get a column
          // that no longer exists from the user settings
          const storeVisibleColumns = this.columnsList;

          // Identify the new columns that have been added by diffing the last known
          // from the new ones and add them to visible columns by default
          const newlyAdded = _(this.$store.state.home.listAvailableColumns[this.selectedReportId])
            .xor(lastKnownDynamicColumns)
            .map(vk => this.dynamicColumns.find(dck => vk === dck.visibleColumnId))
            .omitBy(_.isUndefined)
            .map(dc => dc.name)
            .value();
          let computedVisibleColumns;
          if (Array.isArray(storeVisibleColumns) && (storeVisibleColumns.length > 0)) {
            computedVisibleColumns = _(storeVisibleColumns)
              .map(vk => this.dynamicColumns.find(dck => vk === dck.visibleColumnId))
              .omitBy(_.isUndefined)
              .map(dc => dc.name)
              .value();
          } else {
            computedVisibleColumns = this.dynamicColumns.map(dc => dc.name);
          }
          this.visibleColumns = _.union(computedVisibleColumns, newlyAdded);

          const isSelectedTabFilterExist = this.filteredVisibleFilterTagsOptions
            .some(({ name }) => name === this.selectedTab);
          // Make sure the selectedTab exist for the selected report
          if (isSelectedTabFilterExist === false) {
            this.$store.commit('home/selectedFilterChanged', {
              selectedTab: 'custom',
            });
          }
        })
        .catch((error) => {
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        })
        .then(() => this.hideLoader());
    },
    reportSelected(report) {
      this.handleReportChange(report);
      // Update store with selected option if it has changed
      const newReportId = report.value.toString();
      if (this.selectedReport !== newReportId) {
        this.selectedReport = newReportId;
      }
    },
    goToSingleDevice(row) {
      // Redirect to the single device page
      this.$router.push({
        path: '/device',
        query: {
          reportID: this.selectedReport,
          deviceID: row.deviceId,
        },
      });
    },
    /**
     * Export the report to an csv or xlsx file
     * @param {Object} reportInformation The information on the chosen report to download
     * {
     *   reportType {string} The type of the selected report
     *   extension {string} The extension of the file
     * }
     */
    exportTable(reportInformation) {
      const { reportType } = reportInformation;
      const { reportTypes } = ExportData.props;
      // The columns to export according to the type of report
      let columnsToExport;
      // The rows to export according to the type of report
      let rowsDataToExport;
      // Set the name of the file with the selected report name
      this.exportFileName = this.selectedReportName;
      // Modify the data to export according to the type of report
      if (reportTypes.liveHaulReport === reportType) {
        // Add the estimated catch date to each rowsDataToExport
        rowsDataToExport = getRowsWithEstimatedCatchDate(
          this.dynamicColumns,
          this.rowsData,
          this.timeZone,
        );
        rowsDataToExport = sortRowsByEstimatedCatchDate(rowsDataToExport);
        // Get the columns to export for the live haul report
        columnsToExport = this.liveHaulReportColumnsToExport;
        // Add the report type name to the file name
        this.exportFileName = this.$t('common.components.export.liveHaulPlanningReport')
          .concat(`-${this.exportFileName}`);
      } else if (reportTypes.feedDeliveryScheduleReport === reportType) {
        // Get the SiloTimeToEmptyTotal column which is the column use to sort the rowsDataToExport
        const siloTimeToEmptyTotalColumn = this.dynamicColumns
          .find(({ tag }) => tag === 'SiloTimeToEmptyTotal');
        // Create a copy to avoid modifying the original order
        rowsDataToExport = Object.assign([], this.rowsData);
        // Make sure the siloTimeToEmptyTotalColumn exist
        if (typeof siloTimeToEmptyTotalColumn !== 'undefined') {
          rowsDataToExport
            .sort((rowA, rowB) => (
              this.$sortTableNumberItemPredicate(
                rowA[siloTimeToEmptyTotalColumn.field],
                rowB[siloTimeToEmptyTotalColumn.field],
              )
            ));
        }
        // Get the columns to export for the feed delivery schedule report
        columnsToExport = this.feedDeliveryScheduleReportColumnsToExport;
        // Add the report type name to the file name
        this.exportFileName = this.$t('common.components.export.feedDeliveryScheduleReportFileName')
          .concat(`-${this.exportFileName}`);
      } else {
        rowsDataToExport = this.rowsData;
        // Export all visible columns
        ({ columnsToExport } = this);
      }
      // Wait for the data to be updated before exporting them
      this.$nextTick(() => {
        this.$refs.exportDataRef
          .doExport(
            columnsToExport,
            rowsDataToExport,
            this.timeZone,
          );
      });
    },
    /**
     * Return the list of all column name corresponding to the tag
     * @param {Array} tags Array of tag
     * @return {Array} List of available column name
     */
    getVisibleColumnFromTagList(tags) {
      return this.dynamicColumns
        .filter(({ tag }) => tags.includes(tag) === true)
        .map(tagInfo => tagInfo.tag);
    },
    /**
     * Return the list of all column name corresponding to the visibleColumnId
     * @param {Array} columnIDs Array of visibleColumnId
     * @return {Array} List of available column name
     */
    getVisibleColumnNameByVisibleColumnId(columnIDs) {
      return this.dynamicColumns
        .filter(({ visibleColumnId }) => columnIDs.includes(visibleColumnId) === true)
        .map(tagInfo => tagInfo.name);
    },
    /**
     * Verify if a list of tag is available for a report.
     * @param {Array} tags Array of tags to filter.
     * @return {Boolean} Return true if there is tag name to show.
    */
    hasFilterTag(tags) {
      const listTagFromFilter = this.getVisibleColumnFromTagList(tags);
      // Return true if the list is not empty and don't contain only ProductionDay tag
      return (
        listTagFromFilter.length > 1
        || (listTagFromFilter.length === 1 && listTagFromFilter[0] !== 'ProductionDay')
      );
    },
    handleRowPerPage(row) {
      this.$set(this.pagination, 'rowsPerPage', row);
      if (this.filter === null || this.filter === '') {
        this.pageCount(this.rowsData);
        this.showRowsPerPage(this.rowsData);
      }
    },
    showRowsPerPage(rowsData) {
      const rowsPerPage = this.pagination.rowsPerPage === 0
        ? rowsData.length : this.pagination.rowsPerPage;
      const fromRows = rowsData.length === 0 ? 0 : ((this.pagination.page - 1) * rowsPerPage) + 1;
      const toRows = (this.pagination.page * rowsPerPage)
        > rowsData.length ? rowsData.length
        : (this.pagination.page * rowsPerPage);
      const totalRows = rowsData.length;
      this.showingRowsPerPage = `${this.$t('home.showing')} ${fromRows}
       - ${toRows} ${this.$t('home.of')} ${totalRows}`;
      return this.showingRowsPerPage;
    },
    isRowPerPageActive(row) {
      const className = (row === this.pagination.rowsPerPage) ? 'active' : '';
      return className;
    },
    selectAllColumnVisibility() {
      if (this.initialized && this.optionsLoaded) {
        this.visibleColumns = this.dynamicVisibleColumnOptions.map(col => col.name);
      }
    },
    unSelectAllColumnVisibility() {
      if (this.initialized && this.optionsLoaded) {
        const visibleColumnOptions = this.dynamicVisibleColumnOptions.map(col => col.name);
        this.visibleColumns = this.getVisibleColumnNameByVisibleColumnId(visibleColumnOptions);
      }
    },
    setMaxPagesForMobile() {
      this.maxPages = 3;
    },
    setMaxPagesForLargeScreen() {
      this.maxPages = 6;
    },
  },
  watch: {
    pagination: {
      // Update store with new list pagination option
      handler(val) {
        if (this.initialized && this.optionsLoaded) {
          this.$store.commit('home/listPaginationReportChanged', {
            reportId: this.selectedReportId,
            newReportPagination: val,
          });
        }
        if (this.filter === null || this.filter === '') {
          this.pageCount(this.rowsData);
          this.showRowsPerPage(this.rowsData);
        }
      },
      deep: true,
    },
    filter(val) {
      // Update store with new list filter option
      if (this.initialized && this.optionsLoaded) {
        this.$store.commit('home/listFilterChanged', val);
      }
      if (val === null || val === '') {
        this.pageCount(this.rowsData);
        this.showRowsPerPage(this.rowsData);
      }
    },
    /**
     * Set action to do when user add or remove visible columns from the dropdown
     * @param {array} val List of all selected column
     */
    visibleColumns(val) {
      // Update store with new visible column for this report
      // Don't store required (static) columns
      if (this.initialized && this.optionsLoaded) {
        // Get a list of selected visible column without the static one.
        const valWithoutStaticCol = val
          .filter(v => !this.staticVisibleColumnsNames.includes(v))
          .map(v => this.dynamicColumns.find(xx => xx.name === v).visibleColumnId);
        if (this.dynamicVisibleColumnOptions.length === this.visibleColumns.length) {
          this.isAllColumnSelected = true;
          this.isAllColumnUnSelected = false;
        } else if (this.visibleColumns.length === 0) {
          this.isAllColumnSelected = false;
          this.isAllColumnUnSelected = true;
        } else {
          this.isAllColumnSelected = false;
          this.isAllColumnUnSelected = false;
        }
        // Save the list of visibleColumnId to the local storage
        this.$store.commit('home/listReportVisibleColumnChanged', {
          selectedTabName: this.selectedTab,
          newReportVisibleColumns: valWithoutStaticCol,
        });
      }
    },
    selectedReport() {
      // Update store with new list filter option
      if (this.initialized) {
        this.$store.commit('home/lastSelectedReportChanged', this.selectedReportId);
      }
    },
    isMobileView(newValue) {
      if (newValue === true) {
        this.setMaxPagesForMobile();
      } else {
        this.setMaxPagesForLargeScreen();
      }
    },
  },
};
</script>

<style lang="stylus">
.home-container {
  background-color: $body-color;
  margin-top: 3.5rem;
  padding-top: 0.75rem;
  .tab-bar {
    top: 7.4rem;
    position: fixed;
    width: 100%;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    color: $label-color;
    z-index: 99;
    .q-tab {
      text-transform: capitalize;
    }
    .q-tab--active {
      color: $tab-active-color;
    }
  }
  .tab-panels {
    margin-top: 3rem;
  }
  .prepand-icon {
    margin-top: -1.2rem;
    color: $search-icon-color;
  }
  .q-input .q-field__append {
    margin-top: -0.625rem;
    color: $search-icon-color;
  }
  .q-table thead tr th {
    background-color: $table-header-color;
    color: $label-color;
    font-weight: 600;
    font-size: 0.875rem;
  }
  .q-table tbody tr td {
    color: $label-color;
    font-weight: normal;
    font-size: 0.875rem;
  }
  .q-table__middle {
    max-height: calc(100vh - 20rem);
  }
  .row-per-page {
    a {
      cursor: pointer;
      color: $link-color;
      margin-right: 0.625rem;
    }
    .active {
      text-decoration: underline;
    }
    .view-text {
      margin-right: 0.625rem;
      color: $field-hint-color;
    }
  }
  .paginate {
    .q-btn--standard {
      background-color: $label-color;
    }
    .q-btn--flat {
      color: $label-color;
    }
  }
  .sticky-header-column {
    max-width: 100%;
    tr:first-child th {
      position: sticky;
      top: 0;
      opacity: 1;
      z-index: 2;
    }
  }
  .show-rows {
    color: $title-color;
  }
  .left-spacer {
    padding-left: 1rem;
  }
  .right-spacer {
    padding-right: 1rem;
  }
}

.select-all-active {
  color: $primary;
  font-weight: bold;
}

.scroll.relative-position.fit.hide-scrollbar {
  overflow: scroll;
}

.truncate-text {
  .q-field__native span {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@media (max-width $breakpoint-sm-max) {
  .home-container {
    .left-spacer {
      padding-left: 0;
    }
    .right-spacer {
      padding-right: 0;
    }
    .btn-export {
      button {
        width: 100%;
      }
    }
    .scroll::-webkit-scrollbar {
      width: 0.3rem;
      height: 0.25rem;
    }
    .scroll::-webkit-scrollbar-track:horizontal {
      background-color: $field-border-color;
      border-radius: 0.5rem;
    }
    .scroll::-webkit-scrollbar-thumb:horizontal {
      border-radius: 0.5rem;
      background-color: $tab-active-color;
    }
  }
}

// Resolution for 7 inch tablet
@media only screen and (max-width: 600px) {
  .home-container {
    .btn-export {
      button {
        width: 100%;
      }
    }
    .col-50 {
      width: 50%;
    }
    .col-100 {
      width: 100%;
    }
  }
}

@media all and (device-width: 768px) and (device-height: 1024px) and (orientation:portrait) {
  .home-container {
    .btn-export {
      button {
        width: 100%;
      }
    }
    .col-50 {
      width: 50%;
    }
    .col-100 {
      width: 100%;
    }
    .col-33 {
      width: 33%;
    }
    .pagination-top-spacer {
      margin-top: -3rem;
    }
  }
}

@media only screen and (max-width: 1024px) and (orientation: landscape) {
  .home-container {
    .btn-export {
      button {
        width: 100%;
      }
    }
    .col-50 {
      width: 50%;
    }
    .col-100 {
      width: 100%;
    }
    .col-33 {
      width: 33%;
    }
  }
}

// Resolution for iPhone 6 and newer
@media only screen and (max-width: 420px) {
  .home-container {
    .btn-export {
      button {
        width: 100%;
      }
    }
    .col-50 {
      width: 50%;
    }
    .col-100 {
      width: 100%;
    }
    .row-per-page {
      span {
        font-size: 0.8rem;
      }
      a {
        font-size: 0.8rem;
      }
    }
    .show-rows {
      font-size: 0.8rem;
    }
  }
}

// Resolution for iPhone 5
@media only screen and (max-width: 320px) {
  .home-container {
    .btn-export {
      button {
        width: 100%;
      }
    }
    .col-50 {
      width: 50%;
    }
    .col-100 {
      width: 100%;
    }
    .row-per-page {
      span {
        font-size: 0.6rem;
      }
      a {
        font-size: 0.6rem;
      }
    }
    .show-rows {
      font-size: 0.6rem;
    }
  }
}

</style>
