<template>
  <div class="date-input-box">
    <label v-if="title">
      <strong>{{ title }}</strong>
    </label>
    <q-input
      outlined
      class="q-input-height date-bottom-spacer"
      v-on="listeners"
      @input="input"
      v-bind="$attrs"
      mask="date"
      :rules="['date']">
      <template v-slot:append>
        <q-icon class="cursor-pointer">
          <uil-calendar-alt size="1rem" class="calendar-icon" />
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
            <q-date v-on="listeners" @input="input" v-bind="$attrs">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script>
import { UilCalendarAlt } from '@iconscout/vue-unicons';

export default {
  name: 'date-input-box',
  inheritAttrs: false,
  components: {
    UilCalendarAlt,
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
  },
};
</script>

<style lang="stylus">
.date-input-box {
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
  .q-field__append {
    padding-bottom: 1.6rem;
  }
  .q-field--outlined .q-field__control:before {
    border: 0.06rem solid $field-border-color;
  }
  .date-bottom-spacer {
    padding-bottom: 0;
  }
  .calendar-icon {
    color: $calendar-icon-color;
  }
}
</style>
