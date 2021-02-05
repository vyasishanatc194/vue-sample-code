<template>

  <page-box v-if="listLoaded" :title="$t('admin.poultryCurve.delete.title')"
    class="adminPoultryCurveDeleteBox">

    <h3>{{ $t('admin.poultryCurve.delete.confirmation') }}</h3>

    <!-- List of poultry curve about to be deleted -->
    <q-list>
      <q-item v-for="d in poultryCurveToDelete" :key="d.id">
        <q-item-section avatar>
          <q-icon name="info" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ d.name }}</q-item-label>
          <q-item-label caption>{{ `${$t('admin.poultryCurve.delete.id')}:
            ${d.id}` }}</q-item-label>
          <q-item-label caption>{{ `${$t('admin.poultryCurve.delete.author')}:
            ${userGetFullName(d)}` }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.poultryCurve.delete.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="handleDelete"
        :disable="handleDeleteInProgress">
          {{ $t('admin.poultryCurve.delete.delete') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import _ from 'lodash';
import { mapState, mapActions } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';
import utilUser from 'src/common/utils/user';

export default {
  name: 'admin-poultry-curve-delete',
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
      poultryCurveToDelete: [],
      deleteKeys: [],
    };
  },
  computed: {
    ...mapState('admin/poultryCurve', {
      listLoading: state => state.listLoading,
      listLoaded: state => state.listLoaded,
      curveRows: state => state.curveRows,
      visibilityRows: state => state.visibilityRows,
      stateRows: state => state.stateRows,
      unitsInfo: state => state.unitsInfo,
    }),
  },
  methods: {
    ...mapActions('admin/poultryCurve', ['delete']),
    userGetFullName(userRow) {
      return utilUser.databaseUserToFullName(userRow);
    },
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

      // If poultry curve list is not already loaded, load it
      let p;
      if (!this.listLoading && !this.listLoaded) {
        p = this.$store.dispatch('admin/poultryCurve/getList', {
          loadingMessage: this.$t('admin.poultryCurve.delete.loadingMessage'),
        });
      } else {
        p = Promise.resolve();
      }
      p
        .then(() => {
          // Extract requested poultry curve to delete from query sring
          this.poultryCurveToDelete = this.curveRows
            .filter(d => this.deleteKeys.indexOf(d.id) !== -1);
          // Be sure all poultry curve has been found and loaded
          if (this.poultryCurveToDelete.length !== this.deleteKeys.length) {
            // Go back to list page, but maybe a warning should be more appropriate
            this.$emit('invalid-parameters');
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
      // Disable delete button
      this.handleDeleteInProgress = true;
      // Send request to store
      const deleteCurveInfo = _.map(this.poultryCurveToDelete, x => _(x).pick(['id', 'updated_at']));
      this.delete({
        deleteCurveInfo,
        loadingMessage: this.$t('admin.poultryCurve.delete.deletingMessage'),
      })
        .then((res) => {
          const deleteCurveCount = deleteCurveInfo.length
            - (res.curvesDeletedErrResult ? res.curvesDeletedErrResult.length : 0);
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: this.$t('admin.poultryCurve.delete.curveDeletedSuccessfully', {
              count: deleteCurveCount,
            }),
            icon: 'thumb_up',
          });

          // Go back to list page
          this.$router.push({ path: '../poultry-curve' });
        })
        .catch((error) => {
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        })
        .then(() => {
          // Re-enable delete button
          this.handleDeleteInProgress = false;
        });
    },
    handleCancel() {
      // Go back to poultry curve list
      this.$router.push({ path: '../poultry-curve' });
    },
  },
  created() {
    // Once the page is created, load data about the requested curve to delete
    this.$loadDeleteData();
  },
  watch: {
    queryString: {
      handler() {
        // If page's query string changed, update page data too
        this.$loadDeleteData();
      },
      deep: true,
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminPoultryCurveDeleteBox {
  max-width: 70rem;
  margin: 0 auto;

  h3 {
    font-size: 1rem;
  }
}
</style>
