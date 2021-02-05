<template>

  <page-box :title="getTitle" class="adminEntityNewBox">

    <!-- New or edit component -->
    <!-- v-if="listLoaded" is to prevent create-edit component to
      access the entity store before the entities list be loaded -->
    <create-edit v-if="listLoaded" ref="createEdit"
      mode="create" :query-string="queryStringEmpty"
      @submit="onCreate" :create-args.sync="createArgs"
      @invalid-parameters="onCreateEditInvalidParameter">
    </create-edit>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.entity.new.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="create" :disable="createInProgress">{{ $t('admin.entity.new.create') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';
import utilEntity from 'src/common/utils/entity';
import CreateEdit from './Components/CreateEdit';

export default {
  name: 'admin-entity-new',
  components: {
    PageBox,
    CreateEdit,
  },
  data() {
    return {
      createInProgress: false,
      createArgs: null,
      queryStringEmpty: {},
    };
  },
  created() {
    // If entity list is not already loaded, load it
    let p;
    if (!this.listLoading && !this.listLoaded) {
      p = this.$store.dispatch('admin/entity/getList');
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
    ...mapGetters('admin/entity', ['entitiesToTree']),
    ...mapState('admin/entity', {
      listLoading: state => state.listLoading,
      listLoaded: state => state.listLoaded,
    }),
    getTitle() {
      if (this.createArgs) {
        if (this.createArgs.op === 'r') {
          return this.$t('admin.entity.new.titleRoot');
        } if (this.createArgs.op === 's') {
          return this.$t(
            'admin.entity.new.titleSibling',
            { path: utilEntity.pathToString(this.createArgs.et) },
          );
        } if (this.createArgs.op === 'c') {
          return this.$t(
            'admin.entity.new.titleChildren',
            { path: utilEntity.pathToString(this.createArgs.et) },
          );
        }
        return '';
      }
      return '';
    },
  },
  methods: {
    onCreate(data) {
      // Send request to store
      this.createInProgress = true;
      this.$store
        .dispatch('admin/entity/create', data)
        .then(() => {
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: this.$t('admin.entity.new.entityCreatedSuccessfully', {
              name: data.name,
            }),
            icon: 'thumb_up',
          });

          // Go back to list page
          this.handleCancel();
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
    onCreateEditInvalidParameter() {
      // Go back to list page
      this.handleCancel();
    },
    handleCancel() {
      this.$router.push({ path: '../entity' });
    },
    create() {
      this.$refs.createEdit.validateFormAndEmitHandler();
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminEntityNewBox {
  max-width: 70rem;
  margin: 0 auto;
}
</style>
