/**
 * This module introduces predictive graph support and is based on legacy
 * implementation for Average Poultry Weight
 */

import _ from 'lodash';
import moment from 'moment';

/**
 * A function that models the weight of poultry. It is based on a cubic function
 * f(x)=(sx+1)(ax³+bx²+cx+d).
 *
 * @param {Array} params Contains an array the scale variable (s).
 * @param {Number} x contains the x value for which we are returning the y value.
 * @returns {Number} the y value for the cubic with the given values.
 */
function poultryWeight(params, x) {
  const a = params[0];
  const b = params[1];
  const c = params[2];
  const d = params[3];

  return ((a * x * x * x)
          + (b * x * x)
          + (c * x)
          + d);
}

/**
* This function builds a cubic function from four points.
*
* @param points {Array} the points passed as an array of array :
*   [
*     [x0,y0], [x1,y1], [x2,y2], [x3,y3]
*   ]
* @returns {Array} an array containing the parameters [a, b, c, d] of the cubic
* of form `y = ax³ + bx² + cx + d`. If the points aren't unique, it returns null.
*/
function buildCubic(points) {
  points = _.compact(points);
  if (points.length !== 4) return null;

  const x0 = points[0][0];
  const y0 = points[0][1];
  const x1 = points[1][0];
  const y1 = points[1][1];
  const x2 = points[2][0];
  const y2 = points[2][1];
  const x3 = points[3][0];
  const y3 = points[3][1];

  const x02 = x0 * x0;
  const x03 = x0 * x0 * x0;
  const x12 = x1 * x1;
  const x13 = x1 * x1 * x1;
  const x22 = x2 * x2;
  const x23 = x2 * x2 * x2;
  const x32 = x3 * x3;
  const x33 = x3 * x3 * x3;

  // Need to disable mixed operators to not disturb calculation specially this
  // part is imported from v1 version. All this should be refactored once
  // prediction will be addressed the right way
  /* eslint-disable no-mixed-operators */
  const denom = (x0 * (x12 * (x33 - x23) - x22 * x33 + x23 * x32 + x13 * (x22 - x32))
    + x1 * (x22 * x33 - x23 * x32)
    + x02 * (x2 * x33 + x1 * (x23 - x33) + x13 * (x3 - x2) - x23 * x3)
    + x12 * (x23 * x3 - x2 * x33) + x03 * (x1 * (x32 - x22) - x2 * x32 + x22 * x3 + x12 * (x2 - x3))
    + x13 * (x2 * x32 - x22 * x3));

  // This happens when two or more of the points are identical or nearly
  // identical.
  if (Math.abs(denom) < 0.001) return null;

  const a = (x0 * (x12 * (y3 - y2) - x22 * y3 + x32 * y2 + (x22 - x32) * y1)
    + x1 * (x22 * y3 - x32 * y2) + x02 * (x2 * y3 + x1 * (y2 - y3) - x3 * y2 + (x3 - x2) * y1)
    + x12 * (x3 * y2 - x2 * y3) + (x2 * x32 - x22 * x3) * y1
    + (x1 * (x32 - x22) - x2 * x32 + x22 * x3 + x12 * (x2 - x3)) * y0) / denom;
  // Build b factor
  const b = -(x0 * (x13 * (y3 - y2) - x23 * y3 + x33 * y2 + (x23 - x33) * y1)
    + x1 * (x23 * y3 - x33 * y2) + x03 * (x2 * y3 + x1 * (y2 - y3) - x3 * y2 + (x3 - x2) * y1)
    + x13 * (x3 * y2 - x2 * y3) + (x2 * x33 - x23 * x3) * y1
    + (x1 * (x33 - x23) - x2 * x33 + x23 * x3 + x13 * (x2 - x3)) * y0) / denom;
  // Build c factor
  const c = (x02 * (x13 * (y3 - y2) - x23 * y3 + x33 * y2 + (x23 - x33) * y1)
    + x12 * (x23 * y3 - x33 * y2) + x03 * (x22 * y3 + x12 * (y2 - y3) - x32 * y2 + (x32 - x22) * y1)
    + x13 * (x32 * y2 - x22 * y3) + (x22 * x33 - x23 * x32) * y1
    + (x12 * (x33 - x23) - x22 * x33 + x23 * x32 + x13 * (x22 - x32)) * y0) / denom;
  // Build d factor
  const d = -(x0 * (x12 * (x23 * y3 - x33 * y2) + x13 * (x32 * y2 - x22 * y3)
    + (x22 * x33 - x23 * x32) * y1)
    + x02 * (x1 * (x33 * y2 - x23 * y3) + x13 * (x2 * y3 - x3 * y2) + (x23 * x3 - x2 * x33) * y1)
    + x03 * (x1 * (x22 * y3 - x32 * y2) + x12 * (x3 * y2 - x2 * y3) + (x2 * x32 - x22 * x3) * y1)
    + (x1 * (x23 * x32 - x22 * x33) + x12 * (x2 * x33 - x23 * x3) + x13 * (x22 * x3 - x2 * x32))
    * y0) / denom;
  /* eslint-enable no-mixed-operators */

  return { curve: [a, b, c, d] };
}

/**
 * Establish production based on poultry weight data using
 * 7 days and 14 days poultry weight prediction
 */
function establishProduction(weight, prediction7, prediction14) {
  if (!weight || !prediction7 || !prediction14) return {};

  const dataset = _(weight)
    .dropWhile(entry => entry.value <= 0)
    .reverse()
    .dropWhile(entry => entry.value <= 0)
    .reverse()
    .value();
  // If there is no effective weight data then no support for weight prediction
  if (dataset.length === 0) return {};

  const midpoint = dataset[_.floor(dataset.length / 2)];
  const endpoint = _.last(dataset);

  // We offset the timestamp on the prediction7 by 7 days and prediction14 by
  // 14 days.
  prediction7 = _.cloneDeep(prediction7);
  const x7 = moment(parseInt(prediction7.sensors[0].sensor_timestamp, 10)).add(7, 'days').valueOf();
  prediction7.sensors[0].sensor_timestamp = x7;
  prediction14 = _.cloneDeep(prediction14);
  const x14 = moment(parseInt(prediction14.sensors[0].sensor_timestamp, 10)).add(14, 'days').valueOf();
  prediction14.sensors[0].sensor_timestamp = x14;

  const start = parseInt(_.first(dataset).sensor_timestamp, 10);
  const end = parseInt(_.last(dataset).sensor_timestamp, 10);

  const points = _.concat(
    _.map([midpoint, endpoint], (point) => {
      const x = (parseInt(point.sensor_timestamp, 10) - start) / (1000 * 60 * 60 * 24);
      const y = point.value;
      return [x, y];
    }),
    _.map([prediction7, prediction14], (point) => {
      const x = (point.sensors[0].sensor_timestamp - start) / (1000 * 60 * 60 * 24);
      const y = point.sensors[0].value;
      return [x, y];
    }),
  );
  const prediction = buildCubic(points);
  const isFinished = (end !== parseInt(_.last(weight).sensor_timestamp, 10));

  return {
    start,
    end,
    prediction,
    isFinished,
  };
}

export default {
  // This is the Average Poultry Weight Tag name in the system and used for this
  // prediction utility. This should be refactored with proper prediction
  // implementation as stated in utility/graph.js
  AveragePoultryWeightName: 'AveragePoultryWeight',
  AveragePoultryWeight7DayPredictionName: 'AveragePoultryWeight7DayPrediction',
  AveragePoultryWeight14DayPredictionName: 'AveragePoultryWeight14DayPrediction',
  establishProduction,
  poultryWeight,
};
