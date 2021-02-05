import http from 'src/common/utils/http';

const funcs = {
  /**
   * Get list of user for a report
   *
   * @param {Object} editReportData Report data for which to load user list
   * @returns {Promise.<Object, Error>} An object if get operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      userRows: [],
   *      error: Server error (if any)
   *    }
   */
  list(editReportData) {
    return http
      .post('/api/admin/report-email/list', editReportData);
  },

  /**
   * Delete one or multiple report's email
   *
   * @param {Object|Array} deleteReportData Report and report's email to delete
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  deleteEMail(deleteReportData) {
    return http
      .post('/api/admin/report-email/delete', deleteReportData);
  },

  /**
   * Get list of available device for a report's email
   *
   * @param {Object|Array} reportAndUserData Report and user information
   * @returns {Promise.<Error>} An object if get operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      deviceRows: [],
   *      error: Server error (if any)
   *    }
   */
  listDevice(reportAndUserData) {
    return http
      .post('/api/admin/report-email/list-device', reportAndUserData);
  },

  /**
   * Get list of available user for a report's email
   *
   * @param {Object|Array} reportData Report information
   * @returns {Promise.<Error>} An object if get operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      userRows: [],
   *      error: Server error (if any)
   *    }
   */
  listAvailableUser(reportData) {
    return http
      .post('/api/admin/report-email/list-available-user', reportData);
  },

  /**
   * Create a report's email
   *
   * @param {Object|Array} reportData Report information and
   * report's email configuration
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  create(reportData) {
    return http
      .post('/api/admin/report-email/create', reportData);
  },

  /**
   * Edit a report's email
   *
   * @param {Object|Array} reportData Report information and
   * report's email configuration
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  edit(reportData) {
    return http
      .post('/api/admin/report-email/edit', reportData);
  },
};

// Export all functions of this module
export default funcs;
