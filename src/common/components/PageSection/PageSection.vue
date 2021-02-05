<template>
  <div class="page-section">
    <!-- START: Main section -->
    <div class="row q-col-gutter-sm" v-if="!isMobileView">
      <!-- START: Left Section -->
      <div class="col-lg-4 col-md-6 col-sm-12" v-if="title">
        <q-item class="q-pa-md q-gutter-sm">
          <q-item-section side>
            <q-item-label>{{ title }}</q-item-label>
            <q-item-label caption>{{ subTitle }}</q-item-label>
          </q-item-section>
        </q-item>
      </div>
      <!-- END: Left Section -->
      <!-- START: Right Section -->
      <div class="col-lg-4 col-md-6 col-sm-12 overflow-hidden">
        <q-card flat bordered>
          <q-card-section v-if="$slots['card-section']">
            <slot name="card-section"></slot>
          </q-card-section>
          <q-card-actions v-if="$slots['card-actions']" :align="actionAlign">
            <slot name="card-actions"></slot>
          </q-card-actions>
        </q-card>
      </div>
      <!-- END: Right Section -->
    </div>
    <div class="row q-col-gutter-sm" v-if="isMobileView">
      <div class="col-lg-4 col-md-6 col-sm-12 col-100">
        <q-card>
          <q-card-section>
            <q-expansion-item class="expansion-item" group="section-group"
              :default-opened="isAccordionOpen"
              :label="title" :caption="subTitle" no-ripple>
              <div class="col-lg-4 col-md-6 col-sm-12 q-mt-md q-mb-md">
                <q-separator />
              </div>
              <div class="col-lg-4 col-md-6 col-sm-12 overflow-hidden">
                <q-card flat>
                  <q-card-section v-if="$slots['card-section']" class="no-padding">
                    <slot name="card-section"></slot>
                  </q-card-section>
                  <q-card-actions v-if="$slots['card-actions']" :align="actionAlign"
                    class="no-padding">
                    <slot name="card-actions"></slot>
                  </q-card-actions>
                </q-card>
              </div>
            </q-expansion-item>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <!-- END: Main section -->
  </div>
</template>

<script>
export default {
  name: 'page-section',
  props: {
    title: {
      type: String,
      default: '',
    },
    subTitle: {
      type: String,
      default: '',
    },
    actionAlign: {
      type: String,
      default: 'left',
    },
    isAccordionOpen: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isMobileView() {
      return this.$q.screen.xs === true;
    },
  },
};
</script>

<style lang="stylus" scoped>
.page-section {
  >>> .q-card__actions {
    padding: 1.5rem;
    background-color: $card-action-color;
  }
  >>> .q-card {
    border-radius: 0.8rem;
  }
  >>> .q-item__label {
    color: $title-color;
    font-weight: 800;
    font-size: 1.25rem;
    &.q-item__label--caption {
      color: $label-color;
      font-weight: 500;
      font-size: 0.9rem;
    }
  }
}
@media (max-width $breakpoint-sm-max) {
  .page-section {
    .q-card__actions {
      margin-top: 1rem;
    }
    >>> .q-card {
      border-radius: 0rem;
    }
    >>> .expansion-item {
      .q-item {
        padding: 0.5rem 0;
      }
    }
    .col-100 {
      width: 100%;
    }
  }
}
</style>
