<template>

  <page-box v-if="listLoaded" :title="$t('admin.user.delete.title')" class="adminUserDeleteBox">

    <h3>{{ $t('admin.user.delete.confirmation') }}</h3>

    <!-- List of users about to be deleted -->
    <q-list>
      <q-item v-for="d in usersToDelete" :key="d.id">
        <q-item-section avatar>
          <q-icon name="info" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ `${d.first_name} ${d.last_name}` }}</q-item-label>
          <q-item-label caption>{{ `${$t('admin.user.delete.id')}: ${d.id}` }}</q-item-label>
          <q-item-label caption>{{ `${$t('admin.user.delete.email')}` }}:
              <a :href="`mailto:${d.email}`">{{ d.email }}</a>
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.user.delete.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="handleDelete"
        :disable="handleDeleteInProgress">
          {{ $t('admin.user.delete.delete') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import _ from 'lodash';
import { mapState } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';

export default {
  name: 'admin-user-delete',
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
      usersToDelete: [],
      deleteKeys: [],
    };
  },
  computed: {
    ...mapState('admin/user', {
      userRows: state => state.userRows,
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

      // If user list is not already loaded, load it
      let p;
      if (!this.listLoading && !this.listLoaded) {
        p = this.$store.dispatch('admin/user/getList');
      } else {
        p = Promise.resolve();
      }
      p
        .then(() => {
          // Extract requested user to delete from query sring
          this.usersToDelete = this.userRows.filter(d => this.deleteKeys.indexOf(d.id) !== -1);
          // Be sure all user has been found and load
          if (this.usersToDelete.length !== this.deleteKeys.length) {
            // Go back to list page, but maybe a warning
            // should be more appropriate
            this.$router.push({ path: '../user' });
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
      const d = _.map(this.usersToDelete, x => _(x).pick(['id', 'updated_at']));
      this.$store
        .dispatch('admin/user/delete', d)
        .then(() => {
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: this.$t('admin.user.delete.usersDeletedSuccessfully', { count: d.length }),
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
          this.handleDeleteInProgress = false;
        });
    },
    handleCancel() {
      this.$router.push({ path: '../user' });
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
.adminUserDeleteBox {
  max-width: 70rem;
  margin: 0 auto;

  h3 {
    font-size: 1rem;
  }
}
</style>
