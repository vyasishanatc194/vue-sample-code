<template>
  <div class="account-preferences-container">
    <!-- START: Account Preferences Section -->
    <page-section
      :title="$t('userSettings.accountPreferences.title')"
      :subTitle="$t('userSettings.accountPreferences.subTitle')">
      <div slot="card-section" class="row q-col-gutter-x-md q-col-gutter-y-lg">
        <div class="col-12">
          <select-box
            v-model="accountPreferences.locale"
            :options="localesOptions"
            :placeholder="$t('userSettings.accountPreferences.language')"
            :title="$t('userSettings.accountPreferences.language')"
            @input="handleLanguageChange"
          />

          <div v-if="$v.accountPreferences.locale.$error
            && !$v.accountPreferences.locale.required"
            class="error-validation">
            {{ $t("userSettings.accountPreferences.languageRequired") }}
          </div>
        </div>
        <div class="col-12">
          <select-box
            v-model="accountPreferences.timeZone"
            :options="filterTimezoneOptions"
            :placeholder="$t('userSettings.accountPreferences.timeZone')"
            @filter="filterTimezone"
            :title="$t('userSettings.accountPreferences.timeZone')"
            :hint="$t('userSettings.accountPreferences.timeZoneSubTitle')"
            class="select-box-bottom-spacer"
            @input="handleTimeZoneChange"
          />

          <div v-if="$v.accountPreferences.timeZone.$error
            && !$v.accountPreferences.timeZone.required"
            class="error-validation">
            {{ $t("userSettings.accountPreferences.timeZoneRequired") }}
          </div>
        </div>
        <div class="col-12">
          <toggle-button
            :title="$t('userSettings.accountPreferences.displayCorporateLogo')"
            size="lg"
            v-model="accountPreferences.displayCorporateLogo"
            :labelCaption="$t('userSettings.accountPreferences.displayCorporateLogoCaption')"
            @input="handleDisplayCorporateLogo"
          />
        </div>
      </div>
    </page-section>
    <!-- End: Account Preferences Section -->
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { PageSection } from 'src/common/components/PageSection';
import SelectBox from 'src/common/components/SelectBox';
import ToggleButton from 'src/common/components/ToggleButton';
import userSettingsAPI from 'src/api/user-settings';
import timeZonesAPI from 'src/api/time-zones';
import localesAPI from 'src/api/locales';

export default {
  name: 'account-preferences',
  components: {
    PageSection,
    SelectBox,
    ToggleButton,
  },
  inject: ['userInformation'],
  data() {
    return {
      accountPreferences: {},
      filterTimezoneOptions: this.timeZoneOptions,
      timeZones: [],
      locales: [],
    };
  },
  created() {
    return this.initializeModels()
      .catch(this.$showErrorNotification);
  },
  validations() {
    const validations = {
      accountPreferences: {
        timeZone: {
          value: {
            required,
          },
        },
        locale: {
          value: {
            required,
          },
        },
      },
    };
    return validations;
  },
  methods: {
    findTimeZoneOption(timeZone) {
      return this.timeZoneOptions.find(currentTimeZone => currentTimeZone.value === timeZone);
    },
    findLocaleOption(locale) {
      return this.localesOptions.find(currentLocale => currentLocale.value === locale);
    },
    loadAccountPreferencesFromUserInformation() {
      const info = this.userInformation();
      this.accountPreferences = {
        timeZone: this.findTimeZoneOption(info.time_zone),
        locale: this.findLocaleOption(info.locale_name),
        displayCorporateLogo: info.display_corporate_logo,
      };
    },
    loadLocaleList() {
      return localesAPI.getList()
        .then((response) => {
          this.locales = response.data.data.locales;
        });
    },
    loadTimeZoneList() {
      return timeZonesAPI.getList()
        .then((response) => {
          this.timeZones = response.data.data.time_zones;
        });
    },
    initializeModels() {
      return this.loadLocaleList()
        .then(() => this.loadTimeZoneList())
        .then(() => this.loadAccountPreferencesFromUserInformation());
    },
    filterOptions(filterValue) {
      return this.timeZoneOptions.filter(
        option => option.value.toLowerCase().indexOf(filterValue) > -1,
      );
    },
    isStringEmpty(value) {
      return value.trim().length === 0;
    },
    filterTimezone(value, updateValue) {
      if (this.isStringEmpty(value) === true) {
        updateValue(() => {
          this.filterTimezoneOptions = this.timeZoneOptions;
        });
      } else {
        updateValue(() => {
          const valueInLowerCase = value.toLowerCase();
          this.filterTimezoneOptions = this.filterOptions(valueInLowerCase);
        });
      }
    },
    validateFormElements(elements) {
      let elementsRef = elements;
      if (Array.isArray(elements) === false) {
        elementsRef = [elementsRef];
      }
      let isValid = true;
      elementsRef.forEach((element) => {
        this.$v.accountPreferences[element].$touch();
        if (isValid === true) {
          isValid = this.$v.accountPreferences[element].$error === false;
        }
      });
      return isValid;
    },
    handleLanguageChange() {
      if (this.validateFormElements('locale') === true) {
        this.$store.dispatch('user/setLocale', {
          locale: this.accountPreferences.locale.value,
        })
          .then(() => this.$showSuccessNotification(
            this.$t('userSettings.accountPreferences.languageChangedSuccessfully'),
          ))
          .catch(this.$showErrorNotification);
      }
    },
    handleTimeZoneChange() {
      if (this.validateFormElements('timeZone') === true) {
        userSettingsAPI.setTimeZone(this.accountPreferences.timeZone.value)
          .then(() => this.$showSuccessNotification(
            this.$t('userSettings.accountPreferences.timeZoneChangedSuccessfully'),
          ))
          .catch(this.$showErrorNotification);
      }
    },
    handleDisplayCorporateLogo() {
      userSettingsAPI.setDisplayCorporateLogo(this.accountPreferences.displayCorporateLogo)
        .then(() => this.$showSuccessNotification(
          this.$t('userSettings.accountPreferences.displayCorporateLogoChangedSuccessfully'),
        ))
        .catch(this.$showErrorNotification);
    },
  },

  computed: {
    localesOptions() {
      return this.locales.map(locale => ({
        value: locale.name,
        label: locale.description,
      }));
    },
    timeZoneOptions() {
      return this.timeZones.map(timeZone => ({
        value: timeZone,
        label: timeZone,
      }));
    },
  },
};
</script>

<style lang="stylus" scoped>
.account-preferences-container {
  .select-box-bottom-spacer {
    padding-bottom: 1.5rem;
  }
}
</style>
