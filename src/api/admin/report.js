import http from 'src/common/utils/http';

const funcs = {
  /**
   * Get list of report
   *
   * @returns {Promise.<Object, Error>} An object if get operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      reportRows: [],
   *      error: Server error (if any)
   *    }
   */
  list() {
    return http
      .post('/api/admin/report/list');
  },
  /**
   * Get list of tag
   *
   * @returns {Promise.<Object, Error>} An object if get operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      tagRows: [],
   *      error: Server error (if any)
   *    }
   */
  listTag() {
    return http
      .post('/api/admin/report/tag_list');
  },
  /**
   * Create a new report
   *
   * @param {Object} newReportData New report data
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  create(newReportData) {
    return http
      .post('/api/admin/report/create', newReportData);
  },
  /**
   * Get list of tag for a report
   *
   * @param {Object} editReportData Report data for which to load tag list
   * @returns {Promise.<Object, Error>} An object if get operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      tagRows: [],
   *      error: Server error (if any)
   *    }
   */
  listReportTag(editReportData) {
    return http
      .post('/api/admin/report/report_tag_list', editReportData);
  },
  /**
   * Edit a report
   *
   * @param {Object} editReportData Report data to change
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  edit(editReportData) {
    return http
      .post('/api/admin/report/edit', editReportData);
  },
  /**
   * Delete one or multiple report
   *
   * @param {Object|Array} deleteReportData Report(s) to delete
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  delete(deleteReportData) {
    return http
      .post('/api/admin/report/delete', deleteReportData);
  },
};

// Export all functions of this module
export default funcs;
