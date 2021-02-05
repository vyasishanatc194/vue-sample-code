<template>
  <div>
    <title-bar
      :title="$t('userSettings.title')"
    />
    <q-page padding class="user-settings-container">
      <!-- START: Page Section Container -->
      <page-section-container class="q-gutter-y-lg">
        <!-- Personal Details -->
        <personal-details v-if="this.isUserInformationLoaded" />
        <!-- Account Preferences -->
        <account-preferences v-if="this.isUserInformationLoaded" />
        <!-- Alert And Notification -->
        <alert-and-notification v-if="this.isUserInformationLoaded" />
        <!-- Security -->
        <security  v-if="this.isUserInformationLoaded" />
        <!-- Units -->
        <units  v-if="this.isUserInformationLoaded" />
      </page-section-container>
      <!-- END: Page Section Container -->
    </q-page>
  </div>
</template>

<script>
import { PageSectionContainer } from 'src/common/components/PageSection';
import TitleBar from 'src/common/components/TitleBar';
import PersonalDetails from 'src/pages/UserSettings/components/PersonalDetails';
import AccountPreferences from 'src/pages/UserSettings/components/AccountPreferences';
import AlertAndNotification from 'src/pages/UserSettings/components/AlertAndNotification';
import Security from 'src/pages/UserSettings/components/Security';
import Units from 'src/pages/UserSettings/components/Units';
import UserAPI from 'src/api/user-settings';

export default {
  name: 'user-settings',
  components: {
    PageSectionContainer,
    TitleBar,
    PersonalDetails,
    AccountPreferences,
    AlertAndNotification,
    Security,
    Units,
  },
  provide() {
    return {
      userInformation: () => this.userInformation,
    };
  },
  data() {
    return {
      userInformation: null,
    };
  },
  computed: {
    isUserInformationLoaded() {
      return this.userInformation !== null;
    },
  },
  created() {
    return UserAPI.getUserInformation()
      .then((response) => {
        this.userInformation = response.data.data.user_information;
      })
      .catch((error) => {
        this.$showErrorNotification(error);
      });
  },
};
</script>

<style lang="stylus" scoped>
.user-settings-container {
  background-color: $body-color;
  margin-top: 3.5rem;
}
</style>
