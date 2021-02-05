<template>

  <page-box v-show="currentReport && currentUser"
    :title="pageTitle" class="adminReportEmailEditBox">

    <!-- New or edit component -->
    <!-- v-if="listLoaded" is to prevent create-edit component to
      access the store before the report list be loaded -->
    <create-edit-email ref="createEdit" :query-string="queryString"
      mode="edit" :report.sync="currentReport" :user.sync="currentUser"
      @submit="onSave"
      @invalid-parameters="onCreateEditInvalidParameter">
    </create-edit-email>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.report.emailEdit.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="save" :disable="saveInProgress">{{ $t('admin.report.emailEdit.save') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import { PageBox } from 'src/common/components/PageBox';
import utilUser from 'src/common/utils/user';
import CreateEditEmail from './Components/CreateEditEmail';

export default {
  name: 'admin-report-new-mail',
  components: {
    PageBox,
    CreateEditEmail,
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
      currentReport: null,
      currentUser: null,
    };
  },
  computed: {
    pageTitle() {
      return this.$t('admin.report.emailEdit.title', {
        name: this.currentReport ? this.currentReport.name : '',
        user: this.currentUser ? utilUser.databaseUserToFullName(this.currentUser) : '',
      });
    },
  },
  methods: {
    onCreateEditInvalidParameter() {
      // CreateEdit component get invalid parameters
      // Go back to report's list page
      this.handleCancel();
    },
    onSave(data) {
      // Send request to store
      this.saveInProgress = true;
      this.$store
        .dispatch('admin/reportEmail/edit', data)
        .then(() => {
          // Warn with a positive toast
          const t = this.$t('admin.report.emailEdit.reportSavedSuccessfully', {
            email: data.configuration.user.email,
            name: this.currentReport.name,
          });
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: t,
            icon: 'thumb_up',
          });

          // Go back to list page
          this.handleCancel();
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
      this.$router.push({ path: 'email-list', query: { ids: this.$route.query.rid } });
    },
    save() {
      this.$refs.createEdit.validateFormAndEmitHandler();
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminReportEmailEditBox {
  max-width: 70rem;
  margin: 0 auto;
}
</style>
