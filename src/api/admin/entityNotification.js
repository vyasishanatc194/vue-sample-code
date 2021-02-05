import http from 'src/common/utils/http';

const funcs = {
  /**
   * Get an entity's notification list
   *
   * @param {Object} entityInfo Information on the entity's notification list
   * @returns {Promise.<Object, Error>} An object if get operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      notificationRows: [],
   *      error: Server error (if any)
   *    }
   */
  list(entityInfo) {
    return http
      .get('/api/admin/entity-notification/list', {
        params: entityInfo,
      });
  },
  /**
   * Edit the list of an entity's notification
   *
   * @param {Object|Array} notificationsData Notifications data to edit
   * @returns {Promise.<Error>} An empty promise operation succeed to server,
   * or an error if operation failed.
   */
  edit(notificationsData) {
    return http
      .put('/api/admin/entity-notification/edit', notificationsData);
  },
};

// Export all functions of this module
export default funcs;
