<template>

  <page-box :title="$t('admin.poultryCurve.new.title')" class="adminPoultryCurveBox">

    <!-- New or edit component -->
    <create-edit
      v-if="attributesLoaded && canShowCreateEdit"
      ref="createEdit"
      :mode="getMode"
      :edited-curve="curve"
      :visibility-list="visibilityRows"
      :state-list="stateRows"
      @submit="onCreate"
      @invalid-parameters="onCreateEditInvalidParameter">
    </create-edit>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.poultryCurve.new.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="create"
        v-if="attributesLoaded && canShowCreateEdit">{{ $t('admin.poultryCurve.new.create') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import { mapState, mapActions } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';
import CreateEdit from './Components/CreateEdit';

export default {
  name: 'admin-poultry-curve-new',
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
    return { };
  },
  created() {
    // Load curve attributes
    this.getAttributes({
      loadingMessage: this.$t('admin.poultryCurve.new.loadingMessageGetAttributes'),
    })
      // Load the curve to clone (if we are in cloning mode)
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
      attributesLoaded: state => state.attributesLoaded,
      curve: state => state.curve,
    }),
    getMode() {
      // Test if we are cloning a curve or create a fresh one
      if (this.queryString && this.queryString.id) {
        return 'clone';
      }
      return 'create';
    },
    isCloningMode() {
      return this.getMode === 'clone';
    },
    canShowCreateEdit() {
      // CreateEdit component can only be shown when we are creating a new curve
      // or when we are cloning an existing curve and the curve to be cloned has been loaded
      return !this.isCloningMode || (this.isCloningMode && this.curveLoaded);
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
  methods: {
    ...mapActions('admin/poultryCurve', ['getAttributes', 'get']),
    $loadCurve() {
      // If we are cloning a curve, load the curve to clone first, else do nothing
      if (this.getMode === 'create') {
        return Promise.resolve();
      }

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
        loadingMessage: this.$t('admin.poultryCurve.new.loadingMessageGet'),
      })
        .catch((error) => {
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        });
    },
    onCreate(newCurveData) {
      // Send request to store
      this.$store
        .dispatch('admin/poultryCurve/create', {
          newCurveData,
          loadingMessage: this.$t('admin.poultryCurve.new.loadingMessage'),
        })
        .then(() => {
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: this.$t('admin.poultryCurve.new.curveCreatedSuccessfully', {
              name: newCurveData.name,
            }),
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
      // Go back to poultry curve list page
      this.$router.push({ path: '../poultry-curve' });
    },
    handleCancel() {
      // Go back to poultry curve list page
      this.$router.push({ path: '../poultry-curve' });
    },
    create() {
      // Validate and create the new curve
      this.$refs.createEdit.validateFormAndEmitHandler();
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminPoultryCurveBox {
  max-width: 70rem;
  margin: 0 auto;
}
</style>
