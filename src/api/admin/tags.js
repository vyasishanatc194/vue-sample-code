import http from 'src/common/utils/http';

export default {
  /**
   * Get list of tag
   *
   * @returns {Promise.<Object, Error>} An object if get operation succeed to server,
   * or an error if operation failed. The object should be :
   *    {
   *      tagList: [],
   *      error: Server error (if any)
   *    }
   */
  listTag() {
    return http
      .get('/api/admin/tags/list');
  },
};
