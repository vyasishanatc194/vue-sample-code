<template>
  <div class="password-box">
    <label v-if="title">
      <div class="row">
        <strong class="justify-end col-6">{{ title }}</strong>
        <a @click="handleShowForgotPasswordForm"
          class="row justify-end col-6 forgot-password-link">
          {{ $t('forgotPassword.title') }}
        </a>
      </div>
    </label>
    <q-input outlined
      class="q-input-height"
      :type="isPasswordShown ? 'text' : 'password'"
      v-on="listeners"
      @input="input"
      v-bind="$attrs">
      <template v-slot:append>
        <q-icon
          class="cursor-pointer"
          @click="isPasswordShown = !isPasswordShown">
          <uil-eye size="1.5rem" v-if="isPasswordShown" />
          <uil-eye-slash size="1.5rem" v-if="!isPasswordShown" />
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script>
import { UilEye, UilEyeSlash } from '@iconscout/vue-unicons';

export default {
  name: 'password-box',
  inheritAttrs: false,
  components: {
    UilEye,
    UilEyeSlash,
  },
  data() {
    return {
      isPasswordShown: false,
    };
  },
  props: {
    title: {
      type: String,
      default: () => '',
    },
  },
  computed: {
    listeners() {
      const { input, ...listeners } = this.$listeners;
      return listeners;
    },
  },
  methods: {
    input(event) {
      this.$emit('input', event);
    },
    handleShowForgotPasswordForm() {
      this.$emit('show-forgot-password-form');
    },
  },
};
</script>

<style lang="stylus">
.password-box {
  label {
    color: $title-color;
    line-height: 1.25rem;
  }
  .q-input {
    padding-top: 0.3125rem;
    .q-placeholder {
      color: $password-field-placeholder-color;
    }
  }
  .forgot-password-link {
    color: $link-color;
    text-decoration: none;
    font-size: 0.75rem;
    cursor: pointer;
  }
  .q-input-height.q-field--outlined .q-field__control {
    height: 3.125rem;
    border-radius: 0.5rem;
  }
  .q-field--disabled {
    background-color: $card-action-color;
  }
  .q-field__bottom {
    margin-bottom: -0.5rem;
    padding: 0rem;
    color: $field-hint-color ;
    .q-field__messages {
      line-height: 1.5;
    }
  }
  .q-field--outlined .q-field__control:before {
    border: 0.06rem solid $field-border-color;
  }
  .q-field__append {
    i {
      margin-top: -0.2rem;
      color: $password-box-reveal-eye-color;
    }
  }
}
</style>
