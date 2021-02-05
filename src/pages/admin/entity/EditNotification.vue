<template>

  <page-box :title="getTitle"
    v-if="entityListLoaded && notificationListLoaded"
    class="pageBox">

    <!--Notification table -->
    <q-table
      ref="notificationTable"
      row-key="id"
      class="no-shadow full-width"
      :pagination.sync="tablePagination"
      :columns="tableColumns"
      :data="getNotificationList"
      :hideBottom="true"
      v-if="notificationRowConfigBuild" >

      <!-- Row header -->
      <template slot="header" slot-scope="props">
        <q-tr>
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <!-- Body slot -->
      <template slot="body" slot-scope="props">
        <q-tr :props="props" :key="props.row.ruleIndex">
          <q-td>
            <q-toggle danse color="primary"
              v-model="notificationRowConfig[props.row.ruleIndex].state"
              @input="touchForm"
            />
          </q-td>
          <q-td key="sensor_tag" :props="props">
            {{ props.row.sensor_tag_name }}
          </q-td>
          <q-td auto-width key="operator" style="font-size: 1.5rem;" :props="props">
            {{ props.row.operator }}
          </q-td>
          <q-td style="width: 8rem;" key="value" :props="props">

            <i-mask-input
              v-model="notificationRowConfig[props.row.ruleIndex].value"
              @keydown.enter.native="touchForm"
              @input="touchForm"
              :mask="Number"
              :scale="getUnitDecimalPrecision(props.row.unit_context_id)"
              :suffix="getRuleUserUnitInfo(props.row.ruleIndex).symbol"
              align="center"
              :color="'primary'"
              style="min-width: 8rem;">
            </i-mask-input>

            <!-- Validator -->
            <div v-if="$v.notificationRowConfig[props.row.ruleIndex].$error
              && (!$v.notificationRowConfig[props.row.ruleIndex].required
                || !$v.notificationRowConfig[props.row.ruleIndex].decimal)"
              class="error-validation">
              {{ $t("admin.entity.editNotification.dataDecimalRequired") }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- Bottom button -->
    <div slot="footer" class="row justify-end">
      <q-btn color="secondary"
        @click.prevent="handleCancel">{{ $t('admin.entity.editNotification.cancel') }}
      </q-btn>
      <q-btn color="primary"
        @click.prevent="handleEdit" :disable="saveInProgress">
          {{ $t('admin.entity.editNotification.save') }}
      </q-btn>
    </div>

  </page-box>

</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { PageBox } from 'src/common/components/PageBox';
import IMaskInput from 'src/common/components/IMaskInput';
import { required, decimal } from 'vuelidate/lib/validators';
import utilEntity from 'src/common/utils/entity';
import UtilUnit from 'src/common/utils/unit';

export default {
  name: 'admin-entity-notification',
  components: {
    PageBox,
    IMaskInput,
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
      currentEntity: null,
      tableColumns: [
        {
          name: 'state',
          required: true,
          label: this.$t('admin.entity.editNotification.columnState'),
          align: 'left',
          field: 'state',
          sortable: false,
        },
        {
          name: 'sensor_tag',
          required: true,
          label: this.$t('admin.entity.editNotification.columnTag'),
          align: 'left',
          field: 'sensor_tag',
          sortable: false,
        },
        {
          name: 'operator',
          required: true,
          label: this.$t('admin.entity.editNotification.columnOperator'),
          align: 'left',
          field: 'operator',
          sortable: false,
        },
        {
          name: 'value',
          required: false,
          label: this.$t('admin.entity.editNotification.columnValue'),
          align: 'left',
          field: 'value',
          sortable: false,
        },
      ],
      tablePagination: {
        rowsPerPage: 0,
      },
      notificationRowConfig: [],
      notificationRowConfigBuild: false,
    };
  },
  // Get forms validations
  validations() {
    const v = {
      notificationRowConfig: {},
    };
    // Create a dynamic array of validation rules for notification
    this.getNotificationList.forEach((n) => {
      // Set the validation of the field `state`
      v.notificationRowConfig[n.ruleIndex] = {
        state: {
          required,
        },
      };

      // Set the validation of the `value` field only if the `state` field has a value of `true`
      const valueRules = {
        decimal,
      };
      if (this.notificationRowConfig[n.ruleIndex].state === true) {
        valueRules.required = required;
      }
      v.notificationRowConfig[n.ruleIndex].value = valueRules;
    });
    return v;
  },
  created() {
    this.loadEditData();
  },
  computed: {
    ...mapGetters('admin/entity', ['entitiesToTree']),
    ...mapState('admin/entity', {
      entityListLoading: state => state.listLoading,
      entityListLoaded: state => state.listLoaded,
    }),
    ...mapState('admin/entityNotification', {
      initialized: state => state.initialized,
      notificationListLoaded: state => state.listLoaded,
      notificationRows: state => state.notificationRows,
    }),
    getTitle() {
      if (this.currentEntity) {
        return this.$t('admin.entity.editNotification.title', {
          path: utilEntity.pathToString(this.currentEntity),
        });
      }
      return '';
    },
    getNotificationList() {
      return this.notificationRows
        // Take a shadow copy of the array to prevent altering the data store directly
        .slice()
        // Sort notification by sensor tag name
        .sort((a, b) => a.sensor_tag_name.localeCompare(b.sensor_tag_name))
        // Add index for every element
        .map((x, idx) => {
          x.ruleIndex = idx;
          return x;
        });
    },
  },
  methods: {
    getUnitDecimalPrecision(unitContextID) {
      const unitConverter = UtilUnit.getUnitConverterFromUnitContextID(unitContextID);
      const precision = unitConverter.getUserUnitPrecision();
      return precision;
    },
    // Get rules user unit information according to its sensor tag
    getRuleUserUnitInfo(ruleIndex) {
      const rule = this.getNotificationList[ruleIndex];
      const unitConverter = UtilUnit.getUnitConverterFromUnitContextID(rule.unit_context_id);
      return unitConverter.getUserUnit();
    },
    // Validate data form
    touchForm() {
      this.$v.notificationRowConfig.$touch();
    },
    // Load notifications data to edit
    loadEditData() {
      // Make sure an entity id has been received from the query string parameters
      if (this.queryString === null
        || (typeof this.queryString.id !== 'number'
        && typeof this.queryString.id !== 'string')) {
        // Invalid parameters, go back to entity list page
        this.handleCancel();
        return;
      }

      // Extract entity id parameters from the query string
      const entityId = Number.parseInt(this.queryString.id, 10);
      if (Number.isNaN(entityId) === true) {
        // Invalid parameters, go back to entity list
        this.handleCancel();
        return;
      }

      // If the entity list has not already been loaded, load it now
      let p;
      if (this.entityListLoading === false && this.entityListLoaded === false) {
        p = this.$store.dispatch('admin/entity/getList');
      } else {
        p = Promise.resolve();
      }
      p
        .then(() => {
          // Find this entity
          this.currentEntity = this.entitiesToTree.hashIds[entityId];
          if (typeof this.currentEntity === 'undefined') {
            throw new Error(this.$t('admin.entity.editNotification.entityDoesNotExits'));
          }

          // Load notification list of this entity
          return this.$store.dispatch('admin/entityNotification/getList', {
            id: this.currentEntity.id,
            updated_at: this.currentEntity.updated_at,
          });
        })
        .then(() => {
          // Binding the store's data directly to the configuration table and editing this data
          // would produce the error `Do not mutate vuex store state outside mutation handlers`.
          // To overcome this problem, build an array to hold the notification configuration
          // outside of the data received from the store. From the configuration table, the store
          // array will be used to read only the data and the second for data that can be edited.
          this.notificationRowConfig = this.getNotificationList
            .map((notification) => {
              // Get unit converter associated to the tag of this rule
              const unitConverter = UtilUnit.getUnitConverterFromUnitContextID(
                notification.unit_context_id,
              );
              // Convert value from system to user unit preference
              return {
                state: Boolean(notification.state),
                value: typeof notification.value !== 'number'
                  ? ''
                  : unitConverter.formatValueToUser(notification.value),
              };
            });

          // Nofification rows config array is now ready. This variable prevent accessing to the
          // array before it is used
          this.notificationRowConfigBuild = true;
        })
        .catch((error) => {
          // Warn user with a negative notify
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        });
    },
    handleEdit() {
      // Validate the form
      this.touchForm();
      if (this.$v.notificationRowConfig.$error === true) {
        // There are errors in the form, stop editing
        return;
      }
      // Set save in progress flag to on
      this.saveInProgress = true;
      // Gather all notifications information
      const notifications = this.getNotificationList.map((notification) => {
        // Get local configuration of this notification
        const localInfo = this.notificationRowConfig[notification.ruleIndex];
        // Get unit converter of this notification rule
        const unitConverter = UtilUnit.getUnitConverterFromUnitContextID(
          notification.unit_context_id,
        );
        // Set notification's value according to the state, when the state has
        // a `false` value, the null value is accepted
        // Also, make sure the value is converted from user to system unit
        const valueNumber = Number.parseFloat(localInfo.value);
        let value;
        if (localInfo.state === true) {
          value = unitConverter.convertValueToSystem(valueNumber);
        } else {
          value = localInfo.value.length > 0
            ? unitConverter.convertValueToSystem(valueNumber)
            : null;
        }
        return {
          rule_id: notification.rule_id,
          updated_at: notification.updated_at,
          state: localInfo.state,
          value,
        };
      });
      const editData = {
        entity: {
          id: this.currentEntity.id,
          updated_at: this.currentEntity.updated_at,
        },
        notifications,
      };
      // Send edit notifications request to store
      this.$store
        .dispatch('admin/entityNotification/edit', editData)
        .then(() => {
          // Warn user with a positive notify
          const t = this.$t('admin.entity.editNotification.notificationsEditedSuccessfully', {
            count: editData.notifications.length,
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
          // Warn user with a negative notify
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        })
        .then(() => {
          // Set save in progress flag to off
          this.saveInProgress = false;
        });
    },
    handleCancel() {
      // Go back to the entity list
      this.$router.push({ path: '../entity' });
    },
  },
  watch: {
    // Setup a watcher on the query string value
    queryString: {
      handler() {
        // If the query string value change, reload the page's data
        this.loadEditData();
      },
      deep: true,
    },
  },
};
</script>

<style lang="stylus" scoped>
.pageBox {
  max-width: 70rem;
  margin: 0 auto;
}
</style>
