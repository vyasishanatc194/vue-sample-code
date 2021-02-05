<template>
  <div class="calendar">
    <q-calendar
      ref="calendar"
      v-on="listeners"
      @input="input"
      v-bind="$attrs"
      class="calendar-view">
      <template #day="{ timestamp }">
        <template>
          <template v-for="(computedEvent, index) in getPredictionPoultryWeights(timestamp.date)">
            <div
              :key="index"
              class="q-event q-pl-sm q-pt-sm">
              <template v-if="computedEvent">
                <div>
                  <span class="circle event-red"></span>&nbsp;
                  <span class="event-weight-color">{{ computedEvent.weight1 }}</span>
                  <q-tooltip anchor="bottom middle" self="center middle">
                    {{ computedEvent.weight1 }}
                  </q-tooltip>
                </div>
                <div>
                  <span class="circle event-blue"></span>&nbsp;
                  <span class="event-weight-color">{{ computedEvent.weight2 }}</span>
                  <q-tooltip anchor="bottom middle" self="center middle">
                    {{ computedEvent.weight2 }}
                  </q-tooltip>
                </div>
              </template>
            </div>
          </template>
        </template>
      </template>
    </q-calendar>
    <div class="calendar-legend row justify-end">
      <span class="legend-circle legend-red"></span>&nbsp;
      <span class="legend-text q-pr-md">{{ this.$t('houseView.prediction.weight1') }}</span>
      <span class="legend-circle legend-blue"></span>&nbsp;
      <span class="legend-text">{{ this.$t('houseView.prediction.weight2') }}</span>
    </div>
  </div>
</template>

<script>

export default {
  name: 'calendar',
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
    getPredictionPoultryWeights(selectedDate) {
      const weights = [];
      for (let weight = 0; weight < this.$attrs.events.length; weight += 1) {
        if (this.$attrs.events[weight].date === selectedDate) {
          weights.push(this.$attrs.events[weight]);
        }
      }
      return weights;
    },
  },
};
</script>

<style lang="stylus" scoped>
.calendar {
  .circle {
    height: 0.375rem;
    width: 0.375rem;
    border-radius: 50%;
    display: inline-block;
    &.event-red {
      background-color: $calendar-event-red-dot;
    }
    &.event-blue {
      background-color: $calendar-event-blue-dot;
    }
  }
  .calendar-view {
    border: 0.0625rem solid $calendar-border-color;
  }
  .event-weight-color {
    color: $field-hint-color;
    font-size: 0.6875rem;
    line-height: 1rem;
  }
  .calendar-legend {
    margin-top: 1rem;
    .legend-text {
      color: $label-color;
      font-size: 0.75rem;
      line-height: 1rem;
    }
    .legend-circle {
      height: 0.75rem;
      width: 0.75rem;
      border-radius: 50%;
      display: inline-block;
      &.legend-red {
        background-color: $calendar-event-red-dot;
      }
      &.legend-blue {
        background-color: $calendar-event-blue-dot;
      }
    }
  }
}
</style>
