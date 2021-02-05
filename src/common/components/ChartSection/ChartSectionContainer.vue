<template>

  <!-- Container -->
  <div class="chart-section-container">

    <!-- Dynamic content   -->
    <slot></slot>

  <!-- End of chart's container -->
  </div>

</template>

<script>
export default {
  name: 'chart-section-container',
};
</script>

<style lang="stylus" scoped>
.chart-section-container {
  margin: auto;
  width: 100%;
}
</style>
