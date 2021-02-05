import { withParams } from 'vuelidate/lib';

// Export all functions of this module
export default {
  /**
   * Validate Hardware ID (Hexadecimal)
   *
   * @param {String} hardwareId Hardware ID to validate
   * @returns Returns true if hardware ID is valid, otherwise false.
   */
  isStringHardwareId(hardwareId) {
    const reg = /[0-9A-Fa-f]{8}/g;
    return reg.test(hardwareId);
  },
  /**
   * Convert a Int32 hardware ID to an Hexadecimal string
   *
   * @param {String} hardwareId Hardware ID represented as a 32 bit signed integer
   * @returns Returns the hexadecimal representation of the hardware id.
   */
  int32HardwareIdToHex(hardwareId) {
    return this.toUInt32(hardwareId).toString(16);
  },
  /**
   * Create a validator for GPS Latitude coordinate
   *
   * @param {Number} [min=-90] Minimum latitude
   * @param {number} [max=90] Maximum latitude
   * @returns Return a vuevalidate validator
   */
  isGPSLatitude(min = -90, max = 90) {
    return withParams({ type: 'isGPSLatitude', min, max }, (value) => {
      const t = typeof value;
      if (t === 'number') {
        const x = parseFloat(value);
        if (Number.isNaN(x)) {
          return false;
        }
        return x >= min && x <= max;
      }
      return (t === 'string' && value.length === 0) || t === 'undefined' || value === null;
    });
  },
  /**
   * Create a validator for GPS Longitude coordinate
   *
   * @param {Number} [min=-180] Minimum longitude
   * @param {number} [max=180] Maximum longitude
   * @returns Return a vuevalidate validator
   */
  isGPSLongitude(min = -180, max = 180) {
    return withParams({ type: 'isGPSLongitude', min, max }, (value) => {
      const t = typeof value;
      if (t === 'number') {
        const x = parseFloat(value);
        if (Number.isNaN(x)) {
          return false;
        }
        return x >= min && x <= max;
      }
      return (t === 'string' && value.length === 0) || t === 'undefined' || value === null;
    });
  },
  /**
   * Validate a forward URL
   *
   * @param {any} value Forward URL to validate
   * @returns Return true if the URL is valid otherwise false
   */
  isForwardURL(value) {
    // Empty value is valid
    const t = typeof value;
    if ((t === 'string' && value.length === 0) || t === 'undefined' || value === null) {
      return true;
    }
    // https://gist.github.com/dperini/729294
    const re = new RegExp(
      '^'
        // protocol identifier
        + '(?:(?:https?|ftp|ftps|sftp)://)'
        // user:pass authentication
        + '(?:\\S+(?::\\S*)?@)?'
        + '(?:'
        // IP address exclusion
        // private & local networks
        + '(?!(?:10|127)(?:\\.\\d{1,3}){3})'
        + '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})'
        + '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})'
        // IP address dotted notation octets
        // excludes loopback network 0.0.0.0
        // excludes reserved space >= 224.0.0.0
        // excludes network & broacast addresses
        // (first & last IP address of each class)
        + '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])'
        + '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}'
        + '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))'
        + '|'
        // host name
        + '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)'
        // domain name
        + '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*'
        // TLD identifier
        + '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))'
        // TLD may end with dot
        + '\\.?'
        + ')'
        // port number
        + '(?::\\d{2,5})?'
        // resource path
        + '(?:[/?#]\\S*)?'
        + '$',
      'i',
    );
    return re.test(value);
  },
  /**
   * Convert a 32 bits signed to a unsigned
   * Ref : // http://2ality.com/2012/02/js-integers.html
   *
   * @param {any} x Number to convert to Int32
   * @returns Return number convert to Int32 value
   */
  toUInt32(x) {
    function ToInteger(i) {
      const n = Number(i);
      return n < 0 ? Math.ceil(n) : Math.floor(n);
    }
    function modulo(a, b) {
      return a - (Math.floor(a / b) * b);
    }

    return modulo(ToInteger(x), 2 ** 32);
  },

  /**
   * Convert a 32 bits unsigned to a signed
   * Ref : // http://2ality.com/2012/02/js-integers.html
   *
   * @param {any} x Number to convert to Uint32
   * @returns Return number convert to Uint32 value
   */
  toInt32(x) {
    const uint32 = this.toUInt32(x);
    if (uint32 >= 2 ** 31) {
      return uint32 - (2 ** 32);
    }
    return uint32;
  },

  /**
   * Represents the unique id for ProductionDay Tag
   */
  // TODO: We should refactor this with a proper tag provider
  // That relies on a back-end api
  ProductionDayName: 'ProductionDay',
};
