<template>
  <q-page padding>

    <!-- Page container -->
    <page-box-container v-if="initialized === true">
      <page-box :title="$t('admin.tags.title')">

        <q-table
          class="no-shadow sticky-header-column"
          row-key="tagName"
          :data="tagList"
          :columns="columns"
          :pagination.sync="pagination"
          :rows-per-page-options="[0]"
          :filter="filter">

          <template slot="top">
            <!-- Top template -->
            <div class="column items-center justify-end full-width">
              <div class="row items-center justify-end full-width q-pb-xs">

                <div class="col-auto">
                  <!-- Table search input -->
                  <q-input
                    v-model="filter"
                    outlined
                    dense
                    debounce="500"
                    :placeholder="$t('admin.tags.search')"
                    clearable>
                    <template v-slot:append>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>

              </div>
            </div>
          </template>

          <!-- Table header cells -->
          <template v-slot:header-cell="props">
            <q-th :props="props">
              {{ props.col.label }}
            </q-th>
          </template>

          <!-- Override the default body-cell display for the graphable column's cells -->
          <template v-slot:body-cell-graphable="props">
            <q-td :props="props">
              <q-icon size="sm"
                :name="props.value">
              </q-icon>
             </q-td>
          </template>
        </q-table>

      </page-box>
    </page-box-container>

  </q-page>

</template>

<script>
import { mapState, mapActions } from 'vuex';
import { PageBoxContainer, PageBox } from 'src/common/components/PageBox';
import { dom } from 'quasar';
import UtilUnit from 'src/common/utils/unit';

export default {
  components: {
    PageBoxContainer,
    PageBox,
  },
  name: 'admin-tags-list',
  data() {
    return {
      // Table options
      pagination: {
        sortBy: 'tag_name_locale',
        page: 1,
        rowsPerPage: 0,
      },

      columns: [
        // Column object definition
        {
          name: 'id',
          label: this.$t('admin.tags.columnTagId'),
          align: 'left',
          field: 'id',
          sortable: true,
        },
        {
          name: 'tag',
          label: this.$t('admin.tags.columnTagName'),
          align: 'left',
          field: 'tag',
          sortable: true,
        },
        {
          name: 'tag_name_locale',
          label: this.$t('admin.tags.columnTagNameLocal'),
          align: 'left',
          field: 'tag_name_locale',
          sortable: true,
        },
        {
          name: 'unitContext',
          label: this.$t('admin.tags.columnUnitContext'),
          align: 'left',
          field: row => this.getUnitContextField(row.unit_context_id),
          sortable: true,
        },
        {
          name: 'unitCategory',
          label: this.$t('admin.tags.columnUnitCategory'),
          align: 'left',
          field: row => this.getUnitCategoryField(row.unit_context_id),
          sortable: true,
        },
        {
          name: 'unitDefault',
          label: this.$t('admin.tags.columnUnitDefault'),
          align: 'left',
          field: row => this.getUnitDefaultField(row.unit_context_id),
          sortable: true,
        },
        {
          name: 'graphable',
          label: this.$t('admin.tags.columnGraphable'),
          align: 'center',
          field: 'graphable',
          sortable: true,
          format: val => (val === true ? 'far fa-check-square' : 'far fa-square'),
        },
      ],
      filter: '',
    };
  },
  // Before leaving this page, uninitialize the tags store
  beforeRouteLeave(to, from, next) {
    this.unInitialize().then(() => next());
  },
  created() {
    // Initialize the tags store
    this.initialize()
      // Get the available tag list
      .then(() => this.getTagList())
      .catch((error) => {
        this.$q.notify({
          color: 'negative',
          message: error.message || error,
          icon: 'report_problem',
        });
      });

    // Setup a dynamic watcher on the screen height value
    this.$watch('$q.screen.height', () => {
      // Wait for a DOM update cycle and then re-adjust the table scrollable height
      this.$nextTick(() => {
        this.adjustTableScrollableHeight();
      });
    });
  },
  computed: {
    ...mapState('admin/tags', [
      'initialized',
      'tagList',
      'tagListLoaded',
    ]),
  },
  methods: {
    ...mapActions('admin/tags', [
      'initialize',
      'unInitialize',
      'getTagList',
    ]),
    // Set height of the scrollable part of the table.
    adjustTableScrollableHeight() {
      // Get all DOM elements required to computed the height of the
      // scrollable element of the table
      const layoutQPage = document.querySelector('.q-page');
      const tableBottom = document.querySelector('.q-table__bottom');
      const tableMiddleScroll = document.querySelector('.q-table__middle');
      const tableHeader = tableMiddleScroll.querySelector('thead');
      if (layoutQPage === null
        || tableBottom === null
        || tableMiddleScroll === null
        || tableHeader === null) {
        return;
      }

      // Compute the new height
      const tableOffset = dom.offset(tableHeader);
      const tableBottomHeight = dom.height(tableBottom);
      const tableHeaderHeight = dom.height(tableHeader);
      const layoutHeader = document.querySelector('#main-layout-header');
      const layoutHeaderHeight = dom.height(layoutHeader);
      const layoutQPageHeight = Number.parseFloat(dom.style(layoutQPage, 'min-height'));
      const layoutQPageComputedStyle = window.getComputedStyle(layoutQPage, null);
      const layoutQPagePadding = Number.parseFloat(
        layoutQPageComputedStyle.getPropertyValue('padding-top'),
      );
      let newSize = layoutQPageHeight
        - (tableOffset.top - layoutHeaderHeight)
        - tableBottomHeight
        - (layoutQPagePadding * 2);

      // Get a list of table row nodes
      const tableContentRow = tableMiddleScroll.querySelector('tbody').querySelectorAll('tr');
      // Minimum number of row to display. The default value is 5.
      const minRowToDisplay = tableContentRow.length > 5
        ? 5
        : tableContentRow.length;
      // Get the height of a single row
      const rowHeight = tableContentRow.length >= 1
        ? dom.height(tableContentRow[0])
        : 0;
      // Make sure the table height can display all of its rows up to a maximum of 5
      if (newSize < (minRowToDisplay * rowHeight + tableHeaderHeight)) {
        newSize = minRowToDisplay * rowHeight + tableHeaderHeight;
      }

      // Set new height
      dom.css(tableMiddleScroll, {
        'max-height': `${newSize}px`,
      });
    },
    getUnitContextField(unitContextID) {
      return UtilUnit
        .getUnitConverterFromUnitContextID(unitContextID)
        .getUnitContext().nameLocale;
    },
    getUnitCategoryField(unitContextID) {
      return UtilUnit
        .getUnitConverterFromUnitContextID(unitContextID)
        .getUnitCategory().nameLocale;
    },
    getUnitDefaultField(unitContextID) {
      const unitConverter = UtilUnit.getUnitConverterFromUnitContextID(unitContextID);
      const userUnit = unitConverter.getUserUnit();
      const symbol = (userUnit.symbol.length > 0) ? ` (${userUnit.symbol})` : '';

      return `${userUnit.nameLocale}${symbol}`;
    },
  },
  mounted() {
    // Wait for a DOM update cycle and then re-adjust the table scrollable height
    this.$nextTick(() => {
      this.adjustTableScrollableHeight();
    });
  },
  watch: {
    filter() {
      // Make sure the tags are loaded
      if (this.initialized === true && this.listTagLoaded === true) {
        // Re-adjust the table scrollable height when the search field content change
        // Wait for a DOM update cycle and then re-adjust the table scrollable height
        this.$nextTick(() => {
          this.adjustTableScrollableHeight();
        });
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.sticky-header-column {
  max-width: 100%;

  tr:first-child th {
    background-color: $page-container-background;
    position: sticky;
    top: 0;
    // Opacity is important to not display the other rows through the header
    opacity: 1;
    z-index: 1;
  }
}

.q-table__container >>> .q-table__top {
  padding-top: 0;
  padding-bottom: 0;
}
</style>
