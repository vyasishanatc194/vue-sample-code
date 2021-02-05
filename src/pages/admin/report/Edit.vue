<template>

  <page-box :title="$t('admin.report.edit.title')"
   class="adminReportEditBox">

    <!-- New or edit component -->
    <!-- v-if="listLoaded" is to prevent create-edit component to
      access the report store before the report list be loaded -->
    <create-edit v-if="listLoaded" ref="createEdit" :query-string="queryString"
      mode="edit" @submit="onSave" @invalid-parameters="onCreateEditInvalidParameter">
    </create-edit>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.report.edit.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="save" :disable="saveInProgress">{{ $t('admin.report.edit.save') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import _ from 'lodash';
import { mapState } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';
import utilMisc from 'src/common/utils/misc';
import CreateEdit from './Components/CreateEdit';

export default {
  name: 'admin-report-edit',
  components: {
    PageBox,
    CreateEdit,
  },
  props: {
    queryString: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      saveInProgress: false,
    };
  },
  created() {
    // If report list is not already loaded, load it
    let p;
    if (!this.listLoading && !this.listLoaded) {
      p = this.$store.dispatch('admin/report/getList');
    } else {
      p = Promise.resolve();
    }
    p.catch((error) => {
      this.$q.notify({
        color: 'negative',
        message: error.message || error,
        icon: 'report_problem',
      });
    });
  },
  computed: {
    ...mapState('admin/report', {
      reportRows: state => state.reportRows,
      listLoading: state => state.listLoading,
      listLoaded: state => state.listLoaded,
    }),
  },
  methods: {
    // CreateEdit component get invalid parameters
    onCreateEditInvalidParameter() {
      // Go back to report's list page
      this.$router.push({ path: '../report' });
    },
    onSave(data) {
      // Convert all keys to snake case
      let d = _(data).cloneDeep();
      d = utilMisc.propertyKeyToSnakeCase(d);

      // Send request to store
      this.saveInProgress = true;
      this.$store
        .dispatch('admin/report/edit', d)
        .then(() => {
          // Warn with a positive toast
          const t = this.$t('admin.report.edit.reportEditedSuccessfully', {
            name: d.name,
          });
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: t,
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
          this.saveInProgress = false;
        });
    },
    handleCancel() {
      this.$router.push({ path: '../report' });
    },
    save() {
      this.$refs.createEdit.validateFormAndEmitHandler();
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminReportEditBox {
  max-width: 70rem;
  margin: 0 auto;
}
</style>
