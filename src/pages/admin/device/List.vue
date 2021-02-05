<template>

  <!-- Page container -->
  <page-box :title="$t('admin.device.list.title')">

    <!-- Device's list -->
    <q-table
      ref="deviceTable"
      selection="multiple"
      row-key="id"
      class="no-shadow full-width"
      :pagination.sync="pagination"
      :columns="columns"
      :data="deviceRows"
      :selected.sync="selected"
      :filter="filter">

      <!-- Top left button -->
      <template slot="top-left">
        <div class="row q-gutter-xs">
          <q-btn color="primary" icon="mode_edit"
            :label="$t('admin.device.list.topButtonEdit')"
          :disable="selected.length < 1" @click="handleEdit" />
          <q-btn color="secondary" icon="add"
            :label="$t('admin.device.list.topButtonNew')"
            :disable="selected.length > 0" @click="handleNew" />
          <q-btn color="negative" icon="delete_forever"
            :label="$t('admin.device.list.topButtonDelete')"
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

        <!-- Group by entity row -->
        <q-tr v-if="getEntityRow(props.row, true)" :props="props">
          <q-th :colspan="columns.length + 1" align="left">
            {{ getEntityRow(props.row, false) }}
          </q-th>
        </q-tr>

        <!-- Other columns -->
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" />
          </q-td>
          <q-td key="id" :props="props">{{ props.row.id }}</q-td>
          <q-td key="name" :props="props">{{ props.row.name }}</q-td>
          <q-td key="hardware_id" :props="props">
            {{ props.cols[2].value }}
          </q-td>
          <q-td key="entity" :props="props">
            {{ props.cols[3].value }}
          </q-td>
          <q-td key="time_zone" :props="props">{{ props.row.timezone }}</q-td>
          <q-td key="forward_url" :props="props">{{ props.row.forward_url }}</q-td>
          <q-td key="forward_file_format" :props="props">
            {{ props.row.forward_file_format }}
          </q-td>
        </q-tr>
      </template>

    </q-table>

  </page-box>

</template>

<script>
import { mapState, mapGetters } from 'vuex';
import _ from 'lodash';
import utilsEntity from 'src/common/utils/entity';
import utilsDevice from 'src/common/utils/device';
import { PageBox } from 'src/common/components/PageBox';

let lastGroupIdRendered;

export default {
  components: {
    PageBox,
  },
  name: 'admin-device-list',
  data() {
    return {
      columns: [
        {
          name: 'id',
          required: true,
          label: this.$t('admin.device.list.columnId'),
          align: 'left',
          field: 'id',
          sortable: true,
        },
        {
          name: 'name',
          required: true,
          label: this.$t('admin.device.list.columnName'),
          align: 'left',
          field: 'name',
          sortable: true,
        },
        {
          name: 'hardware_id',
          required: true,
          label: this.$t('admin.device.list.columnHardwareId'),
          align: 'left',
          field: row => this.hardwareIdToString(row.hardware_id),
          sortable: true,
        },
        {
          name: 'entity',
          required: true,
          label: this.$t('admin.device.list.columnEntity'),
          align: 'left',
          field: row => this.getEntityName(row.parent_id),
          sortable: true,
        },
        {
          name: 'time_zone',
          label: this.$t('admin.device.list.columnTimeZone'),
          align: 'left',
          field: 'timezone',
          sortable: true,
        },
        {
          name: 'forward_url',
          label: this.$t('admin.device.list.columnForwardURL'),
          align: 'left',
          field: 'forward_url',
          sortable: true,
        },
        {
          name: 'forward_file_format',
          label: this.$t('admin.device.list.columnForwardFileFormat'),
          align: 'left',
          field: 'forward_file_format',
          sortable: true,
        },
      ],
      selected: [],
      filter: !_.isEmpty(this.$store.state.admin.device.listFilter)
        ? this.$store.state.admin.device.listFilter : '',
      pagination: !_.isEmpty(this.$store.state.admin.device.listPagination)
        ? this.$store.state.admin.device.listPagination
        : { sortBy: 'name' },
    };
  },
  created() {
    this.$store
      .dispatch('admin/device/getList')
      .catch((error) => {
        this.$q.notify({
          color: 'negative',
          message: error.message || error,
          icon: 'report_problem',
        });
      });
  },
  computed: {
    ...mapGetters('admin/device', ['entitiesToTree']),
    ...mapState('admin/device', {
      initialized: state => state.initialized,
      entityRows: state => state.entityRows,
      deviceRows: state => state.deviceRows,
    }),
    // Get row group by entity
    rowGroupByEntity() {
      return this.$refs && this.$refs.deviceTable
        ? _.groupBy(this.$refs.deviceTable.computedRows, r => r.parent_id) : [];
    },
  },
  methods: {
    hardwareIdToString(h) {
      // Device on database is stored on Int32 but we have to handle
      // it as UInt32. Next we output is as an hexadecimal string
      return utilsDevice.int32HardwareIdToHex(h);
    },
    // Get the name of an entity from its ID
    getEntityName(id) {
      const entity = this.entitiesToTree.hashIds[id];
      return typeof entity !== 'undefined' ? entity.name : '???';
    },
    getEntityRow(row, saveLastGroupRendered) {
      // Get row group for entity
      const g = this.rowGroupByEntity[row.parent_id];

      // Test if this row if the first of the group
      // Row with same group may have already been drawn by previous
      // iteration separated by different group. If it's the case, we
      // have to duplicate the group row.
      let ret = '';
      if ((g && g.length > 0 && row.id === g[0].id)
        || row.parent_id !== lastGroupIdRendered) {
        const parent = this.entitiesToTree.hashIds[row.parent_id];
        ret = utilsEntity.pathToString(parent);
      }
      if (!saveLastGroupRendered) {
        lastGroupIdRendered = row.parent_id;
      }
      return ret;
    },
    handleNew() {
      // Go to new device page
      this.$router.push('device/new');
    },
    handleEdit() {
      // Get selected row
      const selectedDevice = Object.keys(this.$refs.deviceTable.selectedKeys).map(key => key);

      // Go to delete page
      this.$router.push({ path: 'device/edit', query: { ids: selectedDevice.join(',') } });
    },
    handleDelete() {
      // Get selected row
      const selectedDevice = Object.keys(this.$refs.deviceTable.selectedKeys).map(key => key);

      // Go to delete page
      this.$router.push({ path: 'device/delete', query: { ids: selectedDevice.join(',') } });
    },
  },
  watch: {
    // Send datatable pagination change to store
    pagination: {
      handler(newPag) {
        if (this.initialized) {
          this.$store.commit('admin/device/listPaginationChanged', newPag);
        }
      },
      deep: true,
    },
    // Send datatable filter change to store
    filter(newFilter) {
      if (this.initialized) {
        this.$store.commit('admin/device/listFilterChanged', newFilter);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
</style>
