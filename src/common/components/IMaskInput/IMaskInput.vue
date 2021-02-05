<template>
  <q-field
    :color="'primary'"
    v-bind="$attrs"
    v-on="$listeners"
    v-model="value">
    <template v-slot:control="{ id, value }">

      <imask-input
        :id="id"
        class="q-field__input i-mask-input"
        :value="value"
        :radix="radix"
        :mapToRadix="mapToRadix"
        :min="min"
        :max="max"
        :maxlength="maxLength"
        v-bind="$attrs"
        v-on="$listeners"
        @change="e => updateValue(e.target.value)">
      </imask-input>

    </template>

  </q-field>
</template>

<script>
import { IMaskComponent } from 'vue-imask';
import Misc from 'src/common/utils/misc';

const radixCharacters = [',', '.'];
const javascriptMaxDigitStringHandling = 15;

export default {
  name: 'i-mask-input',
  components: {
    'imask-input': IMaskComponent,
  },
  props: {
    value: {},
  },
  inheritAttrs: false,
  computed: {
    radix() {
      return typeof this.$attrs.radix !== 'undefined'
        ? this.$attrs.radix
        : Misc.getNumberSeparators().decimal;
    },
    mapToRadix() {
      return typeof this.$attrs.mapToRadix !== 'undefined'
        ? this.$attrs.mapToRadix
        : this.rejectRadixFromRadixCharacters(this.radix);
    },
    min() {
      const attributeMin = this.$attrs.min;
      if (this.$attrs.mask === Number) {
        return typeof attributeMin !== 'undefined'
          ? attributeMin
          : Number.MIN_SAFE_INTEGER;
      }
      return attributeMin;
    },
    max() {
      const attributeMax = this.$attrs.max;
      if (this.$attrs.mask === Number) {
        return typeof attributeMax !== 'undefined'
          ? attributeMax
          : Number.MAX_SAFE_INTEGER;
      }
      return attributeMax;
    },
    maxLength() {
      // The 53-bit significand precision gives from 15 to 17 significant decimal digits
      // precision (2−53 ≈ 1.11 × 10−16). If a decimal string with at most 15 significant
      // digits is converted to IEEE 754 double-precision representation, and then converted
      // back to a decimal string with the same number of digits, the final result should match
      // the original string. If an IEEE 754 double-precision number is converted to a decimal
      // string with at least 17 significant digits, and then converted back to double-precision
      // representation, the final result must match the original number
      //
      // Reference
      //    * https://en.wikipedia.org/wiki/Double-precision_floating-point_format
      //    * https://stackoverflow.com/questions/45929493/node-js-maximum-safe-floating-point-number
      //    * https://stackoverflow.com/questions/307179/what-is-javascripts-highest-integer-value-that-a-number-can-go-to-without-losin
      //    * https://stackoverflow.com/questions/54800022/why-max-digits-with-decimal-in-javascript-are-only-16
      //
      const attributeMaxLength = this.$attrs.maxlength;
      if (this.$attrs.mask === Number) {
        if (typeof attributeMaxLength === 'number') {
          return attributeMaxLength <= javascriptMaxDigitStringHandling
            ? attributeMaxLength
            : javascriptMaxDigitStringHandling;
        }
        return javascriptMaxDigitStringHandling;
      }
      return attributeMaxLength;
    },
  },
  methods: {
    rejectRadixFromRadixCharacters(radixToReject) {
      return radixCharacters.filter(r => r !== radixToReject);
    },
    updateValue(newValue) {
      this.$emit('value', newValue);
    },
  },
};
</script>

<style lang="stylus" scoped>
.i-mask-input {
  border: none;
  outline: none;
  width: 100%;
  background-color :inherit;
}
</style>
