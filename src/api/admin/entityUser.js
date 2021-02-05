import http from 'src/common/utils/http';

const funcs = {
  /**
   * Get list of user for an entity
   *
   * @param {Object} editEntityData Entity for which to load the user list
   * @returns {Promise.<Object, Error>} An object if get operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      userRows: [],
   *      error: Server error (if any)
   *    }
   */
  list(entityData) {
    return http
      .post('/api/admin/entity-user/list', entityData);
  },
  /**
   * Edit the list of user for an entity
   *
   * @param {Object|Array} editEntityData Entity data to edit
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  edit(editEntityData) {
    return http
      .post('/api/admin/entity-user/edit', editEntityData);
  },
};

// Export all functions of this module
export default funcs;
