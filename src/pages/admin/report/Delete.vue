<template>

  <page-box v-if="listLoaded" :title="$t('admin.report.delete.title')" class="adminReportDeleteBox">

    <h3>{{ $t('admin.report.delete.confirmation') }}</h3>

    <!-- List of report about to be deleted -->
    <q-list>
      <q-item v-for="d in reportsToDelete" :key="d.id">
        <q-item-section avatar>
          <q-icon name="info" />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ d.name }}</q-item-label>
          <q-item-label caption>
            {{ `${$t('admin.report.delete.id')}: ${d.id}` }}</q-item-label>
          <q-item-label caption>
            {{ `${$t('admin.report.delete.tagCount', {count: d.tagCount || 0})},
              ${$t('admin.report.delete.userCount', {count: d.userCount || 0})},
              ${$t('admin.report.delete.entityCount', {count: d.entityCount || 0})}`
            }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.report.delete.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="handleDelete"
        :disable="handleDeleteInProgress">{{ $t('admin.report.delete.delete') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import _ from 'lodash';
import { mapState } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';

export default {
  name: 'admin-report-delete',
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
      reportsToDelete: [],
      deleteKeys: [],
    };
  },
  computed: {
    ...mapState('admin/report', {
      reportRows: state => state.reportRows,
      listLoading: state => state.listLoading,
      listLoaded: state => state.listLoaded,
    }),
  },
  methods: {
    $loadDeleteData() {
      // Get route parameters and be sure all params are Number
      if (!this.queryString || !this.queryString.ids) {
        // Invalid parameters, emit to parent
        this.$emit('invalid-parameters');
        return;
      }

      // Extract route parameters
      const deleteKeyAsString = this.queryString.ids.split(',');
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
      p
        .then(() => {
          // Extract requested user to delete from query sring
          this.reportsToDelete = this.reportRows.filter(d => this.deleteKeys.indexOf(d.id) !== -1);
          // Be sure all report has been found and load
          if (this.reportsToDelete.length !== this.deleteKeys.length) {
            // Go back to list page
            this.handleCancel();
          }
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
      const d = _.map(this.reportsToDelete, x => _(x).pick(['id', 'updated_at']));
      this.$store
        .dispatch('admin/report/delete', d)
        .then(() => {
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: this.$t('admin.report.delete.reportsDeletedSuccessfully', { count: d.length }),
            icon: 'thumb_up',
          });

          // Go back to list page
          this.$router.push({ path: '../report' });
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
      this.$router.push({ path: '../report' });
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
