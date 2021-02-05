<template>
  <div class="select-box">
    <label v-if="title">
      <strong>{{ title }}</strong>
    </label>
    <q-select outlined
      class="q-select-height"
      v-on="listeners"
      @input="input"
      v-bind="$attrs"
      dropdown-icon="keyboard_arrow_down">
      <template
        v-for="(_, slot) of $scopedSlots"
        v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope"/>
      </template>
    </q-select>
  </div>
</template>

<script>
export default {
  name: 'select-box',
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
.select-box {
  .q-select-height.q-field--auto-height .q-field__control,
  .q-field--auto-height .q-field__native {
    min-height: 0em;
  }
  .q-field__bottom {
    margin-bottom: -0.5rem;
    padding: 0rem;
    color: $field-hint-color ;
    .q-field__messages {
      line-height: 1.5;
    }
  }
  .q-select-height {
    .q-field__marginal {
      height: 1.5em;
      font-size: 1.5rem;
    }
  }
  .q-field--outlined .q-field__control:before {
    border: 0.06rem solid $field-border-color;
  }
}
</style>
