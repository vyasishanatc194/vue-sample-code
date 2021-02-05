import {
  color as amColor,
  NumberFormatter,
  percent as amPercent,
} from '@amcharts/amcharts4/core';
import {
  DateAxis,
  CategoryAxis,
  ValueAxis,
  LineSeries,
  ColumnSeries,
  CircleBullet,
  Legend,
  XYCursor,
} from '@amcharts/amcharts4/charts';

export default {
  methods: {
    createBarXAxis(chartConfig) {
      const {
        minGridDistance,
        xAxisFieldValue,
        xAxisType,
        xAxisTooltipDateFormat,
      } = chartConfig;

      let xAxis;
      if (xAxisType === 'date') {
        xAxis = this.chart.xAxes.push(new DateAxis());
      } else {
        xAxis = this.chart.xAxes.push(new CategoryAxis());
        xAxis.dataFields.category = xAxisFieldValue;
        // xAxis.renderer.cellStartLocation = 0.2;
        // xAxis.renderer.cellEndLocation = 0.8;
      }

      xAxis.renderer.labels.template.fill = amColor(this.$style.xAxisLabelColor);
      xAxis.renderer.minGridDistance = minGridDistance;
      xAxis.renderer.grid.template.disabled = true;
      xAxis.renderer.baseGrid.disabled = true;
      xAxis.tooltipDateFormat = xAxisTooltipDateFormat;
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
    addLineBarSeriesAndBullets(fields, chartConfig) {
      fields.forEach((element) => {
        const { lineStrokeDasharray } = chartConfig;
        const seriesData = {
          fieldName: element.value,
          valueAxisObject: element.isOpposite === false ? this.yAxis : this.oppositeYAxis,
          seriesName: element.label,
          seriescolor: element.color,
          strokeDasharray: element.isDashedLine === true ? lineStrokeDasharray : '',
          fieldType: element.type,
        };
        this.createLineBarSeries(seriesData, chartConfig)
          .then(response => this.createCircleBulletOnLineSeries(response.series, chartConfig));
      });
    },
    createLineBarSeries(seriesData, chartConfig) {
      const {
        xAxisFieldValue, seriesStrokeWidth, seriesTooltipText,
        columnSeriesTooltipText, barWidth, xAxisType,
      } = chartConfig;
      const {
        fieldName,
        valueAxisObject,
        seriesName,
        seriescolor,
        strokeDasharray,
        fieldType,
        data,
      } = seriesData;

      let series;
      if (fieldType === 'column') {
        series = this.chart.series.push(new ColumnSeries());
        series.tooltipText = columnSeriesTooltipText;
        series.columns.template.width = amPercent(barWidth);
      } else {
        series = this.chart.series.push(new LineSeries());
        series.tooltipText = seriesTooltipText;
      }

      let xAxisDataField = 'categoryX';
      if (xAxisType === 'date') {
        xAxisDataField = this.getXAxisFieldType('date');
      }
      series.dataFields.valueY = fieldName;
      series.dataFields[xAxisDataField] = xAxisFieldValue;
      series.strokeWidth = seriesStrokeWidth;
      series.yAxis = valueAxisObject;
      series.name = seriesName;
      if (data !== null && data !== undefined && data.length > 0) {
        series.data = data;
      }
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
      } = chartConfig;

      if (series.className !== 'ColumnSeries') {
        const circleBullet = series.bullets.push(new CircleBullet());
        circleBullet.circle.radius = circleBulletRadius;
        circleBullet.circle.fill = circleBulletFillColor;
        circleBullet.circle.strokeWidth = circleBulletStrokeWidth;
        return circleBullet;
      }
      return false;
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
      return this.chart.cursor;
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
