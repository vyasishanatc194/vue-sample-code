<template>
  <div class="account-preferences-container">
    <!-- START: Alert & Notifications Section -->
    <page-section
      :title="$t('userSettings.alertAndNotifications.title')"
      :subTitle="$t('userSettings.alertAndNotifications.subTitle')"
      actionAlign="right">
      <div slot="card-section" class="row q-col-gutter-x-md q-col-gutter-y-lg">
        <div class="col-12">
          <label>
            <strong>{{ $t('userSettings.alertAndNotifications.alertTitle') }}</strong>
            <p class="label-caption">
              {{ $t('userSettings.alertAndNotifications.alertSubTitle') }}
            </p>
          </label>
          <check-box
            v-model="alerts.newIsEmailEnabled"
            :title="$t('userSettings.alertAndNotifications.alertTitle')"
            label="Email"
            :labelCaption="$t('userSettings.alertAndNotifications.alertSubTitle')"
            @input="updateAlerts"
          />
          <check-box
            v-model="alerts.newIsSMSEnabled"
            :title="$t('userSettings.alertAndNotifications.alertTitle')"
            label="SMS"
            :labelCaption="$t('userSettings.alertAndNotifications.alertSubTitle')"
            @input="updateAlerts"
          />
        </div>
        <div class="col-12">
          <label>
            <strong>{{ $t('userSettings.alertAndNotifications.notificationsTitle') }}</strong>
            <p class="label-caption">
              {{ $t('userSettings.alertAndNotifications.notificationsSubTitle') }}
            </p>
          </label>
          <check-box
            v-model="notifications.newIsEmailEnabled"
            :title="$t('userSettings.alertAndNotifications.alertTitle')"
            label="Email"
            :labelCaption="$t('userSettings.alertAndNotifications.notificationsTitle')"
            @input="updateNotifications"
          />
          <check-box
            v-model="notifications.newIsSMSEnabled"
            :title="$t('userSettings.alertAndNotifications.alertTitle')"
            label="SMS"
            :labelCaption="$t('userSettings.alertAndNotifications.notificationsSubTitle')"
            @input="updateNotifications"
          />
        </div>
      </div>
    </page-section>
    <!-- END: Alert & Notifications Section -->
  </div>
</template>

<script>
import { PageSection } from 'src/common/components/PageSection';
import CheckBox from 'src/common/components/CheckBox';
import userSettingsAPI from 'src/api/user-settings';

export default {
  name: 'alert-and-notification',
  components: {
    PageSection,
    CheckBox,
  },
  inject: ['userInformation'],
  data() {
    return {
      alerts: {},
      notifications: {},
    };
  },
  created() {
    return this.initializeModels();
  },
  methods: {
    initializeModels() {
      return this.loadAccountPreferencesFromUserInformation();
    },
    loadAccountPreferencesFromUserInformation() {
      const info = this.userInformation();
      this.alerts = {
        newIsEmailEnabled: info.alert_by_email,
        newIsSMSEnabled: info.alert_by_sms,
      };
      this.notifications = {
        newIsEmailEnabled: info.notification_by_email,
        newIsSMSEnabled: info.notification_by_sms,
      };
    },
    updateAlerts() {
      return userSettingsAPI.setAlerts({
        newIsEmailEnabled: this.alerts.newIsEmailEnabled,
        newIsSMSEnabled: this.alerts.newIsSMSEnabled,
      })
        .then(() => this.$showSuccessNotification(
          this.$t('userSettings.alertAndNotifications.alertChangedSuccessfully'),
        ))
        .catch(this.$showErrorNotification);
    },
    updateNotifications() {
      return userSettingsAPI.setNotifications({
        newIsEmailEnabled: this.notifications.newIsEmailEnabled,
        newIsSMSEnabled: this.notifications.newIsSMSEnabled,
      })
        .then(() => this.$showSuccessNotification(
          this.$t('userSettings.alertAndNotifications.notificationsChangedSuccessfully'),
        ))
        .catch(this.$showErrorNotification);
    },
  },
};
</script>

<style lang="stylus" scoped>
</style>
