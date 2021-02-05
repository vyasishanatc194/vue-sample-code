<template>

  <page-box :title="$t( getMode == 'edit-single'
    ? 'admin.device.edit.title_single' : 'admin.device.edit.title_multiple')"
   class="adminDeviceEditBox">

    <!-- New or edit component -->
    <!-- v-if="listLoaded" is to prevent create-edit component to
      access the device store before the device list be loaded -->
    <create-edit v-if="listLoaded" ref="createEdit" :query-string="queryString"
      :mode="getMode" :device-rows="deviceRows" :entity-rows="entityRows"
      :entities-to-tree="entitiesToTree"
      @submit="onSave" @invalid-parameters="onCreateEditInvalidParameter">
    </create-edit>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.device.edit.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="save" :disable="saveInProgress">{{ $t('admin.device.edit.save') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';
import utilMisc from 'src/common/utils/misc';
import CreateEdit from './Components/CreateEdit';

export default {
  name: 'admin-device-edit',
  components: {
    PageBox,
    CreateEdit,
  },
  props: {
    queryString: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      saveInProgress: false,
    };
  },
  created() {
    // If device list is not already loaded, load it
    let p;
    if (!this.listLoading && !this.listLoaded) {
      p = this.$store.dispatch('admin/device/getList');
    } else {
      p = Promise.resolve();
    }
    p.catch((error) => {
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
      entityRows: state => state.entityRows,
      deviceRows: state => state.deviceRows,
      listLoading: state => state.listLoading,
      listLoaded: state => state.listLoaded,
    }),
    // Get component edit mode
    getMode() {
      return this.queryString.ids && this.queryString.ids.split(',').length > 1
        ? 'edit-bulk'
        : 'edit-single';
    },
  },
  methods: {
    // CreateEdit component get invalid parameters
    onCreateEditInvalidParameter() {
      // Go back to device's list page
      this.$router.push({ path: '../device' });
    },
    onSave(data) {
      // While on edit-bulk we received an array of object
      // instead of a plain object
      // Operation :
      // 1. The entity of the device is a hieararchical data,
      //    purge it before sending it to parent
      // 2. Convert all keys to snake case
      this.saveInProgress = true;
      let d;
      if (this.getMode === 'edit-bulk') {
        d = _.map(data, (x) => {
          const v = _(x)
            .omit(['entity.parent', 'entity.children'])
            .cloneDeep();
          return utilMisc.propertyKeyToSnakeCase(v);
        });
      } else {
        d = _(data)
          .omit(['entity.parent', 'entity.children'])
          .cloneDeep();
        d = utilMisc.propertyKeyToSnakeCase(d);
      }

      // Send request to store
      this.$store
        .dispatch('admin/device/edit', d)
        .then(() => {
          // Warn with a positive toast
          let t;
          if (this.getMode === 'edit-bulk') {
            t = this.$t('admin.device.edit.devicesEditedSuccessfully');
          } else {
            t = this.$t('admin.device.edit.deviceEditedSuccessfully', {
              name: d.name,
            });
          }
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: t,
            icon: 'thumb_up',
          });

          // Go back to list page
          this.$router.push({ path: '../device' });
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
      this.$router.push({ path: '../device' });
    },
    save() {
      this.$refs.createEdit.validateFormAndEmitHandler();
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminDeviceEditBox {
  max-width: 70rem;
  margin: 0 auto;
}
</style>
