<template>

  <page-box :title="$t('admin.device.new.title')" class="adminDeviceNewBox">

    <!-- New or edit component -->
    <!-- v-if="listLoaded" is to prevent create-edit component to
      access the device store before the entities list be loaded -->
    <create-edit v-if="listLoaded" ref="createEdit" mode="create"
      :device-rows="deviceRows" :entity-rows="entityRows"
      :entities-to-tree="entitiesToTree" :query-string="queryStringEmpty"
      @submit="onCreate">
    </create-edit>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.device.new.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="create" :disable="createInProgress">{{ $t('admin.device.new.create') }}
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
  name: 'admin-device-new',
  components: {
    PageBox,
    CreateEdit,
  },
  data() {
    return {
      createInProgress: false,
      queryStringEmpty: {},
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
  },
  methods: {
    onCreate(data) {
      // The entity of the device is a hieararchical data,
      // purge it before sending it to parent
      let d = _.cloneDeep(_.omit(data, ['entity.parent', 'entity.children']));

      // Convert all keys to snake case
      d = utilMisc.propertyKeyToSnakeCase(d);

      // Send request to store
      this.createInProgress = true;
      this.$store
        .dispatch('admin/device/create', d)
        .then(() => {
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: this.$t('admin.device.new.deviceCreatedSuccessfully', {
              name: d.name,
            }),
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
          this.createInProgress = false;
        });
    },
    handleCancel() {
      this.$router.push({ path: '../device' });
    },
    create() {
      this.$refs.createEdit.validateFormAndEmitHandler();
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminDeviceNewBox {
  max-width: 70rem;
  margin: 0 auto;
}
</style>
