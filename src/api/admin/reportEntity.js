import http from 'src/common/utils/http';

const funcs = {
  /**
   * Get list of entity for a report
   *
   * @param {Object} editReportData Report data for which to load entity list
   * @returns {Promise.<Object, Error>} An object if get operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      entityRows: [],
   *      error: Server error (if any)
   *    }
   */
  list(editReportData) {
    return http
      .post('/api/admin/report-entity/list', editReportData);
  },
  /**
   * Save list of entity for a report
   *
   * @param {Object} editReportData Report data for which to save the entity list
   * @returns {Promise.<Object, Error>} An empty Promise if operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      error: Server error (if any)
   *    }
   */
  save(editReportData) {
    return http
      .post('/api/admin/report-entity/save', editReportData);
  },
};

// Export all functions of this module
export default funcs;
