<template>
  <div class="chart-section">
    <div>
      <span class="chart-icon" v-if="$slots['title-icon']">
        <slot name="title-icon"></slot>
      </span>
      <span class="chart-title" v-if="title">
        {{ title }}
      </span>
    </div>
    <q-card flat bordered class="card">
      <q-card-section v-if="$slots['card-section']">
        <slot name="card-section"></slot>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  name: 'chart-section',
  props: {
    title: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="stylus" scoped>
.chart-section {
  .chart-title {
    color: $title-color;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.25rem;
  }
  .chart-icon {
    vertical-align: middle;
  }
  .card {
    border-radius: 0.5rem;
  }
}
</style>
