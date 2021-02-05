<template>
  <div class="admin-poultry-curve-create-edit">

    <!-- Curve's name -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-input
          :hide-underline="isStateCompleted"
          :readonly="isStateCompleted"
          v-model.trim="curve.info.name"
          maxlength="32"
          @keydown.enter.native="validateFormAndEmitHandler"
          @input="touchForm"
          :label="$t('admin.poultryCurve.components.createEdit.name')">
          <template v-slot:prepend>
            <q-icon name="class"></q-icon>
          </template>
        </q-input>

        <div v-if="!isStateCompleted
          && $v.curve.info.name.$error && !$v.curve.info.name.required"
          class="error-validation">
          {{ $t("admin.poultryCurve.components.createEdit.nameRequired") }}
        </div>

        <div v-if="$v.curve.info.name.$error &&
          (!$v.curve.info.name.minLength || !$v.curve.info.name.maxLength)"
          class="error-validation">

          {{ $t("admin.poultryCurve.components.nameMinMaxLength",
            {
              min: $v.curve.info.name.$params.minLength.min,
              max: $v.curve.info.name.$params.minLength.max
            })
          }}
        </div>

      </div>
    </div>

    <!-- Curve's description -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-input
          :hide-underline="isStateCompleted"
          :readonly="isStateCompleted"
          v-model.trim="curve.info.description"
          maxlength="512"
          type="textarea"
          @keydown.enter.native="validateFormAndEmitHandler"
          @input="touchForm"
          :label="$t('admin.poultryCurve.components.createEdit.description')">
          <template v-slot:prepend>
            <q-icon name="chrome_reader_mode"></q-icon>
          </template>
        </q-input>

        <div v-if="$v.curve.info.description.$error && !$v.curve.info.description.maxLength"
          class="error-validation">

          {{ $t("admin.poultryCurve.components.descriptionMaxLength",
            { max: $v.curve.info.description.$params.minLength.max })
          }}
        </div>

      </div>
    </div>

    <!-- Author -->
    <div class="row" v-if="isModeEdit && editedCurve">
      <div class="offset-xs-1 col-10">

        <q-input
          :hide-underline="true"
          :readonly="true"
          :value="userGetFullName(editedCurve.info)"
          @input="touchForm"
          :label="$t('admin.poultryCurve.components.createEdit.author')">
          <template v-slot:prepend>
            <q-icon name="face"></q-icon>
          </template>
        </q-input>

      </div>
    </div>

    <!-- State -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-select
          :label="$t('admin.poultryCurve.components.createEdit.state')"
          :options="getStateList"
          v-if="!isStateCompleted"
          :hide-underline="isStateCompleted"
          :readonly="isStateCompleted"
          @change="touchForm"
          v-model="curve.info.state">
            <template v-slot:prepend>
              <q-icon name="done"></q-icon>
            </template>
        </q-select>

        <div v-if="!isStateCompleted &&
          $v.curve.info.state.$error
          && (!$v.curve.info.state.required
          || !$v.curve.info.state.requiredValidValue)"
          class="error-validation">
          {{ $t("admin.poultryCurve.components.createEdit.stateRequired") }}
        </div>

        <q-input
          v-if="isStateCompleted"
          :hide-underline="true"
          :readonly="true"
          :value="getStateName(curve.info.state)"
          :label="$t('admin.poultryCurve.components.createEdit.state')">
          <template v-slot:prepend>
            <q-icon name="face"></q-icon>
          </template>
        </q-input>

      </div>
    </div>

    <!-- Visibility -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-select
          :label="$t('admin.poultryCurve.components.createEdit.visibility')"
          v-if="!isStateCompleted"
          @change="touchForm"
          v-model="curve.info.visibility"
          :options="getVisibilityList"
          :hide-underline="isStateCompleted">
            <template v-slot:prepend>
              <q-icon name="remove_red_eye"></q-icon>
            </template>
        </q-select>

        <div v-if="!isStateCompleted
          && $v.curve.info.visibility.$error
          && (!$v.curve.info.visibility.required
          || !$v.curve.info.visibility.requiredValidValue)"
          class="error-validation">
          {{ $t("admin.poultryCurve.components.createEdit.visibilityRequired") }}
        </div>

        <q-input
          v-if="isStateCompleted"
          :hide-underline="true"
          :readonly="true"
          :value="getVisibilityName(curve.info.visibility)"
          :label="$t('admin.poultryCurve.components.createEdit.visibility')">
          <template v-slot:prepend>
            <q-icon name="remove_red_eye"></q-icon>
          </template>
        </q-input>

      </div>
    </div>

    <!-- Data section -->
    <div class="row q-mt-md">
      <div class="offset-xs-1 col-10">

        <q-field :label="$t('admin.poultryCurve.components.createEdit.data')">
          <template v-slot:prepend>
            <q-icon name="table_chart" />
          </template>

          <div class="self-center full-width no-outline q-py-md" tabindex="0">

            <!-- Tabs control to show table and graph mode -->
            <q-tabs
              v-model="tabsModel"
              dense
              active-color="secondary"
              indicator-color="secondary"
              align="justify"
              @input="tabModelChanged">

              <q-tab
                name="table"
                icon="table_chart"
                :label="$t('admin.poultryCurve.components.createEdit.tabEditor')"></q-tab>
              <q-tab
                name="graphic"
                icon="trending_up"
                :label="$t('admin.poultryCurve.components.createEdit.tabGraphic')"></q-tab>
             </q-tabs>

            <q-tab-panels v-model="tabsModel">

              <!-- Table editor tab -->
              <q-tab-panel name="table">

                <!-- Import and download poultry curve button -->
                <div class="row items-center justify-end q-mt-xs">

                  <q-btn-dropdown
                    v-if="!isStateCompleted"
                    icon="import_export"
                    ref="dataImportButton"
                    color="accent"
                    :label="$t('admin.poultryCurve.components.createEdit.dataButtonImport')"
                    anchor="trop right">
                    <q-list>
                      <q-item clickable v-close-popup
                        @click.native="handleImportCSV()">
                        <q-item-section>
                          <q-item-label> {{
                            $t('admin.poultryCurve.components.createEdit.dataButtonImportFromCSV')
                          }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>

                  <!-- Hidden input file -->
                  <input
                    v-if="!isStateCompleted"
                    ref="dataImportFileInput"
                    type="file"
                    :accept="dataImportInputFileAccept"
                    class="hidden"
                    @change="importDataFile($event)">

                  <!-- Dialog to confirm and give information before importing data -->
                  <q-dialog
                    v-model="dataDialogModel"
                    persistent
                    :content-css="{height: '10rem'}">

                    <q-layout view="lHh lpr lFf" container class="bg-color">

                      <q-header elevated>
                        <q-toolbar class="glossy">
                          <q-toolbar-title>{{ dataDialogConfirmTitle }}</q-toolbar-title>
                        </q-toolbar>
                      </q-header>

                      <q-page-container class="page-box-container-bg">
                        <q-page class="q-pa-md">
                          <span v-html="dataDialogConfirmMessage"></span>
                          <p></p>
                          <span v-html="dataImportCSVDialogContentFileFormat"></span>
                          <br>
<pre>0,40,40,0,0
1,55,50,5,3
140,3035,1960,111,86</pre>
                        </q-page>
                      </q-page-container>

                      <q-footer>
                        <q-toolbar class="glossy">
                          <div class="row q-gutter-xs full-width justify-end">
                            <q-btn
                              color="primary"
                              :label="dataDialogConfirmButtonYes"
                              @click="onDataConfirmOk" />
                            <q-btn
                              color="secondary"
                              :label="dataDialogConfirmButtonCancel"
                              v-close-popup />
                          </div>
                        </q-toolbar>
                      </q-footer>

                    </q-layout>
                  </q-dialog>

                </div>

                <!-- Table of data -->
                <table ref="curveDataTable" id="curveDataTable"
                  class="q-table q-table-horizontal-separator">
                  <thead>
                    <tr>
                      <th :style="getDataColumnStyle('edit')" v-if="getDataColumnVisible('edit')">
                      </th>
                      <th :style="getDataColumnStyle('day')"></th>
                      <th colspan="2" class="text-center"
                        :style="getDataColumnStyle('subHeader')">
                        {{ $t('admin.poultryCurve.components.createEdit.dataHeaderWeight') }}
                        ({{ userUnitSymbol }})
                      </th>
                      <th colspan="2" class="text-center"
                        :style="getDataColumnStyle('subHeader')">
                        {{ $t('admin.poultryCurve.components.createEdit.dataHeaderFeedUsage') }}
                        ({{ userUnitSymbol }})
                      </th>
                    </tr>
                    <tr>
                      <th :style="getDataColumnStyle('edit')" v-if="getDataColumnVisible('edit')">
                      </th>
                      <th v-for="col in curveDataColumns"
                        :key="col.name"
                        :style="getDataColumnStyle(col.name)"
                        :class="getDataColumnAlignClass(col.name)">
                        {{col.label}}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in curveDataRows"
                      v-bind:key="row.day"
                      :id="`rowData_${row.day}`">
                      <td :style="getDataColumnStyle('edit')" v-if="getDataColumnVisible('edit')">
                        <q-btn
                          color="primary"
                          class="block primary-gradient"
                          icon="far fa-trash-alt"
                          size="sm"
                          @click="deleteDataRow(idx)">
                        </q-btn>
                      </td>
                      <td v-for="col in curveDataColumns"
                        :key="col.name"
                        :style="getDataColumnStyle(col.name)"
                        :class="getDataColumnAlignClass(col.name)">
                        {{ row[col.name] }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot v-if="!isStateCompleted">
                    <tr>
                      <td :style="getDataColumnStyle('edit')">
                        <q-btn
                          color="primary"
                          class="block primary-gradient"
                          icon="add"
                          size="sm"
                          @click="validateFormAndAddNewDataRow" />
                      </td>
                      <td :style="getDataColumnStyle('day')">
                        <i-mask-input
                          ref="dataTableAddDayInput"
                          v-model="curveDataNewRow.day"
                          @keydown.enter.native="validateFormAndAddNewDataRow"
                          @input="touchDataForm"
                          :mask="Number"
                          :min="0"
                          :max="maxDataProductionDayCount - 1"
                          :scale="0">
                        </i-mask-input>

                        <div v-if="$v.curveDataNewRow.day.$error
                          && !$v.curveDataNewRow.day.required"
                          class="error-validation">
                          {{ $t("admin.poultryCurve.components.createEdit.dataDayRequired") }}
                        </div>
                        <div v-if="$v.curveDataNewRow.day.$error
                          && !$v.curveDataNewRow.day.integer"
                          class="error-validation">
                          {{ $t("admin.poultryCurve.components.createEdit.dataDayInteger") }}
                        </div>
                        <div v-if="$v.curveDataNewRow.day.$error
                          && (!$v.curveDataNewRow.day.minValue
                          || !$v.curveDataNewRow.day.maxValue)"
                          class="error-validation">
                          {{ $t("admin.poultryCurve.components.createEdit.dataDayIntegerBetween",
                            {
                              min: $v.curveDataNewRow.day.$params.minValue.min,
                              max: $v.curveDataNewRow.day.$params.maxValue.max
                            })
                          }}
                        </div>
                        <div v-if="$v.curveDataNewRow.day.$error
                          && !$v.curveDataNewRow.day.isDayUnique"
                          class="error-validation">
                          {{ $t("admin.poultryCurve.components.createEdit.dataDayIsNotUnique") }}
                        </div>

                      </td>
                      <td :style="getDataColumnStyle('maleBodyWeight')">
                        <i-mask-input
                          v-model="curveDataNewRow.maleBodyWeight"
                          @keydown.enter.native="validateFormAndAddNewDataRow"
                          @input="touchDataForm"
                          :mask="Number"
                          :signed="false"
                          :scale="poultryWeightValuePrecision"
                          align="center">
                        </i-mask-input>

                        <div v-if="$v.curveDataNewRow.maleBodyWeight.$error
                          && !$v.curveDataNewRow.maleBodyWeight.required"
                          class="error-validation">
                          {{ $t("admin.poultryCurve.components.createEdit.dataWeightRequired") }}
                        </div>
                        <div v-if="$v.curveDataNewRow.maleBodyWeight.$error
                          && !$v.curveDataNewRow.maleBodyWeight.decimal"
                          class="error-validation">
                          {{ $t("admin.poultryCurve.components.createEdit.dataDecimal") }}
                        </div>

                      </td>
                      <td :style="getDataColumnStyle('femaleBodyWeight')">
                        <i-mask-input
                          v-model="curveDataNewRow.femaleBodyWeight"
                          @keydown.enter.native="validateFormAndAddNewDataRow"
                          @input="touchDataForm"
                          :mask="Number"
                          :signed="false"
                          :scale="poultryWeightValuePrecision"
                          align="center">
                        </i-mask-input>

                        <div v-if="$v.curveDataNewRow.femaleBodyWeight.$error
                          && !$v.curveDataNewRow.femaleBodyWeight.required"
                          class="error-validation">
                          {{ $t("admin.poultryCurve.components.createEdit.dataWeightRequired") }}
                        </div>
                        <div v-if="$v.curveDataNewRow.femaleBodyWeight.$error
                          && !$v.curveDataNewRow.femaleBodyWeight.decimal"
                          class="error-validation">
                          {{ $t("admin.poultryCurve.components.createEdit.dataDecimal") }}
                        </div>

                      </td>
                      <td :style="getDataColumnStyle('maleFeedConsumption')">
                        <i-mask-input
                          v-model="curveDataNewRow.maleFeedConsumption"
                          @keydown.enter.native="validateFormAndAddNewDataRow"
                          @input="touchDataForm"
                          :mask="Number"
                          :signed="false"
                          :scale="poultryWeightValuePrecision"
                          align="center">
                        </i-mask-input>

                        <div v-if="$v.curveDataNewRow.maleFeedConsumption.$error
                          && !$v.curveDataNewRow.maleFeedConsumption.required"
                          class="error-validation"> {{
                            $t("admin.poultryCurve.components.createEdit.dataConsumptionRequired")
                          }}
                        </div>
                        <div v-if="$v.curveDataNewRow.maleFeedConsumption.$error
                          && !$v.curveDataNewRow.maleFeedConsumption.decimal"
                          class="error-validation">
                          {{ $t("admin.poultryCurve.components.createEdit.dataDecimal") }}
                        </div>

                      </td>
                      <td :style="getDataColumnStyle('femaleFeedConsumption')">
                        <i-mask-input
                          v-model="curveDataNewRow.femaleFeedConsumption"
                          @keydown.enter.native="validateFormAndAddNewDataRow"
                          @input="touchDataForm"
                          :mask="Number"
                          :signed="false"
                          :scale="poultryWeightValuePrecision"
                          align="center">
                        </i-mask-input>

                        <div v-if="$v.curveDataNewRow.femaleFeedConsumption.$error
                          && !$v.curveDataNewRow.femaleFeedConsumption.required"
                          class="error-validation"> {{
                            $t("admin.poultryCurve.components.createEdit.dataConsumptionRequired")
                          }}
                        </div>
                        <div v-if="$v.curveDataNewRow.femaleFeedConsumption.$error
                          && !$v.curveDataNewRow.femaleFeedConsumption.decimal"
                          class="error-validation">
                          {{ $t("admin.poultryCurve.components.createEdit.dataDecimal") }}
                        </div>

                      </td>
                    </tr>
                  </tfoot>
                </table>

              </q-tab-panel>

              <!-- Graphic viewing tab -->
              <q-tab-panel name="graphic">
                <div ref="graphDiv" class="full-width q-mt-xs"></div>
                <div ref="graphStatus" class="full-width q-pt-xs graphLegend"></div>
              </q-tab-panel>

            </q-tab-panels>

          </div>

        </q-field>

      </div>
    </div>

  </div>
</template>

<script>
import Dygraph from 'dygraphs';
import _ from 'lodash';
import {
  required,
  minLength,
  maxLength,
  minValue,
  maxValue,
  integer,
  decimal,
} from 'vuelidate/lib/validators';
import UtilUser from 'src/common/utils/user';
import UtilUnit from 'src/common/utils/unit';
import IMaskInput from 'src/common/components/IMaskInput';

// Available modes of this components
const availableMode = {
  create: 'create',
  clone: 'clone',
  edit: 'edit',
};

// Indicate the maximum number of the poultry cruve data production day
const maxDataProductionDayCount = 250;

export default {
  name: 'admin-poultry-curve-create-edit',
  components: {
    IMaskInput,
  },
  props: {
    // Indicate the component mode (create, clone or edit)
    mode: {
      required: true,
      type: String,
      validator: value => Object.keys(availableMode).find(x => value === availableMode[x]),
      default: () => 'create',
    },
    // When editing or cloning, this should contains the information on the edited curve
    editedCurve: {
      type: Object,
    },
    // A list of poultry curve visibility information
    visibilityList: {
      type: Array,
      required: true,
    },
    // A list of poultry curve state information
    stateList: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      // Convert value from system unit to user unit and vice versa
      poultryWeightUnitContextConverter: null,
      // Edit mode of this component
      availableMode,
      // Hold information of the curve being created or edited
      curve: {
        info: {
          id: null,
          name: null,
          description: null,
          author: null,
          state: null,
          visibility: null,
        },
        data: [],
      },
      // Hold the current tab selected (graphic or table)
      tabsModel: 'table',
      // Pagination of the data table
      curveTableDataPagination: { sortBy: 'day', rowsPerPage: 0 },
      // Data of the curve being edited
      curveDataRows: [],
      // Column of the data table
      curveDataColumns: [
        {
          name: 'day',
          required: true,
          label: this.$t('admin.poultryCurve.components.createEdit.dataColumnDay'),
          align: 'left',
          field: 'day',
          sortable: false,
        },
        {
          name: 'maleBodyWeight',
          required: true,
          label: this.$t('admin.poultryCurve.components.createEdit.dataColumnMale'),
          align: 'center',
          field: 'maleBodyWeight',
          sortable: false,
        },
        {
          name: 'femaleBodyWeight',
          required: true,
          label: this.$t('admin.poultryCurve.components.createEdit.dataColumnFemale'),
          align: 'center',
          field: 'femaleBodyWeight',
          sortable: false,
        },
        {
          name: 'maleFeedConsumption',
          required: true,
          label: this.$t('admin.poultryCurve.components.createEdit.dataColumnMale'),
          align: 'center',
          field: 'maleFeedConsumption',
          sortable: false,
        },
        {
          name: 'femaleFeedConsumption',
          required: true,
          label: this.$t('admin.poultryCurve.components.createEdit.dataColumnFemale'),
          align: 'center',
          field: 'femaleFeedConsumption',
          sortable: false,
        },
      ],
      // Hold the information of a new data row
      curveDataNewRow: {
        day: null,
        maleBodyWeight: null,
        femaleBodyWeight: null,
        maleFeedConsumption: null,
        femaleFeedConsumption: null,
      },
      // Dygraph object
      dygraph: null,
      // Show or hide data dialog confirm message
      dataDialogModel: false,
      // Hold the type of file to import curve
      dataImportFileType: '',
      // Title of the data dialog confirm message
      dataDialogConfirmTitle: '',
      // Message of the data dialog confirm message
      dataDialogConfirmMessage: '',
      // Message (file format) of the data dialog confirm message
      dataImportCSVDialogContentFileFormat: '',
      // Yes button text of the data dialog confirm message
      dataDialogConfirmButtonYes: '',
      // Cancel button text of the data dialog confirm message
      dataDialogConfirmButtonCancel: '',
      // Hold the extention file or mime type for the input file type
      dataImportInputFileAccept: '',
    };
  },
  // Get forms validations
  validations() {
    return {
      curve: {
        info: {
          name: {
            required,
            minLength: minLength(1),
            maxLength: maxLength(32),
          },
          description: {
            maxLength: maxLength(512),
          },
          state: {
            required,
            // Make sure a valid option is selected in the list
            requiredValidValue(o) {
              return _.isEmpty(o) === false && typeof o.value === 'number';
            },
          },
          visibility: {
            required,
            // Make sure a valid option is selected in the list
            requiredValidValue(o) {
              return _.isEmpty(o) === false && typeof o.value === 'number';
            },
          },
        },
      },
      curveDataNewRow: {
        day: {
          required,
          integer,
          minValue: minValue(0),
          maxValue: maxValue(maxDataProductionDayCount - 1),
          isDayUnique(value) {
            return this.curveDataRows.find(x => x.day === value) === undefined;
          },
        },
        maleBodyWeight: {
          required,
          decimal,
        },
        femaleBodyWeight: {
          required,
          decimal,
        },
        maleFeedConsumption: {
          required,
          decimal,
        },
        femaleFeedConsumption: {
          required,
          decimal,
        },
      },
    };
  },
  computed: {
    maxDataProductionDayCount() {
      return maxDataProductionDayCount;
    },
    poultryWeightValuePrecision() {
      const precision = this.poultryWeightUnitContextConverter.getUserUnitPrecision();
      return precision;
    },
    // Get symbol of the user preferred unit
    userUnitSymbol() {
      if (typeof this.poultryWeightUnitContextConverter === 'undefined') {
        return '';
      }
      return this.poultryWeightUnitContextConverter.getUserUnit().symbol;
    },
    isModeCreate() {
      // Return true if this component is in `create` curve mode
      return this.mode === this.availableMode.create;
    },
    isModeClone() {
      // Return true if this component is in `clone` curve mode
      return this.mode === this.availableMode.clone;
    },
    isModeEdit() {
      // Return true if this component is in `edit` curve mode
      return this.mode === this.availableMode.edit;
    },
    getStateList() {
      // Get an array of poultry curve's state name/value.
      const result = _(this.stateList)
        .sortBy(['locale_name'])
        .map(t => ({
          value: t.id,
          label: t.locale_name,
        }))
        .value();
      const emptyElement = { value: null, label: '' };
      result.unshift(emptyElement);
      return result;
    },
    getVisibilityList() {
      // Get an array of poultry curve's visibility name/value.
      const result = _(this.visibilityList)
        .sortBy(['locale_name'])
        .map(t => ({
          value: t.id,
          label: t.locale_name,
        }))
        .value();
      const emptyElement = { value: null, label: '' };
      result.unshift(emptyElement);
      return result;
    },
    getStateCompleted() {
      // Get the poultry curve `completed` state
      if (!Array.isArray(this.stateList)) {
        return undefined;
      }
      return this.stateList.find(x => x.name.toLowerCase() === 'completed');
    },
    getStateInCompleted() {
      // Get the the poultry curve `incomplete` state
      if (!Array.isArray(this.stateList)) {
        return undefined;
      }
      return this.stateList.find(x => x.name.toLowerCase() === 'incomplete');
    },
    isStateCompleted() {
      // Return true if the curve being edited has the `completed` state
      if (this.isModeClone || this.isModeCreate) {
        // In clone or create mode, a curve is always incomplete
        return false;
      } if (this.isModeEdit) {
        // Look at the original curve it is has the completed state
        return this.editedCurve.info.state_id === this.getStateCompleted.id;
      }
      // Unknown mode
      return false;
    },
  },
  created() {
    // Create a unit converter for unit context `Poultry Weight`
    this.poultryWeightUnitContextConverter = UtilUnit
      .getUnitConverterFromUnitContextName('Poultry Weight');

    // Once the page is created, load data to edit (if required)
    if (this.isModeEdit || this.isModeClone) {
      this.$loadEditData();
    }
  },
  beforeDestroy() {
    // Before destroying this component, destroy the dygraph object
    this.destroyGraphObject();
  },
  methods: {
    destroyGraphObject() {
      // Destroy dygraph object
      if (this.dygraph) {
        this.dygraph.destroy();
        this.dygraph = null;
      }
    },
    interpolateGraphPoints(arr, day) {
      // Fill missing entry between two min/max points of the graph

      // Do interpolation between two production day data
      // using a dynamic struct member name
      const interpolateDay = (d, p1, p2, prop) => {
        const upperX = p1.day;
        const upperY = p1[prop];
        const lowerX = p2.day;
        const lowerY = p2[prop];

        const deltaY = upperY - lowerY;
        const deltaX = upperX - lowerX;

        return lowerY + (((d - lowerX) / deltaX) * deltaY);
      };

      // Returns the index pointing to the first element that is not less than value, or
      // last if no such element is found.
      const arrayLowerBound = (d) => {
        let count = arr.length;
        let first = 0;
        let it = 0;
        let step = 0;
        while (count > 0) {
          it = first;
          step = Math.floor(count / 2);
          it += step;
          if (arr[it].day < d) {
            it += 1;
            first = it;
            count -= step + 1;
          } else {
            count = step;
          }
        }
        return first;
      };

      // Find the first table entry whose value is >= caller's x value
      const lowerBoundIdx = arrayLowerBound(day);
      const result = {
        day,
        maleBodyWeight: 0,
        femaleBodyWeight: 0,
        maleFeedConsumption: 0,
        femaleFeedConsumption: 0,
      };

      // If the caller's X value is greater than the largest
      // X value in the table, we can't interpolate.
      if (lowerBoundIdx === arr.length) {
        result.day = day;
        result.maleBodyWeight = 0;
        result.femaleBodyWeight = 0;
        result.maleFeedConsumption = 0;
        result.femaleFeedConsumption = 0;

        return result;
      }

      // If the caller's X value is less than the smallest X value in the table,
      // we can't interpolate.
      if (lowerBoundIdx === 0) {
        const first = arr[0];
        if (day <= first.day) {
          result.day = day;

          result.maleBodyWeight = first.maleBodyWeight;
          result.femaleBodyWeight = first.femaleBodyWeight;
          result.maleFeedConsumption = first.maleFeedConsumption;
          result.femaleFeedConsumption = first.femaleFeedConsumption;

          return result;
        }
      }

      // We can interpolate
      const begin = arr[lowerBoundIdx];
      const end = arr[lowerBoundIdx - 1];
      result.day = day;
      result.maleBodyWeight = interpolateDay(day, begin, end, 'maleBodyWeight');
      result.femaleBodyWeight = interpolateDay(day, begin, end, 'femaleBodyWeight');
      result.maleFeedConsumption = interpolateDay(day, begin, end, 'maleFeedConsumption');
      result.femaleFeedConsumption = interpolateDay(day, begin, end, 'femaleFeedConsumption');

      // Value retrieved successfully
      return result;
    },
    createGraphObject() {
      // Create dygraph object from the curve's data
      // Destroy the graph first
      this.destroyGraphObject();

      // Ensure data is sorted by day
      const pointRowsInString = this.sortCurveDataRowsByDay();

      // Convert rows of point value from string to number
      const pointRowsInNumber = pointRowsInString
        .slice(0)
        .map(pointRow => ({
          day: Number.parseInt(pointRow.day, 10),
          maleBodyWeight: Number.parseFloat(pointRow.maleBodyWeight),
          femaleBodyWeight: Number.parseFloat(pointRow.femaleBodyWeight),
          maleFeedConsumption: Number.parseFloat(pointRow.maleFeedConsumption),
          femaleFeedConsumption: Number.parseFloat(pointRow.femaleFeedConsumption),
        }));

      // Interpolate (fill missing entry between first day and last day)
      const pointRowsInterpolated = [];
      if (pointRowsInNumber.length > 0) {
        const maxDay = pointRowsInNumber[pointRowsInNumber.length - 1].day;
        for (let d = 0; d <= maxDay; d += 1) {
          const pointInterpolated = this.interpolateGraphPoints(pointRowsInNumber, d);
          pointRowsInterpolated.push(pointInterpolated);
        }
      }

      // Convert to dygraph curve array representation
      const graphicData = pointRowsInterpolated.reduce((rowsAccumulator, pointRow) => {
        const pointsRowInString = [];
        pointsRowInString.push(Number.parseInt(pointRow.day, 10));
        pointsRowInString.push(Number.parseFloat(pointRow.maleBodyWeight));
        pointsRowInString.push(Number.parseFloat(pointRow.femaleBodyWeight));
        pointsRowInString.push(Number.parseFloat(pointRow.maleFeedConsumption));
        pointsRowInString.push(Number.parseFloat(pointRow.femaleFeedConsumption));
        rowsAccumulator.push(pointsRowInString);
        return rowsAccumulator;
      }, []);

      // Create graph
      const that = this;
      this.dygraph = new Dygraph(
        this.$refs.graphDiv,
        graphicData,
        {
          labels: [
            this.$t('admin.poultryCurve.components.createEdit.dataColumnDay'),
            `${this.$t('admin.poultryCurve.components.createEdit.dataColumnMale')} ${this.$t('admin.poultryCurve.components.createEdit.dataHeaderWeight')}`,
            `${this.$t('admin.poultryCurve.components.createEdit.dataColumnFemale')} ${this.$t('admin.poultryCurve.components.createEdit.dataHeaderWeight')}`,
            `${this.$t('admin.poultryCurve.components.createEdit.dataColumnMale')} ${this.$t('admin.poultryCurve.components.createEdit.dataHeaderFeedUsage')}`,
            `${this.$t('admin.poultryCurve.components.createEdit.dataColumnFemale')} ${this.$t('admin.poultryCurve.components.createEdit.dataHeaderFeedUsage')}`,
          ],
          fillGraph: false,
          labelsSeparateLines: true,
          ylabel: `${this.$t('admin.poultryCurve.components.createEdit.dataGraphWeight')} (${that.userUnitSymbol})`,
          xlabel: this.$t('admin.poultryCurve.components.createEdit.dataColumnDay'),
          xRangePad: 1,
          labelsDiv: this.$refs.graphStatus,
          legend: 'always',
          legendFormatter(data) {
            if (data.x == null) {
              // This happens when there's no selection and {legend: 'always'} is set.
              return `<br> ${data.series
                .map(series => `${series.dashHTML} ${series.labelHTML} ${that.userUnitSymbol}`)
                .join('<br>')}`;
            }

            let html = `${this.getLabels()[0]}: ${data.xHTML}`;
            data.series.forEach((series) => {
              if (!series.isVisible) {
                return;
              }

              const dataToNumber = Number.parseFloat(series.yHTML);
              const dataDecimalFormatted = dataToNumber.toFixed(that.poultryWeightValuePrecision);

              let labeledData = `${series.labelHTML}: ${dataDecimalFormatted}`;
              if (series.isHighlighted) {
                labeledData = `<b>${labeledData}</b>`;
              }
              html += `<br>${series.dashHTML} ${labeledData} ${that.userUnitSymbol}`;
            });
            return html;
          },
          axes: {
            y: {
              valueFormatter: (yAxisValue) => {
                const valueRoundedToUnitPrecesion = UtilUnit.roundAndFormatValue(
                  yAxisValue,
                  this.poultryWeightUnitContextConverter.getUserUnitPrecision(),
                  10,
                );
                const userUnitSymbol = this.poultryWeightUnitContextConverter.getUserUnit().symbol;
                return `${valueRoundedToUnitPrecesion} ${userUnitSymbol}}`;
              },
              axisLabelFormatter: (yAxisValue) => {
                const valueRoundedToUnitPrecesion = UtilUnit.roundAndFormatValue(
                  yAxisValue,
                  this.poultryWeightUnitContextConverter.getUserUnitPrecision(),
                  10,
                );
                return valueRoundedToUnitPrecesion.toString();
              },
            },
          },
        },
      );
    },
    tabModelChanged(value) {
      // Event triggered when qtabs component needs to change the model
      if (value === 'graphic') {
        // Refresh poultry curve data graphic
        this.$nextTick(() => {
          this.createGraphObject();
        });
      }
    },
    getDataColumnAlignClass(colName) {
      // Find a column by its name and returns its aligment
      const c = this.curveDataColumns.find(x => x.name === colName);
      if (typeof c !== 'undefined') {
        return `text-${c.align}`;
      }
      return 'text-center';
    },
    getDataColumnVisible(colName) {
      // Find a column by its name and returns if it should be visble or not
      if (this.isStateCompleted) {
        if (colName === 'edit') {
          return false;
        }
      }
      return true;
    },
    getDataColumnStyle(colName) {
      // Find a column by its name and returns its style
      if (colName === 'subHeader') {
        return this.isStateCompleted ? { width: '41%' } : { width: '36%' };
      } if (colName === 'edit') {
        return this.isStateCompleted ? { } : { width: '10%' };
      } if (colName === 'day') {
        return { width: '18%' };
      }
      return { width: '18%' };
    },
    getStateName(state) {
      // Get the name of a poultry curve state from an ID
      if (!Array.isArray(this.stateList)) {
        return undefined;
      }
      const r = this.stateList.find(x => x.id === state.value);
      return r ? r.locale_name : undefined;
    },
    getVisibilityName(visibility) {
      // Get the name of a poultry curve visibility from an ID
      if (!Array.isArray(this.visibilityList)) {
        return undefined;
      }
      const r = this.visibilityList.find(x => x.id === visibility.value);
      return r ? r.locale_name : undefined;
    },
    userGetFullName(userRow) {
      // Get a the full name of a user.
      return UtilUser.databaseUserToFullName(userRow);
    },
    $loadEditData() {
      // Ensure edited curve has been loadedw
      if ((this.isModeEdit || this.isModeClone) && !this.editedCurve) {
        this.$emit('invalid-parameters');
        return;
      }

      // Takes curve's information
      const curveToEdit = this.editedCurve;
      this.curve.info.id = curveToEdit.info.id;
      this.curve.info.name = curveToEdit.info.name;
      this.curve.info.description = curveToEdit.info.desc;
      if (this.isModeClone) {
        // When cloning, leave the state to incomplete
        this.curve.info.state = this.getStateInCompleted;
      } else {
        this.curve.info.state = this.getStateList
          .find(x => x.value === curveToEdit.info.state_id);
      }
      this.curve.info.visibility = this.getVisibilityList
        .find(x => x.value === curveToEdit.info.visibility_id);
      this.curve.info.author = curveToEdit.info.user_id_author;
      this.curveDataRows = this.convertDataUnitsToUser();
    },
    // Handle poultry curve data import (from csv)
    handleImportCSV() {
      // Open the data import confirmation dialog
      this.dataDialogModel = true;
      this.dataImportFileType = 'csv';
      this.dataDialogConfirmTitle = this.$t('admin.poultryCurve.components.createEdit.dataImportCSVDialogTitle');
      this.dataDialogConfirmMessage = this.$t('admin.poultryCurve.components.createEdit.dataImportCSVDialogContent', {
        unit: this.userUnitSymbol,
      });
      this.dataImportCSVDialogContentFileFormat = this.$t('admin.poultryCurve.components.createEdit.dataImportCSVDialogContentFileFormat');
      this.dataDialogConfirmButtonYes = this.$t('admin.poultryCurve.components.createEdit.dataImportCSVDialogYesButtuon');
      this.dataDialogConfirmButtonCancel = this.$t('admin.poultryCurve.components.createEdit.dataImportCSVDialogCancelButtuon');
      this.dataImportInputFileAccept = '.csv';
    },
    onDataConfirmOk() {
      // Hide data import confirmation dialog
      this.dataDialogModel = false;
      // Remove the file to prevent the change event to be skipped while choosing the same file
      this.$refs.dataImportFileInput.value = '';
      // User confirm that he accept to import a file
      // Open the file open dialog to let the user choose a csv file
      this.$refs.dataImportFileInput.click();
    },
    importDataFile(e) {
      // We are ready to import a file
      if (this.dataImportFileType === 'csv') {
        this.importDataFileCSV(e.target.files[0]);
      }
    },
    importDataFileCSV(data) {
      // We are ready to import a CSV file
      const reader = new FileReader();
      reader.onerror = (evt) => {
        // Error while reading the file
        this.$q.notify({
          color: 'negative',
          message: evt.target.error.message || evt.target.error.name || evt.target.error,
          icon: 'report_problem',
        });
      };
      reader.onload = (evt) => {
        // File successfully read
        // Parse CSV and inject result to the curve data table
        // File format
        //    Day, MALE_WEIGHT, FEMALE_WEIGHT, MALE_CONSUMPTION, FEMALE_CONSUMPTION
        //    0, 40,40, 0, 0
        //    ....
        const cellTerminator = ',';
        const csvFile = evt.target.result;
        const allTextLines = csvFile.split(/\r\n|\n/);
        const newData = [];
        for (let i = 0; i < allTextLines.length; i += 1) {
          let oneLine = allTextLines[i];
          // Tolerate " character on first and last position
          if (oneLine.startsWith('"')) oneLine = oneLine.substring(1);
          if (oneLine.endsWith('"')) oneLine = oneLine.slice(0, -1);
          // Extract all lines
          const values = oneLine.split(cellTerminator);
          // 5 columns required
          if (values.length === 5) {
            // Extract all column
            const day = Number.parseInt(values[0], 10);
            let maleBodyWeight = Number.parseFloat(values[1], 10);
            let femaleBodyWeight = Number.parseFloat(values[2], 10);
            let maleFeedConsumption = Number.parseFloat(values[3], 10);
            let femaleFeedConsumption = Number.parseFloat(values[4], 10);
            if (!Number.isNaN(day)
              && day < maxDataProductionDayCount
              && !Number.isNaN(maleBodyWeight)
              && !Number.isNaN(femaleBodyWeight)
              && !Number.isNaN(maleFeedConsumption)
              && !Number.isNaN(femaleFeedConsumption)) {
              // Make sure poultry weight value is rounded to the user unit's decimal preference
              maleBodyWeight = maleBodyWeight
                .toFixed(this.poultryWeightValuePrecision);
              femaleBodyWeight = femaleBodyWeight
                .toFixed(this.poultryWeightValuePrecision);
              maleFeedConsumption = maleFeedConsumption
                .toFixed(this.poultryWeightValuePrecision);
              femaleFeedConsumption = femaleFeedConsumption
                .toFixed(this.poultryWeightValuePrecision);
              // Valid data
              newData.push({
                day,
                maleBodyWeight,
                femaleBodyWeight,
                maleFeedConsumption,
                femaleFeedConsumption,
              });
            }
          }
        }

        // Ensure the array is sorted and remove any duplicate values
        // Silentely remove the duplicates
        const finalData = _(newData)
          .uniqBy('day')
          .sort((a, b) => a.day - b.day)
          .value();

        // Notify result
        const hasError = (finalData.length === 0);
        this.$q.notify({
          timeout: (hasError === true) ? 0 : this.$alertTimeoutMs,
          color: (hasError === true) ? 'negative' : 'positive',
          message: hasError
            ? this.$t('admin.poultryCurve.components.createEdit.dataImportCSVNotifyError', {
              fileName: data.fileName,
            })
            : this.$t('admin.poultryCurve.components.createEdit.dataImportCSVNotifyOK', {
              lineCount: finalData.length,
            }),
          icon: hasError ? 'report_problem' : 'thumb_up',
        });

        // Import data
        if (!hasError) {
          this.curveDataRows = finalData;
        }
      };
      // Start reading the file
      reader.readAsText(data);
    },
    // Add a new row to the curve's data table
    addDataRow() {
      Object.keys(this.curveDataNewRow).forEach((key) => {
        this.curveDataNewRow[key] = this.curveDataNewRow[key];
      });
      // Do not take reference on the object, clone it
      this.curveDataRows.push({ ...this.curveDataNewRow });
      // Keep the curve's data sorted by day
      this.sortCurveDataRowsByDay();
    },
    sortCurveDataRowsByDay() {
      return this.curveDataRows
        .sort((a, b) => Number.parseInt(a.day, 10) - Number.parseInt(b.day, 10));
    },
    // Delete an entry from the data table
    deleteDataRow(rowIndex) {
      this.curveDataRows.splice(rowIndex, 1);
    },
    convertDataUnitsToUser() {
      // Convert poultry curve data units from system to user unit
      if (this.isModeCreate || !Array.isArray(this.curve.data)) {
        return [];
      }
      return this.editedCurve.data.map(x => ({
        // Build a new object with user unit and proper name casing
        day: x.day.toString(),
        maleBodyWeight: this.poultryWeightUnitContextConverter
          .formatValueToUser(Number.parseFloat(x.male_body_weight)),
        femaleBodyWeight: this.poultryWeightUnitContextConverter
          .formatValueToUser(Number.parseFloat(x.female_body_weight)),
        maleFeedConsumption: this.poultryWeightUnitContextConverter
          .formatValueToUser(Number.parseFloat(x.male_feed_consumption)),
        femaleFeedConsumption: this.poultryWeightUnitContextConverter
          .formatValueToUser(Number.parseFloat(x.female_feed_consumption)),
      }));
    },
    convertDataUnitsToSystem() {
      // Convert poultry curve data units from user to system unit
      return this.curveDataRows.map(x => ({
        // Build a new object with datatabase unit and proper name casing
        day: Number.parseInt(x.day, 10),
        male_body_weight: this.poultryWeightUnitContextConverter
          .convertValueToSystem(Number.parseFloat(x.maleBodyWeight)),
        female_body_weight: this.poultryWeightUnitContextConverter
          .convertValueToSystem(Number.parseFloat(x.femaleBodyWeight)),
        male_feed_consumption: this.poultryWeightUnitContextConverter
          .convertValueToSystem(Number.parseFloat(x.maleFeedConsumption)),
        female_feed_consumption: this.poultryWeightUnitContextConverter
          .convertValueToSystem(Number.parseFloat(x.femaleFeedConsumption)),
      }));
    },
    // Build the edited object before submiting the result
    $buildSubmitResult() {
      const result = {
        curveInfo: {},
        curveData: this.convertDataUnitsToSystem(),
      };
      if (!this.isModeCreate) {
        // Only set those properties when editing a curve
        result.curveInfo.id = this.editedCurve.info.id;
        result.curveInfo.updated_at = this.editedCurve.info.updated_at;
      }
      result.curveInfo.name = this.curve.info.name;
      result.curveInfo.desc = this.curve.info.description;
      result.curveInfo.state_id = this.curve.info.state.value;
      result.curveInfo.visibility_id = this.curve.info.visibility.value;
      return result;
    },
    // Validate form
    touchForm() {
      this.$v.curve.info.$touch();
    },
    // Validate form and emit a submit signal
    validateFormAndEmitHandler(ev) {
      // Do not validate and submit the form when the key <ENTER> is pressed into
      // on a textarea element as it prevent adding carriage return
      if (typeof ev === 'object'
        && typeof ev.target === 'object'
        && typeof ev.target.nodeName === 'string'
        && ev.target.nodeName.toLowerCase() === 'textarea') {
        return;
      }

      // Validate the form
      this.touchForm();
      if (!this.$v.curve.info.$error) {
        // Build submit result and notify parent
        this.$emit('submit', this.$buildSubmitResult());
      }
    },
    // Validate data form
    touchDataForm() {
      this.$v.curveDataNewRow.$touch();
    },
    scrollCurveDataTableToLastRow() {
      this.$refs.curveDataTable
        .querySelector('tbody tr:last-child')
        .scrollIntoView();
    },
    validateFormAndAddNewDataRow() {
      // Validate form
      this.touchDataForm();
      // Find the index of the day to add to the poultry curve.
      const dayIndex = this.curveDataRows.findIndex(
        data => typeof this.curveDataNewRow !== 'undefined'
          && data.day === Number.parseInt(this.curveDataNewRow.day, 10),
      );
      // Check if the curveDataNewRow is valid and if the day is unique
      if (this.$v.curveDataNewRow.$error === false && dayIndex < 0) {
        // Add new row
        this.addDataRow();
        // Set focus back to the first input box
        this.$refs.dataTableAddDayInput.$el.focus();
        this.scrollCurveDataTableToLastRow();
        // Clear all input box
        this.curveDataNewRow.day = null;
        this.curveDataNewRow.maleBodyWeight = null;
        this.curveDataNewRow.femaleBodyWeight = null;
        this.curveDataNewRow.maleFeedConsumption = null;
        this.curveDataNewRow.femaleFeedConsumption = null;
        // Reset the validation of the form but delay it a bit because the `curveDataNewRow`
        // model has just been modified and this will modify the content of the text boxes
        // which will trigger the validation again.
        this.$nextTick(() => {
          this.$v.curveDataNewRow.$reset();
        });
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.bg-color {
  background-color: $page-container-background
}

.admin-poultry-curve-create-edit {

  .dataTableDeleteButton {
    padding: 0px;
  }

  .graphLegend {
    font-size:0.9em;
    color: $dark;
  }

  // The 3 next following styles allow scrolling vertically on the body of the data table.
  .q-table thead, tfoot, tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }

  .q-table thead, theader th {
    text-align: left;
    color: $accent;
  }

  .q-table tbody {
    display: block;
    min-height: 5vh;
    max-height: 30vh;
    overflow-y: overlay;
  }

  .q-tab-panel {
    border: 1px solid $border;
  }

  .q-table {
    thead, tbody tr {
      border-bottom: 1px solid $border;
    }
  }

  .q-tabs {
    background-color: $primary;
    color: $border;
  }
}
</style>

<style lang='stylus'>
// We don't scope these else they will not be applied to Dygraphs
@import '~dygraphs/dist/dygraph.css';
.admin-poultry-curve-create-edit {
  .dygraph-label-rotate-right,
  .dygraph-label-rotate-left {
    padding-bottom: 1rem;
  }

  .dygraph-xlabel {
    margin-top: 0.5rem;
  }

  #curveDataTable,
  .dygraph-xlabel,
  .dygraph-ylabel {
    color: $dark;
  }
}

</style>
