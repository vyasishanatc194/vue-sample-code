import http from 'src/common/utils/http';

const funcs = {
  /**
   * Get list of devices
   *
   * @returns {Promise.<Object, Error>} An object if get operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      entityRows: [],
   *      deviceRows: [],
   *      error: Server error (if any)
   *    }
   */
  list() {
    return http
      .post('/api/admin/device/list');
  },
  /**
   * Create a new device
   *
   * @param {Object} newDeviceData New device data
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  create(newDeviceData) {
    return http
      .post('/api/admin/device/create', newDeviceData);
  },
  /**
   * Edit one or multiple device
   *
   * @param {Object|Array} editDeviceData Device(s) device data to change
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  edit(editDeviceData) {
    return http
      .post('/api/admin/device/edit', editDeviceData);
  },
  /**
   * Delete one or multiple device
   *
   * @param {Object|Array} deleteDeviceData Device(s) to delete
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  delete(deleteDeviceData) {
    return http
      .post('/api/admin/device/delete', deleteDeviceData);
  },
};

// Export all functions of this module
export default funcs;
