<template>
  <div class="admin-device-create-edit">

    <!-- Device name -->
    <div class="row" v-if="mode !== availableMode.editBulk">
      <div class="offset-xs-1 col-10">

        <q-input
          v-model.trim="device.name"
          @keydown.enter.native="validateFormAndEmitHandler"
          @input="touchForm"
          :bg-color="isModeEditBulk && nameEditChanged ? 'secondary' : 'transparent'"
          :color="isModeEditBulk && nameEditChanged ? 'warning' : 'primary'"
          :label="$t('admin.device.components.createEdit.name')">
          <template v-slot:prepend>
            <q-icon name="class"></q-icon>
          </template>
        </q-input>

          <div v-if="$v.device.name.$error && !$v.device.name.required" class="error-validation">
          {{ $t("admin.device.components.createEdit.nameRequired") }}
        </div>

      </div>
    </div>

      <!-- Device entity -->
    <div class="row">
      <div class="offset-xs-1 col-10">
        <entity-selector
          :title="$t('admin.device.components.createEdit.entitySelectorTitle')"
          selectMode="single"
          :selectable="false"
          :tickedEntity.sync="deviceInternal.tickedEntity"
          :treeOptions="internalTreeOptions"
          @input="touchForm"
          :label="$t('admin.device.components.createEdit.entity')">

          <template slot-scope="props">
            <q-input
              v-model="props.selectedPath"
              readonly
              :label="$t('admin.device.components.createEdit.entity')"
              @click="props.show"
              @keyup="props.show"
              :bg-color="isModeEditBulk && entityEditChanged ? 'secondary' : 'transparent'"
              :color="isModeEditBulk && entityEditChanged ? 'warning' : 'primary'">
              <template v-slot:prepend>
                <q-icon name="location_searching"></q-icon>
              </template>
            </q-input>
          </template>

        </entity-selector>

        <div v-if="$v.device.entity.$error && !$v.device.entity.required"
          class="error-validation">
          {{ $t("admin.device.components.createEdit.entityRequired") }}
        </div>

      </div>
    </div>

    <!-- Hardware ID -->
    <div class="row" v-if="mode !== availableMode.editBulk">
      <div class="offset-xs-1 col-10">

        <q-input
          v-model.trim="deviceInternal.stringHardwareId"
          :label="$t('admin.device.components.createEdit.hardwareId')"
          @keydown.enter.native="validateFormAndEmitHandler"
          @input="touchForm"
          :bg-color="isModeEditBulk && hardwareIdEditChanged ? 'secondary' : 'transparent'"
          :color="isModeEditBulk && hardwareIdEditChanged ? 'warning' : 'primary'">
            <template v-slot:prepend>
              <q-icon name="perm_identity"></q-icon>
            </template>
        </q-input>

        <div v-if="$v.deviceInternal.stringHardwareId.$error
          && !$v.deviceInternal.stringHardwareId.required" class="error-validation">
          {{ $t("admin.device.components.createEdit.hardwareIdRequired") }}
        </div>
        <div v-if="$v.deviceInternal.stringHardwareId.$error &&
          (!$v.deviceInternal.stringHardwareId.minLength
          || !$v.deviceInternal.stringHardwareId.maxLength
          || !$v.deviceInternal.stringHardwareId.isStringHardwareId )" class="error-validation">
          {{ $t("admin.device.components.createEdit.hardwareIdInvalid") }}
        </div>

      </div>
    </div>

    <!-- Timezone -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-select
          :label="$t('admin.device.components.createEdit.timezone')"
          @filter="filterTimezone"
          :options="filterTimezoneOptions"
          use-input
          @change="touchForm"
          v-model="device.timezone"
          :bg-color="isModeEditBulk && timezoneEditChanged ? 'secondary' : 'transparent'"
          :color="isModeEditBulk && timezoneEditChanged ? 'warning' : 'primary'">
            <template v-slot:prepend>
              <q-icon name="access_time"></q-icon>
            </template>
        </q-select>

        <div v-if="$v.device.timezone.$error
          && ( !$v.device.timezone.required
          || !$v.device.timezone.requiredValidValue)" class="error-validation">
          {{ $t("admin.device.components.createEdit.timezoneRequired") }}
        </div>

      </div>
    </div>

    <!-- GPS latitude -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-input
          :label="$t('admin.device.components.createEdit.gpsLatitude')"
          v-model.trim.number="device.gpsLatitude"
          @keydown.enter.native="validateFormAndEmitHandler"
          @input="touchForm"
          :bg-color="isModeEditBulk && gpsLatitudeEditChanged ? 'secondary' : 'transparent'"
          :color="isModeEditBulk && gpsLatitudeEditChanged ? 'warning' : 'primary'">
          <template v-slot:prepend>
            <q-icon name="gps_fixed"></q-icon>
          </template>
        </q-input>

        <div v-if="$v.device.gpsLatitude.$error && !$v.device.gpsLatitude.isGPSLatitude"
          class="error-validation">
          {{ $t("admin.device.components.createEdit.gpsLatitudeInvalid",
            { min: $v.device.gpsLatitude.$params.isGPSLatitude.min,
            max: $v.device.gpsLatitude.$params.isGPSLatitude.max }) }}
        </div>

      </div>
    </div>

    <!-- GPS longitude -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-input
          :label="$t('admin.device.components.createEdit.gpsLongitude')"
          v-model.trim.number="device.gpsLongitude"
          @keydown.enter.native="validateFormAndEmitHandler"
          @input="touchForm"
          :bg-color="isModeEditBulk && gpsLongitudeEditChanged ? 'secondary' : 'transparent'"
          :color="isModeEditBulk && gpsLongitudeEditChanged ? 'warning' : 'primary'">
          <template v-slot:prepend>
            <q-icon name="gps_fixed"></q-icon>
          </template>
        </q-input>

        <div v-if="$v.device.gpsLongitude.$error
          && !$v.device.gpsLongitude.isGPSLongitude" class="error-validation">
          {{ $t("admin.device.components.createEdit.gpsLongitudeInvalid",
            { min: $v.device.gpsLongitude.$params.isGPSLongitude.min,
            max: $v.device.gpsLongitude.$params.isGPSLongitude.max }) }}
        </div>

      </div>
    </div>

    <!-- Forward URL -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-input
          :label="$t('admin.device.components.createEdit.forwardURL')"
          v-model.trim="device.forwardURL"
          @keydown.enter.native="validateFormAndEmitHandler"
          @input="touchForm"
          :bg-color="isModeEditBulk && forwardURLEditChanged ? 'secondary' : 'transparent'"
          :color="isModeEditBulk && forwardURLEditChanged ? 'warning' : 'primary'">
          <template v-slot:prepend>
            <q-icon name="fast_forward"></q-icon>
          </template>
        </q-input>

        <div v-if="$v.device.forwardURL.$error && !$v.device.forwardURL.isForwardURL"
          class="error-validation">
          {{ $t("admin.device.components.createEdit.forwardURLInvalid") }}
        </div>

      </div>
    </div>

    <!-- Forward File Format -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-select
          :label="$t('admin.device.components.createEdit.forwardFileFormat')"
          v-model="device.forwardFileFormat"
          :options="fileForwardFormatOptions"
          :bg-color="isModeEditBulk && forwardFileFormatEditChanged ? 'secondary' : 'transparent'"
          :color="isModeEditBulk && forwardFileFormatEditChanged ? 'warning' : 'primary'">
          <template v-slot:prepend>
            <q-icon name="insert_drive_file"></q-icon>
          </template>
        </q-select>

        <div v-if="$v.device.forwardFileFormat.$error
          && (!$v.device.forwardFileFormat.required
          || !$v.device.forwardFileFormat.requiredValidValue)" class="error-validation">
          {{ $t("admin.device.components.createEdit.forwardFileFormatRequired") }}
        </div>

      </div>
    </div>

    <!-- CAT2 House ID -->
    <div class="row" v-if="mode !== availableMode.editBulk">
      <div class="offset-xs-1 col-10">

        <q-input
          v-model.trim="device.cat2HouseID"
          :label="$t('admin.device.components.createEdit.cat2HouseID')"
          @keydown.enter.native="validateFormAndEmitHandler"
          @input="touchForm">
            <template v-slot:prepend>
              <q-icon name="house"></q-icon>
            </template>
        </q-input>

      </div>
    </div>

  </div>
</template>

<script>
import _ from 'lodash';
import {
  required, requiredIf, minLength, maxLength,
} from 'vuelidate/lib/validators';
import EntitySelector from 'src/common/components/EntitySelector/EntitySelector';
import utilDevice from 'src/common/utils/device';

const availableMode = {
  create: 'create',
  editSingle: 'edit-single',
  editBulk: 'edit-bulk',
};

export default {
  name: 'admin-device-create-edit',
  components: {
    EntitySelector,
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
    deviceRows: {
      type: Array,
    },
    entityRows: {
      type: Array,
    },
    entitiesToTree: {
      type: Object,
    },
  },
  data() {
    const localFileForwardFormatOptions = [
      {
        label: '',
        value: null,
      },
      {
        label: 'TXT',
        value: 'txt',
      },
      {
        label: 'XML',
        value: 'xml',
      },
    ];
    return {
      filterTimezoneOptions: this.getTimeZoneList,
      availableMode,
      editKeys: [],
      deviceInternal: {
        stringHardwareId: '',
        tickedEntity: [],
      },
      internalTreeOptions: {
        nodes: this.entitiesToTree.tree,
        map: this.entitiesToTree.hashIds,
      },
      device: {
        name: null,
        entity: null,
        hardwareId: null,
        timezone: null,
        gpsLatitude: null,
        gpsLongitude: null,
        forwardURL: null,
        forwardFileFormat: localFileForwardFormatOptions.find(f => f.value === 'xml'),
        cat2HouseID: null,
      },
      deviceEditOriginal: {
        name: null,
        entity: null,
        hardwareId: null,
        timezone: null,
        gpsLatitude: null,
        gpsLongitude: null,
        forwardURL: null,
        forwardFileFormat: localFileForwardFormatOptions.find(f => f.value === 'xml'),
        cat2HouseID: null,
      },
      fileForwardFormatOptions: localFileForwardFormatOptions,
    };
  },
  // Get forms validations
  validations() {
    // On create mode, validate all fields
    // On edit mode, validate only changed field
    const v = {
      device: {
        name: {
          required: requiredIf(() => this.isModeCreate || this.isModeEditSingle),
        },
        entity: {
          required: requiredIf(() => (this.isModeEditBulk ? this.entityEditChanged : true)),
        },
        timezone: {
          required: requiredIf(() => (this.isModeEditBulk ? this.timezoneEditChanged : true)),
          // Make sure a valid option is selected in the list
          requiredValidValue(o) {
            return this.timezoneEditChanged === true
              ? _.isEmpty(o) === false && typeof o.value === 'string'
              : true;
          },
        },
        forwardURL: {
          isForwardURL(value) {
            if (this.isModeEditBulk) {
              return this.forwardURLEditChanged ? utilDevice.isForwardURL(value) : true;
            }
            return utilDevice.isForwardURL(value);
          },
        },
        forwardFileFormat: {
          required: requiredIf(() => (
            this.isModeEditBulk ? this.forwardFileFormatEditChanged : true
          )),
          // Make sure a valid option is selected in the list
          requiredValidValue(o) {
            return this.forwardFileFormatEditChanged === true
              ? _.isEmpty(o) === false && typeof o.value === 'string'
              : true;
          },
        },
      },
    };

    if (this.isModeEditBulk) {
      v.device.gpsLatitude = {
        isGPSLatitude: this.gpsLatitudeEditChanged ? utilDevice.isGPSLatitude() : true,
      };
      v.device.gpsLongitude = {
        isGPSLongitude: this.gpsLongitudeEditChanged ? utilDevice.isGPSLongitude() : true,
      };
    } else {
      v.device.gpsLatitude = { isGPSLatitude: utilDevice.isGPSLatitude() };
      v.device.gpsLongitude = { isGPSLongitude: utilDevice.isGPSLongitude() };
    }

    if (this.isModeCreate || this.isModeEditSingle) {
      v.deviceInternal = {
        stringHardwareId: {
          required,
          minLength: minLength(8),
          maxLength: maxLength(8),
          isStringHardwareId(value) {
            return utilDevice.isStringHardwareId(value);
          },
        },
      };
    }

    if (this.isModeEditSingle || this.isModeEditBulk) {
      v.device.editBulkNoProperty = () => {
        let ret = this.entityEditChanged
          || this.timezoneEditChanged
          || this.gpsLatitudeEditChanged
          || this.gpsLongitudeEditChanged
          || this.forwardURLEditChanged
          || this.forwardFileFormatEditChanged;
        if (this.isModeEditSingle) {
          ret = ret
            || this.nameEditChanged
            || this.hardwareIdEditChanged
            || this.cat2HouseIDEditChanged;
        }
        return ret;
      };
    }

    return v;
  },
  computed: {
    isModeCreate() {
      return this.mode === this.availableMode.create;
    },
    isModeEditSingle() {
      return this.mode === this.availableMode.editSingle;
    },
    isModeEditBulk() {
      return this.mode === this.availableMode.editBulk;
    },
    nameEditChanged() {
      return this.$watchEditChangedProperty('name', false);
    },
    entityEditChanged() {
      return this.$watchEditChangedProperty('entity', true, null);
    },
    hardwareIdEditChanged() {
      return this.$watchEditChangedProperty('hardwareId', false);
    },
    timezoneEditChanged() {
      return this.$watchEditChangedProperty('timezone.value', true, null);
    },
    gpsLatitudeEditChanged() {
      return this.$watchEditChangedProperty('gpsLatitude', true);
    },
    gpsLongitudeEditChanged() {
      return this.$watchEditChangedProperty('gpsLongitude', true);
    },
    forwardURLEditChanged() {
      return this.$watchEditChangedProperty('forwardURL', true);
    },
    forwardFileFormatEditChanged() {
      return this.$watchEditChangedProperty('forwardFileFormat.value', true, null);
    },
    cat2HouseIDEditChanged() {
      return this.$watchEditChangedProperty('cat2HouseID', true);
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
  },
  created() {
    if (this.mode !== this.availableMode.create) {
      this.$loadEditData();
    }
  },
  watch: {
    'deviceInternal.stringHardwareId': {
      handler(newVal) {
        const x = Number.parseInt(newVal, 16);
        if (!Number.isNaN(x)) {
          this.device.hardwareId = utilDevice.toInt32(x);
        } else {
          this.device.hardwareId = x;
        }
      },
    },
    'deviceInternal.tickedEntity': {
      handler(newVal) {
        if (newVal.length) {
          this.device.entity = this.internalTreeOptions.map[newVal[0]];
        } else {
          this.device.entity = null;
        }
      },
    },
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
        if (canBeNull && _.get(this.device, propertyPath) === ev) {
          return _.get(this.deviceEditOriginal, propertyPath) !== ev;
        }
        return _.get(this.device, propertyPath) !== _.get(this.deviceEditOriginal, propertyPath);
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

      // Load device data from data store
      if (this.isModeEditSingle || this.isModeEditBulk) {
        // Load device from store
        const devicesToEdit = this.deviceRows.filter(d => this.editKeys.indexOf(d.id) !== -1);
        // Be sure all device has been found and load
        if (devicesToEdit.length !== this.editKeys.length) {
          // Invalid parameters, emit to parent
          this.$emit('invalid-parameters');
          return;
        }

        // Get first device as we are editing one or more devices
        const firstDevice = devicesToEdit[0];

        // According edit mode, set local data from store's data
        if (this.isModeEditSingle) {
          // Set name
          this.device.name = firstDevice.name;
          this.deviceEditOriginal.name = firstDevice.name;

          // Set entity
          const et = this.entitiesToTree.hashIds[firstDevice.parent_id];
          // Clear the array and add the the parent entity only if it exists
          if (et) {
            this.deviceInternal.tickedEntity
              .splice(0, this.deviceInternal.tickedEntity.length, et.id);
          } else {
            this.deviceInternal.tickedEntity
              .splice(0, this.deviceInternal.tickedEntity.length);
          }
          this.deviceEditOriginal.entity = et;

          // Set hardware id
          this.device.hardwareId = firstDevice.hardware_id;
          this.deviceEditOriginal.hardwareId = firstDevice.hardware_id;
          this.deviceInternal.stringHardwareId = utilDevice
            .int32HardwareIdToHex(firstDevice.hardware_id);

          // Set timezone
          const foundFirstTimezone = this.getTimeZoneList
            .find(t => t.value === firstDevice.timezone);
          this.device.timezone = foundFirstTimezone;
          this.deviceEditOriginal.timezone = foundFirstTimezone;

          // Set gps latitude
          this.device.gpsLatitude = firstDevice.gps_latitude;
          this.deviceEditOriginal.gpsLatitude = firstDevice.gps_latitude;

          // Set gps longitude
          this.device.gpsLongitude = firstDevice.gps_longitude;
          this.deviceEditOriginal.gpsLongitude = firstDevice.gps_longitude;

          // Set gps forward URL
          this.device.forwardURL = firstDevice.forward_url;
          this.deviceEditOriginal.forwardURL = firstDevice.forward_url;

          // Set gps forward File format
          const firstForwardFileFormat = this.fileForwardFormatOptions
            .find(f => f.value === firstDevice.forward_file_format);
          this.device.forwardFileFormat = firstForwardFileFormat;
          this.deviceEditOriginal.forwardFileFormat = firstForwardFileFormat;

          // Set CAT2 house ID
          this.device.cat2HouseID = firstDevice.cat2_house_id;
          this.deviceEditOriginal.cat2HouseID = firstDevice.cat2_house_id;
        } else {
          // Set entity
          const entityParentId = this.$bulkSetPropertyToArraySameValue(
            devicesToEdit,
            'parent_id',
            firstDevice,
            null,
          );
          let et = null;
          if (entityParentId !== null) {
            et = this.entitiesToTree.hashIds[entityParentId] || null;
          }
          // Clear the array and add the the parent entity only if it exists
          if (et) {
            this.deviceInternal.tickedEntity
              .splice(0, this.deviceInternal.tickedEntity.length, et.id);
          } else {
            this.deviceInternal.tickedEntity
              .splice(0, this.deviceInternal.tickedEntity.length);
          }
          this.deviceEditOriginal.entity = et;

          // Set timezone
          const tz = this.$bulkSetPropertyToArraySameValue(
            devicesToEdit,
            'timezone',
            firstDevice,
            null,
          );
          const tzOption = this.getTimeZoneList
            .find(t => t.value === tz);
          this.device.timezone = tzOption;
          this.deviceEditOriginal.timezone = tzOption;

          // Set gps latitude
          const gpsLa = this.$bulkSetPropertyToArraySameValue(
            devicesToEdit,
            'gps_latitude',
            firstDevice,
            null,
          );
          this.device.gpsLatitude = gpsLa;
          this.deviceEditOriginal.gpsLatitude = gpsLa;

          // Set gps longitude
          const gpsLo = this.$bulkSetPropertyToArraySameValue(
            devicesToEdit,
            'gps_longitude',
            firstDevice,
            null,
          );
          this.device.gpsLongitude = gpsLo;
          this.deviceEditOriginal.gpsLongitude = gpsLo;

          // Set forward url
          const fURL = this.$bulkSetPropertyToArraySameValue(
            devicesToEdit,
            'forward_url',
            firstDevice,
            null,
          );
          this.device.forwardURL = fURL;
          this.deviceEditOriginal.forwardURL = fURL;

          // Set forward file format
          const fType = this.$bulkSetPropertyToArraySameValue(
            devicesToEdit,
            'forward_file_format',
            firstDevice,
            null,
          );
          const fTypeOption = this.fileForwardFormatOptions
            .find(f => f.value === fType);
          this.device.forwardFileFormat = fTypeOption;
          this.deviceEditOriginal.forwardFileFormat = fTypeOption;
        }
      }
    },
    // Build the edited object before submiting the result
    $buildEditedSubmitResult(deviceId) {
      const result = {};
      result.id = deviceId;
      if (!this.isModeEditBulk && this.nameEditChanged) {
        result.name = this.device.name;
      }
      if (this.entityEditChanged) {
        result.entity = this.device.entity;
      }
      if (!this.isModeEditBulk && this.hardwareIdEditChanged) {
        result.hardwareId = this.device.hardwareId;
      }
      if (this.timezoneEditChanged) {
        result.timezone = typeof this.device.timezone === 'object'
          ? this.device.timezone.value
          : null;
      }
      if (this.gpsLatitudeEditChanged) {
        result.gpsLatitude = this.device.gpsLatitude;
      }
      if (this.gpsLongitudeEditChanged) {
        result.gpsLongitude = this.device.gpsLongitude;
      }
      if (this.forwardURLEditChanged) {
        result.forwardURL = this.device.forwardURL;
      }
      if (this.forwardFileFormatEditChanged) {
        result.forwardFileFormat = typeof this.device.forwardFileFormat === 'object'
          ? this.device.forwardFileFormat.value
          : null;
      }
      if (!this.isModeEditBulk && this.cat2HouseIDEditChanged) {
        result.cat2HouseID = this.device.cat2HouseID;
      }
      result.updated_at = this.deviceRows.find(d => d.id === deviceId).updated_at;
      return result;
    },
    // Validate form
    touchForm() {
      this.$v.device.$touch();
      if (this.$v.deviceInternal) {
        this.$v.deviceInternal.$touch();
      }
    },
    // Validate form and emit a submit signal
    validateFormAndEmitHandler() {
      this.touchForm();
      let hasError = this.$v.device.$error;
      if (!hasError && this.$v.deviceInternal) {
        hasError = this.$v.deviceInternal.$error;
      }
      if (!hasError) {
        // If we are in edit mode, only returns field that has been changed
        if (this.isModeCreate) {
          const cDevice = _.cloneDeep(this.device);
          cDevice.forwardFileFormat = typeof this.device.forwardFileFormat === 'object'
            ? this.device.forwardFileFormat.value
            : null;
          cDevice.timezone = typeof this.device.timezone === 'object'
            ? this.device.timezone.value
            : null;
          this.$emit('submit', cDevice);
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
.admin-device-create-edit {

}
</style>
