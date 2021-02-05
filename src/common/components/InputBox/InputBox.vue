<template>
  <div class="input-box">
    <label v-if="title">
      <strong>{{ title }}</strong>
    </label>
    <q-input outlined
      class="q-input-height"
      v-on="listeners"
      @input="input"
      v-bind="$attrs"
      :debounce="this.$debouncingInputMs">
      <template
        v-for="(_, slot) of $scopedSlots"
        v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope"/>
      </template>
    </q-input>
  </div>
</template>

<script>
export default {
  name: 'input-box',
  inheritAttrs: false,
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
  },
};
</script>

<style lang="stylus">
.input-box {
  .q-input-height.q-field--outlined .q-field__control {
    height: 2.5em;
    min-height: 0em;
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
}
</style>
