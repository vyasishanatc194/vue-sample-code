import moment from 'moment-timezone';
import _ from 'lodash';
import dygraphLib from 'dygraphs';
import UtilUnit from 'src/common/utils/unit';

/**
 * This function pivots an array of column into an array of rows.
 *
 * @param columns contains an array of rows to pivot.
 *
 * @param comparatorFunc contains a function to compare different entries in
 *                       a row. The function is given two entries to
 *                       compare.
 *
 * @param indexFunc contains a function that should returns the index for
 *                  the new row (eg timestamp). This value is placed in the
 *                  left most column of the row. The function is given the
 *                  smallest entry in the row as determined by the
 *                  comparatorFunc as input.
 *
 * @param valueFunc contains a function that should return the new value for
 *                  an element in the row. The function is given a boolean
 *                  to indicate if the current element is the smallest in
 *                  the row and the last element which was smallest for
 *                  which to return the value. If no element was previously
 *                  valid, undefined given as an element. The boolean value
 *                  is useful because it could be useful to return null, 0,
 *                  undefined for an empty row or the previous element.
 */
function pivot(columns, comparatorFunc, indexFunc, valueFunc) {
  const chainedGroups = _.map(columns, col => _.chain(col).sort(comparatorFunc));

  // We build a list of iterators to iterate through our data.
  let iterators = _.map(chainedGroups, chain => chain.next());

  const result = [];

  // We know we are finished when we don't have an iterator left which
  // isn't 'done'.
  let running = (_.chain(iterators)
    .map(x => !x.done)
    .some().value());

  while (running) {
    // We keep the iterator that isn't finished that has the smallest
    // value as told by the comparatorFunc.
    const smallest = _.reduce(iterators, (res, iter) => {
      if (!res || res.done) {
        return iter;
      }
      if (!iter || iter.done) {
        return res;
      }

      const compare = comparatorFunc(res.value, iter.value);
      if (compare <= 0) {
        return res;
      }
      return iter;
    }, undefined);

    // We go through our list and get the latest value for every
    // iterator.
    result.push(_.concat(
      [indexFunc(smallest.value)],
      _.map(iterators, (iter) => {
        const isSmallest = !iter.done && comparatorFunc(
          smallest.value,
          iter.value,
        ) === 0;
        const value = (isSmallest
          ? iter.value : undefined);

        return valueFunc(isSmallest, value);
      }),
    ));

    // We update the value of the iterators
    iterators = _.map(_.zip(chainedGroups, iterators), (current) => {
      const iter = current[1];
      const isSmallest = !iter.done && comparatorFunc(
        smallest.value,
        iter.value,
      ) === 0;
      if (isSmallest) {
        return current[0].next();
      }

      return iter;
    });

    // We check if we are now finished
    running = (_.chain(iterators)
      .map(x => !x.done)
      .some().value());
  }

  return result;
}

/**
 * Join to a list of tags all time series data from each of their sensors.
 *
 * @param tags {Array} Contains the tag information. Each tag entry should look like :
 *
 *   {
 *     "tag": "PoultryWeight",
 *     "tag_locale_name": "Poultry Weight",
 *     "tag_id": 28,
 *     "tag_priority": 1,
 *     "graphable": true,
 *     "default_unit": 7,
 *     "user_unit": 7,
 *     "selected": true
 *   },
 *   {
 *      // Next tag declaration ...
 *   },
 *
 * @param tagsSensorTimeSeriesData {Array} Contains the database time-series data of the selected
 * tags. Each entry should look like :
 *
 *   {
 *     "tag": "PoultryWeight",
 *     "sensor_index": 2,
 *     "sensor_timestamp": "1564533000000",
 *     "value": 0
 *   },
 *   {
 *     "tag": "PoultryWeight",
 *     "sensor_index": 1,
 *     "sensor_timestamp": "1564533000000",
 *     "value": 0.051
 *   },
 *   {
 *     "tag": "ProductionDay",
 *     "sensor_index": 0,
 *     "sensor_timestamp": "1564533000000",
 *     "value": 1
 *   }
 *   {
 *      // Next sensor time-series data declaration ...
 *   },
 *
 * @param isUnitConversionRequired {Boolean} When true, a unit conversion will be applied
 * to data history. The conversion is done from database to caller/user's unit
 *
 * @returns {Array<Object>} The tags information filled out with all of their sensor's
 * time-series data. The array should look like :
 *
 *   {
 *     "tag": "PoultryWeight",
 *     "tag_locale_name": "Poultry Weight",
 *     "tag_id": 28,
 *     "tag_priority": 1,
 *     "graphable": true,
 *     "default_unit": 7,
 *     "user_unit": 7,
 *     "sensors": [
 *       {
 *         "index": 1,
 *         "data": [
 *           {
 *             "tag": "PoultryWeight",
 *             "sensor_index": 1,
 *             "sensor_timestamp": "1564533000000",
 *             "value": 51
 *           }
 *         ]
 *       },
 *       {
 *         // Next sensor time-series data declaration ...
 *       },
 *     ],
 *     "selected": true,
 *     "unit": {
 *       "id": 7,
 *       "symbol": "g",
 *       "scale": 1000,
 *       "offset": 0,
 *       "name": "gram",
 *       "unit_category_id": 2,
 *       "name_locale": "gram"
 *     }
 *   },
 *   {
 *     // Next tag declaration ...
 *   }
 */
function mergeTagAndData(tags, tagsSensorTimeSeriesData, isUnitConversionRequired) {
  // We group the data we received by the tag.
  const groupedData = _(tagsSensorTimeSeriesData)
    .groupBy(x => x.tag)
    .value();

  // For every tag, we fill in the sensor data.
  const result = _(tags)
    .map((tag) => {
      // Get only the time-series data of the current tag mapped
      const tagTimeSeriesData = groupedData[tag.tag];

      // Skip tag with no associated time-series data
      if (!tagTimeSeriesData) return null;

      // Clone deep here because we don't want to modify the data that was
      // received as a parameter
      const tagCloned = _.cloneDeep(tag);

      // If required, apply unit conversion to all current tag's sensors value.
      // The unit is converted from default database unit to the one of the caller
      // that has been passed along with the current tag mapped
      if (isUnitConversionRequired === true) {
        _(tagTimeSeriesData).each((entry) => {
          // Prevent the conversion of null values to number because null is converted to 0.
          if (entry.value !== null) {
            const unitConverter = UtilUnit
              .getUnitConverterFromUnitContextID(tagCloned.unit_context_id);
            entry.value = unitConverter.convertValueToUser(entry.value);
          }
        });
      }

      // Hook up all sensors time-series data to the tag being mapped.
      tagCloned.sensors = _(tagTimeSeriesData)
        .groupBy(x => x.sensor_index)
        .toPairs()
        .sortBy((x) => {
          // At this point, x look like this
          //    ["i", [
          //      /* Time-series data of sensor with index i... */
          //      {
          //        tag: "PoultryWeight",
          //        sensor_index: 1,
          //        sensor_timestamp: "1564533000000",
          //        value: 51
          //      },
          //      { // Next time-series data of this sensor ... },
          //    ],
          const sensorIndex = parseInt(x[0], 10);
          return sensorIndex;
        })
        .map((x) => {
          const first = _.first(x[1]);
          return {
            index: first.sensor_index,
            data: x[1],
          };
        })
        .value();
      return tagCloned;
    })
    // Remove any falsy results
    .compact()
    .value();

  return result;
}

/**
 * Pivots data from specified tags based using right timezone
 *
 * @param {String} timezone IANA time zone associated to the data
 * @param {Array}  leftYAxisTagList contains the list of the tag objects that use the
 * left axis.
 * @param {Array, optional} rightYAxisTagList contains the tag objects that use the
 * right axis. Can be null or undefined.
 *
 * @returns an object containing the { data, graphTags } where data is the
 * result of the pivot applied on the tag's data and graphTags are formatted
 * with necessary sensor labeling information
 */
function pivotTagsData(timezone, leftYAxisTagList, rightYAxisTagList) {
  // This function takes an axis and returns a function which returns an object
  // with all the information we need for the graph for a given tag.
  const tagToGraph = axis => tag => _(tag.sensors)
    .map(sensor => ({
      name: `${tag.tag_locale_name} #${sensor.index}`,
      color: sensor.color,
      data: sensor.data,
      axis,
    }))
    .value();

  // We combine the left and the right tags. For the right tags, we set the axis
  // to 'y2' so they show up on the right axis.
  let graphTags = _(_.concat(
    _(leftYAxisTagList)
      .map(tagToGraph(null))
      .value(),
    _(rightYAxisTagList)
      .map(tagToGraph('y2'))
      .value(),
  ))
    .flatten()
    .compact()
    .value();

  // Here, we reorder the tags to match the graph data
  const compareGraphTags = _.filter(graphTags, tag => typeof tag.name === 'string'
    && tag.name.includes('C_') === true);
  if (compareGraphTags.length > 0) {
    graphTags = _.filter(graphTags, tag => typeof tag.name === 'string'
      && tag.name.includes('C_') === false);
    graphTags = _.concat(graphTags, compareGraphTags);
  }
  // We merge all our data. We go from each data being an independent column to
  // having an array of rows for all our data. We place nulls when we don't have
  // data for a given timestamp.
  const data = pivot(
    _.map(graphTags, tag => tag.data),
    (a, b) => {
      const valueA = parseInt(a.sensor_timestamp, 10);
      const valueB = parseInt(b.sensor_timestamp, 10);

      if (_.isFinite(valueA) && _.isFinite(valueB)) {
        return valueA - valueB;
      } if (_.isFinite(valueA)) {
        return -1;
      } if (_.isFinite(valueB)) {
        return 1;
      }

      return 0;
    },

    // Get the timezone
    elem => moment.tz(parseInt(elem.sensor_timestamp, 10), timezone).toDate(),
    (isSmallest, elem) => {
      if (isSmallest) {
        return elem.value;
      }

      return null;
    },
  );

  return {
    data,
    graphTags,
  };
}

/**
 * This is a function which takes in tag information and builds a standard
 * Dygraphs option and dataset.
 *
 * @param {String} timezone IANA time zone associated to the data
 * @param {String} leftYAxisLabel contains the text that is shown on the left axis.
 * @param {Array}  leftYAxisTagList contains the list of the tag objects that use the left axis.
 * @param {String, optional} rightYAxisLabel contains the text that is shown on the right axis.
 * Can be null or undefined.
 * @param {Array, optional} rightYAxisTagList contains the tag objects that use the
 * right axis. Can be null or undefined.
 * @param {String, optional} timeMarkerPrefix contains the prefix text that is
 * shown near the time marker value
 * @param {Array, optional} timeMarkerTags contains tag objects to mark on
 * time axis. Mainly used for production day marker
 * @param {Array, optional} compareMode contains the current mode (flockCompare, dateCompare, '')
 * @returns an object containing the { data, options } that can be passed to
 *          Dygraphs to build the desired graph.
 */
function getGraph(timezone, leftYAxisLabel, leftYAxisTagList, rightYAxisLabel, rightYAxisTagList,
  timeMarkerPrefix, timeMarkerTags, compareMode, commonDay) {
  // Pivot with tag axis labeled properly
  const result = pivotTagsData(timezone, leftYAxisTagList, rightYAxisTagList);
  // Retreive graph tags
  const { graphTags } = result;
  // Retreive graph pivot
  const { data } = result;

  // We build a list of objects to change the series property of all our tags
  const series = _(graphTags)
    .map(tag => [tag.name, {}])
    .fromPairs()
    .value();
  _.forEach(series, (serie, key) => {
    const serieTag = _.find(graphTags, tag => tag.name === key);
    if (typeof serieTag !== 'undefined') {
      if (typeof serieTag.axis !== 'undefined') {
        serie.axis = serieTag.axis;
      }
      if (typeof key === 'string' && key.includes('C_') === true) {
        // [dashes' size, space between dashes]
        serie.strokePattern = [6, 8];
      }
    }
  });
  // Build markers collection to show on time axis
  // Build object {timeStamp, value} based on given timeMarkerTags
  // timeStamp is the real date of the marker tag sensor_timestamp
  // value is the value of the marker tag
  const timeMarkers = _(timeMarkerTags)
    .map((e) => {
      // Timezone offset of the device
      const offsetFromDevice = moment.tz(timezone).utcOffset();
      // Timezone offset of the browser
      const offsetFromBrowser = moment().utcOffset();
      // Number of minutes we need to add.
      // We calculate the difference between the two timezone offsets.
      // The difference is needed to convert timestamp from device timezone to browser timezone.
      const diffDeviceVSBrowserMinutes = offsetFromDevice - offsetFromBrowser;
      const markerDate = moment.utc(parseInt(e.sensor_timestamp, 10))
        .add(diffDeviceVSBrowserMinutes, 'minutes').toDate();
      const marker = {
        timeStamp: markerDate,
        value: e.value,
      };
      return marker;
    })
    // Sort markers chronologically from oldest to newest
    .sort((m1, m2) => m1.timeStamp - m2.timeStamp)
    .value();

  /**
   * Retrieve marker object by returning latest marker recorded
   * just before the given timestamp
   * @param {Number} Timestamp to retrieve marker for
   *
   */
  const findMarker = d => _.findLast(timeMarkers, e => e.timeStamp <= d);
  // Standard Dygraphs options
  const options = {
    labels: _.concat(['t'], _.map(graphTags, tag => tag.name)),
    ylabel: leftYAxisLabel,
    y2label: rightYAxisLabel,
    series,
    strokeWidth: 2,
    gridLineColor: '#ddd',
    rollPeriod: 1, // Don't change this.
    labelsSeparateLines: true,
    legend: 'always',
    connectSeparatedPoints: true,
    includeZero: true,
    axes: {
      x: {
        // Overrides label formatter to indicate required time markers
        axisLabelFormatter: (d, granularity, opts) => {
          let dFormatted = dygraphLib.dateAxisLabelFormatter(d, granularity, opts);
          const dDate = moment(d).toDate();
          const marker = _.findLast(timeMarkers, e => dDate.getDate() === e.timeStamp.getDate()
            && dDate.getMonth() === e.timeStamp.getMonth()
            && dDate.getFullYear() === e.timeStamp.getFullYear());
          // Number of minutes we need to add
          const diffDeviceVSBrowserMinutes = moment.tz(timezone).utcOffset() - moment().utcOffset();
          // Indicate marker tag value
          if (typeof marker !== 'undefined') {
            if (compareMode[0] === 'flockCompare') {
              // Display the day value only
              dFormatted = `<span>${timeMarkerPrefix} ${marker.value}</span>`;
              if (typeof commonDay !== 'undefined'
                && moment(marker.timeStamp, 'x').valueOf()
                <= moment(_.toString(commonDay), 'x')
                  .add(diffDeviceVSBrowserMinutes, 'minutes').valueOf()) {
                // Hide all days before the first aligned day
                dFormatted = `<span>${timeMarkerPrefix} --</span>`;
              }
            } else if (compareMode[0] === 'dateCompare') {
              // Display the date only
              dFormatted = `${dFormatted}`;
            } else {
              // Decrease police size just a little
              dFormatted = `${dFormatted}<br><span style='font-size: 75%;'>${timeMarkerPrefix} ${marker.value}</span>`;
            }
          } else {
            // The dygraph library creates markers that we don't want to display
            dFormatted = `<span>${timeMarkerPrefix} --</span>`;
          }
          return dFormatted;
        },
      },
      y: {
        valueFormatter: (yAxisValue) => {
          const firstLeftYAxisTag = leftYAxisTagList[0];
          return UtilUnit
            .getUnitConverterFromUnitContextID(firstLeftYAxisTag.unit_context_id)
            .formatValueToUserWithUnitSymbol(yAxisValue);
        },
        axisLabelFormatter: (yAxisValue) => {
          const firstLeftYAxisTag = leftYAxisTagList[0];
          return UtilUnit
            .getUnitConverterFromUnitContextID(firstLeftYAxisTag.unit_context_id)
            .formatValueToUser(yAxisValue);
        },
      },
      y2: {
        valueFormatter: (yAxisValue) => {
          const firstRightYAxisTag = rightYAxisTagList[0];
          return UtilUnit
            .getUnitConverterFromUnitContextID(firstRightYAxisTag.unit_context_id)
            .formatValueToUserWithUnitSymbol(yAxisValue);
        },
        axisLabelFormatter: (yAxisValue) => {
          const firstRightYAxisTag = rightYAxisTagList[0];
          return UtilUnit
            .getUnitConverterFromUnitContextID(firstRightYAxisTag.unit_context_id)
            .formatValueToUser(yAxisValue);
        },
      },
    },
  };

  return {
    options,
    data,
    findMarker,
  };
}

function getNoAxisGraph(tags) {
  const graph = getGraph(null, tags);

  // TODO scale the data
  // http://dygraphs.com/tests/multi-scale.html

  graph.options.drawAxis = false;
  graph.options.showLabelsOnHighlight = false;

  return graph;
}

export default {
  pivot,
  mergeTagAndData,
  getGraph,
  getNoAxisGraph,
  pivotTagsData,
};
