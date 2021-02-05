<template>

  <page-box v-if="listLoaded" :title="$t('admin.entity.delete.title')" class="adminEntityDeleteBox">

    <h3>{{ $t('admin.entity.delete.confirmation') }}</h3>

    <!-- List of entities about to be deleted -->
    <q-list>
      <q-item v-for="d in entityToDelete" :key="d.id">
        <q-item-section avatar>
          <q-icon name="info" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ entityPathToString(d) }}</q-item-label>
          <q-item-label caption>{{ `${$t('admin.entity.delete.id')}: ${d.id}` }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.entity.delete.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="handleDelete" :disable="handleDeleteInProgress">
          {{ $t('admin.entity.delete.delete') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';
import utilEntity from 'src/common/utils/entity';

export default {
  name: 'admin-entity-delete',
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
      entityToDelete: [],
      deleteKeys: [],
    };
  },
  computed: {
    ...mapGetters('admin/entity', ['entitiesToTree']),
    ...mapState('admin/entity', {
      listLoading: state => state.listLoading,
      listLoaded: state => state.listLoaded,
    }),
  },
  methods: {
    entityPathToString(e) {
      return utilEntity.pathToString(this.entitiesToTree.hashIds[e.id]);
    },
    $loadDeleteData() {
      // Get route parameters and be sure all params are Number
      if (!this.queryString || !this.queryString.ids) {
        // Invalid parameters, return to list
        this.handleCancel();
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

      // If entity list is not already loaded, load it
      let p;
      if (!this.listLoading && !this.listLoaded) {
        p = this.$store.dispatch('admin/entity/getList');
      } else {
        p = Promise.resolve();
      }
      p
        .then(() => {
          // Extract requested entity to delete from query string
          this.entityToDelete = this.deleteKeys.reduce((acc, val) => {
            const d = this.entitiesToTree.hashIds[val];
            if (d) {
              acc.push(d);
            }
            return acc;
          }, []);
          // Be sure all entity has been found and load
          if (this.entityToDelete.length !== this.deleteKeys.length) {
            // Go back to list page, but maybe a warning
            // should be more appropriate
            this.handleCancel();
          }
          // Remove duplicate entities
          this.removeDuplicateEntity();
        })
        .catch((error) => {
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        });
    },
    removeDuplicateEntity() {
      // Only keep the parent entities and drop their children as
      // they will be deleted automatically
      this.entityToDelete = this.entityToDelete.filter((f) => {
        const isParentPresent = (parentId) => {
          if (this.entityToDelete.find(ff => ff.id === parentId)) {
            return true;
          }
          return false;
        };
        let p = f.parent;
        while (p) {
          if (isParentPresent(p.id)) {
            return false;
          }
          p = p.parent;
        }
        return true;
      });
    },
    handleDelete() {
      // Send request to store
      this.handleDeleteInProgress = true;
      const d = _.map(this.entityToDelete, x => _(x).pick(['id', 'updated_at']));
      this.$store
        .dispatch('admin/entity/delete', d)
        .then(() => {
          this.$q.notify({
            timeout: this.$alertTimeoutMs,
            color: 'positive',
            message: this.$t('admin.entity.delete.entityDeletedSuccessfully', { count: d.length }),
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
          this.handleDeleteInProgress = false;
        });
    },
    handleCancel() {
      this.$router.push({ path: '../entity' });
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
.adminEntityDeleteBox {
  max-width: 70rem;
  margin: 0 auto;

  h3 {
    font-size: 1rem;
  }
}
</style>
