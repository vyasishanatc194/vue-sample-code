<template>

  <page-box v-if="listLoaded && currentReport && userListLoaded"
    :title="$t('admin.report.emailDelete.title', {name: currentReport ? currentReport.name : '?'})"
    class="adminReportDeleteBox">

    <h3>{{ $t('admin.report.emailDelete.confirmation') }}</h3>

    <!-- List of report about to be deleted -->
    <q-list>
      <q-item v-for="d in emailsToDelete" :key="d.id">
        <q-item-section avatar>
          <q-icon name="info" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ d.name }}</q-item-label>
          <q-item-label caption>{{ getUserFullName(d) }}</q-item-label>
          <q-item-label caption v-html="$t('admin.report.emailDelete.deleteEmailInformation', {
            email: getEmailLink(d) })"></q-item-label>
          <q-item-label caption>{{ $t('admin.report.emailDelete.deleteDeviceCountInformation', {
            deviceCount: d.device_count } ) }} </q-item-label>
          <q-item-label caption>{{ $t('admin.report.emailDelete.deleteFrequencyInformation', {
            frequency: getReportFrequency(d) } ) }} </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.report.emailDelete.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="handleDelete"
        :disable="handleDeleteInProgress">{{ $t('admin.report.emailDelete.delete') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import _ from 'lodash';
import { mapState } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';
import utilUser from 'src/common/utils/user';
import utilReport from 'src/common/utils/report';

export default {
  name: 'admin-report-email-delete',
  components: {
    PageBox,
  },
  props: {
    queryString: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      handleDeleteInProgress: false,
      emailsToDelete: [],
      deleteKeys: [],
      currentReport: null,
    };
  },
  computed: {
    ...mapState('admin/report', {
      reportRows: state => state.reportRows,
      listLoading: state => state.listLoading,
      listLoaded: state => state.listLoaded,
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
    getEmailLink(u) {
      return `<a href="mailto:${u.email}">${u.email}</a>`;
    },
    $loadDeleteData() {
      // Get route parameters to extract report ID
      if (!this.queryString || !this.queryString.rid) {
        // Invalid parameters, go back to previous page
        this.handleCancel();
        return;
      }
      const rid = parseInt(this.$route.query.rid, 10);
      if (Number.isNaN(rid)) {
        // Invalid parameters, go back to previous page
        this.handleCancel();
        return;
      }

      // Get route parameters and be sure all params are Number
      if (!this.queryString.uid) {
        // Invalid parameters, go back to previous page
        this.handleCancel();
        return;
      }

      // Extract route parameters
      const deleteKeyAsString = this.queryString.uid.split(',');
      this.deleteKeys = deleteKeyAsString.reduce((acc, val) => {
        const i = parseInt(val, 10);
        if (!Number.isNaN(i)) {
          acc.push(i);
        }
        return acc;
      }, []);

      // If report list is not already loaded, load it
      let p;
      if (!this.listLoading && !this.listLoaded) {
        p = this.$store.dispatch('admin/report/getList');
      } else {
        p = Promise.resolve();
      }

      // Load current report
      p
        .then(() => {
          // Find the report
          this.currentReport = this.reportRows.find(r => r.id === rid);
          if (!this.currentReport) {
            // Invalid parameters, go back to previous page
            return Promise
              .reject(new Error(this.$t('admin.report.emailDelete.reportDoesNotExists')));
          }

          // Test if this report's email list has been loaded
          if (!this.userListLoaded) {
            return this.$store.dispatch('admin/reportEmail/getList', this.currentReport);
          }
          return Promise.resolve();
        })
        .then(() => {
          // Extract requested report's email to delete from query sring
          this.emailsToDelete = this.userRows.filter(d => this.deleteKeys.indexOf(d.id) !== -1);
          // Be sure all report has been found and load
          if (this.emailsToDelete.length !== this.deleteKeys.length) {
            return Promise
              .reject(new Error(this.$t('admin.report.emailDelete.invalidParameters')));
          }

          return Promise.resolve();
        })
        .then(() => {
          // Initialize the reportEmail store (if not initialized)
          if (!this.initialized) {
            return this.$store.dispatch('admin/reportEmail/initialize');
          }
          return Promise.resolve();
        })
        .catch((error) => {
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        });
    },
    handleDelete() {
      // Send request to store
      this.handleDeleteInProgress = true;
      const d = _.map(this.emailsToDelete, x => _(x).pick(['id', 'updated_at']));
      const args = {
        report: this.currentReport,
        list: d,
      };
      this.$store
        .dispatch('admin/reportEmail/delete', args)
        .then(() => {
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: this.$t('admin.report.emailDelete.reportsEmailDeletedSuccessfully', {
              count: d.length,
            }),
            icon: 'thumb_up',
          });

          // Go back to list page
          this.$router.push({ path: 'email-list', query: { ids: this.$route.query.rid } });
        })
        .catch((error) => {
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        })
        .then(() => {
          this.handleDeleteInProgress = false;
        });
    },
    handleCancel() {
      this.$router.push({ path: 'email-list', query: { ids: this.$route.query.rid } });
    },
  },
  created() {
    this.$loadDeleteData();
  },
  watch: {
    queryString: {
      handler() {
        this.$loadDeleteData();
      },
      deep: true,
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminReportDeleteBox {
  max-width: 70rem;
  margin: 0 auto;

  h3 {
    font-size: 1rem;
  }
}
</style>
