<template>
  <q-page class="login">
    <div class="row fullscreen">
      <!-- Left Section -->
      <div class="col-lg-8 col-md-8 left-section">
        <!-- Select Language -->
        <div class="left-section-header">
          <select-box
            v-model="language"
            :options="languages"
            @input="changeUILanguage(language)"
            class="select-language"
            :class="{'select-box-center': isMobileView}">
            <template v-slot:option="scope">
              <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents">
                <q-item-section avatar v-if="scope.opt.flag" class="flag-option-width">
                  <flag :iso="scope.opt.flag" :squared="false" />
                </q-item-section>
                <q-item-section>
                  <q-item-label v-html="scope.opt.label" ></q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <!-- Selected Option -->
            <template v-slot:selected-item="scope">
              <flag :iso="scope.opt.flag"
                :squared="false" v-if="scope.opt.flag"
                class="flag-right-spacer" />
              {{ scope.opt.label }}
            </template>
          </select-box>
        </div>
        <div class="left-section-content flex-center">
          <div class="box-login">
            <img src="~assets/images/compass_logo.svg"/>
            <!-- Login Form -->
            <div v-if="!showForgotPassword">
              <q-item class="q-pa-lg q-gutter-sm title-spacer">
                <q-item-section>
                  <q-item-label class="text-h5">
                    {{ $t('login.signInTitle') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <div class="row q-col-gutter-x-md q-col-gutter-y-lg">
                <!-- Email -->
                <div class="col-12">
                  <input-box
                    type="email"
                    v-model.trim="loginForm.accountEmail"
                    :placeholder="$t('login.emailPlaceholder')"
                    :title="$t('login.email')"
                    @keydown.enter.native="handleLoginFormSubmit"
                    @input="$v.loginForm.$touch()" />

                  <div v-if="$v.loginForm.accountEmail.$error
                    && !$v.loginForm.accountEmail.required"
                    class="error-validation">
                    {{ $t("login.emailRequired") }}
                  </div>
                  <div v-if="$v.loginForm.accountEmail.$error && !$v.loginForm.accountEmail.email"
                    class="error-validation">
                    {{ $t("login.emailValidate") }}
                  </div>
                </div>
                <!-- Password -->
                <div class="col-12 password-box-top-spacer">
                  <password-box
                    v-model.trim="loginForm.password"
                    :placeholder="$t('login.passwordPlaceholder')"
                    :title="$t('login.password')"
                    @keydown.enter.native="handleLoginFormSubmit"
                    @input="$v.loginForm.$touch()"
                    @show-forgot-password-form="handleShowForgotPasswordForm" />

                  <div v-if="$v.loginForm.password
                    && $v.loginForm.password.$error
                    && !$v.loginForm.password.required" class="error-validation">
                      {{ $t("login.passwordRequired") }}
                  </div>
                </div>
                <!-- Remember me -->
                <div class="col-12"
                  :class="{'q-pa-sm q-ml-sm': isMobileView, 'q-pa-md': !isMobileView}">
                  <check-box
                    class="checkbox-left-spacer"
                    v-model="loginForm.stayConnected"
                    :label="$t('login.stayConnected')"
                  />
                </div>
                <!-- Sign In button -->
                <div class="row q-gutter-xs no-padding full-width justify-center">
                  <q-btn
                    class="sign-in-button"
                    @click.prevent="handleLoginFormSubmit"
                    :disable="handleLoginInProgressFlag">
                    {{ $t('login.signInButton') }}
                  </q-btn>
                </div>
              </div>
            </div>
            <!-- Forgot Password Form -->
            <forgot-password
              v-if="showForgotPassword"
              @cancel-forgot-password="handleCancelForgotPassword"
            />
            <div class="left-section-mobile-footer flex-center q-mt-lg" v-if="isMobileView">
              <p>{{ $t('login.leftSectionFooterText') }}</p>
              <p class="top-spacer">{{ $t('layouts.version') }} {{ this.appVersion }}</p>
            </div>
          </div>
        </div>
        <div class="left-section-footer flex-center" v-if="!isMobileView">
          <p>{{ $t('login.leftSectionFooterText') }}</p>
          <p class="top-spacer">{{ $t('layouts.version') }} {{ this.appVersion }}</p>
        </div>
        <div class="left-section-footer-image flex-center" v-if="isMobileView">
          <img src="~assets/images/wave-left.svg"/>
        </div>
      </div>
      <!-- Right Section -->
      <div class="col-lg-4 col-md-4 right-section">
        <div class="right-section-center flex-center">
          <p class="text-h5">
            {{ $t('login.rightSectionTopTitle') }}
          </p>
          <img src="~assets/images/brand.svg"/>
          <p class="text-h5">
            {{ $t('login.rightSectionBottomTitle') }}
          </p>
          <a href="https://poultry-and-meat-technology.fbtechreview.com/vendor/intelia-improving-poultry-performance-with-realtime-data-cid-126-mid-17.html"
            target="_blank">
            <q-btn color="white" class="read-article-button">
              {{ $t('login.readArticleButton') }}
            </q-btn>
          </a>
        </div>
        <div class="right-section-footer">
          <img src="~assets/images/wave.svg"/>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex';
import { required, email } from 'vuelidate/lib/validators';
import InputBox from 'src/common/components/InputBox';
import CheckBox from 'src/common/components/CheckBox';
import PasswordBox from 'src/common/components/PasswordBox';
import UtilUnit from 'src/common/utils/unit';
import SelectBox from 'src/common/components/SelectBox/SelectBox.vue';
import ForgotPassword from 'src/pages/ForgotPassword';

export default {
  name: 'login',
  components: {
    InputBox,
    CheckBox,
    PasswordBox,
    ForgotPassword,
    SelectBox,
  },
  data() {
    return {
      handleLoginInProgressFlag: false,
      loginForm: {
        accountEmail: '',
        password: '',
        stayConnected: false,
      },
      showForgotPassword: false,
      language: {},
      appVersion: process.env.APP_VERSION,
    };
  },
  validations() {
    return {
      loginForm: {
        accountEmail: {
          required,
          email,
        },
        password: {
          required,
        },
      },
    };
  },
  created() {
    this.getUserPreferredLanguage();
  },
  computed: {
    ...mapGetters('user', ['getLanguageListKeys']),
    languages() {
      return this.getLanguageListKeys.map(x => ({
        value: x,
        label: this.$t(`language.${x}`),
        flag: x.split('-')[1],
      }));
    },
    isMobileView() {
      return this.$q.screen.sm === true || this.$q.screen.xs === true;
    },
  },
  methods: {
    getUserPreferredLanguage() {
      this.language = this.languages
        .find(x => x.value === this.$store.state.user.language);
    },
    changeUILanguage(locale) {
      this.$store.dispatch('user/setLanguage', { language: locale.value });
    },
    triggerLoginFormValidation() {
      this.$v.loginForm.$touch();
    },
    isFormValidationError() {
      return this.$v.loginForm.$error;
    },
    setLoginInProgressFlag() {
      this.handleLoginInProgressFlag = true;
    },
    unsetLoginInProgressFlag() {
      this.handleLoginInProgressFlag = false;
    },
    handleLoginFormSubmit() {
      this.triggerLoginFormValidation();
      if (!this.isFormValidationError()) {
        this.setLoginInProgressFlag();
        this.$store
          .dispatch('user/login', {
            username: this.loginForm.accountEmail,
            password: this.loginForm.password,
            keepMeLoggedIn: this.loginForm.stayConnected,
            redirectURL: this.$route.query ? this.$route.query.redirect : undefined,
          })
          .catch(this.$showErrorNotification)
          .then(() => {
            UtilUnit.resetUnitConverterCache();
            this.unsetLoginInProgressFlag();
          });
      }
    },
    handleCancelForgotPassword() {
      this.showForgotPassword = false;
    },
    handleShowForgotPasswordForm() {
      this.showForgotPassword = true;
    },
  },
};
</script>

<style src="src/css/login.styl" lang="stylus" />
