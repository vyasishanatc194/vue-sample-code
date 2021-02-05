<template>

  <!-- Page container -->
  <page-box :title="$t('admin.report.list.title')">

    <!-- Report's list -->
    <q-table
      ref="reportTable"
      selection="multiple"
      row-key="id"
      class="no-shadow full-width"
      :pagination.sync="pagination"
      :columns="columns"
      :data="rows"
      :selected.sync="selected"
      :filter="filter">

      <!-- Top left button -->
      <template slot="top-left">
        <div class="row q-gutter-xs">
          <q-btn color="primary" icon="mode_edit"
            :label="$t('admin.report.list.topButtonEdit')"
          :disable="selected.length !== 1" @click="handleEdit" />
          <q-btn color="secondary" icon="add"
            :label="$t('admin.report.list.topButtonNew')"
            :disable="selected.length > 0" @click="handleNew" />
          <q-btn color="negative" icon="delete_forever"
            :label="$t('admin.report.list.topButtonDelete')"
            :disable="selected.length < 1" @click="handleDelete" />
          <q-btn color="accent" icon="group_work"
            :label="$t('admin.report.list.topButtonEntity')"
            :disable="selected.length !== 1" @click="handleEntity" />
          <q-btn color="positive" icon="email"
            :label="$t('admin.report.list.topButtonEmail')"
            :disable="selected.length !== 1" @click="handleEmail" />
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
      <template slot="header" slot-scope="props">
        <q-tr>
          <q-th auto-width></q-th>
          <q-th auto-width></q-th>
          <q-th colspan="4" class="text-center" auto-width>
            {{ $t('admin.report.list.columnUsedBy') }}
          </q-th>
        </q-tr>
        <q-tr>
          <q-th auto-width>
            <q-checkbox v-model="props.selected" />
          </q-th>
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{col.label}}
          </q-th>
        </q-tr>
      </template>

      <!-- Body slot -->
      <template slot="body" slot-scope="props">

        <!-- Other columns -->
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" />
          </q-td>
          <q-td key="id" :props="props">{{ props.row.id }}</q-td>
          <q-td key="name" :props="props">{{ props.row.name }}</q-td>
          <q-td key="tagCount" :props="props">
            {{ props.row.tagCount ? props.row.tagCount : 0 }}
          </q-td>
          <q-td key="entityCount" :props="props">
            {{ props.row.entityCount ? props.row.entityCount : 0 }}
          </q-td>
          <q-td key="userCount" :props="props">
            {{ props.row.userCount ? props.row.userCount : 0 }}
          </q-td>
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
  name: 'admin-report-list',
  data() {
    return {
      columns: [
        {
          name: 'id',
          required: true,
          label: this.$t('admin.report.list.columnID'),
          align: 'left',
          field: 'id',
          sortable: true,
        },
        {
          name: 'name',
          required: true,
          label: this.$t('admin.report.list.columnName'),
          align: 'left',
          field: 'name',
          sortable: true,
        },
        {
          name: 'tagCount',
          required: true,
          label: this.$t('admin.report.list.columnTag'),
          align: 'right',
          field: 'tagCount',
          sortable: true,
          sort: (a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10),
        },
        {
          name: 'entityCount',
          required: true,
          label: this.$t('admin.report.list.columnEntity'),
          align: 'right',
          field: 'entityCount',
          sortable: true,
          sort: (a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10),
        },
        {
          name: 'userCount',
          required: true,
          label: this.$t('admin.report.list.columnUser'),
          align: 'right',
          field: 'userCount',
          sortable: true,
          sort: (a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10),
        },
      ],
      selected: [],
      rows: [],
      filter: !_.isEmpty(this.$store.state.admin.report.listFilter)
        ? this.$store.state.admin.report.listFilter : '',
      pagination: !_.isEmpty(this.$store.state.admin.report.listPagination)
        ? this.$store.state.admin.report.listPagination
        : { sortBy: 'name' },
    };
  },
  created() {
    this.$store
      .dispatch('admin/report/getList')
      .then(() => {
        this.rows = this.reportRows;
      })
      .catch((error) => {
        this.$q.notify({
          color: 'negative',
          message: error.message || error,
          icon: 'report_problem',
        });
      });
  },
  computed: {
    ...mapState('admin/report', {
      initialized: state => state.initialized,
      reportRows: state => state.reportRows,
    }),
    selectedReport() {
      return Object.keys(this.$refs.reportTable.selectedKeys).map(key => key);
    },
  },
  methods: {
    handleNew() {
      // Go to new report page
      this.$router.push('report/new');
    },
    handleEdit() {
      // Go to delete page
      this.$router.push({
        path: 'report/edit',
        query: { ids: this.selectedReport.join(',') },
      });
    },
    handleDelete() {
      // Go to delete page
      this.$router.push({
        path: 'report/delete',
        query: { ids: this.selectedReport.join(',') },
      });
    },
    handleEntity() {
      // Go to delete page
      this.$router.push({
        path: 'report/entity',
        query: { ids: this.selectedReport.join(',') },
      });
    },
    handleEmail() {
      // Go to delete page
      this.$router.push({
        path: 'report/email-list',
        query: { ids: this.selectedReport.join(',') },
      });
    },
  },
  watch: {
    // Send datatable pagination change to store
    pagination: {
      handler(newPag) {
        if (this.initialized) {
          this.$store.commit('admin/report/listPaginationChanged', newPag);
        }
      },
      deep: true,
    },
    // Send datatable filter change to store
    filter(newFilter) {
      if (this.initialized) {
        this.$store.commit('admin/report/listFilterChanged', newFilter);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
</style>
