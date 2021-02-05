<template>

  <!-- Page container -->
  <page-box :title="$t('admin.entity.list.title')" class="adminEntityList">

    <div class="row q- relative-position no-wrap items-center top-toolbar"
      v-if="initialized && listLoaded">

      <div class="row q-gutter-xs">
        <q-btn-dropdown ref="tickOperationBtn" icon="check"
          color="primary" :label="$t('admin.entity.list.editionOperation')" anchor="trop right">
          <q-list>
            <q-item clickable v-close-popup
              v-for="n in editionOperationOptionsAvailable" :key="n.value"
              @click.native="doEditionOperation(n.value)">
              <q-item-section>
                <q-item-label>
                  {{ n.label }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn-dropdown ref="tickOperationBtn" icon="check"
          color="primary" :label="$t('admin.entity.list.tickOperation')" anchor="trop right">
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

        <q-btn color="secondary" icon="accessibility"
          :label="$t('admin.entity.list.topButtonUser')"
          :disable="treeTicked.length !== 1" @click="handleUser">
        </q-btn>

        <q-btn color="negative" icon="notification_important"
          :label="$t('admin.entity.list.topButtonNotification')"
          :disable="treeTicked.length !== 1" @click="handleNotifications">
        </q-btn>
      </div>

      <div class="col"></div>

      <q-toggle
        v-model="keepTickedInSearch"
        :label="$t('admin.entity.list.keepTickedInSearch')" />

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
        :expanded-entity.sync="treeExpanded"
        :filter="treeFilter"
        :filter-method="treeFilterMethod"
        :selectedEntity.sync="treeSelected">
      </entity-list>
    </div>

  </page-box>

</template>

<script>
import EntityList from 'src/common/components/EntityList';
import { mapState, mapGetters } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';

export default {
  components: {
    EntityList,
    PageBox,
  },
  name: 'admin-entity-list',
  data() {
    // Rather then referencing the store by using a computed value,
    // we get the data by directly referencing the state otherwise the
    // computed properties have not been evaluated yet.
    return {
      treeFilter: this.$store.state.admin.entity.options.filter || '',
      keepTickedInSearch: this.$store.state.admin.entity.options.keepEntityInSearch || false,
      treeOptions: {
        nodes: [],
        map: {},
      },
      treeTicked: [],
      treeExpanded: this.$store.state.admin.entity.options.expanded || [],
      treeSelected: null,
      tickOperationOptions: [
        {
          label: this.$t('admin.entity.list.topButtonTickAll'),
          value: 'tickAll',
          requiringSelectedNode: false,
        },
        {
          label: this.$t('admin.entity.list.topButtonUnTickAll'),
          value: 'unTickAll',
          requiringSelectedNode: false,
        },
        {
          label: this.$t('admin.entity.list.topButtonTickAllSibling'),
          value: 'tickAllSibling',
          requiringSelectedNode: true,
        },
        {
          label: this.$t('admin.entity.list.topButtonUnTickAllSibling'),
          value: 'unTickAllSibling',
          requiringSelectedNode: true,
        },
        {
          label: this.$t('admin.entity.list.topButtonTickAllChildren'),
          value: 'tickAllChildren',
          requiringSelectedNode: true,
        },
        {
          label: this.$t('admin.entity.list.topButtonUnTickAllChildren'),
          value: 'unTickAllChildren',
          requiringSelectedNode: true,
        },
        {
          label: this.$t('admin.entity.list.topButtonTickAllImmediateChildren'),
          value: 'tickAllImmediateChildren',
          requiringSelectedNode: true,
        },
        {
          label: this.$t('admin.entity.list.topButtonUnTickAllImmediateChildren'),
          value: 'unTickAllImmediateChildren',
          requiringSelectedNode: true,
        },
      ],
      editionOperations: [
        {
          label: this.$t('admin.entity.list.editionOperationAddRoot'),
          value: 'addRoot',
          requiringNoTickNode: true,
        },
        {
          label: this.$t('admin.entity.list.editionOperationAddSibling'),
          value: 'addSibling',
          requiringTickedNode: { min: 1, max: 1 },
        },
        {
          label: this.$t('admin.entity.list.editionOperationAddChildren'),
          value: 'addChildren',
          requiringTickedNode: { min: 1, max: 1 },
        },
        {
          label: this.$t('admin.entity.list.editionOperationEdit'),
          value: 'edit',
          requiringTickedNode: { min: 1, max: 1 },
        },
        {
          label: this.$t('admin.entity.list.editionOperationDelete'),
          value: 'delete',
          requiringTickedNode: { min: 1, max: Number.MAX_VALUE },
        },
      ],
    };
  },
  created() {
    // Initialize the store
    this.$store.dispatch('admin/entity/initialize')
      .then(() => this.$store.dispatch('admin/entity/getList'))
      .then(() => {
        // Initialize tree
        this.treeOptions = {
          nodes: this.entitiesToTree.tree,
          map: this.entitiesToTree.hashIds,
        };
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
    ...mapState('admin/entity', {
      initialized: state => state.initialized,
      listLoading: state => state.listLoading,
      listLoaded: state => state.listLoaded,
    }),
    ...mapGetters('admin/entity', ['entitiesToTree']),
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
    editionOperationOptionsAvailable() {
      // Return available edition operation according current tree state
      return this.editionOperations
        .filter((x) => {
          if (x.requiringNoTickNode && this.treeTicked.length <= 0) {
            return true;
          }
          if (x.requiringTickedNode) {
            return this.treeTicked.length ? this.treeTicked.length >= x.requiringTickedNode.min
                && this.treeTicked.length <= x.requiringTickedNode.max : false;
          }
          return false;
        });
    },
  },
  methods: {
    updatePageOptions() {
      // Save pages options (filter, state, etc...)
      this.$store.commit('admin/entity/optionsChanged', {
        keepEntityInSearch: this.keepTickedInSearch,
        filter: this.treeFilter,
        expanded: this.treeExpanded,
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
    doEditionOperation(op) {
      if (op === 'addRoot') {
        this.handleAddRoot();
      } else if (op === 'addSibling') {
        this.handleAddChildrenOrSibling('s');
      } else if (op === 'addChildren') {
        this.handleAddChildrenOrSibling('c');
      } else if (op === 'edit') {
        this.handleEdit();
      } else if (op === 'delete') {
        this.handleDelete();
      }
    },
    handleAddRoot() {
      // Go to new entity page for adding a new root
      this.$router.push({ path: 'entity/new', query: { op: 'r' } });
    },
    handleAddChildrenOrSibling(op) {
      // Get parent Id of selected node
      const et = this.entitiesToTree.hashIds[this.treeTicked];

      // Go to new entity page for adding a new root
      this.$router.push({
        path: 'entity/new',
        query: {
          op,
          eid: et.id,
        },
      });
    },
    handleEdit() {
      // Go to edit page
      this.$router.push({ path: 'entity/edit', query: { id: this.treeTicked[0] } });
    },
    handleDelete() {
      // Go to delete page
      this.$router.push({ path: 'entity/delete', query: { ids: this.treeTicked.join(',') } });
    },
    handleUser() {
      // Go to user page
      this.$router.push({ path: 'entity/user', query: { id: this.treeTicked[0] } });
    },
    // Go to notification page
    handleNotifications() {
      this.$router.push({ path: 'entity/notification', query: { id: this.treeTicked[0] } });
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
    treeExpanded() {
      this.updatePageOptions();
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminEntityList {
  max-width: 96rem;
  margin: 0 auto;

  .entity-list {
    margin-top: 1rem;
    height: 70vh;
  }
}
</style>
