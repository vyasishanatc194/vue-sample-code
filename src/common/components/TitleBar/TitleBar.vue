<template>
  <div class="title-bar">
    <q-toolbar class="q-pa-md">
      <q-toolbar-title class="title-text toolbar-left-spacer">{{ title }}</q-toolbar-title>
    </q-toolbar>
  </div>
</template>

<script>
export default {
  name: 'title-bar',
  props: {
    title: {
      type: String,
      default: () => '',
    },
  },
};
</script>

<style lang="stylus" scoped>
.title-bar {
  background-color: $title-bar-background;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  position: fixed;
  top: 3.5em;
  width: 100%;
  z-index: 99;

  .title-text {
    color: $title-bar-text-color;
    font-size: 1.5rem;
    font-weight: 600;
  }
  .toolbar-left-spacer {
    padding-left: 1rem;
  }
  @media (max-width: 767px) {
    top: 3.5em;
    text-align: center;
  }
  @media only screen and (min-device-width: 1024px) and (max-device-width: 1366px) \
    and (orientation: portrait) {
    top: 3.5em;
  }
}
</style>
