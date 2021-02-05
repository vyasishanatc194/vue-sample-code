import { helpers } from 'vuelidate/lib/validators';
import moment from 'moment';

// Export all functions of this module
export default {
  /**
   * Represent Constant value for Minimum Password Length.
   */
  minPasswordLength: 8,
  /**
   * Represent Constant value for Maximum Password Length.
   */
  maxPasswordLength: 32,
  /**
   * Represent Constant value for Profile Image Maximum Size(byte).
   */
  profilePictureMaxSizeInBytes: 2000000,
  /**
   * Validate Password which must have capital, small letter & at least 1 symbol.
   *
   * @returns Return a vuevalidate validator.
   */
  isPasswordComplexityValid() {
    const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    return helpers.regex('alpha', reg);
  },
  /**
   * Validate Area Code with 3 digits
   *
   * @returns Return a vuevalidate validator.
   */
  isThreeDigitsAreaCodeValid() {
    const reg = /^\(?([0-9]{3})$/;
    return helpers.regex('numeric', reg);
  },
  /**
   * Validate Phone number with 7 digits
   *
   * @returns Return a vuevalidate validator.
   */
  isSevenDigitsPhoneNumberValid() {
    const reg = /^\(?([0-9]{3})[-. ]?([0-9]{4})$/;
    return helpers.regex('numeric', reg);
  },
  /**
   * Validate Date
   *
   * @returns Return a vuevalidate validator.
   */
  isDateValid(date) {
    return value => !helpers.req(value) || moment(date, 'YYYY/MM/DD', true).isValid();
  },
};
