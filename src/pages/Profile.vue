<template>
  <q-page padding>

    <page-box-container class="preferenceBoxContainer">

      <page-box :title="$t('profile.title')">

      </page-box>

    </page-box-container>

  </q-page>
</template>

<script>
import { PageBoxContainer, PageBox } from 'src/common/components/PageBox';

export default {
  name: 'profile',
  components: {
    PageBoxContainer,
    PageBox,
  },
};
</script>

<style>

</style>
