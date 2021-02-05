<template>
  <div>
    <slot :selectedPath="selectedPath" :show="show" :hide="hide">
      <q-input v-model="selectedPath" readonly
        @click="$refs.pathModal.show()"
        @keyup="$refs.pathModal.show()"
      />
    </slot>

    <q-dialog
      ref="pathModal"
      :content-css="{padding: '50px', minWidth: '50vw', minHeight: '80vh'}"
      @show="$setEnterKeyHandler"
      @hide="$removeEnterKeyHandler"
      :persistent="true">
      <q-layout view="lHh lpr lFf" container class="bg-color">

        <q-header elevated>
          <q-toolbar class="glossy">
            <q-toolbar-title>{{ title }}</q-toolbar-title>
          </q-toolbar>
        </q-header>

        <q-page-container class="page-box-container-bg">
          <q-page class="q-pa-md">
            <entity-list
              class="entity-list"
              ref="treeList"
              :tick-mode="selectMode"
              :selectable="selectable"
              :nodes-and-map-entity="internalTreeOptions"
              :ticked-entity.sync="internalTickedEntity"
              :accordion="true">
            </entity-list>
          </q-page>
        </q-page-container>

        <q-footer>
          <q-toolbar class="glossy">
            <div class="row q-gutter-xs full-width justify-end">
              <q-btn color="accent" @click="$refs.treeList.clearTicked()">
                {{ $t('common.components.entitySelector.clearTick') }}
              </q-btn>
              <q-btn color="secondary" @click="$refs.pathModal.hide()">
                {{ $t('common.components.entitySelector.cancel') }}
              </q-btn>
              <q-btn color="primary" @click="$handleAccept">
                {{ $t('common.components.entitySelector.accept') }}
              </q-btn>
            </div>
          </q-toolbar>
        </q-footer>

      </q-layout>
    </q-dialog>

  </div>
</template>

<script>
import utilsEntity from 'src/common/utils/entity';
import EntityList from '../EntityList';

const selectModes = ['single', 'multiple'];

export default {
  name: 'entity-selector',
  components: {
    EntityList,
  },
  props: {
    title: {
      type: String,
      default: () => 'Select an entity',
    },
    selectMode: {
      type: String,
      default: () => 'single',
      validator: v => selectModes.includes(v),
    },
    treeOptions: {
      type: Object,
      required: true,
    },
    tickedEntity: {
      type: [Array],
      default: () => [],
    },
    selectable: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      internalTreeOptions: this.treeOptions,
      internalTickedEntity: this.tickedEntity.slice(0),
    };
  },
  methods: {
    // Event triggered when the <enter> key is pressed
    $onEnterKeyUp(evt) {
      if (evt.which === 13 || evt.keyCode === 13) {
        this.$handleAccept();
      }
    },
    // Set <enter> handler to accept and close modal box
    $setEnterKeyHandler() {
      document.addEventListener('keyup', this.$onEnterKeyUp);
    },
    // Remove <enter> handler
    $removeEnterKeyHandler() {
      document.removeEventListener('mousemove', this.$onEnterKeyUp);
    },
    $handleAccept() {
      // Update tickedEntity prop
      this.$emit('update:tickedEntity', this.internalTickedEntity);

      // Close modal
      this.hide();
    },
    show() {
      // Show modal path selector
      if (this.$refs.pathModal) {
        this.$refs.pathModal.show();

        // When the modal is showing, restore original selection
        // Do not takes the internal as the user may have change
        // internal state then clicked on cancel button and then
        // show the modal again
        this.internalTreeOptions = this.treeOptions;
        this.internalTickedEntity = this.tickedEntity.slice(0);

        // Reveal ticked entity
        this.$nextTick(() => {
          this.$refs.treeList.revealTicked();
        });
      }
    },
    hide() {
      // Hide modal path selector
      if (this.$refs.pathModal) {
        this.$refs.pathModal.hide();
      }
    },
  },
  computed: {
    // Get path of ticked entity
    selectedPath() {
      return this.tickedEntity.length > 0
        ? this.tickedEntity
          .map(x => utilsEntity.pathToString(this.treeOptions.map[x]))
        : '';
    },
  },
};
</script>

<style lang="stylus" scoped>
.bg-color {
  background-color: $page-container-background
}
</style>
