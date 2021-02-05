<template>
  <div class="toggle-button">
    <label v-if="title">
      <strong>{{ title }}</strong>
    </label>
    <q-item class="q-toggle-align-left">
      <q-toggle
        @input="input"
        v-bind="$attrs"
        v-on="listeners"
      />
    </q-item>
    <p class="label-caption" v-if="labelCaption">
      {{ labelCaption }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'toggle-button',
  inheritAttrs: false,
  props: {
    title: {
      type: String,
      default: () => '',
    },
    labelCaption: {
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
  },
};
</script>

<style lang="stylus" scoped>
.toggle-button {
  .q-toggle-align-left {
    padding: 0rem;
    margin-left: -0.8rem;
  }
}
</style>
