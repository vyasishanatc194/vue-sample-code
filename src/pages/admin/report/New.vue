<template>

  <page-box v-if="listLoaded && listTagLoaded" :title="$t('admin.report.new.title')"
    class="adminReportNewBox">

    <!-- New or edit component -->
    <create-edit ref="createEdit" mode="create"
      :query-string="queryStringEmpty" @submit="onCreate">
    </create-edit>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.report.new.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="create" :disable="createInProgress">{{ $t('admin.report.new.create') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import { mapState } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';
import CreateEdit from './Components/CreateEdit';

export default {
  name: 'admin-report-new',
  components: {
    PageBox,
    CreateEdit,
  },
  data() {
    return {
      createInProgress: false,
      queryStringEmpty: {},
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
    p.then(() => this.$store.dispatch('admin/report/getListTag'))
      .catch((error) => {
        this.$q.notify({
          color: 'negative',
          message: error.message || error,
          icon: 'report_problem',
        });
      });
  },
  computed: {
    ...mapState('admin/report', ['reportRows', 'listLoaded', 'listTagLoaded']),
  },
  methods: {
    onCreate(data) {
      // Send request to store
      this.createInProgress = true;
      this.$store
        .dispatch('admin/report/create', data)
        .then(() => {
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: this.$t('admin.report.new.reportCreatedSuccessfully', {
              name: data.name,
            }),
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
          this.createInProgress = false;
        });
    },
    handleCancel() {
      this.$router.push({ path: '../report' });
    },
    create() {
      this.$refs.createEdit.validateFormAndEmitHandler();
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminReportNewBox {
  max-width: 70rem;
  margin: 0 auto;
}
</style>
