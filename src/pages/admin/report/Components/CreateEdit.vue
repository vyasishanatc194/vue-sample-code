<template>
  <div class="admin-report-create-edit">

    <!-- Report's name -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-input
          v-model.trim="report.name"
          @keydown.enter.native="validateFormAndEmitHandler"
          @input="touchForm"
          :label="$t('admin.report.components.createEdit.name')">
          <template v-slot:prepend>
            <q-icon name="class"></q-icon>
          </template>
        </q-input>

        <div v-if="$v.report.name.$error && !$v.report.name.required" class="error-validation">
          {{ $t("admin.report.components.createEdit.nameRequired") }}
        </div>
      </div>
    </div>

    <!-- Report's tag list -->
    <div class="row" >
      <div class="offset-xs-1 col-10">

        <q-field :label="$t('admin.report.components.createEdit.tags')">
          <template v-slot:prepend>
            <q-icon name="settings_remote" />
          </template>

          <div class="self-center full-width no-outline q-py-sm" tabindex="0">

            <table class="q-table q-table-horizontal-separator q-mb-sm" id="reportTagTable">
              <thead>
                <tr>
                  <th>
                    {{ $t('admin.report.components.createEdit.columnAction') }}
                  </th>
                  <th class="text-left">
                    {{ $t('admin.report.components.createEdit.columnName') }}
                  </th>
                </tr>
              </thead>
              <transition-group name="flip-list" tag="tbody">
                <tr v-for="(item, idx) in tableTagRows"
                  v-bind:key="item.id"
                  :id="`rowTag_${item.id}`">
                  <td>
                    <div class="row q-gutter-xs">
                      <q-btn size="sm" color="primary" icon="delete_forever"
                        @click="$removeTag(tableTagRows[idx].id)" />
                      <q-btn size="sm" color="primary" icon="arrow_drop_up"
                        @click="$moveTagUp(tableTagRows[idx].id)" />
                      <q-btn size="sm" color="primary" icon="arrow_drop_down"
                        @click="$moveTagDown(tableTagRows[idx].id)" />
                    </div>
                  </td>
                  <td class="text-left">
                    {{ tableTagRows[idx].name }}
                  </td>
                </tr>
              </transition-group>
            </table>

            <q-table v-if="tagRows"
              id="reportTagAddTable"
              ref="reportTagAddTable"
              row-key="id"
              class="no-shadow full-width"
              :columns="tableAddTagColumns"
              :hideBottom="true">

              <!-- Body slot -->
              <template slot="header" slot-scope="props">
                <q-tr :props="props">
                  <q-td>
                    <q-btn size="sm" color="primary" icon="add" @click="$addNewTag" />
                  </q-td>
                  <q-td>
                    <q-select
                      v-model="addTag"
                      :options="filterTagsOptions"
                      @filter="filterTags"
                      use-chips
                      use-input
                      stack-label
                      :label="$t('admin.report.components.createEdit.selectTags')"
                      multiple
                      clearable
                      class="no-padding">
                    </q-select>
                  </q-td>
                </q-tr>
              </template>
            </q-table>

          </div>
        </q-field>

      </div>
    </div>

  </div>
</template>

<script>
import { dom } from 'quasar';
import { mapState } from 'vuex';
import _ from 'lodash';
import { required } from 'vuelidate/lib/validators';

const { height, width } = dom;

const availableMode = {
  create: 'create',
  edit: 'edit',
};

export default {
  name: 'admin-report-create-edit',
  components: {
  },
  props: {
    queryString: {
      required: true,
      type: Object,
    },
    mode: {
      required: true,
      type: String,
      validator: value => Object.keys(availableMode).find(x => value === availableMode[x]),
      default: () => 'create',
    },
  },
  data() {
    return {
      filterTagsOptions: this.getTagSelectorList,
      availableMode,
      editKey: [],
      report: {
        name: null,
        tags: [],
      },
      tableTagRows: [],
      tableTagPagination: {
        rowsPerPage: 0,
      },
      reportEditOriginal: {
        name: null,
      },
      tableTagFilter: this.listTagFilter,
      addTag: [],
      tableAddTagColumns: [],
    };
  },
  // Get forms validations
  validations() {
    return {
      report: {
        name: {
          required,
        },
      },
    };
  },
  computed: {
    ...mapState('admin/report', [
      'reportRows',
      'listLoaded',
      'tagRows',
      'listTagLoaded',
      'listTagFilter',
      'reportTagRows',
      'listReportTagLoaded',
      'listReportTagFilter',
    ]),
    isModeCreate() {
      return this.mode === this.availableMode.create;
    },
    isModeEdit() {
      return this.mode === this.availableMode.edit;
    },
    nameEditChanged() {
      return this.$watchEditChangedProperty('name', false);
    },
    getTags() {
      return this.isModeCreate ? this.tagRows : this.reportTagRows;
    },
    getTagSelectorList() {
      return this.getTags.filter(s => !this.tableTagRows.find(t => t.id === s.id)).map(e => ({
        label: e.name,
        value: e.id,
      }));
    },
  },
  created() {
    if (this.isModeEdit) {
      this.$loadEditData();
    }
  },
  mounted() {
    this.$handleResize();
    window.addEventListener('resize', this.$handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.$handleResize);
  },
  watch: {
    queryString: {
      handler() {
        if (this.isModeEdit) {
          this.$loadEditData();
        }
      },
      deep: true,
    },
  },
  methods: {
    // Timezone filtering function
    filterTags(val, update) {
      if (val === '') {
        update(() => {
          this.filterTagsOptions = this.getTagSelectorList;
        });
      } else {
        update(() => {
          const t = val.toLowerCase();
          this.filterTagsOptions = this.getTagSelectorList.filter(
            v => (typeof v.label === 'string'
              ? v.label.toLowerCase().indexOf(t) > -1
              : false),
          );
        });
      }
    },
    $handleResize() {
      // Set report's tag table height to 30% of viewport height
      const bodyHeight = height(document.body);
      const tableHeight = bodyHeight * 0.3;
      document.querySelector('.q-table tbody').style.maxHeight = `${tableHeight}px`;

      // Set report's tag add table same widht as report's table tag
      const reportTagTableWidth = width(document.querySelector('#reportTagTable'));
      document.querySelector('#reportTagAddTable').style.width = `${reportTagTableWidth}px`;
    },
    $scrollToTag(elementID) {
      // Scroll to a tag's row
      const row = document.getElementById(elementID);
      const tbody = document.querySelector('tbody');
      this.$scrollTo(row, 500, { container: tbody });
    },
    $addNewTag() {
      // Find corresponding tag and add it to the report's table tag
      if (!Array.isArray(this.addTag) || this.addTag.length <= 0) {
        return;
      }
      this.addTag.forEach((t) => {
        const tag = this.getTags.find(tx => tx.id === t.value);
        if (tag) {
          this.tableTagRows.push(tag);
        }
      });

      // Scroll to latest row added
      this.$nextTick(() => {
        const lastTag = this.addTag[this.addTag.length - 1];
        this.$scrollToTag(`rowTag_${lastTag.value}`);

        // Clear added tag
        this.addTag.splice(0, this.addTag.length);
      });
    },
    $removeTag(tagId) {
      // Find corresponding tag and remove it
      const tagIndex = this.tableTagRows.findIndex(t => t.id === tagId);
      if (tagIndex > -1) {
        this.tableTagRows.splice(tagIndex, 1);
      }
    },
    $moveTagUp(tagId) {
      // Find corresponding tag and move it up
      const tagIndex = this.tableTagRows.findIndex(t => t.id === tagId);
      if (tagIndex > -1 && tagIndex > 0) {
        this.tableTagRows.splice(tagIndex - 1, 0, this.tableTagRows.splice(tagIndex, 1)[0]);

        // Scroll up to this tag
        this.$nextTick(() => {
          this.$scrollToTag(`rowTag_${this.tableTagRows[tagIndex - 1].id}`);
        });
      }
    },
    $moveTagDown(tagId) {
      // Find corresponding tag and move it down
      const tagIndex = this.tableTagRows.findIndex(t => t.id === tagId);
      if (tagIndex > -1 && tagIndex < this.tableTagRows.length - 1) {
        this.tableTagRows.splice(tagIndex + 1, 0, this.tableTagRows.splice(tagIndex, 1)[0]);

        // Scroll down to this tag
        this.$nextTick(() => {
          this.$scrollToTag(`rowTag_${this.tableTagRows[tagIndex + 1].id}`);
        });
      }
    },
    $watchEditChangedProperty(property, canBeNull) {
      if (this.isModeEdit) {
        if (canBeNull && this.report[property] === '') {
          return this.reportEditOriginal[property] !== null;
        }
        return this.report[property] !== this.reportEditOriginal[property];
      }
      return false;
    },
    $bulkSetPropertyToArraySameValue(arr, propName, obj, defaultValue) {
      const val = obj[propName];
      if (_.every(arr, a => _.isEqual(val, a[propName]))) {
        return val;
      }
      return defaultValue;
    },
    $loadEditData() {
      // Only execute this method while in edit mode
      if (!this.isModeEdit) {
        return;
      }

      // Get route parameters and be sure all params are Number
      if (!this.$route.query || !this.$route.query.ids) {
        // Invalid parameters, emit to parent
        this.$emit('invalid-parameters');
        return;
      }

      // Extract route parameters and get report key
      const editKeyAsString = this.$route.query.ids;
      this.editKey = parseInt(editKeyAsString, 10);
      if (Number.isNaN(this.editKey)) {
        // Invalid parameters, emit to parent
        this.$emit('invalid-parameters');
        return;
      }

      // Load report data from data store
      const reportToEdit = this.reportRows.find(r => r.id === this.editKey);
      // Be sure the report exists
      if (!reportToEdit) {
        // Invalid parameters, emit to parent
        this.$emit('invalid-parameters');
        return;
      }

      // Set name
      this.report.name = reportToEdit.name;
      this.reportEditOriginal.name = reportToEdit.name;

      // Load selected tag of the report
      this.$store
        .dispatch('admin/report/getReportListTag', reportToEdit)
        .then((res) => {
          // Set selected tag
          const selectedTag = [];
          for (let i = 0; i < res.tagRows.length; i += 1) {
            const r = res.tagRows[i];
            if (r.selected) {
              selectedTag.push({
                id: r.id,
                name: r.name,
              });
            }
          }
          this.tableTagRows = selectedTag;
        })
        .catch((error) => {
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        });
    },
    // Build the edited object before submiting the result
    $buildEditedSubmitResult(reportId) {
      const result = {};
      result.id = reportId;
      result.name = this.report.name;
      result.updated_at = this.reportRows.find(r => r.id === reportId).updated_at;
      result.tags = this.tableTagRows;
      return result;
    },
    // Validate form
    touchForm() {
      this.$v.report.$touch();
    },
    // Validate form and emit a submit signal
    validateFormAndEmitHandler() {
      this.touchForm();
      if (!this.$v.report.$error) {
        // If we are in edit mode, only returns field that has been changed
        if (this.isModeCreate) {
          this.report.tags = this.tableTagRows;
          this.$emit('submit', this.report);
        } else if (this.isModeEdit) {
          const d = this.$buildEditedSubmitResult(this.editKey);
          this.$emit('submit', d);
        } else {
          this.$emit('invalid-parameters');
        }
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.admin-report-create-edit {

  #reportTagTable,
  #reportTagAddTable {
    th:first-child,
    td:first-child {
      width: 11rem;
    }
  }

  .q-table thead, tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }

  .q-table thead, theader th {
    text-align: left;
  }

  .q-table tbody {
    display: block;
    min-height: 5vh;
    max-height: 34vh;
    overflow-y: scroll;
  }

  .flip-list-move {
     transition: transform 0.7s;
  }
}
</style>
