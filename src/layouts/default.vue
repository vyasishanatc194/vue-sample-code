<template>
  <q-layout view="hHh LpR lFf" v-if="isStoreInitialized" id="main-layout"
    class="shadow-2 rounded-borders">
    <q-header bordered v-if="isLoggedIn" id="main-layout-header" class="bg-white">
      <q-toolbar color="primary">
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          class="mobile-view menu-title"
        >
          <uil-bars size="1.5rem" />
        </q-btn>
        <img
          src="~assets/images/compass_logo.svg"
          class="logo-image"
          alt="logo-compass" />

        <q-toolbar-title>
          <!-- Compass
          <div slot="subtitle">Running on Quasar v{{ $q.version }}</div> -->
        </q-toolbar-title>

        <!-- Settings Menu -->
        <q-btn flat round dense
          class="q-mr-xs custom-icon-color desktop-view setting-icon">
          <uil-setting size="1.5rem" class="custom-icon-color" />
          <q-menu>
            <q-list v-if="hasRole(['Administrator'])">
              <q-item clickable v-close-popup to="/admin/device">
                <q-item-section side>
                  <uil-modem size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.menuAdminZoneDevices') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/admin/entity">
                <q-item-section side>
                  <uil-layer-group size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.menuAdminZoneEntities') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/admin/user">
                <q-item-section side>
                  <uil-user size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.menuAdminZoneUsers') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/admin/report">
                <q-item-section side>
                  <uil-file-graph size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.menuAdminZoneReports') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/admin/poultry-curve">
                <q-item-section side>
                  <uil-arrow-growth size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.menuAdminZonePoultryCurve') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/admin/tags">
                <q-item-section side>
                  <uil-wifi-router size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.menuAdminZoneTags') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <!-- Info Menu -->
        <q-btn flat round dense
          class="custom-icon-color desktop-view info-icon">
          <uil-question-circle size="1.5rem" class="custom-icon-color" />
          <q-menu>
            <q-list>
              <q-item clickable v-close-popup to="/contact-us">
                <q-item-section side>
                  <uil-envelope-question size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t("app.contactUs") }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/whats-new">
                <q-item-section side>
                  <uil-gift size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.whatsNew') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="handleAboutCompassDialog">
                <q-item-section side>
                  <uil-info-circle size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.aboutCompass') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <!-- Notification Menu -->
        <q-btn flat round dense
          class="bell-icon hidden">
          <q-img :src="bellIcon" class="custom-icon-color" />
          <q-badge color="red notification-badge" floating>{{ this.notificationCount }}</q-badge>
          <q-menu class="notification-menu">
            <q-card class="notification">
              <q-card-section class="header">
                <div>
                  {{ $t('notifications.title') }}
                </div>
              </q-card-section>

              <q-card-section class="q-pa-sm">
                <q-list>
                  <q-item clickable v-ripple v-for="notification in notifications"
                    :key="notification.id">
                    <div class="notification-row"
                      :class="getNotificationStatusStyleClassName(notification.status)">
                      <div class="notification-icon-left">
                        <q-icon name="flag" class="icon-text-status-color" size="1.5rem" />
                      </div>
                      <div class="notification-box-right">
                        <h3>{{ notification.title }}</h3>
                        <div class="row-icon-text">
                          <div class="icon-text-box">
                            <uil-check-circle size="1rem" class="icon-text-status-color" />
                            <span class="icon-text-status-color">
                              {{ notification.status }}
                            </span>
                          </div>
                          <div class="icon-text-box">
                            <uil-map-marker size="1rem" class="custom-icon-color" />
                            <span class="icon-text-color">{{ notification.location }}</span>
                          </div>
                          <div class="icon-text-box">
                            <uil-clock size="1rem" class="custom-icon-color" />
                            <span class="icon-text-color">{{ notification.time }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-item>
                </q-list>
              </q-card-section>

              <q-card-actions align="center" class="bg-white text-teal">
                <q-btn
                  flat
                  color="primary"
                  class="view-all-button"
                  :label="$t('notifications.viewAll')"
                />
              </q-card-actions>
            </q-card>
          </q-menu>
        </q-btn>
        <!-- Profile Menu -->
        <q-btn flat v-if="profileImage"
          class="desktop-view profile-image">
          <q-avatar size="2.125rem">
            <img :src="profileImage">
          </q-avatar>
          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column items-center">
                <q-avatar size="3.125rem">
                  <img :src="profileImage">
                </q-avatar>

                <q-item class="q-pa-md q-gutter-sm">
                  <q-item-section class="item-section-row text-center">
                    <q-item-label>{{ getFullName }}</q-item-label>
                    <q-item-label caption v-if="userInformation">
                      {{ userInformation.email }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-btn
                  to="/user-settings"
                  outline
                  class="btn-grey-outline text-capitalize"
                  :label="$t('app.userSettings')"
                />

                <q-btn
                  @click.native="$store.dispatch('user/logout')"
                  class="text-capitalize"
                  color="primary"
                  :label="$t('app.signout')"
                  flat
                  size="md"
                  v-close-popup
                />
              </div>
            </div>
         </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      id="main-layout-left-menu"
      v-if="isLoggedIn"
      v-model="leftDrawerOpen"
      :mini="!leftDrawerOpen || miniState"
      side="left"
      bordered
      :overlay="leftOverlay"
      content-class="bg-white"
      class="mobile-drawer">
      <!-- START: Mobile View Menus -->
      <div class="mobile-view">
        <div class="profile-top-spacer">
          <q-item class="q-pt-lg">
            <q-item-section avatar v-if="profileImage">
              <q-avatar>
                <img :src="profileImage">
              </q-avatar>
            </q-item-section>

            <q-item-section class="profile-detail" v-if="userInformation">
              <q-item-label class="label-title text-white text-capitalize" lines="1">
                {{ getFullName }}
              </q-item-label>
              <q-item-label caption lines="1" class="label-caption">
                {{ userInformation.email }}
              </q-item-label>
            </q-item-section>

            <q-item-section side class="profile-setting">
              <q-btn flat round dens to="/user-settings">
                <uil-setting size="1.5rem" class="text-white" />
              </q-btn>
            </q-item-section>
          </q-item>
        </div>
        <div class="hidden">
          <q-item class="notification-mobile-section">
            <q-item-section>
              <q-item-label class="label-title" lines="1">
                {{ $t('app.notifications') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge class="notification-badge">{{ this.notificationCount }}</q-badge>
            </q-item-section>
          </q-item>
        </div>
      </div>
      <!-- END: Mobile View Menus -->
      <q-list padding class="menu-list">

        <q-item clickable v-ripple to="/home"
          active-class="active-menu"
          class="menu-title">
          <q-item-section avatar>
            <uil-apps size="1.5rem" />
          </q-item-section>
          <q-item-section>
            {{ $t('app.menuGlobalView') }}
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/house-view"
          active-class="active-menu"
          class="menu-title">
          <q-item-section avatar>
            <uil-presentation size="1.5rem" />
          </q-item-section>
          <q-item-section>
            {{ $t('app.menuHouseView') }}
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/historical"
          active-class="active-menu"
          class="menu-title">
          <q-item-section avatar>
            <uil-chart-line size="1.5rem" />
          </q-item-section>
          <q-item-section>
            {{ $t('app.menuHistoricalView') }}
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/compare"
          active-class="active-menu"
          class="menu-title">
          <q-item-section avatar>
            <compare-icon size="1.5rem" />
          </q-item-section>
          <q-item-section>
            {{ $t('app.menuCompareView') }}
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/map"
          active-class="active-menu"
          class="menu-title">
          <q-item-section avatar>
            <uil-map size="1.5rem" />
          </q-item-section>
          <q-item-section>
            {{ $t('app.menuMap') }}
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple
          to="#!"
          @click="miniState = !miniState"
          class="fix-bottom-menu menu-title desktop-view">
          <q-item-section avatar>
            <q-img :src="hideIcon" class="custom-svg-icon" />
          </q-item-section>
          <q-item-section>
            {{ $t('app.hideMenu') }}
          </q-item-section>
        </q-item>

        <q-separator class="q-ma-md menu-separator mobile-view"/>
      </q-list>

      <!-- START: Mobile View Menus -->
      <div class="menu-list mobile-view">
        <q-item clickable v-ripple
          active-class="active-menu"
          class="menu-title">
          <q-item-section avatar>
            <uil-setting size="1.5rem" />
          </q-item-section>
          <q-item-section>
            {{ $t('app.configuration') }}
          </q-item-section>
          <q-menu anchor="center middle">
            <q-list v-if="hasRole(['Administrator'])">
              <q-item clickable v-close-popup to="/admin/device">
                <q-item-section side>
                  <uil-modem size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.menuAdminZoneDevices') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/admin/entity">
                <q-item-section side>
                  <uil-layer-group size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.menuAdminZoneEntities') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/admin/user">
                <q-item-section side>
                  <uil-user size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.menuAdminZoneUsers') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/admin/report">
                <q-item-section side>
                  <uil-file-graph size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.menuAdminZoneReports') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/admin/poultry-curve">
                <q-item-section side>
                  <uil-arrow-growth size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.menuAdminZonePoultryCurve') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/admin/tags">
                <q-item-section side>
                  <uil-wifi-router size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.menuAdminZoneTags') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>

        <q-item clickable v-ripple
          active-class="active-menu"
          class="menu-title">
          <q-item-section avatar>
            <uil-question-circle size="1.5rem" />
          </q-item-section>
          <q-item-section>
            {{ $t('app.help') }}
          </q-item-section>
          <q-menu anchor="center middle">
            <q-list>
              <q-item clickable v-close-popup to="/contact-us">
                <q-item-section side>
                  <uil-envelope-question size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t("app.contactUs") }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/whats-new">
                <q-item-section side>
                  <uil-gift size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.whatsNew') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="handleAboutCompassDialog">
                <q-item-section side>
                  <uil-info-circle size="1.125rem" class="custom-icon-color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label side>
                    {{ $t('app.aboutCompass') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>

        <q-separator class="q-ma-md menu-separator mobile-view"/>

        <q-item clickable v-ripple
          active-class="active-menu"
          class="menu-title"
          @click.native="$store.dispatch('user/logout')">
          <q-item-section avatar>
            <uil-signout size="1.5rem" />
          </q-item-section>
          <q-item-section>
            {{ $t('app.signout') }}
          </q-item-section>
        </q-item>
      </div>
      <!-- END: Mobile View Menus -->
    </q-drawer>

    <!-- About Compass Dialog -->
    <q-dialog v-model="isAboutCompassDialogOpen">
      <q-card class="about-compass q-pa-md">
        <q-card-section class="q-pa-lg">
          <div class="row justify-center">
            <img
              src="~assets/images/compass_logo.svg"
              class="logo-image no-margin"
              alt="logo-compass" />
          </div>
        </q-card-section>

        <q-card-section class="no-padding">
          <div class="text-center header-text-color">
            {{ $t('aboutCompass.title') }}
          </div>
          <div class="text-center version">
            v{{ this.appVersion }}
          </div>
          <div class="text-center bottom-text-color q-pb-sm">
            <q-btn
              outline
              flat
              :label="$t('aboutCompass.softwareLicense')"
              class="text-capitalize"
              @click="showSoftwareLicenseDialog"
            />
          </div>
        </q-card-section>

        <q-card-actions align="center" class="bg-white text-teal no-padding">
          <q-btn
            outline
            :label="$t('aboutCompass.closeButton')"
            v-close-popup
            class="close-button"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Software Licence Dialog Box -->
    <q-dialog v-model="isSoftwareLicenseDialogOpen">
      <software-license-dialog-box />
    </q-dialog>

    <!-- Pages container -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer -->
    <q-footer elevated id="main-layout-footer" class="hidden">
      <q-tabs
        v-model="tab"
        indicator-color="white"
        class="text-teal mobile-view bg-white border-top"
        v-if="!leftDrawerOpen">
        <q-route-tab
          to="/home"
          class="menu-title"
          active-class="active-tab"
          exact>
          <uil-apps size="1.5rem" />
        </q-route-tab>
        <q-route-tab
          to="/map"
          class="menu-title"
          active-class="active-tab"
          exact>
          <uil-map size="1.5rem" />
        </q-route-tab>
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>
import { LocalStorage } from 'quasar';
import { mapState, mapGetters, mapActions } from 'vuex';
import {
  UilSetting,
  UilQuestionCircle,
  UilApps,
  UilMap,
  UilBars,
  UilEnvelopeQuestion,
  UilGift,
  UilInfoCircle,
  UilModem,
  UilWifiRouter,
  UilArrowGrowth,
  UilFileGraph,
  UilUser,
  UilLayerGroup,
  UilCheckCircle,
  UilMapMarker,
  UilClock,
  UilChartLine,
  UilSignout,
  UilPresentation,
} from '@iconscout/vue-unicons';
import { CompareIcon } from 'src/common/custom-icons';
import chatAPI from 'src/api/chat';
import UserAPI from 'src/api/user-settings';
import utilUser from 'src/common/utils/user';
import SoftwareLicenseDialogBox from 'src/layouts/components/SoftwareLicenseDialogBox';
import bellIcon from '../assets/images/layout/Bell.svg';
import hideIcon from '../assets/images/layout/Hide.svg';

const storePrefixKey = 'chat';
const chatWidgetKey = `${storePrefixKey}/isShow/{USER_ID}`;

export default {
  name: 'LayoutDefault',
  components: {
    UilSetting,
    UilQuestionCircle,
    UilApps,
    UilMap,
    UilBars,
    UilEnvelopeQuestion,
    UilGift,
    UilInfoCircle,
    UilModem,
    UilWifiRouter,
    UilArrowGrowth,
    UilFileGraph,
    UilUser,
    UilLayerGroup,
    UilCheckCircle,
    UilMapMarker,
    UilClock,
    UilChartLine,
    UilSignout,
    CompareIcon,
    UilPresentation,
    SoftwareLicenseDialogBox,
  },
  provide() {
    return {
      setChatWidgetVisibilityFlag: this.setChatWidgetVisibilityFlag,
      loadProfileImageFromUserInformation: this.loadProfileImageFromUserInformation,
    };
  },
  data() {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      footerReveal: false,
      leftOverlay: false,
      miniState: true,
      appVersion: process.env.APP_VERSION,
      tab: 'mail',
      isAboutCompassDialogOpen: false,
      isSoftwareLicenseDialogOpen: false,
      bellIcon,
      hideIcon,
      chatWidgetVisibilityFlag: 'show',
      userInformation: null,
      profileImage: null,
    };
  },
  created() {
    return this.initializeLayout();
  },
  methods: {
    ...mapActions('layout', [
      'initialize',
      'unInitialize',
      'getNotificationCount',
      'getNotifications',
    ]),
    initializeLayout() {
      this.initialize()
        .then(() => this.presetValues())
        .catch(this.$showErrorNotification);
    },
    presetValues() {
      if (this.isLoggedIn === true) {
        this.loadProfileImageFromUserInformation();
      }
      this.getNotificationCount()
        .then(() => this.getNotifications())
        .then(() => this.initializeChatWidget())
        .then(() => this.setZohoChatFloatWindowMinimizeEvent());
    },
    hasRole(roles) {
      return utilUser.hasRole(this.$store, roles);
    },
    handleAboutCompassDialog() {
      this.isAboutCompassDialogOpen = true;
    },
    showSoftwareLicenseDialog() {
      this.isSoftwareLicenseDialogOpen = true;
    },
    getNotificationStatusStyleClassName(status) {
      let className = '';
      if (status === 'Acknowledged') {
        className = 'notification-acknowledged';
      } else if (status === 'Inactive') {
        className = 'notification-inactive';
      } else if (status === 'Shelve') {
        className = 'notification-shelve';
      } else if (status === 'Need Attention') {
        className = 'notification-need-attention';
      }
      return className;
    },
    initializeChatWidget() {
      return chatAPI.getChatWidgetVisibilityFlag()
        .then((response) => {
          this.chatWidgetVisibilityFlag = this.getLocalStorageChatWidgetVisibilityFlag()
            || response.data.chatWidgetVisibilityFlag;
          return this.initChatWidgetVisibility();
        })
        .catch(this.$showErrorNotification);
    },
    initChatWidgetVisibility() {
      if (this.chatWidgetVisibilityFlag === 'hide') {
        return this.setChatWidgetVisibilityFlag('hide');
      }
      return this.setChatWidgetVisibilityFlag('show');
    },
    setZohoChatFloatWindowMinimizeEvent() {
      return this.$zohoChat.salesiq.floatwindow.minimize(() => this.setChatWidgetVisibilityFlag('hide'));
    },
    setChatWidgetVisibilityFlag(flag) {
      return chatAPI.setChatWidgetVisibilityFlag(flag)
        .then((response) => {
          this.$zohoChat.salesiq.floatbutton.visible(flag);
          this.chatWidgetVisibilityFlag = response.data.chatWidgetVisibilityFlag;
          this.setLocalStorageChatWidgetVisibilityFlag(this.chatWidgetVisibilityFlag);
        })
        .catch(this.$showErrorNotification);
    },
    getLocalStorageChatWidgetVisibilityFlag() {
      return LocalStorage.getItem(`${chatWidgetKey.replace('{USER_ID}', this.userId)}`);
    },
    setLocalStorageChatWidgetVisibilityFlag(flag) {
      const key = `${chatWidgetKey.replace('{USER_ID}', this.userId)}`;
      LocalStorage.set(key, flag);
      return flag;
    },
    loadProfileImageFromUserInformation() {
      return this.getUserInformation()
        .then(() => this.getProfileImage());
    },
    getUserInformation() {
      return UserAPI.getUserInformation()
        .then((response) => {
          this.userInformation = response.data.data.user_information;
        })
        .catch((error) => {
          this.$showErrorNotification(error);
        });
    },
    getProfileImage() {
      return UserAPI.getProfileImage(this.userInformation.profile_photo_url)
        .then((response) => {
          this.profileImage = response.data.data.profile_photo;
        })
        .catch((error) => {
          this.$showErrorNotification(error);
        });
    },
  },
  computed: {
    ...mapGetters('user', ['getFullName']),
    ...mapState('user', {
      isLoggedIn: state => state.isLoggedIn,
      isStoreInitialized: state => state.isStoreInitialized,
      timeZone: state => state.timeZone,
      userId: state => state.userId,
    }),
    ...mapState('layout', [
      'notifications',
      'notificationCount',
    ]),
  },
  watch: {
    userId() {
      this.initializeChatWidget()
        .then(() => this.setZohoChatFloatWindowMinimizeEvent());
    },
    isLoggedIn(newIsLoggedIn) {
      if (newIsLoggedIn === true) {
        this.loadProfileImageFromUserInformation();
      }
    },
  },
};
</script>

<style lang="stylus" scoped>

.q-page-container {
  background-color: $body-background;
}

.logo-image {
  margin-left: 0.25rem;
  height: 2.1875rem;
}

.user, .timezone {
  padding-right: 0.3rem;
  font-size: 0.95rem;
  text-transform: none;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.timezone {
  font-size: 0.7rem;
}

.q-list .q-item.router-link-active {
  border-right: 0.1875rem $secondary solid;
}

.custom-icon-color {
  color: $label-color;
}

.notification-badge {
  padding: 0.125rem 0.25rem;
  top: 0.125rem;
  right: 0;
}

.btn-grey-outline {
  border: 0.06rem solid $field-border-color;
  margin-bottom: 0.5rem;
  color: $field-hint-color;
}

.q-drawer--standard .q-list--padding {
  padding: 0.5rem 0.75rem;
}

.q-drawer--mini .q-list--padding {
  padding: 0.5rem 0.3rem;
}

.border-top {
  border-top: 0.06rem solid $field-border-color;
}

.q-footer .q-toolbar {
  font-size: 0.8rem;
  min-height: 2rem;
}

.fix-bottom-menu {
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
}

.menu-title {
  color: $label-color;
  font-weight: 600;
  .q-item__section {
    font-size: 1rem;
    line-height: 1.25rem;
  }
  .ui-svg-inline {
    color: $field-hint-color;
  }
}

.menu-description {
  color: $field-hint-color;
}

.active-menu {
  color: $side-bar-menu-active-color;
  background-color: $title-bar-background;
  font-weight: 600;
  border-radius: 0.6rem;
  .ui-svg-inline {
    color: $side-bar-menu-active-color;
  }
}

.active-tab {
  color: $side-bar-menu-active-color;
  font-weight: 600;
  border-radius: 0.6rem;
  .ui-svg-inline {
    color: $side-bar-menu-active-color;
  }
}

.mobile-view {
  display: none;
  visibility: hidden;
}

.desktop-view {
  visibility: inherit;
}

.custom-svg-icon {
  font-size: 2.5rem;
  width: 1em;
  height: 1em;
}

.about-compass {
  width: 25rem;
  border-radius: 0.5rem;
  .close-button {
    border: 0.0625rem solid $field-border-color;
    box-sizing: border-box;
    border-radius: 0.25rem;
    color: $label-color;
    text-transform: capitalize;
  }
  .header-text-color {
    color: $label-color;
  }
  .version {
    color: $title-color;
    padding: 0.5rem 0.5rem;
  }
  .bottom-text-color {
    color: $field-hint-color;
  }
}


.notification-menu {
  max-width: 30rem;
}
.notification {
  width: 29rem;
  border-radius: 0.5rem;
  .header {
    color: $title-color;
    font-weight: 600;
  }
  .q-card__actions {
    padding: 0.5rem;
    background-color: $card-action-color !important;
  }
  .view-all-button {
    text-transform: inherit;
  }
  .notification-row {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    width: 100%;
  }
  .notification-icon-left {
    width: 2.1875rem;
  }
  .notification-box-right {
    width: calc(100% - 2.1875rem);
    h3 {
      color: $title-color;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.25rem;
      padding: 0.125rem 0;
      margin: 0 0 0.25rem 0;
    }
  }
  .row-icon-text {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
  }
  .icon-text-box {
    padding: 0 0.64rem 0 0;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    font-size: 0.70rem;
    min-width: 30%;
   .ui-svg-inline {
      margin: 0 0.1875rem 0 0;
    }
  }
  .icon-text-box:last-child {
    padding-right: 0;
    width: 25%;
    justify-content: flex-end;
  }
  .icon-text-color {
    color: $field-hint-color;
  }
  .notification-inactive {
    .icon-text-status-color {
      color: $notification-inactive-color;
    }
  }
  .notification-need-attention {
    .icon-text-status-color {
      color: $notification-need-attention-color;
    }
  }
  .notification-acknowledged {
    .icon-text-status-color {
      color: $notification-acknowledged-color;
    }
  }
  .notification-shelve {
    .icon-text-status-color {
      color: $notification-shelve-color;
    }
  }
}

.menu-list .q-item__section--side {
  min-width: 2.5rem;
}

.mobile-drawer {
  .q-avatar {
    display: inline-table;
    border: 0.125rem solid $body-color;
    height: 1.4em;
    width: 1.4em;
  }
  .profile-top-spacer {
    margin-top: -0.625rem;
    background-image: linear-gradient(
      to right,
      $mobile-layout-profile-section-start-color 0%,
      $mobile-layout-profile-section-end-color 100%
    );
    .q-item {
      padding-bottom: 1.25rem;
    }
  }
  .profile-detail {
    .label-title {
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.03rem;
    }
    .label-caption {
      color: $mobile-layout-email-caption-color;
    }
  }
  .notification-mobile-section {
    background-color: $mobile-layout-notification-section-background-color;
    min-height: 1.5rem;
    padding: 0 1rem 0 1rem;
    .label-title {
      color: $label-color;
      text-transform: uppercase;
      font-size: 0.75rem;
    }
    .notification-badge {
      background-color: $primary;
      color: $body-color;
      padding: 0 0.2rem;
      border-radius: 50%;
      height: 1rem;
      width: 1rem;
    }
  }
}

@media (max-width $breakpoint-sm-max) {
  .mobile-view {
    display: block;
    visibility: inherit;
    &.logo-image {
      top: 0;
      left: 0;
      transform: translate(0, 0);
      position: relative;
    }
  }
  .menu-list .q-item {
    margin-bottom: 0.5rem;
  }
  .menu-list .menu-separator {
    width: inherit;
  }
  .active-menu {
    background-color: transparent;
  }
  .desktop-view {
    display: none;
    visibility: hidden;
  }
  .mobile-drawer {
    .q-drawer--bordered {
      border-right: none;
    }
    .q-drawer, .q-drawer__content {
      border-radius: 0 1rem 1rem 0;
    }
    .profile-setting {
      .q-btn {
        font-size: 0.375rem;
      }
    }
  }
}
@media only screen and (max-width: 420px) {
  .logo-image {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
  }
}

@media only screen and (max-width: 320px) {
  .logo-image {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
  }
}
</style>

<style lang="stylus">
.active-tab {
  .q-tab__content {
    background-color: $title-bar-background;
    border-radius: 0.6rem;
    margin: 0.2rem;
  }
}
@media (max-width $breakpoint-sm-max) {
  .mobile-drawer {
    .q-drawer--bordered {
      border-right: none;
    }
    .q-drawer, .q-drawer__content {
      border-radius: 0 1rem 1rem 0;
    }
  }
}
</style>
