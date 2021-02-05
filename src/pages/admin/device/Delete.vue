<template>

  <page-box v-if="listLoaded" :title="$t('admin.device.delete.title')" class="adminDeviceDeleteBox">

    <h3>{{ $t('admin.device.delete.confirmation') }}</h3>

    <q-list>
      <q-item v-for="d in devicesToDelete" :key="d.id">
        <q-item-section avatar>
          <q-icon name="info" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ d.name }}</q-item-label>
          <q-item-label caption>{{ `${$t('admin.device.delete.id')}: ${d.id}` }}</q-item-label>
          <q-item-label caption>{{ `${$t('admin.device.delete.hardware_id')}:
              ${hardwareIDToString(d.hardware_id)}` }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.device.delete.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="handleDelete"
        :disable="handleDeleteInProgress">
          {{ $t('admin.device.delete.delete') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';
import utilDevice from 'src/common/utils/device';

export default {
  name: 'admin-device-delete',
  components: {
    PageBox,
  },
  props: {
    queryString: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      handleDeleteInProgress: false,
      devicesToDelete: [],
      deleteKeys: [],
    };
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
    hardwareIDToString(h) {
      return utilDevice.int32HardwareIdToHex(h);
    },
    $loadDeleteData() {
      // Get route parameters and be sure all params are Number
      if (!this.queryString || !this.queryString.ids) {
        // Invalid parameters, emit to parent
        this.$emit('invalid-parameters');
        return;
      }

      // Extract route parameters
      const deleteKeyAsString = this.queryString.ids.split(',');
      this.deleteKeys = deleteKeyAsString.reduce((acc, val) => {
        const i = parseInt(val, 10);
        if (!Number.isNaN(i)) {
          acc.push(i);
        }
        return acc;
      }, []);

      // If device list is not already loaded, load it
      let p;
      if (!this.listLoading && !this.listLoaded) {
        p = this.$store.dispatch('admin/device/getList');
      } else {
        p = Promise.resolve();
      }
      p
        .then(() => {
          // Extract requested device to delete from query sring
          this.devicesToDelete = this.deviceRows.filter(d => this.deleteKeys.indexOf(d.id) !== -1);
          // Be sure all device has been found and load
          if (this.devicesToDelete.length !== this.deleteKeys.length) {
            // Go back to list page, but maybe a warning
            // should be more appropriate
            this.$router.push({ path: '../device' });
          }
        })
        .catch((error) => {
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        });
    },
    handleDelete() {
      // Send request to store
      this.handleDeleteInProgress = true;
      const d = _.map(this.devicesToDelete, x => _(x).pick(['id', 'updated_at']));
      this.$store
        .dispatch('admin/device/delete', d)
        .then(() => {
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: this.$t('admin.device.delete.devicesDeletedSuccessfully', { count: d.length }),
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
          this.handleDeleteInProgress = false;
        });
    },
    handleCancel() {
      this.$router.push({ path: '../device' });
    },
  },
  created() {
    this.$loadDeleteData();
  },
  watch: {
    queryString: {
      handler() {
        this.$loadDeleteData();
      },
      deep: true,
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminDeviceDeleteBox {
  max-width: 70rem;
  margin: 0 auto;

  h3 {
    font-size: 1rem;
  }
}
</style>
