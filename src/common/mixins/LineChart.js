import {
  color as amColor,
  NumberFormatter,
} from '@amcharts/amcharts4/core';
import {
  DateAxis,
  CategoryAxis,
  ValueAxis,
  LineSeries,
  CircleBullet,
  Legend,
  XYCursor,
} from '@amcharts/amcharts4/charts';

export default {
  methods: {
    createXAxis(chartConfig) {
      const {
        minGridDistance, axisStrokeOpacity, axisStrokeWidth, axisStrokeColor,
        xAxisTemplateLocation, xAxisTemplateStartLocation, xAxisTemplateEndLocation,
        xAxisType, xAxisFieldValue,
      } = chartConfig;

      let xAxis;
      if (xAxisType === 'category') {
        xAxis = this.chart.xAxes.push(new CategoryAxis());
        xAxis.dataFields.category = xAxisFieldValue;
      } else {
        xAxis = this.chart.xAxes.push(new DateAxis());
      }

      xAxis.renderer.labels.template.fill = amColor(this.$style.xAxisLabelColor);
      xAxis.renderer.minGridDistance = minGridDistance;
      xAxis.renderer.grid.template.strokeOpacity = axisStrokeOpacity;
      xAxis.renderer.grid.template.strokeWidth = axisStrokeWidth;
      xAxis.renderer.grid.template.stroke = axisStrokeColor;
      xAxis.renderer.grid.template.location = xAxisTemplateLocation;
      xAxis.startLocation = xAxisTemplateStartLocation;
      xAxis.endLocation = xAxisTemplateEndLocation;
      return Promise.resolve({ xAxis });
    },
    loadYAxis(chartConfig) {
      return this.createYAxis(false, chartConfig)
        .then((response) => {
          this.yAxis = response.valueAxis;
          return this.yAxis;
        });
    },
    loadOppositeYAxis(chartConfig) {
      return this.createYAxis(true, chartConfig)
        .then((response) => {
          this.oppositeYAxis = response.valueAxis;
          return this.oppositeYAxis;
        });
    },
    isYAxisIndexPositionNotZero(valueAxis) {
      return this.chart.yAxes.indexOf(valueAxis) !== 0;
    },
    createYAxis(isOppositeAxis, chartConfig) {
      const {
        axisStrokeOpacity, axisStrokeWidth, axisStrokeColor,
        yAxisLabelText, yAxisLabelColor, yAxisNumberFormat,
        oppositeYAxisLabelText, oppositeYAxisTitleRotation,
      } = chartConfig;

      const valueAxis = this.chart.yAxes.push(new ValueAxis());

      valueAxis.renderer.labels.template.fill = amColor(this.$style.yAxisLabelColor);
      valueAxis.renderer.grid.template.strokeOpacity = axisStrokeOpacity;
      valueAxis.renderer.grid.template.strokeWidth = axisStrokeWidth;
      valueAxis.renderer.grid.template.stroke = axisStrokeColor;
      valueAxis.renderer.line.strokeOpacity = axisStrokeOpacity;
      valueAxis.renderer.line.strokeWidth = axisStrokeWidth;
      valueAxis.renderer.line.stroke = axisStrokeColor;
      valueAxis.renderer.opposite = isOppositeAxis;
      valueAxis.title.fill = yAxisLabelColor;

      if (this.isYAxisIndexPositionNotZero() === true) {
        valueAxis.syncWithAxis = this.chart.yAxes.getIndex(0);
      }

      if (valueAxis.renderer.opposite === false) {
        valueAxis.title.text = yAxisLabelText;
        valueAxis.numberFormatter = new NumberFormatter();
        valueAxis.numberFormatter.numberFormat = yAxisNumberFormat;
      } else {
        valueAxis.title.text = oppositeYAxisLabelText;
        valueAxis.title.rotation = oppositeYAxisTitleRotation;
      }
      return Promise.resolve({ valueAxis });
    },
    addLineSeriesAndBullets(fields, chartConfig) {
      fields.forEach((element) => {
        const { lineStrokeDasharray } = chartConfig;
        const seriesData = {
          fieldName: element.value,
          valueAxisObject: element.isOpposite === false ? this.yAxis : this.oppositeYAxis,
          seriesName: element.label,
          seriescolor: element.color,
          strokeDasharray: element.isDashedLine === true ? lineStrokeDasharray : '',
        };
        this.createLineSeries(seriesData, chartConfig)
          .then(response => this.createCircleBulletOnLineSeries(response.series, chartConfig));
      });
    },
    createLineSeries(seriesData, chartConfig) {
      const {
        xAxisFieldValue, seriesStrokeWidth, seriesTooltipText,
        xAxisType,
      } = chartConfig;
      const {
        fieldName,
        valueAxisObject,
        seriesName,
        seriescolor,
        strokeDasharray,
      } = seriesData;

      const series = this.chart.series.push(new LineSeries());

      let xAxisDataField = 'dateX';
      if (xAxisType === 'category') {
        xAxisDataField = this.getXAxisFieldType('category');
      }

      series.dataFields.valueY = fieldName;
      series.dataFields[xAxisDataField] = xAxisFieldValue;
      series.strokeWidth = seriesStrokeWidth;
      series.yAxis = valueAxisObject;
      series.name = seriesName;
      series.tooltipText = seriesTooltipText;
      series.stroke = amColor(seriescolor);
      series.fill = amColor(seriescolor);
      series.strokeDasharray = strokeDasharray;
      return Promise.resolve({ series });
    },
    createCircleBulletOnLineSeries(series, chartConfig) {
      const {
        circleBulletRadius,
        circleBulletFillColor,
        circleBulletStrokeWidth,
        isBulletHiddenOnLineSeries,
      } = chartConfig;

      const circleBullet = series.bullets.push(new CircleBullet());

      circleBullet.circle.radius = circleBulletRadius;
      circleBullet.circle.fill = circleBulletFillColor;
      circleBullet.circle.strokeWidth = circleBulletStrokeWidth;
      circleBullet.disabled = isBulletHiddenOnLineSeries === true;
      return circleBullet;
    },
    addChartFillRange(axis, chartConfig) {
      const { seriesFillColor, fillRange, seriesFillOpacity } = chartConfig;
      const range = axis.axisRanges.create();
      range.date = new Date(fillRange.start);
      range.endDate = new Date(fillRange.end);
      range.axisFill.fill = amColor(seriesFillColor);
      range.axisFill.fillOpacity = seriesFillOpacity;
      return range;
    },
    addLegend(chartConfig) {
      const { legendContentAlign, legendLabelTextColor } = chartConfig;
      this.chart.legend = new Legend();
      this.chart.legend.contentAlign = legendContentAlign;
      this.chart.legend.labels.template.fill = legendLabelTextColor;
      return this.chart.legend;
    },
    addCursorToShowTooltip() {
      this.chart.cursor = new XYCursor();
      return Promise.resolve({ cursor: this.chart.cursor });
    },
    getXAxisFieldType(type) {
      const fieldTypes = {
        date: 'dateX',
        category: 'categoryX',
        value: 'valueX',
      };
      return fieldTypes[type];
    },
  },
};
