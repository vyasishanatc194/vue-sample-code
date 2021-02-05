import http from 'src/common/utils/http';

const funcs = {
  /**
   * Get list of users
   *
   * @returns {Promise.<Object, Error>} An object if get operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      users: [],
   *      error: Server error (if any)
   *    }
   */
  list() {
    return http
      .post('/api/admin/user/list');
  },
  /**
   * Create a new user
   *
   * @param {Object} newUserData New user data
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  create(newUserData) {
    return http
      .post('/api/admin/user/create', newUserData);
  },
  /**
   * Edit one or multiple user
   *
   * @param {Object|Array} editUserData User(s) device data to change
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  edit(editUserData) {
    return http
      .post('/api/admin/user/edit', editUserData);
  },
  /**
   * Delete one or multiple user
   *
   * @param {Object|Array} deleteUserData User(s) to delete
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  delete(deleteUserData) {
    return http
      .post('/api/admin/user/delete', deleteUserData);
  },
};

// Export all functions of this module
export default funcs;
