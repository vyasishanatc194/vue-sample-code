<template>
  <div class="admin-user-create-edit">

    <!-- User first name -->
    <div class="row" v-if="mode !== availableMode.editBulk">
      <div class="offset-xs-1 col-10">

        <q-input
          v-model.trim="user.firstName"
          @keydown.enter.native="validateFormAndEmitHandler"
          @input="touchForm"
          :bg-color="isModeEditBulk && nameEditChanged ? 'secondary' : 'transparent'"
          :color="isModeEditBulk && nameEditChanged ? 'warning' : 'primary'"
          :label="$t('admin.user.components.createEdit.firstName')">
          <template v-slot:prepend>
            <q-icon name="class"></q-icon>
          </template>
        </q-input>

        <div v-if="$v.user.firstName.$error && !$v.user.firstName.required"
          class="error-validation">
          {{ $t("admin.user.components.createEdit.firstNameRequired") }}
        </div>

      </div>
    </div>

    <!-- User last name -->
    <div class="row" v-if="mode !== availableMode.editBulk">
      <div class="offset-xs-1 col-10">

        <q-input
          v-model.trim="user.lastName"
          @keydown.enter.native="validateFormAndEmitHandler"
          @input="touchForm"
          :bg-color="isModeEditBulk && lastNameEditChanged ? 'secondary' : 'transparent'"
          :color="isModeEditBulk && lastNameEditChanged ? 'warning' : 'primary'"
          :label="$t('admin.user.components.createEdit.lastName')">
          <template v-slot:prepend>
            <q-icon name="class"></q-icon>
          </template>
        </q-input>

        <div v-if="$v.user.lastName.$error && !$v.user.lastName.required"
          class="error-validation">
          {{ $t("admin.user.components.createEdit.lastNameRequired") }}
        </div>

      </div>
    </div>

    <!-- User email -->
    <div class="row" v-if="mode === availableMode.create">
      <div class="offset-xs-1 col-10">

        <q-input
          v-model.trim="user.email"
          @keydown.enter.native="validateFormAndEmitHandler"
          @input="touchForm"
          type="email"
          :bg-color="isModeEditBulk && emailEditChanged ? 'secondary' : 'transparent'"
          :color="isModeEditBulk && emailEditChanged ? 'warning' : 'primary'"
          :label="$t('admin.user.components.createEdit.email')">
          <template v-slot:prepend>
            <q-icon name="mail_outline"></q-icon>
          </template>
        </q-input>

        <div v-if="$v.user.email.$error && !$v.user.email.required" class="error-validation">
          {{ $t("admin.user.components.createEdit.emailRequired") }}
        </div>
        <div v-if="$v.user.email.$error && !$v.user.email.email" class="error-validation">
          {{ $t("admin.user.components.createEdit.emailInvalid") }}
        </div>

      </div>
    </div>

    <!-- Role -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-select
          :label="$t('admin.user.components.createEdit.role')"
          :options="getRoleList"
          @change="touchForm"
          v-model="user.role"
          :bg-color="isModeEditBulk && roleEditChanged ? 'secondary' : 'transparent'"
          :color="isModeEditBulk && roleEditChanged ? 'warning' : 'primary'">
            <template v-slot:prepend>
              <q-icon name="assignment_ind"></q-icon>
            </template>
        </q-select>

        <div v-if="$v.user.role.$error
          && (!$v.user.role.required
          || !$v.user.role.requiredValidValue)" class="error-validation">
          {{ $t("admin.user.components.createEdit.roleRequired") }}
        </div>

      </div>
    </div>

    <!-- Timezone -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-select
          :label="$t('admin.user.components.createEdit.timeZone')"
          @filter="filterTimezone"
          :options="filterTimezoneOptions"
          use-input
          @change="touchForm"
          v-model="user.timeZone"
          :bg-color="isModeEditBulk && timeZoneEditChanged ? 'secondary' : 'transparent'"
          :color="isModeEditBulk && timeZoneEditChanged ? 'warning' : 'primary'">
            <template v-slot:prepend>
              <q-icon name="access_time"></q-icon>
            </template>
        </q-select>

        <div v-if="$v.user.timeZone.$error
          && (!$v.user.timeZone.required
          || !$v.user.timeZone.requiredValidValue)"
          class="error-validation">
          {{ $t("admin.user.components.createEdit.timeZoneRequired") }}
        </div>

      </div>
    </div>

    <!-- Language -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-select
          :label="$t('admin.user.components.createEdit.language')"
          :options="getLanguageList"
          @change="touchForm"
          v-model="user.language"
          :bg-color="isModeEditBulk && languageEditChanged ? 'secondary' : 'transparent'"
          :color="isModeEditBulk && languageEditChanged ? 'warning' : 'primary'">
            <template v-slot:prepend>
              <q-icon name="language"></q-icon>
            </template>
        </q-select>

        <div v-if="$v.user.language.$error
          && (!$v.user.language.required
          || !$v.user.language.requiredValidValue)"
          class="error-validation">
          {{ $t("admin.user.components.createEdit.languageRequired") }}
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import _ from 'lodash';
import { email, requiredIf } from 'vuelidate/lib/validators';

const availableMode = {
  create: 'create',
  editSingle: 'edit-single',
  editBulk: 'edit-bulk',
};

export default {
  name: 'admin-user-create-edit',
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
    userRows: {
      type: Array,
    },
  },
  data() {
    return {
      filterTimezoneOptions: this.getTimeZoneList,
      availableMode,
      editKeys: [],
      user: {
        firstName: null,
        lastName: null,
        email: null,
        role: null,
        timeZone: null,
        language: null,
      },
      userEditOriginal: {
        firstName: null,
        lastName: null,
        email: null,
        role: null,
        timeZone: null,
        language: null,
      },
    };
  },
  // Get forms validations
  validations() {
    // On create mode, validate all fields
    // On edit mode, validate only changed field
    return {
      user: {
        firstName: {
          required: requiredIf(() => this.isModeCreate || this.isModeEditSingle),
        },
        lastName: {
          required: requiredIf(() => this.isModeCreate || this.isModeEditSingle),
        },
        email: {
          required: requiredIf(() => this.isModeCreate),
          email(val) {
            return email(val);
          },
        },
        role: {
          required: requiredIf(() => (this.isModeEditBulk ? this.roleEditChanged : true)),
          // Make sure a valid option is selected in the list
          requiredValidValue(o) {
            return this.roleEditChanged === true
              ? _.isEmpty(o) === false && typeof o.value === 'number'
              : true;
          },
        },
        timeZone: {
          required: requiredIf(() => (this.isModeEditBulk ? this.timeZoneEditChanged : true)),
          // Make sure a valid option is selected in the list
          requiredValidValue(o) {
            return this.timeZoneEditChanged === true
              ? _.isEmpty(o) === false && typeof o.value === 'string'
              : true;
          },
        },
        language: {
          required: requiredIf(() => (this.isModeEditBulk ? this.languageEditChanged : true)),
          // Make sure a valid option is selected in the list
          requiredValidValue(o) {
            return this.languageEditChanged === true
              ? _.isEmpty(o) === false && typeof o.value === 'string'
              : true;
          },
        },
      },
    };
  },
  computed: {
    ...mapState('user', ['roleList']),
    ...mapGetters('user', ['getLanguageListKeys', 'getLanguageListKeys']),
    isModeCreate() {
      return this.mode === this.availableMode.create;
    },
    isModeEditSingle() {
      return this.mode === this.availableMode.editSingle;
    },
    isModeEditBulk() {
      return this.mode === this.availableMode.editBulk;
    },
    firstNameEditChanged() {
      return this.$watchEditChangedProperty('firstName', false);
    },
    lastNameEditChanged() {
      return this.$watchEditChangedProperty('lastName', false);
    },
    emailEditChanged() {
      return this.$watchEditChangedProperty('email', false);
    },
    roleEditChanged() {
      return this.$watchEditChangedProperty('role.value', true, null);
    },
    timeZoneEditChanged() {
      return this.$watchEditChangedProperty('timeZone.value', true, null);
    },
    languageEditChanged() {
      return this.$watchEditChangedProperty('language.value', true, null);
    },
    getRoleList() {
      const result = _(this.roleList)
        .sortBy(['locale_name'])
        .map(t => ({
          value: t.id,
          label: t.locale_name,
        }))
        .value();
      const emptyElement = { value: null, label: '' };
      result.unshift(emptyElement);
      return result;
    },
    getTimeZoneList() {
      const result = this.$moment.tz.names().map(t => ({
        value: t,
        label: t,
      }));
      const emptyElement = { value: null, label: '' };
      result.unshift(emptyElement);
      return result;
    },
    getLanguageList() {
      const result = this.getLanguageListKeys.map(x => ({
        value: x,
        label: this.$t(`language.${x}`),
      }));
      const emptyElement = { value: null, label: '' };
      result.unshift(emptyElement);
      return result;
    },
  },
  created() {
    if (this.mode !== this.availableMode.create) {
      this.$loadEditData();
    }
  },
  watch: {
    queryString: {
      handler() {
        if (this.isModeEditSingle || this.isModeEditBulk) {
          this.$loadEditData();
        }
      },
      deep: true,
    },
  },
  methods: {
    // Timezone filtering function
    filterTimezone(val, update) {
      if (val === '') {
        update(() => {
          this.filterTimezoneOptions = this.getTimeZoneList;
        });
      } else {
        update(() => {
          const tzlc = val.toLowerCase();
          this.filterTimezoneOptions = this.getTimeZoneList.filter(
            v => (typeof v.value === 'string'
              ? v.value.toLowerCase().indexOf(tzlc) > -1
              : false),
          );
        });
      }
    },
    $watchEditChangedProperty(propertyPath, canBeNull, emptyValue) {
      const ev = typeof emptyValue !== 'undefined' ? emptyValue : '';
      if (this.isModeEditSingle || this.isModeEditBulk) {
        if (canBeNull && _.get(this.user, propertyPath) === ev) {
          return _.get(this.userEditOriginal, propertyPath) !== ev;
        }
        return _.get(this.user, propertyPath) !== _.get(this.userEditOriginal, propertyPath);
      }
      return false;
    },
    $bulkSetPropertyToArraySameValue(arr, propertyPath, obj, defaultValue) {
      const val = _.get(obj, propertyPath);
      if (_.every(arr, a => _.isEqual(val, _.get(a, propertyPath)))) {
        return val;
      }
      return defaultValue;
    },
    $loadEditData() {
      // Load and validate route parameters
      if (this.isModeEditSingle || this.isModeEditBulk) {
        // Get route parameters and be sure all params are Number
        if (!this.$route.query || !this.$route.query.ids) {
          // Invalid parameters, emit to parent
          this.$emit('invalid-parameters');
          return;
        }

        // Extract route parameters
        const editKeyAsString = this.$route.query.ids.split(',');
        this.editKeys = editKeyAsString.reduce((acc, val) => {
          const i = parseInt(val, 10);
          if (!Number.isNaN(i)) {
            acc.push(i);
          }
          return acc;
        }, []);

        // Validate parameters
        if (
          this.editKeys.length <= 0
          || editKeyAsString.length !== this.editKeys.length
          || (this.isModeEditSingle && this.editKeys.length !== 1)
        ) {
          // Invalid parameters, emit to parent
          this.$emit('invalid-parameters');
          return;
        }
      }

      // Load user data from data store
      if (this.isModeEditSingle || this.isModeEditBulk) {
        // Load user from store
        const usersToEdit = this.userRows.filter(d => this.editKeys.indexOf(d.id) !== -1);
        // Be sure all user has been found and load
        if (usersToEdit.length !== this.editKeys.length) {
          // Invalid parameters, emit to parent
          this.$emit('invalid-parameters');
          return;
        }

        // Get first user as we are editing one or more users
        const firstUser = usersToEdit[0];

        // According edit mode, set local data from store's data
        if (this.isModeEditSingle) {
          // Set first name
          this.user.firstName = firstUser.first_name;
          this.userEditOriginal.firstName = firstUser.first_name;

          // Set last name
          this.user.lastName = firstUser.last_name;
          this.userEditOriginal.lastName = firstUser.last_name;

          // Set role
          const roleFound = this.getRoleList
            .find(t => t.value === firstUser.role_id);
          this.user.role = roleFound;
          this.userEditOriginal.role = roleFound;

          // Set timezone
          const timeZoneFound = this.getTimeZoneList
            .find(t => t.value === firstUser.time_zone);
          this.user.timeZone = timeZoneFound;
          this.userEditOriginal.timeZone = timeZoneFound;

          // Set language
          const languageFound = this.getLanguageList
            .find(t => t.value === firstUser.locale_name);
          this.user.language = languageFound;
          this.userEditOriginal.language = languageFound;
        } else {
          // Set role
          const role = this.$bulkSetPropertyToArraySameValue(
            usersToEdit,
            'role_id',
            firstUser,
            null,
          );
          const roleOptions = this.getRoleList
            .find(t => t.value === role);
          this.user.role = roleOptions;
          this.userEditOriginal.role = roleOptions;

          // Set time zone
          const tz = this.$bulkSetPropertyToArraySameValue(
            usersToEdit,
            'time_zone',
            firstUser,
            null,
          );
          const tzOption = this.getTimeZoneList
            .find(t => t.value === tz);
          this.user.timeZone = tzOption;
          this.userEditOriginal.timeZone = tzOption;

          // Set language
          const language = this.$bulkSetPropertyToArraySameValue(
            usersToEdit,
            'locale_name',
            firstUser,
            null,
          );
          const languageFound = this.getLanguageList
            .find(({ value }) => value === language);
          this.user.language = typeof languageFound !== 'undefined'
            ? languageFound.label
            : languageFound;
          this.userEditOriginal.language = typeof languageFound !== 'undefined'
            ? languageFound.label
            : languageFound;
        }
      }
    },
    // Build the edited object before submiting the result
    $buildEditedSubmitResult(userId) {
      const result = {};
      result.id = userId;
      if (!this.isModeEditBulk && this.firstNameEditChanged) {
        result.firstName = this.user.firstName;
      }
      if (!this.isModeEditBulk && this.lastNameEditChanged) {
        result.lastName = this.user.lastName;
      }
      if (this.roleEditChanged) {
        result.role_id = typeof this.user.role === 'object'
          ? this.user.role.value
          : null;
      }
      if (this.timeZoneEditChanged) {
        result.time_zone = typeof this.user.timeZone === 'object'
          ? this.user.timeZone.value
          : null;
      }
      if (this.languageEditChanged) {
        result.language = typeof this.user.language === 'object'
          ? this.user.language.value
          : null;
      }
      result.updated_at = this.userRows.find(d => d.id === userId).updated_at;
      return result;
    },
    // Validate form
    touchForm() {
      this.$v.user.$touch();
    },
    // Validate form and emit a submit signal
    validateFormAndEmitHandler() {
      this.touchForm();
      if (!this.$v.user.$error) {
        // If we are in edit mode, only returns field that has been changed
        if (this.isModeCreate) {
          const cUser = _.cloneDeep(this.user);
          delete cUser.role;
          cUser.role_id = typeof this.user.role === 'object'
            ? this.user.role.value
            : null;
          delete cUser.timeZone;
          cUser.time_zone = typeof this.user.timeZone === 'object'
            ? this.user.timeZone.value
            : null;
          cUser.language = typeof this.user.language === 'object'
            ? this.user.language.value
            : null;
          this.$emit('submit', cUser);
        } else if (this.isModeEditSingle || this.isModeEditBulk) {
          let d;
          if (this.isModeEditSingle) {
            d = this.$buildEditedSubmitResult(this.editKeys[0]);
          } else if (this.isModeEditBulk) {
            d = this.editKeys.reduce((acc, val) => {
              acc.push(this.$buildEditedSubmitResult(val));
              return acc;
            }, []);
          }
          this.$emit('submit', d);
        } else {
          this.$emit('invalid-parameters');
        }
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.admin-user-create-edit {

}
</style>
