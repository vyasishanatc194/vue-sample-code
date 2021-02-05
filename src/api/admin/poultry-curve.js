import http from 'src/common/utils/http';

const funcs = {
  /**
   * Get list of poultry curve
   *
   * @returns {Promise.<Object, Error>} An object if get operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      curves: [],
   *      error: Server error (if any)
   *    }
   */
  list() {
    return http
      .post('/api/admin/poultry-curve/list');
  },
  /**
   * Get attributes for handling poultry curve
   *
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      visibilityList: [],
   *      stateList: [],
   *      units: [],
   *      error: Server error (if any)
   *    }
   */
  getAttributes() {
    return http
      .get('/api/admin/poultry-curve/get-attributes');
  },
  /**
   * Get a poultry curve
   *
   * @param {Object} curveId The id of the curve for which we want to get information
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      curve: {
   *        info: {},
   *        data: [],
   *      },
   *      error: Server error (if any)
   *    }
   */
  get(curveId) {
    return http
      .get(`/api/admin/poultry-curve/get/${curveId}`);
  },
  /**
   * Create a new poultry curve
   *
   * @param {Object} newCurveInfo New curve information data. The object should be :
   *    {
   *      curveInfo,
   *      curveData
   *    }
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      newId,
   *      error: Server error (if any)
   *    }
   */
  create(newCurveInfo) {
    return http
      .post('/api/admin/poultry-curve/create', newCurveInfo);
  },
  /**
   * Edit one entity
   *
   * @param {Object|Array} editEntityData Curve's data to edit. The object should be :
   *    {
   *      curveInfo,
   *      curveData
   *    }
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  edit(editCurveData) {
    return http
      .post('/api/admin/poultry-curve/edit', editCurveData);
  },
  /**
   * Delete one or multiple entity
   *
   * @param {Object|Array} deleteCurveData Curve(s) to delete. When an object is use, it should
   * be like
   *    {
   *      id,
   *      updated_at
   *    }
   * when an array is used, each item of the array should be like
   *    [
   *      {
   *        id,
   *        updated_at
   *      }
   *    ]
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  delete(deleteCurveData) {
    return http
      .post('/api/admin/poultry-curve/delete', deleteCurveData);
  },
  /**
   * Download a poultry curve
   *
   * @param {Object} curveId The id of the curve to download
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      file:
   *      error: Server error (if any)
   *    }
   */
  download(curveId) {
    return http
      .get(`/api/admin/poultry-curve/download/${curveId}`, { responseType: 'arraybuffer' });
  },
};

// Export all functions of this module
export default funcs;
