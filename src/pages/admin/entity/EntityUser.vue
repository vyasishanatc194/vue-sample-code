<template>

  <page-box :title="getTitle"
   class="adminEntityUserEditBox" v-if="entityListLoaded && userListLoaded">

    <!--Users table -->
    <q-table
      ref="userTable"
      row-key="id"
      class="no-shadow full-width listUser"
      :pagination.sync="tableUserPagination"
      :columns="tableUserColumns"
      :data="getUserTableList"
      :filter="tableUserFilter"
      :hideBottom="false" >

      <!-- Top right filter box -->
      <template slot="top-right">
        <q-input
          v-model="tableUserFilter"
          debounce="500"
          placeholder="Search"
          clearable>
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <!-- Row header -->
      <template slot="header" slot-scope="props">
        <q-tr>
          <q-th auto-width>
          </q-th>
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{col.label}}
          </q-th>
        </q-tr>
      </template>

      <!-- Body slot -->
      <template slot="body" slot-scope="props">
        <q-tr :props="props" :key="props.row.id" :id="`rowUser_${props.row.id}`">
          <q-td style="width: 60px">
            <q-btn size="sm" color="primary" icon="delete_forever"
              @click="removeUser(props.row.id)" />
          </q-td>
          <q-td key="name" :props="props">{{ props.row.name }}</q-td>
          <q-td key="email" :props="props">
            <a :href="`mailto:${props.row.email}`">{{ props.row.email }}</a>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <p></p>

    <!-- Add new users table -->
    <q-table
      id="userAddTable"
      ref="userAddTable"
      row-key="id"
      class="no-shadow full-width"
      :columns="tableAddUserColumns"
      :hideBottom="true">

      <!-- Body slot -->
      <template slot="header" slot-scope="props">
        <q-tr :props="props">
          <q-td style="width: 90px">
            <q-btn size="sm" color="primary" icon="add" @click="addNewUser" />
          </q-td>
          <q-select
            v-model="addUser"
            use-input
            :options="filterNewUserTableListOptions"
            @filter="filterNewUserTableList"
            multiple
            clearable>
          </q-select>
        </q-tr>
      </template>
    </q-table>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.entity.user.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="handleEdit" :disable="saveInProgress">{{ $t('admin.entity.user.save') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';
import _ from 'lodash';
import utilEntity from 'src/common/utils/entity';
import utilUser from 'src/common/utils/user';

export default {
  name: 'admin-entity-user',
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
      filterNewUserTableListOptions: this.getNewUserTableList,
      saveInProgress: false,
      currentEntity: null,
      internalUserList: [],
      tableUserColumns: [
        {
          name: 'name',
          required: true,
          label: this.$t('admin.entity.user.columnName'),
          align: 'left',
          field: 'name',
          sortable: true,
        },
        {
          name: 'email',
          required: false,
          label: this.$t('admin.entity.user.columnEmail'),
          align: 'left',
          field: 'email',
          sortable: true,
        },
      ],
      tableUserPagination: !_.isEmpty(this.$store.state.admin.entityUser.listPagination)
        ? this.$store.state.admin.entityUser.listPagination
        : { sortBy: 'name' },
      tableUserFilter: !_.isEmpty(this.$store.state.admin.entityUser.listFilter)
        ? this.$store.state.admin.entityUser.listFilter : '',
      addUser: [],
      tableAddUserColumns: [],
    };
  },
  created() {
    this.loadEditData();
  },
  computed: {
    ...mapGetters('admin/entity', ['entitiesToTree']),
    ...mapState('admin/entity', {
      entityListLoading: state => state.listLoading,
      entityListLoaded: state => state.listLoaded,
    }),
    ...mapState('admin/entityUser', {
      initialized: state => state.initialized,
      userListLoaded: state => state.listLoaded,
      userRows: state => state.userRows,
    }),
    getTitle() {
      if (this.currentEntity) {
        return this.$t('admin.entity.user.title', {
          path: utilEntity.pathToString(this.currentEntity),
        });
      }
      return '';
    },
    getUserList() {
      return this.userRows.slice().map(u => ({
        id: u.id,
        name: utilUser.databaseUserToFullName(u),
        email: u.email,
      })).sort((a, b) => a.name.localeCompare(b.name));
    },
    getUserTableList() {
      return this.getUserList
        .filter(s => this.internalUserList.find(t => t === s.id));
    },
    getNewUserTableList() {
      return this.getUserList
        .filter(s => !this.internalUserList.find(t => t === s.id))
        .map(e => ({
          label: e.name,
          sublabel: e.email,
          value: e.id,
        }));
    },
  },
  methods: {
    // Timezone filtering function
    filterNewUserTableList(val, update) {
      if (val === '') {
        update(() => {
          this.filterNewUserTableListOptions = this.getNewUserTableList;
        });
      } else {
        update(() => {
          const u = val.toLowerCase();
          this.filterNewUserTableListOptions = this.getNewUserTableList.filter(
            v => v.label.toLowerCase().indexOf(u) > -1,
          );
        });
      }
    },
    loadEditData() {
      // Get route parameters and be sure all params are Number
      if (!this.queryString || !this.queryString.id) {
        // Invalid parameters, go back to list
        this.handleCancel();
        return;
      }

      // Extract route parameters
      const entityId = Number.parseInt(this.queryString.id, 10);
      if (Number.isNaN(entityId)) {
        // Invalid parameters, go back to list
        this.handleCancel();
        return;
      }

      // If entity list is not already loaded, load it
      let p;
      if (!this.entityListLoading && !this.entityListLoaded) {
        p = this.$store.dispatch('admin/entity/getList');
      } else {
        p = Promise.resolve();
      }
      p
        .then(() => {
          // Find this entity
          this.currentEntity = this.entitiesToTree.hashIds[entityId];
          if (!this.currentEntity) {
            throw new Error(this.$t('admin.entity.user.entityDoesNotExits'));
          }

          // Load user of this entity
          return this.$store.dispatch('admin/entityUser/getList', {
            id: this.currentEntity.id,
            updated_at: this.currentEntity.updated_at,
          });
        })
        .then(() => {
          // Set current selected user
          this.internalUserList.splice(
            0,
            this.internalUserList.length,
            ...this.userRows.filter(u => u.selected).map(u => u.id),
          );
        })
        .catch((error) => {
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        });
    },
    handleEdit() {
      // Send request to store
      this.saveInProgress = true;
      const users = this.internalUserList.map((x) => {
        const u = this.userRows.find(uu => uu.id === x);
        return {
          id: u.id,
          updated_at: u.updated_at,
        };
      });
      const data = {
        entity: {
          id: this.currentEntity.id,
          updated_at: this.currentEntity.updated_at,
        },
        users,
      };
      this.$store
        .dispatch('admin/entityUser/edit', data)
        .then(() => {
          // Warn with a positive toast
          const t = this.$t('admin.entity.user.userEditedSuccessfully', {
            count: this.internalUserList.length,
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
      this.$router.push({ path: '../entity' });
    },
    addNewUser() {
      // Find corresponding user and add it to the user's table
      if (!Array.isArray(this.addUser) || this.addUser.length <= 0) {
        return;
      }
      const toAdd = [];
      this.addUser.forEach((t) => {
        const u = this.userRows.find(x => x.id === t.value);
        if (u) {
          toAdd.push(u.id);
        }
      });
      this.internalUserList.push(...toAdd);

      // Clear added user
      this.addUser.splice(0, this.addUser.length);
    },
    removeUser(userId) {
      // Find corresponding user and remove it
      const userIndex = this.internalUserList.indexOf(userId);
      if (userIndex > -1) {
        this.internalUserList.splice(userIndex, 1);
      }
    },
  },
  watch: {
    queryString: {
      handler() {
        this.loadEditData();
      },
      deep: true,
    },
    // Send datatable pagination change to store
    tableUserPagination: {
      handler(newPag) {
        if (this.initialized) {
          this.$store.commit('admin/entityUser/listPaginationChanged', newPag);
        }
      },
      deep: true,
    },
    // Send datatable filter change to store
    tableUserFilter(newFilter) {
      if (this.initialized) {
        this.$store.commit('admin/entityUser/listFilterChanged', newFilter);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminEntityUserEditBox {
  max-width: 70rem;
  margin: 0 auto;

  >>> .listUser .q-table thead, tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }

  >>> .listUser .q-table thead, theader th {
    text-align: left;
  }

  >>> .listUser .q-table tbody {
    display: block;
    min-height: 5vh;
    max-height: 34vh;
    overflow-y: scroll;
  }
}
</style>
