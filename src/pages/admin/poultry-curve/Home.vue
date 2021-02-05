<template>
  <q-page padding>

    <page-box-container>
      <!-- v-if is to prevent accessing the store before it is initialized -->
      <router-view
        v-if="initialized"
        :query-string="queryString"
        @invalid-parameters="onInvalidParameters">
      </router-view>
    </page-box-container>

  </q-page>
</template>


<script>
import { PageBoxContainer } from 'src/common/components/PageBox';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'admin-poultry-curve-home',
  components: {
    PageBoxContainer,
  },
  methods: {
    ...mapActions('admin/poultryCurve', ['initialize', 'unInitialize']),
    onInvalidParameters() {
      // Go back to poultry curve list page
      this.$router.push({ path: '../poultry-curve' });
    },
  },
  computed: {
    ...mapState('user', {
      userId: state => state.userId,
    }),
    ...mapState('admin/poultryCurve', {
      initialized: state => state.initialized,
      loadingMessage: state => state.loadingMessage,
    }),
  },
  data() {
    return {
      queryString: this.$route.query,
    };
  },
  // Before entering in the admin/poultry-curve zone,
  // initialize the store admin/poultry-curve store
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.initialize(vm.userId);
    });
  },
  // Before leaving in the admin/poultry-curve zone,
  // uninitialize the store admin/poultry-curve store
  beforeRouteLeave(to, from, next) {
    this.unInitialize().then(() => next());
  },
  watch: {
    // When any params of current route change, update interval variable too
    '$route.query': {
      handler(newVal) {
        this.queryString = newVal;
      },
      deep: true,
    },
    // Hide or show the loading message or not
    loadingMessage(newMsg) {
      if (newMsg) {
        // Show loading message
        this.$q.loading.show({ message: newMsg });
      } else {
        // Hide message
        this.$q.loading.hide();
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
</style>
