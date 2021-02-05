<template>
  <q-page padding>

    <page-box-container class="preferenceBoxContainer">

      <!-- Page container of security -->
      <page-box v-if="getConfigurableUnitContext" :title="$t('preference.security.title')">

        <!-- Security password sub-title -->
        <div class="full-width gutter-y-md">
          <div class="row item-center">
              <h2 class="subTitle">{{ $t('preference.security.changePassword') }}</h2>
          </div>

          <!-- Security password current -->
          <div class="row">
            <div class="offset-xs-1 col-10">

              <q-input
                v-model.trim="security.current"
                @keydown.enter.native="handleSecurityChange"
                type="password"
                @input="$v.security.$touch()"
                :label="$t('preference.security.passwordCurrent')">
                <template v-slot:prepend>
                  <q-icon name="lock_outline"></q-icon>
                </template>
              </q-input>

              <div v-if="$v.security.current.$error && !$v.security.current.required"
                class="error-validation">
                {{ $t("preference.security.currentPasswordRequired") }}
              </div>

            </div>
          </div>

          <!-- Security password new -->
          <div class="row">
            <div class="offset-xs-1 col-10">

              <q-input
                v-model.trim="security.new"
                @keydown.enter.native="handleSecurityChange"
                type="password"
                @input="$v.security.$touch()"
                :label="$t('preference.security.passwordNew')">
                <template v-slot:prepend>
                  <q-icon name="lock"></q-icon>
                </template>
              </q-input>

              <div v-if="$v.security.new.$error && !$v.security.new.required"
                class="error-validation">
                {{ $t("preference.security.newPasswordRequired") }}
              </div>
              <div v-if="$v.security.new.$error && !$v.security.new.minLength"
                class="error-validation">

                {{ $t("preference.security.newPasswordMinLength",
                  { min: $v.security.new.$params.minLength.min })
                }}
              </div>
              <div v-if="$v.security.new.$error && !$v.security.new.isDifferentThenCurrent"
                class="error-validation">
                {{ $t("preference.security.newPasswordShouldBeDifferenThanCurrent") }}
              </div>

            </div>
          </div>

          <!-- Security password confirm -->
          <div class="row">
            <div class="offset-xs-1 col-10">

              <q-input
                v-model.trim="security.confirm"
                @keydown.enter.native="handleSecurityChange"
                type="password"
                @input="$v.security.$touch()"
                :label="$t('preference.security.passwordConfirm')">
                <template v-slot:prepend>
                  <q-icon name="fingerprint"></q-icon>
                </template>
              </q-input>

              <div v-if="$v.security.confirm.$error && !$v.security.confirm.required"
                class="error-validation">
                {{ $t("preference.security.confirmPasswordRequired") }}
              </div>

              <div v-if="$v.security.confirm.$error && !$v.security.confirm.sameAsNewPassword"
                class="error-validation">
                {{ $t("preference.security.confirmPasswordSameAs") }}
              </div>
            </div>
          </div>

        </div>

        <!-- Security apply button -->
        <div slot="footer" class="row justify-end">
          <q-btn color="primary"
            @click.prevent="handleSecurityChange"
            :disable="handleSecurityChangeInProgress">
              {{ $t("preference.security.securityApply") }}
          </q-btn>
        </div>

      </page-box>

      <!-- Page container of preferences -->
      <page-box :title="$t('preference.preference.title')">

        <!-- Preferences region sub-title -->
        <div class="full-width">
          <div class="row item-center vertical-space">
              <h2 class="subTitle">{{ $t('preference.preference.region') }}</h2>
          </div>

          <!-- Timezone -->
          <div class="row">
            <div class="offset-xs-1 col-10">

              <q-select
                v-model="preference.timeZone"
                use-input
                :label="$t('preference.preference.timeZone')"
                :options="filterTimezoneOptions"
                @filter="filterTimezone">
                <template v-slot:prepend>
                  <q-icon name="access_time"></q-icon>
                </template>
              </q-select>

              <div v-if="$v.preference.timeZone.$error && !$v.preference.timeZone.required"
                class="error-validation">
                {{ $t("preference.preference.timeZoneRequired") }}
              </div>

            </div>
          </div>

          <!-- Language -->
          <div class="row">
            <div class="offset-xs-1 col-10">

              <q-select
                v-model="preference.language"
                :label="$t('preference.preference.language')"
                :options="getLanguageList">
                <template v-slot:prepend>
                  <q-icon name="language"></q-icon>
                </template>
              </q-select>

              <div v-if="$v.preference.language.$error && !$v.preference.language.required"
                class="error-validation">
                {{ $t("preference.preference.languageRequired") }}
              </div>

            </div>
          </div>


          <!-- Preferences unit sub-title -->
          <div class="row item-center vertical-space">
            <h2 class="subTitle">{{ $t('preference.preference.unit') }}</h2>
          </div>

          <!-- Units -->
          <div class="row"
            v-for="(uc) in getPreferenceUnit" :key="uc.id">
            <div class="offset-xs-1 col-10">

              <q-select
                ref="selectUnit"
                v-model="preference.unitContextListModels[uc.id]"
                :label="uc.nameLocale"
                :options="uc.unitsAvailable">
                <template v-slot:prepend>
                  <q-icon name="transform"></q-icon>
                </template>
              </q-select>

              <div v-if="$v.preference.unitContextListModels[uc.id].$error
                && !$v.preference.unitContextListModels[uc.id].required"
                class="error-validation">
                {{ $t("preference.preference.unitRequired") }}
              </div>
            </div>
          </div>

        </div>

        <!-- Preferences apply button -->
        <div slot="footer" class="row justify-end">
          <q-btn color="primary"
            @click.prevent="handlePrefrenceChange"
            :disable="handlePrefrenceChangeInProgress">
              {{ $t("preference.preference.apply") }}
          </q-btn>
        </div>

      </page-box>

    </page-box-container>

  </q-page>
</template>

<script>
import { mapGetters } from 'vuex';
import _ from 'lodash';
import { required, sameAs, minLength } from 'vuelidate/lib/validators';
import userSetting from 'src/api/setting';
import UtilUnit from 'src/common/utils/unit';
import { PageBoxContainer, PageBox } from 'src/common/components/PageBox';

export default {
  name: 'preferences',
  components: {
    PageBoxContainer,
    PageBox,
  },
  created() {
    // Preset user's value for each list
    this.presetValues();
  },
  computed: {
    ...mapGetters('user', ['getLanguageListKeys']),
    getConfigurableUnitContext() {
      // Get all configurable unit's context
      // Keep only unit context that have more than one unit in its cateogry
      return UtilUnit.getUnitContextList()
        .filter((unitContext) => {
          let countUnitInThisCategory = 0;
          _(UtilUnit.getUnitList()).forEach((unit) => {
            if (unit.unitCategoryID === unitContext.unitCategoryID) {
              countUnitInThisCategory += 1;
            }
            // Returning false for a forEach stop the iteration
            const continueCounting = (countUnitInThisCategory <= 1);
            return continueCounting;
          });
          return countUnitInThisCategory > 1;
        });
    },
    getPreferenceUnit() {
      // Get all unit context and their unit options
      const unitContextList = _(this.getConfigurableUnitContext)
        .sortBy(['nameLocale'])
        .each((unitContext) => {
          const unitContextRef = unitContext;
          const unitsAvailable = UtilUnit.getUnitList()
            .filter(unit => unit.unitCategoryID === unitContextRef.unitCategoryID)
            .map(unit => ({
              value: unit.id,
              label: unit.nameLocale,
            }));
          unitContextRef.unitsAvailable = unitsAvailable;
        });
      return unitContextList;
    },
    getLanguageList() {
      return this.getLanguageListKeys.map(x => ({
        value: x,
        label: this.$t(`language.${x}`),
      }));
    },
    getTimeZoneList() {
      return this.$moment.tz.names().map(t => ({
        value: t,
        label: t,
      }));
    },
  },
  data() {
    return {
      filterTimezoneOptions: this.getTimeZoneList,
      handleSecurityChangeInProgress: false,
      handlePrefrenceChangeInProgress: false,
      security: {
        current: '',
        new: '',
        confirm: '',
        error: undefined,
      },
      preference: {
        timeZone: '',
        language: '',
        languageList: [],
        unitContextListModels: {},
      },
    };
  },
  // Get forms validations
  validations() {
    const v = {
      // Security form validation
      security: {
        current: {
          required,
        },
        new: {
          required,
          minLength: minLength(6),
          isDifferentThenCurrent(value, parentVm) {
            return value !== parentVm.current;
          },
        },
        confirm: {
          required,
          sameAsNewPassword: sameAs('new'),
        },
      },
      // Preference form validation
      preference: {
        timeZone: {
          value: {
            required,
          },
        },
        language: {
          value: {
            required,
          },
        },
        unitContextListModels: {},
      },
    };
    // Unit are dynamic
    this.getPreferenceUnit.forEach((u) => {
      v.preference.unitContextListModels[u.id] = {
        value: {
          required,
          requiredValidValue(o) {
            return typeof o === 'number';
          },
        },
      };
    });
    return v;
  },
  methods: {
    // For each list preset their value based on users preference value
    presetValues() {
      // Initialize model preference's timezone
      this.preference.timeZone = this.getTimeZoneList
        .find(x => x.value === this.$store.state.user.timeZone);

      // Initialize model preference's language
      this.preference.language = this.getLanguageList
        .find(x => x.value === this.$store.state.user.language);

      // Initalize model and model selection of preference's unit
      this.preference.unitContextListModels = {};
      this.getPreferenceUnit.forEach((unitContext) => {
        // Find selected unit of this unit context
        const unitConverter = UtilUnit.getUnitConverterFromUnitContextID(unitContext.id);
        const userUnit = unitConverter.getUserUnit();
        const selectedUnitAvailableReference = unitContext.unitsAvailable
          .find(unitAvailable => unitAvailable.value === userUnit.id);
        this.$set(
          this.preference.unitContextListModels,
          unitContext.id,
          selectedUnitAvailableReference,
        );
      });
    },
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
            v => v.value.toLowerCase().indexOf(tzlc) > -1,
          );
        });
      }
    },
    handleSecurityChange() {
      // Validate form
      this.$v.security.$touch();
      if (!this.$v.security.$error) {
        // Change user password
        this.handleSecurityChangeInProgress = true;
        userSetting
          .changePassword(this.security.current, this.security.new)
          .then((response) => {
            if (response.error) {
              throw response.error;
            }

            this.$q.notify({
              timeout: this.$alertTimeoutMs,
              color: 'positive',
              message: this.$t('preference.security.passwordChangedSuccessfully'),
              icon: 'thumb_up',
            });
          })
          .catch((error) => {
            this.$q.notify({
              color: 'negative',
              message: error.message || error,
              icon: 'report_problem',
            });
          })
          .then(() => {
            this.handleSecurityChangeInProgress = false;
          });
      }
    },
    handlePrefrenceChange() {
      // Validate form
      this.$v.preference.$touch();
      if (!this.$v.preference.$error) {
        this.handlePrefrenceChangeInProgress = true;
        const unit = [];
        for (let i = 0; i < this.getPreferenceUnit.length; i += 1) {
          const ctxId = this.getPreferenceUnit[i].id;
          unit.push({
            unit_context_id: ctxId,
            unit_id: this.preference.unitContextListModels[ctxId].value,
          });
        }
        this.$store
          .dispatch('user/changePreferences', {
            timeZone: this.preference.timeZone.value,
            language: this.preference.language.value,
            unit,
          })
          .then(() => {
            // Force unit utility to reset its cache of UnitConverter because
            // user's preferred units may have changed for some unit context
            UtilUnit.resetUnitConverterCache();

            // Force the update of the inner array of options set to each unit
            // element otherwise the `presetValue` function will not use
            // the new element referenced by switch of the new language
            this.$refs.selectUnit.options = this.getPreferenceUnit;

            // Force re-render of this component
            this.$forceUpdate();

            // Preset user's value for each list
            this.presetValues();

            // Notify about the application of preferences
            this.$q.notify({
              timeout: this.$alertTimeoutMs,
              color: 'positive',
              message: this.$t('preference.preference.changedSuccessfully'),
              icon: 'thumb_up',
            });
          })
          .catch((error) => {
            this.$q.notify({
              color: 'negative',
              message: error.message || error,
              icon: 'report_problem',
            });
          })
          .then(() => {
            this.handlePrefrenceChangeInProgress = false;
          });
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.preferenceBoxContainer {
  max-width: 60rem;

  h2 {
    margin-left: 0.8rem;
  }

  .subTitle {
    line-height: 1.8rem;
    font-size: 1.4rem;
  }
}
</style>
