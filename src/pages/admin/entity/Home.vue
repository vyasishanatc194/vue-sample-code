<template>
  <q-page padding>

    <page-box-container>
      <!-- v-if is to prevent accessing the store
      before it be initialized -->
      <router-view v-if="initialized" :query-string="queryString"></router-view>
    </page-box-container>

  </q-page>
</template>

<script>
import { PageBoxContainer } from 'src/common/components/PageBox';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'admin-entity-home',
  components: {
    PageBoxContainer,
  },
  methods: {
    ...mapActions('admin/entity', {
      initialize: 'initialize',
      unInitialize: 'unInitialize',
    }),
    ...mapActions('admin/entityUser', {
      userInitialize: 'initialize',
      userUnInitialize: 'unInitialize',
    }),
  },
  computed: {
    ...mapState('user', {
      userId: state => state.userId,
    }),
    ...mapState('admin/entity', {
      initialized: state => state.initialized,
    }),
  },
  data() {
    return {
      queryString: this.$route.query,
    };
  },
  // Before entering in the admin/user zone,
  // initialize the stores
  beforeRouteEnter(to, from, next) {
    next(vm => vm.initialize(vm.userId)
      .then(() => vm.userInitialize(vm.userId)));
  },
  // Before leaving in the admin/entity zone,
  // uninitialize the stores
  beforeRouteLeave(to, from, next) {
    this.unInitialize()
      .then(() => this.userUnInitialize())
      .then(() => next());
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
