<template>

  <!-- Page container -->
  <page-box :title="$t('admin.poultryCurve.list.title')">

    <!-- Curve's list -->
    <q-table
      ref="curveTable"
      selection="multiple"
      row-key="id"
      class="no-shadow full-width"
      :pagination.sync="pagination"
      :columns="columns"
      :data="curveRows"
      :selected.sync="selected"
      :filter="filter">

      <!-- Top left button -->
      <template slot="top-left">
        <div class="row q-gutter-xs">
          <q-btn color="primary" icon="mode_edit"
            :label="$t('admin.poultryCurve.list.topButtonEdit')"
          :disable="selected.length !== 1" @click="handleEdit" />
          <q-btn color="secondary" icon="add"
            :label="$t('admin.poultryCurve.list.topButtonNew')"
            :disable="selected.length > 0" @click="handleNew" />
          <q-btn color="secondary" icon="filter"
            :label="$t('admin.poultryCurve.list.topButtonClone')"
            :disable="selected.length !== 1" @click="handleClone" />
          <q-btn color="negative" icon="delete_forever"
            :label="$t('admin.poultryCurve.list.topButtonDelete')"
            :disable="selected.length < 1 || selectionContainsComplete()"
            @click="handleDelete" />
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

        <!-- Columns -->
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" />
          </q-td>
          <q-td key="id" :props="props">{{ props.row.id }}</q-td>
          <q-td key="name" :props="props">{{ props.row.name }}</q-td>
          <q-td key="description" :props="props" v-html="getBreakedText(props.row.desc)"/>
          <q-td key="state" :props="props">{{ props.row.locale_state_name }}</q-td>
          <q-td key="visibility" :props="props">{{ props.row.locale_visibility_name }}</q-td>
          <q-td key="author" :props="props">{{ getFullUserNameOfAuthor(props.row) }}</q-td>
        </q-tr>
      </template>

    </q-table>

  </page-box>

</template>

<script>
import { mapState } from 'vuex';
import _ from 'lodash';
import utilsUser from 'src/common/utils/user';
import { PageBox } from 'src/common/components/PageBox';

export default {
  components: {
    PageBox,
  },
  name: 'admin-poultry-curve-list',
  data() {
    return {
      columns: [
        {
          name: 'id',
          required: true,
          label: this.$t('admin.poultryCurve.list.columnId'),
          align: 'right',
          field: 'id',
          sortable: true,
        },
        {
          name: 'name',
          required: true,
          label: this.$t('admin.poultryCurve.list.columnName'),
          align: 'left',
          field: 'name',
          sortable: true,
        },
        {
          name: 'description',
          required: true,
          label: this.$t('admin.poultryCurve.list.columnDescription'),
          align: 'left',
          field: 'desc',
          sortable: true,
          format: val => this.getBreakedText(val),
        },
        {
          name: 'state',
          label: this.$t('admin.poultryCurve.list.columnState'),
          align: 'left',
          field: 'locale_state_name',
          sortable: true,
        },
        {
          name: 'visibility',
          label: this.$t('admin.poultryCurve.list.columnVisibility'),
          align: 'left',
          field: 'locale_visibility_name',
          sortable: true,
        },
        {
          name: 'author',
          label: this.$t('admin.poultryCurve.list.columnAuthor'),
          align: 'left',
          field: row => this.getFullUserNameOfAuthor(row),
          sortable: true,
        },
      ],
      selected: [],
      filter: !_.isEmpty(this.$store.state.admin.poultryCurve.listFilter)
        ? this.$store.state.admin.poultryCurve.listFilter : '',
      pagination: !_.isEmpty(this.$store.state.admin.poultryCurve.listPagination)
        ? this.$store.state.admin.poultryCurve.listPagination
        : { sortBy: 'name' },
      curveStateEnum: {
        Incomplete: 1,
        Complete: 2,
      },
    };
  },
  created() {
    this.$store
      .dispatch('admin/poultryCurve/getList', {
        loadingMessage: this.$t('admin.poultryCurve.list.loadingMessage'),
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
    ...mapState('admin/poultryCurve', {
      initialized: state => state.initialized,
      curveRows: state => state.curveRows,
    }),
  },
  methods: {
    /**
     * Transform any line break to return <br> instead to render properly
     *
     * @param {String} text text to transform.
     * @returns {String} transformed text that include <br>
     */
    getBreakedText(text) {
      return text.replace(/(?:\r\n|\r|\n)/g, '<br>');
    },
    getFullUserNameOfAuthor(userRow) {
      // From database row, return full user name of the author
      return utilsUser.databaseUserToFullName(userRow);
    },
    handleNew() {
      // Go to new poultry curve page
      this.$router.push('poultry-curve/new');
    },
    handleClone() {
      // Get selected row
      const selectedDevice = Object.keys(this.$refs.curveTable.selectedKeys).map(key => key);

      // Go to clone page
      this.$router.push({ path: 'poultry-curve/new', query: { id: selectedDevice[0] } });
    },
    handleEdit() {
      // Get selected row
      const selectedDevice = Object.keys(this.$refs.curveTable.selectedKeys).map(key => key);

      // Go to edit page
      this.$router.push({ path: 'poultry-curve/edit', query: { id: selectedDevice[0] } });
    },
    handleDelete() {
      // Get selected rows
      const selectedDevice = Object.keys(this.$refs.curveTable.selectedKeys).map(key => key);

      // Go to delete page
      this.$router.push({ path: 'poultry-curve/delete', query: { ids: selectedDevice.join(',') } });
    },
    /**
     * Check whether selection contains any complete curve
     *
     * @returns {Boolean} true if there is at least one selected curve that is complete
     */
    selectionContainsComplete() {
      const complete = _(this.selected)
        .find(curve => curve.state_id === this.curveStateEnum.Complete);
      return typeof complete !== 'undefined';
    },
  },
  watch: {
    // Send datatable pagination change to store
    pagination: {
      handler(newPag) {
        if (this.initialized) {
          this.$store.commit('admin/poultryCurve/listPaginationChanged', newPag);
        }
      },
      deep: true,
    },
    // Send datatable filter change to store
    filter(newFilter) {
      if (this.initialized) {
        this.$store.commit('admin/poultryCurve/listFilterChanged', newFilter);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
