<template>

  <page-box v-if="listLoaded && listReportEntityLoaded" :title="$t('admin.report.entity.title',
    {name: reportTitle})" class="adminReportEntityBox">

    <div class="row relative-position row no-wrap items-center top-toolbar">
      <div class="row q-gutter-xs">

        <q-btn-dropdown ref="tickOperationBtn" icon="check"
          color="primary" :label="$t('admin.report.entity.tickOperation')" anchor="trop right">
          <q-list>
            <q-item clickable v-close-popup
              v-for="n in tickOperationOptionsAvailable" :key="n.value"
              @click.native="doTickOperation(n.value)">
              <q-item-section>
                <q-item-label>
                  {{ n.label }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

      </div>

      <div class="col"></div>

      <q-toggle
        v-model="keepTickedInSearch"
        :label="$t('admin.report.entity.keepTickedInSearch')" />

      <q-input
        class="q-ml-sm"
        v-model="treeFilter"
        debounce="500"
        placeholder="Search"
        clearable>
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <div class="entity-list scroll">
      <entity-list
        class="entity-list"
        ref="treeList"
        tick-mode="multiple"
        :selectable="true"
        :nodes-and-map-entity="treeOptions"
        :ticked-entity.sync="treeTicked"
        :filter="treeFilter"
        :filter-method="treeFilterMethod"
        :selectedEntity.sync="treeSelected">
      </entity-list>
    </div>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.report.entity.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="save" :disable="saveInProgress">{{ $t('admin.report.entity.save') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import EntityList from 'src/common/components/EntityList';
import { PageBox } from 'src/common/components/PageBox';
import utilsEntity from 'src/common/utils/entity';

export default {
  name: 'admin-report-entity',
  components: {
    EntityList,
    PageBox,
  },
  data() {
    // Rather then referencing the store by using a computed value,
    // we get the data by directly referencing the state otherwise the
    // computed properties have not been evaluated yet.
    return {
      saveInProgress: false,
      editKey: null,
      currentReport: null,
      reportTitle: '?',
      value: [],
      treeFilter: this.$store.state.admin.reportEntity.options.filter,
      treeOptions: {
        nodes: [],
        map: {},
      },
      keepTickedInSearch: this.$store.state.admin.reportEntity.options
        .keepEntityInSearch,
      treeTicked: [],
      treeSelected: null,
      tickOperationOptions: [
        {
          label: this.$t('admin.report.entity.topButtonTickAll'),
          value: 'tickAll',
          requiringSelectedNode: false,
        },
        {
          label: this.$t('admin.report.entity.topButtonUnTickAll'),
          value: 'unTickAll',
          requiringSelectedNode: false,
        },
        {
          label: this.$t('admin.report.entity.topButtonTickAllSibling'),
          value: 'tickAllSibling',
          requiringSelectedNode: true,
        },
        {
          label: this.$t('admin.report.entity.topButtonUnTickAllSibling'),
          value: 'unTickAllSibling',
          requiringSelectedNode: true,
        },
        {
          label: this.$t('admin.report.entity.topButtonTickAllChildren'),
          value: 'tickAllChildren',
          requiringSelectedNode: true,
        },
        {
          label: this.$t('admin.report.entity.topButtonUnTickAllChildren'),
          value: 'unTickAllChildren',
          requiringSelectedNode: true,
        },
        {
          label: this.$t('admin.report.entity.topButtonTickAllImmediateChildren'),
          value: 'tickAllImmediateChildren',
          requiringSelectedNode: true,
        },
        {
          label: this.$t('admin.report.entity.topButtonUnTickAllImmediateChildren'),
          value: 'unTickAllImmediateChildren',
          requiringSelectedNode: true,
        },
      ],
    };
  },
  created() {
    // Get route parameters and be sure we got a report id
    if (!this.$route.query || !this.$route.query.ids) {
      // Invalid parameters go back to report's list page
      this.$router.push({ path: 'report' });
      return;
    }

    // Extract route parameters and get report key
    this.editKey = parseInt(this.$route.query.ids, 10);
    if (Number.isNaN(this.editKey)) {
      // Invalid parameters go back to report's list page
      this.$router.push({ path: 'report' });
      return;
    }

    // If report list is not already loaded, load it
    let p;
    if (!this.listLoading && !this.listLoaded) {
      p = this.$store.dispatch('admin/report/getList');
    } else {
      p = Promise.resolve();
    }
    p
      .then(() => {
        // Find the report
        this.currentReport = this.reportRows.find(r => r.id === this.editKey);
        if (!this.currentReport) {
          // This report does not exists, go back to report's list page
          this.$router.push({ path: 'report' });
          throw new Error(this.$t('admin.report.entity.reportDoesNotExists'));
        }

        // Set page title
        this.reportTitle = this.currentReport.name;
      })
      .then(() => this.$store.dispatch('admin/reportEntity/list', this.currentReport))
      .then(() => {
        // Convert list of entity to a tree and map
        //  and set data it to QTree component
        const treeAndMap = utilsEntity.entityToTree(this.entityRows);
        this.treeOptions = {
          nodes: treeAndMap.tree,
          map: treeAndMap.hashIds,
        };

        // Ticked all entity already associated to this report
        const toTickKeys = [];
        for (let i = 0; i < this.entityRows.length; i += 1) {
          const e = this.entityRows[i];
          if (e.selected) {
            toTickKeys.push(e.id);
          }
        }
        this.treeTicked.splice(0, this.treeTicked.length, ...toTickKeys);

        // Auto expand selected entity
        this.$nextTick(() => {
          this.$refs.treeList.revealTicked();
        });
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
    ...mapState('admin/report', [
      'reportRows',
      'listLoading',
      'listLoaded',
    ]),
    ...mapState('user', {
      userId: state => state.userId,
    }),
    ...mapGetters('admin/reportEntity', ['entitiesListToTree']),
    ...mapState('admin/reportEntity', {
      initialized: state => state.initialized,
      listReportEntityLoaded: state => state.listLoaded,
      entityRows: state => state.entityRows,
    }),
    tickOperationOptionsAvailable() {
      // Return available tick operation according current tree state
      return this.tickOperationOptions
        .filter((x) => {
          if (x.requiringSelectedNode) {
            return this.treeSelected !== null && typeof this.treeSelected === 'number';
          }
          return true;
        });
    },
  },
  // Before entering in the admin/report entity zone,
  // initialize the store admin/reportEntity entity store
  beforeRouteEnter(to, from, next) {
    next(vm => vm.initialize(vm.userId));
  },
  // Before leaving in the admin/report entity zon,
  // uninitialize the store admin/reportEntity on store
  beforeRouteLeave(to, from, next) {
    this.unInitialize().then(() => next());
  },
  methods: {
    ...mapActions('admin/reportEntity', ['initialize', 'unInitialize']),
    updatePageOptions() {
      // Save pages options (filter, state, etc...)
      this.$store.commit('admin/reportEntity/optionsChanged', {
        keepEntityInSearch: this.keepTickedInSearch,
        filter: this.treeFilter,
      });
    },
    doTickOperation(op) {
      this.$refs.treeList[op]();
      this.$refs.tickOperationBtn.hide();
    },
    treeFilterMethod(node, filter) {
      // We want to keep the ticked node into the result
      return (
        (this.keepTickedInSearch && this.treeTicked.includes(node.id))
        || node.name.search(new RegExp(filter, 'i')) !== -1
      );
    },
    handleCancel() {
      this.$router.push({ path: '.' });
    },
    treeTickAll() {
      this.$refs.treeList.tickAll();
    },
    treeUnTickAll() {
      this.$refs.treeList.unTickAll();
    },
    treeTickAllSiblingOfSelected() {
      this.$refs.treeList.tickAllSiblingOfSelected();
    },
    treeUnTickAllSiblingOfSelected() {
      this.$refs.treeList.unTickAllSiblingOfSelected();
    },
    treeTickAllChildrenOfSelected() {
      this.$refs.treeList.tickAllChildrenOfSelected();
    },
    treeUnTickAllChildrenOfSelected() {
      this.$refs.treeList.unTickAllChildrenOfSelected();
    },
    save() {
      // Send request to store
      this.saveInProgress = true;
      const d = {
        id: this.currentReport.id,
        updated_at: this.currentReport.updated_at,
        entities: this.treeTicked,
      };
      this.$store
        .dispatch('admin/reportEntity/save', d)
        .then(() => {
          // Warn with a positive toast
          const t = this.$t('admin.report.entity.reportEntityEditedSuccessfully', {
            name: this.currentReport.name,
          });
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: t,
            icon: 'thumb_up',
          });

          // Go back to report's list page
          this.$router.push({ path: '.' });
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
  },
  watch: {
    // Send tree filter change to store
    keepTickedInSearch() {
      this.updatePageOptions();
    },
    treeFilter() {
      this.updatePageOptions();
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminReportEntityBox {
  max-width: 70rem;
  margin: 0 auto;

  .entity-list {
    margin-top: 1rem;
    height: 50vh;
  }
}
</style>
