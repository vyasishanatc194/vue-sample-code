import _ from 'lodash';

/**
 *  Convert all property name of an object from a case to another one
 *
 * @param {Object} obj Object on which we want to convert all keys names case
 * @param {any} fcCase Case conversion function
 */
function allKeysToOtherCase(obj, fcCase) {
  let output;
  if (_.isPlainObject(obj)) {
    output = {};
  } else if (_.isArray(obj)) {
    output = [];
  }
  _.forEach(obj, (v, k) => {
    let vRef = v;
    if (_.isPlainObject(vRef) || _.isArray(vRef)) {
      vRef = allKeysToOtherCase(vRef, fcCase);
    }
    if (_.isPlainObject(output)) {
      output[fcCase(k)] = vRef;
    } else if (_.isArray(output)) {
      output.push(vRef);
    }
  });
  return output;
}

/**
 *  Returns the type of the tag specified by `tagName`
 *
 * @param {String} tagName The tag name
 * @return {String} The tag type ('string', 'number')
 */
function getTagType(tagName) {
  const columnsToExportAsString = ['PoultryCurve', 'PoultrySex', 'SiloSex'];
  return columnsToExportAsString.indexOf(tagName) !== -1 ? 'string' : 'number';
}

// Export all functions of this module
export default {
  /**
   * Convert all property name of an object from x case to camel case
   *
   * @param {Object} x Object to convert
   * @returns Return the object with converted property name
   */
  propertyKeyToCamelCase(obj) {
    return allKeysToOtherCase(obj, _.camelCase);
  },
  /**
   * Convert all property name of an object from x case to snake case
   *
   * @param {Object} x Object to convert
   * @returns Return the object with converted property name
   */
  propertyKeyToSnakeCase(obj) {
    return allKeysToOtherCase(obj, _.snakeCase);
  },
  getTagType,
  /**
   * Get number separators based on browser locale
   *
   * @returns {Object} Return an object with numbers separators
   */
  getNumberSeparators() {
    const numberSeparators = {
      decimal: '.',
      thousand: '',
    };
    const numberToLocalString = parseFloat(1234.56).toLocaleString();
    // If the resulting number does not contain previous number
    // (i.e. in some Arabic formats), return defaults
    // https://en.wikipedia.org/wiki/Decimal_separator#Other_numeral_systems
    if (numberToLocalString.match('1') === false) {
      return numberSeparators;
    }

    numberSeparators.decimal = numberToLocalString.replace(/.*4(.*)5.*/, '$1');
    numberSeparators.thousand = numberToLocalString.replace(/.*1(.*)2.*/, '$1');
    return numberSeparators;
  },
};
