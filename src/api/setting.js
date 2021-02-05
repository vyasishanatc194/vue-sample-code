import http from 'src/common/utils/http';
// import Store from '../store';

const funcs = {
  /**
   * Change user's password
   *
   * @param {String} old Old password
   * @param {String} newPassword New password
   * @returns {Promise.<Object, Error>} An object if password change operation
   * succeed to server, or an error if operation failed. The object should be :
   *    {
   *        error: Server error (if any)
   *    }
   */
  changePassword(oldPassword, newPassword) {
    return http
      .post('/api/setting/change_password/', {
        oldPassword,
        newPassword,
      });
  },

  /**
   * Change user's preferences
   *
   * @param {String} timeZone Timezone
   * @param {String} language Language
   * @param {Array} units Units
   * @returns {Promise.<Object, Error>} An object if preference change operation
   * succeed to server, or an error if operation failed. The object should be :
   *    {
   *        error: Server error (if any)
   *    }
   */
  changePreferences(timeZone, language, units) {
    return http
      .post('/api/setting/change_preferences/', {
        timeZone,
        language,
        units,
      });
  },
};

// Export all functions of this module
export default funcs;
