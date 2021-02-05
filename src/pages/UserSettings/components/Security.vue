<template>
  <div class="security-container">
    <!-- START: Security Section -->
    <page-section
      :title="$t('userSettings.security.title')"
      :subTitle="$t('userSettings.security.subTitle')"
      actionAlign="right">
      <div slot="card-section" class="row q-col-gutter-x-md q-col-gutter-y-lg">
        <!-- START: Current Password -->
        <div class="col-12">
          <input-box
            type="password"
            v-model="security.currentPassword"
            :placeholder="$t('userSettings.security.currentPassword')"
            :title="$t('userSettings.security.currentPassword')"
            @input="$v.security.currentPassword.$touch()" />

            <div v-if="$v.security.currentPassword.$error
              && !$v.security.currentPassword.required"
              class="error-validation">
              {{ $t("userSettings.security.currentPasswordRequired") }}
            </div>
        </div>
        <!-- END: Current Password -->
        <!-- START: New Password -->
        <div class="col-12">
          <input-box
            type="password"
            v-model="security.newPassword"
            :placeholder="$t('userSettings.security.newPassword')"
            :title="$t('userSettings.security.newPassword')"
            @input="$v.security.newPassword.$touch()" />

          <div v-if="$v.security.newPassword.$error
            && !$v.security.newPassword.required"
            class="error-validation">
            {{ $t("userSettings.security.newPasswordRequired") }}
          </div>

          <div v-if="$v.security.newPassword.$error
            && ( !$v.security.newPassword.minLength
              || !$v.security.newPassword.maxLength)"
            class="error-validation">
            {{ $t("userSettings.security.newPasswordLength",
              { min: $v.security.newPassword.$params.minLength.min,
                max: $v.security.newPassword.$params.maxLength.max })
            }}
          </div>

            <div v-if="$v.security.newPassword.$error
            && !$v.security.newPassword.isPasswordComplexityValid"
            class="error-validation">
            {{ $t("userSettings.security.newPasswordCharacterValidate") }}
          </div>

          <div v-if="$v.security.newPassword.$error
            && !$v.security.newPassword.isDifferentThenCurrent"
            class="error-validation">
            {{ $t("userSettings.security.newPasswordShouldBeDifferentThanCurrent") }}
          </div>
        </div>
        <!-- END: New Password -->
        <!-- START: Confirm Password -->
        <div class="col-12">
          <input-box
            type="password"
            v-model="security.confirmPassword"
            :placeholder="$t('userSettings.security.confirmPassword')"
            :title="$t('userSettings.security.confirmPassword')"
            @input="$v.security.confirmPassword.$touch()" />

          <div v-if="$v.security.confirmPassword.$error
            && !$v.security.confirmPassword.required"
            class="error-validation">
            {{ $t("preference.security.confirmPasswordRequired") }}
          </div>

          <div v-if="$v.security.confirmPassword.$error
            && !$v.security.confirmPassword.sameAsNewPassword"
            class="error-validation">
            {{ $t("userSettings.security.confirmPasswordSameAs") }}
          </div>
        </div>
        <!-- END: Confirm Password -->
      </div>
      <div slot="card-actions">
        <q-btn
          unelevated
          class="color-grey cancel-button-bottom-spacer text-capitalize q-mb-sm"
          :label="$t('userSettings.security.cancelButton')"
        />
        &nbsp;&nbsp;
        <q-btn
          unelevated
          class="change-password-button text-capitalize q-mb-sm"
          :label="$t('userSettings.security.changePassword')"
          @click.prevent="handleSecurityChange"
          :disable="handleSecurityChangeInProgress"
        />
      </div>
    </page-section>
    <!-- END: Security Section -->
  </div>
</template>

<script>
import {
  required, sameAs, minLength, maxLength,
} from 'vuelidate/lib/validators';
import utilValidation from 'src/common/utils/validation';
import userSettingsAPI from 'src/api/user-settings';
import { PageSection } from 'src/common/components/PageSection';
import InputBox from 'src/common/components/InputBox';

export default {
  name: 'security',
  components: {
    PageSection,
    InputBox,
  },
  data() {
    return {
      handleSecurityChangeInProgress: false,
      security: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        error: undefined,
      },
    };
  },
  validations() {
    const isPasswordComplexityValid = utilValidation.isPasswordComplexityValid();
    const validations = {
      security: {
        currentPassword: {
          required,
        },
        newPassword: {
          required,
          minLength: minLength(utilValidation.minPasswordLength),
          maxLength: maxLength(utilValidation.maxPasswordLength),
          isDifferentThenCurrent(value, parentVm) {
            return value !== parentVm.currentPassword;
          },
          isPasswordComplexityValid,
        },
        confirmPassword: {
          required,
          sameAsNewPassword: sameAs('newPassword'),
        },
      },
    };
    return validations;
  },
  methods: {
    validateForm() {
      this.$v.security.$touch();
      const valid = this.$v.security.$error === false;
      return valid;
    },
    disableSecurityChangeButton() {
      this.handleSecurityChangeInProgress = true;
    },
    enableSecurityChangeButton() {
      this.handleSecurityChangeInProgress = false;
    },
    handleSecurityChange() {
      if (this.validateForm() === true) {
        this.disableSecurityChangeButton();
        userSettingsAPI.setPassword(
          this.security.currentPassword,
          this.security.newPassword,
        )
          .then(() => this.$showSuccessNotification(this.$t(
            'userSettings.security.passwordChangedSuccessfully',
          )))
          .catch(this.$showErrorNotification)
          .then(() => this.enableSecurityChangeButton());
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.security-container {
  .error-validation {
    color: $negative;
    clear: both;
    font-size: 70%;
  }
  .color-grey {
    color: $label-color;
  }
  .change-password-button {
    background-color: $tab-active-color;
    color: $body-color;
    border-radius: 0.25rem;
  }
}
</style>
