<template>

  <!-- Page container -->
  <page-box v-if="reportListLoaded && userListLoaded"
    :title="$t('admin.report.emailList.title', {name: reportTitle})">

    <!-- Report's list -->
    <q-table
      ref="userTable"
      selection="multiple"
      row-key="id"
      class="no-shadow full-width"
      :pagination.sync="pagination"
      :columns="columns"
      :data="rows"
      :selected.sync="selected"
      :filter="filter">

      <!-- Top left button -->
      <div slot="top-left">
        <div class="row q-gutter-xs">
          <q-btn color="primary" icon="mode_edit"
            :label="$t('admin.report.emailList.topButtonEdit')"
          :disable="selected.length !== 1" @click="handleEdit" />
          <q-btn color="secondary" icon="add"
            :label="$t('admin.report.emailList.topButtonNew')"
            :disable="selected.length > 0" @click="handleNew" />
          <q-btn color="negative" icon="delete_forever"
            :label="$t('admin.report.emailList.topButtonDelete')"
            :disable="selected.length < 1" @click="handleDelete" />
        </div>
      </div>

      <!-- Top right filter box -->
      <q-input
        slot="top-right"
        v-model="filter"
        debounce="500"
        placeholder="Search"
        clearable>
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>

      <!-- Row header -->
      <q-tr slot="header" slot-scope="props" :props="props">
        <q-th auto-width>
          <q-checkbox v-model="props.selected" />
        </q-th>
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.label }}
        </q-th>
      </q-tr>

      <!-- Other columns -->
      <template slot="body" slot-scope="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" />
          </q-td>
          <q-td key="fullName" :props="props">
            {{ getUserFullName(props.row) }}
          </q-td>
          <q-td key="email" :props="props">
            <a :href="`mailto:${props.row.email}`">{{ props.row.email }}</a>
          </q-td>
          <q-td key="deviceCount" :props="props">
            {{ props.row.device_count || 0 }}
          </q-td>
          <q-td key="frequency" :props="props">
            {{ getReportFrequency(props.row) }}
          </q-td>
        </q-tr>
      </template>

    </q-table>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleGoBack">{{ $t('admin.report.emailList.bottomButtonGoBack') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import { mapState } from 'vuex';
import Promise from 'bluebird';
import _ from 'lodash';
import { PageBox } from 'src/common/components/PageBox';
import utilUser from 'src/common/utils/user';
import utilReport from 'src/common/utils/report';

export default {
  components: {
    PageBox,
  },
  name: 'admin-report-email-list',
  data() {
    return {
      columns: [
        {
          name: 'fullName',
          field: 'fullName',
          required: true,
          label: this.$t('admin.report.emailList.columnName'),
          align: 'left',
          sortable: true,
        },
        {
          name: 'email',
          field: 'email',
          required: false,
          label: this.$t('admin.report.emailList.columnEmail'),
          align: 'left',
          sortable: true,
        },
        {
          name: 'deviceCount',
          field: 'deviceCount',
          required: false,
          label: this.$t('admin.report.emailList.columnDeviceCount'),
          align: 'right',
          sortable: true,
          sort: (a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10),
        },
        {
          name: 'frequency',
          field: 'frequency',
          required: true,
          label: this.$t('admin.report.emailList.columnFrequency'),
          align: 'left',
          sortable: true,
        },
      ],
      selected: [],
      rows: [],
      // Rather then referencing the store by using a computed value,
      // we get the data by directly referencing the state otherwise the
      // computed properties have not been evaluated yet.
      filter: !_.isEmpty(this.$store.state.admin.reportEmail.listFilter)
        ? this.$store.state.admin.reportEmail.listFilter : '',
      pagination: !_.isEmpty(this.$store.state.admin.reportEmail.listPagination)
        ? this.$store.state.admin.reportEmail.listPagination
        : { sortBy: 'fullName' },
      editKey: null,
      currentReport: null,
      reportTitle: '?',
    };
  },
  created() {
    // Get route parameters and be sure we got a report id
    if (!this.$route.query || !this.$route.query.ids) {
      // Invalid parameters go back to report's list page
      this.$router.push({ path: 'report' });
      return;
    }

    // Extract route parameters and get report key
    this.editKey = parseInt(this.$route.query.ids, 10);
    if (Number.isNaN(this.editKey)) {
      // Invalid parameters go back to report's list page
      this.$router.push({ path: 'report' });
      return;
    }

    // If report list is not already loaded, load it
    let p;
    if (!this.reportListLoading && !this.reportListLoaded) {
      p = this.$store.dispatch('admin/report/getList');
    } else {
      p = Promise.resolve();
    }

    // Restore table filter and pagination
    // and load the report's email setting
    p
      .then(() => {
        // Find the report
        this.currentReport = this.reportRows.find(r => r.id === this.editKey);
        if (!this.currentReport) {
          // This report does not exists, go back to report's list page
          this.$router.push({ path: 'report' });
          return;
        }

        // Set page title
        this.reportTitle = this.currentReport.name;
      })

      // Initialize the reportEmail store
      .then(() => this.$store.dispatch('admin/reportEmail/initialize'))

      // Get list of email of this report
      .then(() => this.$store.dispatch('admin/reportEmail/getList', this.currentReport))
      .then(() => {
        this.rows = this.userRows;
      })
      .catch((error) => {
        this.$q.notify({
          color: 'negative',
          message: error.message || error,
          icon: 'report_problem',
        });
      });
  },
  computed: {
    ...mapState('admin/report', {
      reportListLoading: state => state.listLoading,
      reportListLoaded: state => state.listLoaded,
      reportRows: state => state.reportRows,
    }),
    ...mapState('admin/reportEmail', {
      initialized: state => state.initialized,
      userRows: state => state.userRows,
      userListLoaded: state => state.userListLoaded,
    }),
  },
  methods: {
    getUserFullName(u) {
      // Get user full name
      return utilUser.databaseUserToFullName(u);
    },
    getReportFrequency(r) {
      return utilReport.mailFrequencyToString(this.$t.bind(this), r);
    },
    handleNew() {
      // Go to new page
      this.$router.push({ path: 'email-new', query: { rid: this.editKey } });
    },
    handleEdit() {
      // Get selected row
      const selectedReport = Object.keys(this.$refs.userTable.selectedKeys).map(key => key);

      // Go to edit page
      this.$router.push({
        path: 'email-edit',
        query: { rid: this.editKey, uid: selectedReport.join(',') },
      });
    },
    handleDelete() {
      // Get selected row
      const selectedReport = Object.keys(this.$refs.userTable.selectedKeys).map(key => key);

      // Go to delete page
      this.$router.push({
        path: 'email-delete',
        query: { rid: this.editKey, uid: selectedReport.join(',') },
      });
    },
    handleGoBack() {
      // Go back to report's list
      this.$router.push({ path: '.' });
    },
  },
  watch: {
    // Send datatable pagination change to store
    pagination: {
      handler(newPag) {
        if (this.initialized) {
          this.$store.commit('admin/reportEmail/listPaginationChanged', newPag);
        }
      },
      deep: true,
    },
    // Send datatable filter change to store
    filter(newFilter) {
      if (this.initialized) {
        this.$store.commit('admin/reportEmail/listFilterChanged', newFilter);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
</style>
