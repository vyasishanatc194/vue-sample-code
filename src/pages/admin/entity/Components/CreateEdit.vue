<template>
  <div class="admin-entity-create-edit" v-if="listLoaded">

    <!-- Entity name -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-input
          v-model.trim="entity.name"
          @keydown.enter.native="validateFormAndEmitHandler"
          @input="touchForm"
          :label="$t('admin.entity.components.createEdit.name')">
          <template v-slot:prepend>
            <q-icon name="class"></q-icon>
          </template>
        </q-input>

        <div v-if="$v.entity.name.$error && !$v.entity.name.required"
          class="error-validation">
          {{ $t("admin.entity.components.createEdit.nameRequired") }}
        </div>
        <div v-if="$v.entity.name.$error && !$v.entity.name.isInvalid"
          class="error-validation">
          {{ $t("admin.entity.components.createEdit.isInvalid") }}
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import utilEntity from 'src/common/utils/entity';

const availableMode = {
  create: 'create',
  edit: 'edit',
};

export default {
  name: 'admin-entity-create-edit',
  components: {
  },
  props: {
    queryString: {
      required: true,
      type: Object,
    },
    mode: {
      required: true,
      type: String,
      validator: value => Object.keys(availableMode).find(x => value === availableMode[x]),
      default: () => 'create',
    },
    createArgs: {
      type: Object,
      default: () => ({ op: null, parent: null }),
    },
    editEntity: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      availableMode,
      editKey: null,
      entityToEdit: null,
      internalCreateOperation: null,
      createParent: null,
      entity: {
        name: null,
      },
    };
  },
  // Get forms validations
  validations() {
    // On create mode, validate all fields
    // On edit mode, validate only changed field
    return {
      entity: {
        name: {
          required,
          isInvalid(value) {
            return utilEntity.isNameValid(value);
          },
        },
      },
    };
  },
  computed: {
    ...mapState('admin/entity', ['listLoaded']),
    ...mapGetters('admin/entity', ['entitiesToTree']),
    isModeCreate() {
      return this.mode === this.availableMode.create;
    },
    isModeEdit() {
      return this.mode === this.availableMode.edit;
    },
  },
  created() {
    if (this.isModeCreate) {
      this.$setForCreate();
    } else if (this.isModeEdit) {
      this.$loadEditData();
    }
  },
  watch: {
    queryString: {
      handler() {
        if (this.isModeCreate) {
          this.$setForCreate();
        } else if (this.isModeEdit) {
          this.$loadEditData();
        }
      },
      deep: true,
    },
  },
  methods: {
    $setForCreate() {
      // Get route parameters and be sure we have the create
      // operation mode and their parameters
      if (!this.$route.query || !this.$route.query.op) {
        // Invalid parameters, emit to parent
        this.$emit('invalid-parameters');
        return;
      }
      this.internalCreateOperation = this.$route.query.op;
      let et;
      if (this.internalCreateOperation === 'r') {
        // Creating a root entity, nothing special to do
      } else {
        // Get entity id
        if (!this.$route.query || !this.$route.query.eid) {
          // Invalid parameters, emit to parent
          this.$emit('invalid-parameters');
          return;
        }
        const entityId = Number.parseInt(this.$route.query.eid, 10);
        if (Number.isNaN(entityId)) {
          // Invalid parameters, emit to parent
          this.$emit('invalid-parameters');
          return;
        }

        // Read entity
        et = this.entitiesToTree.hashIds[entityId];
        if (!et) {
          this.$emit('invalid-parameters');
        }

        // Do we add a sibling entity ?
        if (this.internalCreateOperation === 's') {
          // We are creating an sibling next this entity
          // Get the parent of this entity
          this.createParent = et.parent;
        } else if (this.internalCreateOperation === 'c') {
          // We are creating an chilidren entity
          // Get this entity
          this.createParent = et;
        }
      }

      // Update props to parent
      this.$emit('update:createArgs', {
        op: this.internalCreateOperation,
        et,
      });
    },
    $loadEditData() {
      // Load and validate route parameters
      if (this.isModeEdit) {
        // Get route parameters and be sure all params are Number
        if (!this.$route.query || !this.$route.query.id) {
          // Invalid parameters, emit to parent
          this.$emit('invalid-parameters');
          return;
        }

        // Extract route parameters
        this.editKey = parseInt(this.$route.query.id, 10);

        // Validate parameters
        if (Number.isNaN(this.editKey)) {
          // Invalid parameters, emit to parent
          this.$emit('invalid-parameters');
          return;
        }

        // Load entity from store
        this.entityToEdit = this.entitiesToTree.hashIds[this.editKey];
        if (!this.entityToEdit) {
          // Invalid parameters, emit to parent
          this.$emit('invalid-parameters');
          return;
        }

        // Set name
        this.entity.name = this.entityToEdit.name;

        // Update props to parent
        this.$emit('update:editEntity', this.entity);
      }
    },
    // Build the object before submiting the result
    $buildSubmitResult() {
      const result = {};
      result.name = this.entity.name;
      if (this.isModeCreate) {
        result.parent = this.createParent ? {
          id: this.createParent.id,
          updated_at: this.createParent.updated_at,
        } : null;
      } else {
        result.id = this.entityToEdit.id;
        result.updated_at = this.entityToEdit.updated_at;
      }
      return result;
    },
    // Validate form
    touchForm() {
      this.$v.entity.$touch();
    },
    // Validate form and emit a submit signal
    validateFormAndEmitHandler() {
      this.touchForm();
      if (!this.$v.entity.$error) {
        this.$emit('submit', this.$buildSubmitResult());
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.admin-entity-create-edit {
}
</style>
