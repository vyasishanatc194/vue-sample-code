<template>
  <div class="units-container">
    <!-- START: Units Section -->
      <page-section
        :title="$t('userSettings.units.title')"
        :subTitle="$t('userSettings.units.subTitle')">
        <div slot="card-section" class="row q-col-gutter-x-md q-col-gutter-y-lg">
          <div class="col-6 col-100" v-for="(uc) in getPreferenceUnit" :key="uc.id">
            <select-box
              v-model="units.unitContextListModels[uc.id]"
              :options="uc.unitsAvailable"
              :placeholder="uc.nameLocale"
              :title="uc.nameLocale"
              @input="(options) => handleUnitChange(uc.unitContextID, options.value)"
              class="field-label"
            />

            <div v-if="$v.units.unitContextListModels[uc.id].$error
              && !$v.units.unitContextListModels[uc.id].required"
              class="error-validation">
              {{ $t("userSettings.units.unitRequired") }}
            </div>
          </div>
        </div>
      </page-section>
      <!-- END: Units Section -->
  </div>
</template>

<script>
import _ from 'lodash';
import UtilUnit from 'src/common/utils/unit';
import { required } from 'vuelidate/lib/validators';
import { PageSection } from 'src/common/components/PageSection';
import SelectBox from 'src/common/components/SelectBox';
import userSettingsAPI from 'src/api/user-settings';

export default {
  name: 'units',
  components: {
    PageSection,
    SelectBox,
  },
  data() {
    return {
      units: {
        unitContextListModels: {},
      },
    };
  },
  created() {
    this.setupLocaleChangedMutationWatcher();
    this.initializeModels();
  },
  validations() {
    const validations = {
      units: {
        unitContextListModels: this.buildUnitDynamicValidationRules(),
      },
    };
    return validations;
  },
  methods: {
    setupLocaleChangedMutationWatcher() {
      this.$store.subscribe((mutation) => {
        if (mutation.type === 'user/languageSet') {
          this.reloadUnitsFromServer();
        }
      });
    },
    reloadUnitsFromServer() {
      return userSettingsAPI.getUnits()
        .then((response) => {
          // TODO: Object property names changed on V1
          // They cannot be changed in util/units as it would breake the APP. For now simply
          // remap them to old names
          const unitsWithOldPropertyNames = {
            unit: response.data.units.units,
            category: response.data.units.unitCategories,
            context: response.data.units.unitContexts,
            contextPrecision: response.data.units.unitContextPrecisions,
          };
          this.$store.commit('user/saveUnitList', {
            unitList: unitsWithOldPropertyNames,
          });

          UtilUnit.resetUnitConverterCache();

          this.initializeModels();
        });
    },
    buildUnitDynamicValidationRules() {
      const dynamicRules = {};
      this.getPreferenceUnit.forEach((unit) => {
        dynamicRules[unit.id] = {
          value: {
            required,
            requiredValidValue(selectedValue) {
              return typeof selectedValue === 'number';
            },
          },
        };
      });
      return dynamicRules;
    },
    validateForm() {
      this.$v.units.$touch();
      const isValid = this.$v.units.$error === false;
      return isValid;
    },
    findUserSelectedUnitInAvailableUnits(unitContext, userUnitID) {
      return unitContext.unitsAvailable
        .find(availableUnit => availableUnit.value === userUnitID);
    },
    initializeUnitModel(unitContext) {
      const unitConverter = UtilUnit
        .getUnitConverterFromUnitContextID(unitContext.id);
      const userUnit = unitConverter.getUserUnit();
      const selectedAvailableUnitReference = this
        .findUserSelectedUnitInAvailableUnits(unitContext, userUnit.id);
      this.$set(
        this.units.unitContextListModels,
        unitContext.id,
        selectedAvailableUnitReference,
      );
    },
    initializeUnitModels() {
      this.units.unitContextListModels = {};
      this.getPreferenceUnit.forEach((unitContext) => {
        this.initializeUnitModel(unitContext);
      });
    },
    initializeModels() {
      this.initializeUnitModels();
    },
    handleUnitChange(unitContextID, unitID) {
      if (this.validateForm() === true) {
        const units = [{
          unit_context_id: unitContextID,
          unit_id: unitID,
        }];
        this.$store.dispatch('user/setUnits', { units })
          .then(() => this.$showSuccessNotification(
            this.$t('userSettings.units.unitChangedSuccessfully'),
          ))
          .catch(this.$showErrorNotification);
      }
    },
    isContextShouldBeExcludedFromConfigurable(unitContext) {
      return unitContext.name !== 'Part Per Million'
          && unitContext.name !== 'Percentage';
    },
  },
  computed: {
    getConfigurableUnitContexts() {
      return UtilUnit.getUnitContextList()
        .filter((unitContext) => {
          let countUnitInThisCategory = 0;
          _(UtilUnit.getUnitList()).forEach((unit) => {
            if (unit.unitCategoryID === unitContext.unitCategoryID) {
              countUnitInThisCategory += 1;
            }
            const continueCounting = (countUnitInThisCategory <= 1);
            return continueCounting;
          });

          return countUnitInThisCategory > 1
            && this.isContextShouldBeExcludedFromConfigurable(unitContext) === true;
        });
    },
    getPreferenceUnit() {
      const unitContextList = _(this.getConfigurableUnitContexts)
        .sortBy(['nameLocale'])
        .each((unitContext) => {
          const unitContextRef = unitContext;
          const unitsAvailable = UtilUnit.getUnitList()
            .filter(unit => unit.unitCategoryID === unitContextRef.unitCategoryID)
            .map(unit => ({
              value: unit.id,
              label: unit.nameLocale,
            }));
          unitContextRef.unitContextID = unitContext.id;
          unitContextRef.unitsAvailable = unitsAvailable;
        });
      return unitContextList;
    },
  },
};
</script>

<style lang="stylus" scoped>
.units-container {
  .error-validation {
    color: $negative;
    clear: both;
    font-size: 70%;
  }
  .field-label >>> label {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: -0.375rem;
  }
  @media (max-width: 767px) {
    .col-50 {
      width: 50%;
    }
    .col-100 {
      width: 100%;
    }
  }
  @media only screen and (min-device-width: 1024px) and (max-device-width: 1366px) \
    and (orientation: portrait) {
    .col-50 {
      width: 50%;
    }
    .col-100 {
      width: 100%;
    }
  }
}
</style>
