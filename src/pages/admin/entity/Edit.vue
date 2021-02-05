<template>

  <page-box :title="getTitle" class="adminEntityEditBox">

    <!-- New or edit component -->
    <!-- v-if="listLoaded" is to prevent create-edit component to
      access the device store before the device list be loaded -->
    <create-edit v-if="listLoaded" ref="createEdit"
      mode="edit" :query-string="queryString"
      @submit="onSave" :edit-entity.sync="editEntity"
      @invalid-parameters="onCreateEditInvalidParameter">
    </create-edit>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.entity.edit.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="save" :disable="saveInProgress">{{ $t('admin.entity.edit.save') }}
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
  name: 'admin-entity-edit',
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
      editEntity: null,
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
      return this.editEntity
        ? this.$t('admin.entity.edit.title', { path: utilEntity.pathToString(this.editEntity) })
        : '';
    },
  },
  methods: {
    onCreateEditInvalidParameter() {
      // CreateEdit component get invalid parameters
      this.handleCancel();
    },
    onSave(data) {
      // Send request to store
      this.saveInProgress = true;
      this.$store
        .dispatch('admin/entity/edit', data)
        .then(() => {
          // Warn with a positive toast
          const t = this.$t('admin.entity.edit.entityEditedSuccessfully', {
            name: data.name,
          });
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: t,
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
          this.saveInProgress = false;
        });
    },
    handleCancel() {
      this.$router.push({ path: '../entity' });
    },
    save() {
      this.$refs.createEdit.validateFormAndEmitHandler();
    },
  },
};
</script>

<style lang="stylus" scoped>
.adminEntityEditBox {
  max-width: 70rem;
  margin: 0 auto;
}
</style>
