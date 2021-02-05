<template>
  <div class="entity-list">

    <q-tree
      ref="tree"
      node-key="id"
      :nodes="nodesAndMapEntity.nodes"
      :selected.sync="internalSelectedEntity"
      tick-strategy="strict"
      :ticked.sync="internalTickedEntity"
      :expanded.sync="internalExpandedEntity"
      :accordion="accordion"
      :filter="filter"
      :filter-method="filterMethod"
      selected-color="secondary"
    >
      <div slot="default-header" slot-scope="props">
        {{ props.node.name }}
      </div>
    </q-tree>

  </div>
</template>

<script>
const tickModes = ['none', 'single', 'multiple'];

export default {
  name: 'entity-list',
  components: {
  },
  props: {
    tickMode: {
      type: String,
      default: () => 'none',
      validator: v => tickModes.includes(v),
    },
    accordion: {
      type: Boolean,
      default: () => false,
    },
    filter: {
      type: String,
      default: () => null,
    },
    filterMethod: {
      type: Function,
    },
    nodesAndMapEntity: {
      type: Object,
      required: true,
      validator: v => v !== null
        && typeof v === 'object'
        && Array.isArray(v.nodes)
        && v.map !== null
        && typeof v.map === 'object',
    },
    tickedEntity: {
      type: Array,
      default: () => [],
    },
    selectedEntity: {
      type: [Object, Number],
      default: () => null,
    },
    selectable: {
      type: Boolean,
      default: () => true,
    },
    expandedEntity: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      internalTickedEntity: this.tickedEntity.slice(0) || [],
      internalSelectedEntity: this.selectable ? this.selectedEntity || null : undefined,
      internalExpandedEntity: this.expandedEntity.slice(0) || [],
    };
  },
  methods: {
    $gatherChildrenNodes(acc, nodes) {
      // Gather all children of a node
      if (Array.isArray(nodes)) {
        nodes.forEach((node) => {
          if (node.children) {
            this.$gatherChildrenNodes(acc, node.children);
          }
          acc.push(node.id);
        });
      }
      return acc;
    },
    revealTicked() {
      // Expand all ticked node's and their parent up to root and set ticked nodes
      if (this.tickMode !== 'none' && this.internalTickedEntity.length > 0) {
        const e = this.tickMode === 'single'
          ? [this.internalTickedEntity[0]]
          : this.internalTickedEntity;
        for (let i = 0; i < e.length; i += 1) {
          let ep = this.nodesAndMapEntity.map[e[i]].parent;
          while (ep) {
            this.internalExpandedEntity.push(ep.id);
            ep = ep.parent;
          }
        }
        this.$emit('update:expandedEntity', this.internalExpandedEntity);
      }
    },
    clearSelected() {
      // Clear selected entity
      if (this.selectable) {
        this.internalSelectedEntity = null;
        this.$emit('update:selectedEntity', this.selectedEntity);
      }
    },
    clearTicked() {
      // Clear selected nodes
      if (this.tickMode !== 'none') {
        this.internalTickedEntity.splice(0, this.internalTickedEntity.length);
        this.$emit('update:tickedEntity', this.internalTickedEntity);
      }
    },
    tickAll() {
      // Tick all nodes
      if (this.$mapEntityKeys.length > 0) {
        let toTickKeys = [];
        if (this.tickMode === 'single') {
          [toTickKeys] = this.$mapEntityKeys;
        } else if (this.tickMode === 'multiple') {
          toTickKeys = this.$mapEntityKeys;
        }
        this.internalTickedEntity.splice(
          0,
          this.internalTickedEntity.length,
          ...toTickKeys.map(k => this.nodesAndMapEntity.map[k].id),
        );
        this.$emit('update:tickedEntity', this.internalTickedEntity);
      }
    },
    unTickAll() {
      // Untick all nodes
      if (this.tickMode !== 'none') {
        this.internalTickedEntity.splice(0, this.internalTickedEntity.length);
        this.$emit('update:tickedEntity', this.internalTickedEntity);
      }
    },
    tickAllSibling() {
      // Tick all sibling of the selected node
      if (typeof this.internalSelectedEntity === 'number' && this.$mapEntityKeys.length > 0) {
        const et = this.nodesAndMapEntity.map[this.internalSelectedEntity];
        let toTickKeys = [];
        if (et.parent) {
          toTickKeys = et.parent.children.map(x => x.id);
        } else {
          toTickKeys = this.nodesAndMapEntity.nodes.map(x => x.id);
        }
        if (this.tickMode === 'single') {
          toTickKeys.slice(0, 1);
        }
        toTickKeys = toTickKeys.filter(f => !this.internalTickedEntity.includes(f));
        this.internalTickedEntity.splice(
          0,
          this.internalTickedEntity.length,
          ...this.internalTickedEntity.concat(toTickKeys),
        );
        this.$emit('update:tickedEntity', this.internalTickedEntity);
      }
    },
    unTickAllSibling() {
      // Untick all sibling of the selected node
      if (typeof this.internalSelectedEntity === 'number' && this.$mapEntityKeys.length > 0) {
        const et = this.nodesAndMapEntity.map[this.internalSelectedEntity];
        let toUnTickKeys = [];
        if (et.parent) {
          toUnTickKeys = et.parent.children.map(x => x.id);
        } else {
          toUnTickKeys = this.nodesAndMapEntity.nodes.map(x => x.id);
        }
        this.internalTickedEntity.splice(
          0,
          this.internalTickedEntity.length,
          ...this.internalTickedEntity.filter(x => !toUnTickKeys.includes(x)),
        );
        this.$emit('update:tickedEntity', this.internalTickedEntity);
      }
    },
    tickAllChildren() {
      // Tick all children of the selected node
      if (typeof this.internalSelectedEntity === 'number' && this.$mapEntityKeys.length > 0) {
        const et = this.nodesAndMapEntity.map[this.internalSelectedEntity];
        if (Array.isArray(et.children) && et.children.length > 0) {
          let toTickKeys = [];
          if (this.tickMode === 'single') {
            toTickKeys = et.children[0].id;
          } else if (this.tickMode === 'multiple') {
            toTickKeys = this.$gatherChildrenNodes([], et.children);
          }
          toTickKeys = toTickKeys.filter(f => !this.internalTickedEntity.includes(f));
          this.internalTickedEntity.splice(
            0,
            this.internalTickedEntity.length,
            ...this.internalTickedEntity.concat(toTickKeys),
          );
          this.$emit('update:tickedEntity', this.internalTickedEntity);
        }
      }
    },
    unTickAllChildren() {
      // Untick all children of the selected node
      if (typeof this.internalSelectedEntity === 'number' && this.$mapEntityKeys.length > 0) {
        const et = this.nodesAndMapEntity.map[this.internalSelectedEntity];
        if (Array.isArray(et.children) && et.children.length > 0) {
          const toUnTickKeys = this.$gatherChildrenNodes([], et.children);
          this.internalTickedEntity.splice(
            0,
            this.internalTickedEntity.length,
            ...this.internalTickedEntity.filter(x => !toUnTickKeys.includes(x)),
          );
          this.$emit('update:tickedEntity', this.internalTickedEntity);
        }
      }
    },
    tickAllImmediateChildren() {
      // Tick all immediate children of the selected node
      if (typeof this.internalSelectedEntity === 'number' && this.$mapEntityKeys.length > 0) {
        const et = this.nodesAndMapEntity.map[this.internalSelectedEntity];
        if (Array.isArray(et.children) && et.children.length > 0) {
          let toTickKeys = [];
          if (this.tickMode === 'single') {
            toTickKeys = et.children[0].id;
          } else if (this.tickMode === 'multiple') {
            toTickKeys = et.children.map(k => k.id);
          }
          toTickKeys = toTickKeys.filter(f => !this.internalTickedEntity.includes(f));
          this.internalTickedEntity.splice(
            0,
            this.internalTickedEntity.length,
            ...this.internalTickedEntity.concat(toTickKeys),
          );
          this.$emit('update:tickedEntity', this.internalTickedEntity);
        }
      }
    },
    unTickAllImmediateChildren() {
      // Untick all immediate children of the selected node
      if (typeof this.internalSelectedEntity === 'number' && this.$mapEntityKeys.length > 0) {
        const et = this.nodesAndMapEntity.map[this.internalSelectedEntity];
        if (Array.isArray(et.children) && et.children.length > 0) {
          const toUnTickKeys = et.children.map(x => x.id);
          this.internalTickedEntity.splice(
            0,
            this.internalTickedEntity.length,
            ...this.internalTickedEntity.filter(x => !toUnTickKeys.includes(x)),
          );
          this.$emit('update:tickedEntity', this.internalTickedEntity);
        }
      }
    },
  },
  computed: {
    $mapEntityKeys() {
      // Get all keys of entities'map into an array
      return Object.keys(this.nodesAndMapEntity.map);
    },
  },
  watch: {
    selectable(val) {
      // When selectedable mode change, validate internal selected entity
      this.internalSelectedEntity = val ? this.internalSelectedEntity || null : undefined;
      this.$emit('update:selectedEntity', this.internalSelectedEntity);
    },
    internalTickedEntity: {
      handler(newVal) {
        // When in single mode, keep only the first ticked item
        if (this.tickMode === 'single' && newVal.length > 1) {
          this.internalTickedEntity.splice(0, this.internalTickedEntity.length - 1);
          return;
        }
        this.$emit('update:tickedEntity', this.internalTickedEntity);
      },
    },
    internalSelectedEntity() {
      this.$emit('update:selectedEntity', this.internalSelectedEntity);
    },
    internalExpandedEntity() {
      this.$emit('update:expandedEntity', this.internalExpandedEntity);
    },
    tickedEntity(val) {
      this.internalTickedEntity = val;
    },
    selectedEntity(val) {
      this.internalSelectedEntity = val;
    },
    expandedEntity(val) {
      this.internalExpandedEntity = val;
    },
  },
};
</script>

<style lang="stylus" scoped>
.entity-list {
}
</style>
