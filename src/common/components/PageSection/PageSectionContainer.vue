<template>

  <!-- Container -->
  <div class="page-section-container">

    <!-- Dynamic content   -->
    <slot></slot>

  <!-- End of page's container -->
  </div>

</template>

<script>
export default {
  name: 'page-section-container',
};
</script>

<style lang="stylus" scoped>

.page-section-container {
  margin: auto;
  width: 100%;
  background-color : $page-section-container-background
}

</style>
