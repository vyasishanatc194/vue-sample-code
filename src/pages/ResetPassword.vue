<template>
  <q-page padding>

    <div class="background fullscreen">

      <a href="#" id="logo"></a>

      <div class="loginContainer shadow-2">

          <div class="row">

            <div class="col-10 title-vertical-space">
                  <h1>{{ $t('resetPassword.title') }}</h1>
            </div>

            <div class="col-2 text-right">
              <q-btn flat class="pull-right">

                  <q-icon name="language" />
                  <q-menu ref="popover_change_language">
                    <q-list item-separator link>
                      <q-item v-for="language in getLanguageListKeys()" :key="language"
                          @click.native="setLanguage(language)"
                          clickable v-close-popup>
                          <q-item-section>
                            {{ $t(`language.${language}`) }}
                          </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
            </div>

          </div>

          <div v-if="errorMessage" class="row justify-center items-center text-center q-pb-md">
            <div class="col-12 text-negative">{{ errorMessage }}</div>
          </div>

          <div v-if="passwordResetSuccessfully && !errorMessage"
              class="row justify-center items-center text-center q-pb-md">
            <div class="col-12 text-positive">{{ $t('resetPassword.passwordResetSuccessfully') }}
            </div>
          </div>

          <div class="row justify-center items-center"
              v-if="resetPasswordQueryValid && !passwordResetSuccessfully">

              <div class="col-xs-12 col-sm-11">

                <q-input
                  type="password"
                  v-model.trim="security.new"
                  @keydown.enter.native="handlePasswordChange"
                  @input="$v.security.$touch()"
                  :label="$t('resetPassword.passwordNew')">
                  <template v-slot:prepend>
                    <q-icon name="lock"></q-icon>
                  </template>
                </q-input>

                <div v-if="$v.security.new.$error && !$v.security.new.required"
                  class="error-validation">
                  {{ $t("resetPassword.newPasswordRequired") }}
                </div>
                <div v-if="$v.security.new.$error && !$v.security.new.minLength"
                  class="error-validation">

                  {{ $t("resetPassword.newPasswordMinLength",
                    { min: $v.security.new.$params.minLength.min })
                  }}
                </div>

              </div>

              <div class="col-xs-12 col-sm-11" >

                <q-input
                  type="password"
                  v-model.trim="security.confirm"
                  @keydown.enter.native="handlePasswordChange"
                  @input="$v.security.$touch()"
                  :label="$t('resetPassword.passwordConfirm')">
                  <template v-slot:prepend>
                    <q-icon name="fingerprint"></q-icon>
                  </template>
                </q-input>

                <div v-if="$v.security.confirm.$error && !$v.security.confirm.required"
                  class="error-validation">
                  {{ $t("resetPassword.confirmPasswordRequired") }}
                </div>

                <div v-if="$v.security.confirm.$error && !$v.security.confirm.sameAsNewPassword"
                  class="error-validation">
                  {{ $t("resetPassword.confirmPasswordSameAs") }}
                </div>

              </div>
          </div>

          <div class="row justify-end q-pt-md q-gutter-md">

              <div class="col-auto">
                <q-btn color="primary"
                  @click.prevent="handlePasswordChange"
                  v-if="resetPasswordQueryValid && !passwordResetSuccessfully"
                  :disable="handleSecurityChangeInProgress">
                    {{ $t("resetPassword.apply") }}
                </q-btn>
              </div>

              <div class="col-auto">
                <q-btn color="secondary"
                  @click.prevent="goToLoginPage"
                  :disable="handleSecurityChangeInProgress">
                    {{ getCancelButtonText }}
                </q-btn>
              </div>

          </div>

      </div>

    </div>

  </q-page>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { required, sameAs, minLength } from 'vuelidate/lib/validators';

export default {
  name: 'reset-password',
  created() {
    // Validate reset query
    this.validateResetQuery(this.queryString.lang);
  },
  data() {
    return {
      queryString: this.$route.query,
      resetId: '',
      resetToken: '',
      language: undefined,
      handleSecurityChangeInProgress: false,
      handlePrefrenceChangeInProgress: false,
      security: {
        new: '',
        confirm: '',
        error: undefined,
      },
      resetPasswordQueryValid: false,
      errorMessage: undefined,
      passwordResetSuccessfully: false,
    };
  },
  // Get forms validations
  validations() {
    return {
      // Security form validation
      security: {
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
    };
  },
  watch: {
    '$route.query': {
      handler(newVal) {
        // Refresh local value from the query parameters
        this.queryString = newVal;
        // Validate reset query
        this.validateResetQuery(this.queryString.lang);
      },
      deep: true,
    },
  },
  computed: {
    // Cancel button can be used to go back home or send the reset password
    getCancelButtonText() {
      return this.passwordResetSuccessfully || !this.resetPasswordQueryValid
        ? this.$t('resetPassword.goBackHome')
        : this.$t('resetPassword.cancel');
    },
  },
  methods: {
    ...mapGetters('user', ['getLanguageListKeys']),
    ...mapActions('user', ['changePassword', 'isResetPasswordQueryValid']),
    // Go back to login page
    goToLoginPage() {
      this.$router.push({ path: '/' });
    },
    // Test if reset password query is valid or not
    validateResetQuery(language) {
      // Validate reset password request
      this.resetId = this.queryString.id;
      this.resetToken = this.queryString.token;
      if (!this.resetId || !this.resetToken) {
        // Information are missing to reset password, redirect to login page
        this.goToLoginPage();
        return;
      }

      this.isResetPasswordQueryValid({
        id: this.resetId,
        token: this.resetToken,
        lang: language,
      })
        .then((res) => {
          // Test if reset password request is valid or not
          if (!res.data || res.data.isValid !== true) {
            // Invalid reset password request
            throw new Error(this.$t('resetPassword.invalidRequest'));
          }

          // Reset password query is valid
          this.resetPasswordQueryValid = true;
        })
        .catch((error) => {
          this.errorMessage = error.message || error;
          this.resetPasswordQueryValid = false;
        })
        .then(() => {
          // Set language (if provied in query parameter)
          this.setLanguage(language);
        });
    },
    // Set new language
    setLanguage(language) {
      // Test if we received a language
      if (language && this.language !== language) {
        // Change UI language for the one requested in query parameters
        this.$store.dispatch('user/setLanguage', { language })
          .then(() => {
            // Synchronize with the new language set
            this.language = language;

            // Revalidate reset password query
            this.validateResetQuery(this.language);
          });
      }
    },
    // Apply new password
    handlePasswordChange() {
      this.$v.security.$touch();
      if (!this.$v.security.$error) {
        // Change user password
        this.handleSecurityChangeInProgress = true;
        this.changePassword({
          id: this.resetId,
          token: this.resetToken,
          newPassword: this.security.new,
          confirmPassword: this.security.confirm,
        })
          .catch((error) => {
            this.errorMessage = error.message || error;
          })
          .then(() => {
            this.passwordResetSuccessfully = true;
            this.handleSecurityChangeInProgress = false;
          });
      }
    },
  },
};
</script>

<style src="src/css/login.styl" lang="stylus" scoped />
