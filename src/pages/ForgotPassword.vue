<template>
  <div>
    <q-item class="q-pa-md q-gutter-sm title-spacer">
      <q-item-section>
        <q-item-label class="text-h5">
          {{ $t('forgotPassword.title') }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <div class="row q-col-gutter-x-md q-col-gutter-y-lg">
      <!-- Email -->
      <div class="col-12">
        <input-box
          type="email"
          v-model.trim="forgotPasswordForm.accountEmail"
          :placeholder="$t('forgotPassword.emailPlaceholder')"
          :title="$t('forgotPassword.email')"
          @keydown.enter.native="handleSubmitForgotPasswordForm"
          @input="$v.forgotPasswordForm.$touch()" />

        <div v-if="$v.forgotPasswordForm.accountEmail.$error
          && !$v.forgotPasswordForm.accountEmail.required"
          class="error-validation">
          {{ $t("forgotPassword.emailRequired") }}
        </div>
        <div v-if="$v.forgotPasswordForm.accountEmail.$error
          && !$v.forgotPasswordForm.accountEmail.email"
          class="error-validation">
          {{ $t("forgotPassword.emailValidate") }}
        </div>
      </div>
      <!-- Forgot Password & Cancel button -->
      <div class="row q-gutter-xs full-width justify-center">
        <q-btn
          color="primary"
          class="forgot-password-button"
          @click.prevent="handleSubmitForgotPasswordForm"
          :disable="handleForgotPasswordInProgress">
          {{ $t('forgotPassword.forgotPasswordButton') }}
        </q-btn>
        <q-btn
          color="primary"
          class="forgot-password-button"
          @click.prevent="handleCancelForgotPassword">
          {{ $t('forgotPassword.cancelButton') }}
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators';
import InputBox from 'src/common/components/InputBox';
import APIUser from 'src/api/user';

export default {
  name: 'forgot-password',
  components: {
    InputBox,
  },
  data() {
    return {
      handleForgotPasswordInProgress: false,
      forgotPasswordForm: {
        accountEmail: '',
      },
    };
  },
  validations() {
    return {
      forgotPasswordForm: {
        accountEmail: {
          required,
          email,
        },
      },
    };
  },
  methods: {
    validateForgotPasswordForm() {
      this.$v.forgotPasswordForm.$touch();
      const isValid = this.$v.forgotPasswordForm.$error === false;
      return isValid;
    },
    handleSubmitForgotPasswordForm() {
      if (this.validateForgotPasswordForm() === true) {
        this.resetPassword();
      }
    },
    showSearchingMessage() {
      this.$q.loading.show({
        message: this.$t('forgotPassword.searchingPassword'),
      });
      this.handleForgotPasswordInProgress = true;
    },
    hideSearchingMessage() {
      this.handleForgotPasswordInProgress = false;
      this.$q.loading.hide();
    },
    resetPassword() {
      this.showSearchingMessage();
      APIUser.doResetPassword(this.forgotPasswordForm.accountEmail)
        .then(() => this.$showSuccessNotification(
          this.$t('forgotPassword.resetPasswordEmailSending'),
        ))
        .catch(this.$showErrorNotification)
        .then(() => this.hideSearchingMessage());
    },
    handleCancelForgotPassword() {
      this.$emit('cancel-forgot-password');
    },
  },
};
</script>

<style src="src/css/login.styl" lang="stylus" scoped />
