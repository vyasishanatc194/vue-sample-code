<template>

  <page-box :title="$t('admin.poultryCurve.edit.title')" class="adminDeviceEditBox">

    <!-- New or edit component -->
    <create-edit
      v-if="attributesLoaded && curveLoaded"
      mode="edit"
      ref="createEdit"
      :edited-curve="curve"
      :visibility-list="visibilityRows"
      :state-list="stateRows"
      @submit="onSave"
      @invalid-parameters="onCreateEditInvalidParameter">
    </create-edit>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn
        v-if="attributesLoaded && isStateCompleted"
        color="positive"
        :label="$t(
          'admin.poultryCurve.components.createEdit.dataButtonDownload')"
        @click.prevent="handleDownload">
      </q-btn>

      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.poultryCurve.edit.cancel') }}
      </q-btn>

      <q-btn
        v-if="attributesLoaded && curveLoaded && !isStateCompleted"
        color="primary"
        @click.prevent="save">{{ $t('admin.poultryCurve.edit.save') }}
      </q-btn>

    </div>

  </page-box>

</template>

<script>
import { mapState, mapActions } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';
import CreateEdit from './Components/CreateEdit';

export default {
  name: 'admin-poultry-curve-edit',
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
    return {};
  },
  created() {
    // Load curve attributes and then load the curve to edit
    this.getAttributes({
      loadingMessage: this.$t('admin.poultryCurve.edit.loadingMessageGetAttributes'),
    })
      .then(() => this.$loadCurve())
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
      visibilityRows: state => state.visibilityRows,
      stateRows: state => state.stateRows,
      curveLoaded: state => state.curveLoaded,
      curve: state => state.curve,
      attributesLoaded: state => state.attributesLoaded,
    }),
    isStateCompleted() {
      // Return true if the curve being edited has the `completed` state
      return this.curveLoaded && this.curve.info.state_id === this.getStateCompletedId;
    },
    getStateCompletedId() {
      // Get the ID of the poultry curve `completed` state
      if (Array.isArray(this.stateRows) === false) {
        return undefined;
      }
      const r = this.stateRows.find(x => x.name.toLowerCase() === 'completed');
      return r ? r.id : undefined;
    },
  },
  methods: {
    ...mapActions('admin/poultryCurve', ['getAttributes', 'edit', 'get', 'download']),
    $loadCurve() {
      // Load requested curve and return a promise
      const curveId = this.queryString ? Number.parseInt(this.queryString.id, 10) : NaN;
      if (Number.isNaN(curveId)) {
        // Invalid parameters go back to list page
        this.$router.push({ path: '../poultry-curve' });
        return Promise.resolve();
      }

      // Load this curve
      return this.get({
        curveId,
        loadingMessage: this.$t('admin.poultryCurve.edit.loadingMessageGet'),
      })
        .catch((error) => {
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        });
    },
    onSave(curveData) {
      // Send request to store
      this.edit({
        curveData,
        loadingMessage: this.$t('admin.poultryCurve.edit.loadingMessageEdit'),
      })
        .then(() => {
          // Warn with a positive toast
          const t = this.$t('admin.poultryCurve.edit.curveEditedSuccessfully', {
            name: curveData.name,
          });
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: t,
            icon: 'thumb_up',
          });

          // Go back to list page
          this.$router.push({ path: '../poultry-curve' });
        })
        .catch((error) => {
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        });
    },
    // CreateEdit component get invalid parameters
    onCreateEditInvalidParameter() {
      // Go back to poultry curve 's list page
      this.$router.push({ path: '../poultry-curve' });
    },
    handleCancel() {
      // Go back to poultry curve 's list page
      this.$router.push({ path: '../poultry-curve' });
    },
    save() {
      // Validate and save the curve
      this.$refs.createEdit.validateFormAndEmitHandler();
    },
    handleDownload() {
      // Download curve's data as file
      // Send request to store
      this.download({
        curveId: this.curve.info.id,
        loadingMessage: this.$t('admin.poultryCurve.edit.loadingMessageDownload'),
      })
        .then((response) => {
          // Show save-as dialog to allow user to save the file
          const blob = new Blob([response.data], { type: response.headers['content-type'] });
          const filename = (response.headers['content-disposition'] || '').split('filename=')[1];
          const result = document.createElement('a');
          result.href = window.URL.createObjectURL(blob);
          result.download = filename;
          result.click();
        })
        .catch((error) => {
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        });
    },
  },
  watch: {
    queryString: {
      handler() {
        // If queryString variable changes, reload page's data
        this.$loadCurve();
      },
      deep: true,
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
