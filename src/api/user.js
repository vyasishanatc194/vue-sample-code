import http from 'src/common/utils/http';

const funcs = {
  /**
   * Log user again the server
   *
   * @param {any} username Username
   * @param {any} password password
   * @param {Boolean} keepMeLoggedIn  Indicate if user want be stay logged
   * @returns {Promise.<Object, Error>} An object if login operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *        roleList: [],
   *        unitList: {
   *          unit: [],
   *          category: [],
   *          context: [],
   *          contextPrecision: [],
   *        },
   *        error: Server error (if any)
   *    }
   */
  login(username, password, keepMeLoggedIn) {
    return http
      .post('/api/auth/login/', {
        info: {
          username,
          password,
          keepMeLoggedIn,
        },
      });
  },

  /**
   * Do a reset password operation
   *
   * @param {any} username Username
   * @returns {Promise.<Object, Error>} An object if login operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *        error: Server error (if any)
   *    }
   */
  doResetPassword(username) {
    return http
      .post('/api/auth/reset_password/', {
        username,
      });
  },

  /**
   * Do a set new password operation
   * @param {any} id The id sent by the back-end
   * @param {any} token The short-time token sent by the back-end to check the operation
   * @param {any} newPassword The new password to set
   * @param {any} confirmPassword The new password to set
   */
  doSetNewPassword(id, token, newPassword, confirmPassword) {
    return http
      .post('/api/reset-password/change', {
        id,
        token,
        newPassword,
        confirmPassword,
      });
  },

  /**
   * Test if a reset password query is valid or not
   * @param {String} id The id sent by the back-end
   * @param {String} token The short-time token sent by the back-end to check the operation
   */
  isResetPasswordValid(id, token, lang) {
    return http
      .get(`/api/reset-password/is-request-valid?id=${id}&token=${token}&lang=${lang}`);
  },

  /**
   * Refresh authentication token (Keep session alive)
   *
   * @returns {Promise.<Object, Error>} An object if login operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *        error: Server error (if any)
   *    }
   */
  refreshSession() {
    return http
      .post('/api/user/keep_session_alive/');
  },
};

// Export all functions of this module
export default funcs;
