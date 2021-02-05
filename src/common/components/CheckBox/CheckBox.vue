<template>
  <q-checkbox
    class="check-box"
    @input="input"
    v-bind="$attrs"
    v-on="listeners"
  />
</template>

<script>
export default {
  name: 'check-box',
  inheritAttrs: false,
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
</style>
