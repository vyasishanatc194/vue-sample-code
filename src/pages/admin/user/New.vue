<template>

  <page-box :title="$t('admin.user.new.title')" class="adminUserNewBox">

    <!-- New or edit component -->
    <create-edit ref="createEdit" mode="create"
      :user-rows="userRows" :query-string="queryStringEmpty"
      @submit="onCreate">
    </create-edit>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.user.new.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="create" :disable="createInProgress">{{ $t('admin.user.new.create') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import { mapState } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';
import utilMisc from 'src/common/utils/misc';
import CreateEdit from './Components/CreateEdit';

export default {
  name: 'admin-user-new',
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
    // If user list is not already loaded, load it
    let p;
    if (!this.listLoading && !this.listLoaded) {
      p = this.$store.dispatch('admin/user/getList');
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
    ...mapState('admin/user', {
      userRows: state => state.userRows,
      listLoading: state => state.listLoading,
      listLoaded: state => state.listLoaded,
    }),
  },
  methods: {
    onCreate(data) {
      // Convert all keys to snake case
      const d = utilMisc.propertyKeyToSnakeCase(data);

      // Send request to store
      this.$q.loading.show({
        message:
          this.$t('admin.user.new.creatingLoading'),
      });
      this.createInProgress = true;
      this.$store
        .dispatch('admin/user/create', d)
        .then(() => {
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: this.$t('admin.user.new.userCreatedSuccessfully', {
              name: d.name,
            }),
            icon: 'thumb_up',
          });

          // Go back to list page
          this.$router.push({ path: '../user' });
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
          this.$q.loading.hide();
        });
    },
    handleCancel() {
      this.$router.push({ path: '../user' });
    },
    create() {
      this.$refs.createEdit.validateFormAndEmitHandler();
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminUserNewBox {
  max-width: 70rem;
  margin: 0 auto;
}
</style>
