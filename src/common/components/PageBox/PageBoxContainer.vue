<template>

  <!-- Container -->
  <div class="page-box-container">

    <!-- Dynamic content   -->
    <slot></slot>

  <!-- End of page's container -->
  </div>

</template>

<script>
export default {
  name: 'page-box-container',
};
</script>

<style lang="stylus" scoped>

.page-box-container {
  margin: auto;
  width: 100%;
  background-color : $page-container-background
}

</style>
