<template>

  <!-- Page container -->
  <page-box :title="$t('admin.user.list.title')">

    <!-- User's list -->
    <q-table
      ref="userTable"
      selection="multiple"
      row-key="id"
      class="no-shadow full-width"
      :pagination.sync="pagination"
      :columns="columns"
      :data="userRows"
      :selected.sync="selected"
      :filter="filter">

      <!-- Top left button -->
      <template slot="top-left">
        <div class="row q-gutter-xs">
          <q-btn color="primary" icon="mode_edit"
            :label="$t('admin.user.list.topButtonEdit')"
          :disable="selected.length < 1" @click="handleEdit" />
          <q-btn color="secondary" icon="add"
            :label="$t('admin.user.list.topButtonNew')"
            :disable="selected.length > 0" @click="handleNew" />
          <q-btn color="negative" icon="delete_forever"
            :label="$t('admin.user.list.topButtonDelete')"
            :disable="selected.length < 1" @click="handleDelete" />
        </div>
      </template>

      <!-- Top right filter box -->
      <template slot="top-right">
        <q-input
          v-model="filter"
          debounce="500"
          placeholder="Search"
          clearable>
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <!-- Row header -->
      <q-tr slot="header" slot-scope="props">
        <q-th auto-width>
          <q-checkbox v-model="props.selected" />
        </q-th>
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{col.label}}
        </q-th>
      </q-tr>

      <!-- Body slot -->
      <template slot="body" slot-scope="props">

        <!-- Other columns -->
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" />
          </q-td>
          <q-td key="id" :props="props">{{ props.row.id }}</q-td>
          <q-td key="first_name" :props="props">{{ props.row.first_name }}</q-td>
          <q-td key="last_name" :props="props">{{ props.row.last_name }}</q-td>
          <q-td key="email" :props="props">
            <a :href="`mailto:${props.row.email}`">
              {{ props.row.email }}
            </a>
          </q-td>
          <q-td key="role" :props="props">
            {{ props.colsMap['role'].format(props.row.role_id) }}
          </q-td>
          <q-td key="timezone" :props="props">{{ props.row.time_zone }}</q-td>
        </q-tr>
      </template>

    </q-table>

  </page-box>

</template>

<script>
import { mapState } from 'vuex';
import _ from 'lodash';
import { PageBox } from 'src/common/components/PageBox';

export default {
  components: {
    PageBox,
  },
  name: 'admin-user-list',
  data() {
    return {
      columns: [
        {
          name: 'id',
          required: true,
          label: this.$t('admin.user.list.columnId'),
          align: 'left',
          field: 'id',
          sortable: true,
        },
        {
          name: 'first_name',
          required: true,
          label: this.$t('admin.user.list.columnFirstName'),
          align: 'left',
          field: 'first_name',
          sortable: true,
        },
        {
          name: 'last_name',
          required: true,
          label: this.$t('admin.user.list.columnLastName'),
          align: 'left',
          field: 'last_name',
          sortable: true,
        },
        {
          name: 'email',
          required: true,
          label: this.$t('admin.user.list.columnEmail'),
          align: 'left',
          field: 'email',
          sortable: true,
        },
        {
          name: 'role',
          required: true,
          label: this.$t('admin.user.list.columnRole'),
          align: 'left',
          field: 'role_id',
          sortable: true,
          format: val => this.getRole(val),
        },
        {
          name: 'timezone',
          required: true,
          label: this.$t('admin.user.list.columnTimezone'),
          align: 'left',
          field: 'time_zone',
          sortable: true,
        },
      ],
      selected: [],
      filter: !_.isEmpty(this.$store.state.admin.user.listFilter)
        ? this.$store.state.admin.user.listFilter : '',
      pagination: !_.isEmpty(this.$store.state.admin.user.listPagination)
        ? this.$store.state.admin.user.listPagination
        : { sortBy: 'first_name' },
    };
  },
  created() {
    this.$store
      .dispatch('admin/user/getList')
      .catch((error) => {
        this.$q.notify({
          color: 'negative',
          message: error.message || error,
          icon: 'report_problem',
        });
      });
  },
  computed: {
    ...mapState('user', {
      roleList: state => state.roleList,
    }),
    ...mapState('admin/user', {
      initialized: state => state.initialized,
      userRows: state => state.userRows,
    }),
  },
  methods: {
    // Get user role
    getRole(rId) {
      const f = _.find(this.roleList, r => r.id === rId);
      return f ? f.locale_name : '';
    },
    handleNew() {
      // Go to new user page
      this.$router.push('user/new');
    },
    handleEdit() {
      // Get selected row
      const selectedUser = Object.keys(this.$refs.userTable.selectedKeys).map(key => key);

      // Go to delete page
      this.$router.push({ path: 'user/edit', query: { ids: selectedUser.join(',') } });
    },
    handleDelete() {
      // Get selected row
      const selectedUser = Object.keys(this.$refs.userTable.selectedKeys).map(key => key);

      // Go to delete page
      this.$router.push({ path: 'user/delete', query: { ids: selectedUser.join(',') } });
    },
  },
  watch: {
    // Send datatable pagination change to store
    pagination: {
      handler(newPag) {
        if (this.initialized) {
          this.$store.commit('admin/user/listPaginationChanged', newPag);
        }
      },
      deep: true,
    },
    // Send datatable filter change to store
    filter(newFilter) {
      if (this.initialized) {
        this.$store.commit('admin/user/listFilterChanged', newFilter);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
</style>
