import http from 'src/common/utils/http';

const funcs = {
  /**
   * Get list of entity
   *
   * @returns {Promise.<Object, Error>} An object if get operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      entityRows: [],
   *      error: Server error (if any)
   *    }
   */
  list() {
    return http
      .post('/api/admin/entity/list');
  },
  /**
   * Create a new entity
   *
   * @param {Object} newEntityData New entity data
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  create(newEntityData) {
    return http
      .post('/api/admin/entity/create', newEntityData);
  },
  /**
   * Edit one entity
   *
   * @param {Object|Array} editEntityData Entity data to edit
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  edit(editEntityData) {
    return http
      .post('/api/admin/entity/edit', editEntityData);
  },
  /**
   * Delete one or multiple entity
   *
   * @param {Object|Array} deleteEntityData Entity(s) to delete
   * @returns {Promise.<Error>} An emtpy promise operation succeed to server,
   * or an error if operation failed.
   */
  delete(deleteEntityData) {
    return http
      .post('/api/admin/entity/delete', deleteEntityData);
  },
};

// Export all functions of this module
export default funcs;
