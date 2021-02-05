<template>
  <div class="dygraph-component">
    <div :class='{
      hideY: yHiddenSettings.y,
      hideY1: yHiddenSettings.y1,
      hideY2: yHiddenSettings.y2 }'>
      <div ref='graph' class='full-width'/>
    </div>
  </div>
</template>

<script>
import Dygraph from 'dygraphs';
import _ from 'lodash';

export default {
  name: 'dygraph',
  mounted() {
    // We have to wait until the next tick since we are doing DOM manipulation
    // on a child div. We need a child DIV or else Vuejs complains that Dygraphs
    // is trying to delete one of its divs. See
    // https://vuejs.org/v2/api/#mounted
    this.$nextTick(() => {
      this.buildGraphObject();
    });
  },
  beforeDestroy() {
    this.destroyGraphObject();
  },
  watch: {
    graph() {
      this.buildGraphObject();
    },
    sensorVisibility() {
      if (!this.sensorVisibility || !this.dygraph) return;

      // If sensor selection hasn't changed then exit
      const sensorVisibilityArray = _(this.sensorVisibility)
        .flatten()
        .value();
      if (this.dygraph.visibility()
        .every((currentVis, index) => currentVis === sensorVisibilityArray[index])) return;

      // Reset y axis hidden settings to default
      this.yHiddenSettings = _(this.yHiddenSettings)
        .map(() => false);

      // Hides y axis for each tag group if applicable
      if (this.sensorVisibility.length === 1) {
        this.yHiddenSettings.y = _(this.sensorVisibility[0])
          .every(visible => !visible);
      } else if (this.sensorVisibility.length === 2) {
        this.yHiddenSettings.y1 = _(this.sensorVisibility[0])
          .every(visible => !visible);
        this.yHiddenSettings.y2 = _(this.sensorVisibility[1])
          .every(visible => !visible);
      }

      // Set each sensor visibility
      _(sensorVisibilityArray)
        .each((vis, i) => {
          this.dygraph.setVisibility(i, vis);
        });
    },
  },
  props: ['graph', 'sensorVisibility'],
  methods: {
    /**
     *  Destroy the Dygraph instance if any
     */
    destroyGraphObject() {
      if (this.dygraph) {
        this.dygraph.destroy();
        this.dygraph = null;
      }
    },
    /**
     * Build the Dygraph instance based on the graph property
     */
    buildGraphObject() {
      this.destroyGraphObject();

      if (!this.graph || !this.graph.options || !this.graph.data || !this.graph.data.length) {
        return;
      }

      // We have to create a new Dygraph here since there are rendering
      // artifacts when we go from not drawing the y2 axis to drawing it.
      this.dygraph = new Dygraph(this.$refs.graph, this.graph.data, this.graph.options);
    },
  },
  data() {
    return {
      yHiddenSettings: {
        y: false,
        y1: false,
        y2: false,
      },
    };
  },
};
</script>

<style lang='stylus'>
// We don't scope these else they will not be applied to Dygraphs
@import '~dygraphs/dist/dygraph.css';

.dygraph-component .dygraph-axis-label {
  color: $light-font;
}

.dygraph-component .hideY .dygraph-axis-label-y, .dygraph-component .hideY .dygraph-ylabel,
.dygraph-component .hideY1 .dygraph-axis-label-y1, .dygraph-component .hideY1 .dygraph-ylabel,
.dygraph-component .hideY2 .dygraph-axis-label-y2, .dygraph-component .hideY2 .dygraph-y2label {
  display: none;
}

.dygraph-component .dygraph-legend {
   font-size: 75%;
   left: 0px !important;
   width: 100%;
   padding-left: 5em;
   background-color: transparent;
}

</style>
