<template>
  <q-page padding>

    <page-box-container>
      <!-- v-if is to prevent accessing the store
      before it be initialized -->
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
  name: 'admin-user-home',
  components: {
    PageBoxContainer,
  },
  methods: {
    ...mapActions('admin/user', ['initialize', 'unInitialize']),
    onInvalidParameters() {
      // Go back to user list page
      this.$router.push({ path: '../poultry-curve' });
    },
  },
  computed: {
    ...mapState('user', {
      userId: state => state.userId,
    }),
    ...mapState('admin/user', {
      initialized: state => state.initialized,
    }),
  },
  data() {
    return {
      queryString: this.$route.query,
    };
  },
  // Before entering in the admin/user zone,
  // initialize the store admin/user store
  beforeRouteEnter(to, from, next) {
    next(vm => vm.initialize(vm.userId));
  },
  // Before leaving in the admin/user zone,
  // uninitialize the store admin/user store
  beforeRouteLeave(to, from, next) {
    this.unInitialize().then(() => next());
  },
  watch: {
    '$route.query': {
      handler(newVal) {
        this.queryString = newVal;
      },
      deep: true,
    },
  },
};
</script>

<style lang="stylus" scoped>
</style>
