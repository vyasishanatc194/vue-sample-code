<template>

  <!-- Page's section -->
  <div class="page-box page-box-bg shadow-2 q-mb-sm q-pa-sm">

    <!-- Section's title -->
    <div class="header" v-if="$slots['header']">
      <slot name="header"></slot>
    </div>
    <div class="header row items-center" v-if="title && !$slots['header']">
      <div class="col-auto">
        <h1>{{ title }}</h1>
      </div>
      <div class="col text-right">
        <slot name="top-right"></slot>
      </div>
      <div class="separator"></div>
    </div>

    <!-- Dynamic body (default slot) -->
    <div class="body" v-if="$slots['default']">
      <slot></slot>
    </div>

    <div class="footer q-ma-md" v-if="$slots['footer']">
      <slot name="footer"></slot>
    </div>

  <!-- End of Section -->
  </div>

</template>

<script>
export default {
  name: 'page-box',
  props: {
    title: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="stylus" scoped>

.page-box {

  .header {

    >>> h1 {
      line-height: 1.5rem;
      font-size:2rem;
    }
  }

  .footer {

    .q-btn {
      min-width: 8rem;
      margin: 0.2rem 0.4rem;
    }
  }

  .separator {
    background-color: $item-separator-color;
    height: 1px;
    width: 100%;
  }
}

// Resolution for iPhone 6 and newer
@media only screen and (max-width: 420px) {
  .page-box {
    .header {
      >>> h1 {
        line-height: 1.2rem;
        font-size: 1.65rem;
      }
    }
  }
}

// Resolution for iPhone 5
@media only screen and (max-width: 320px) {
  .page-box {
    .header {
      >>> h1 {
        font-size: 1.25rem;
      }
    }
  }
}
</style>

<style lang="stylus">
.page-box {
  background-color: $page-box-background

  .error-validation {
    color: $negative;
    clear: both;
    font-size: 70%;
  }

  .q-table-top {
    .q-btn {
      margin: 0.2rem 0.2rem;
    }

    .q-btn:first-child {
      margin-left: 0;
    }
  }
}
</style>
