import Promise from 'bluebird';
import _ from 'lodash';
import { LocalStorage } from 'quasar';
import APIAdminReport from 'src/api/admin/report';

// Misc keys
const storePrefixKey = 'admin/report';
const listPaginationKey = `${storePrefixKey}/pagination/{USER_ID}`;
const listFilterKey = `${storePrefixKey}/filter/{USER_ID}`;
const listTagFilterKey = `${storePrefixKey}/tag/filter/{USER_ID}`;
const listReportTagFilterKey = `${storePrefixKey}/tag/filter/{USER_ID}`;

const stateDefault = {
  initialized: false,
  userId: undefined,
  reportRows: [],
  listLoading: false,
  listLoaded: false,
  listPagination: {},
  listFilter: '',
  tagRows: [],
  listTagLoading: false,
  listTagLoaded: false,
  listTagFilter: '',
  reportTagRows: [],
  listReportTagLoading: false,
  listReportTagLoaded: false,
  listReportTagFilter: '',
  reportEntityRows: [],
};

// Mutation functions (Syncronous)
// The only way to actually change state
// in a Vuex store is by committing a mutation
const mutations = {
  /**
   * Store initialization mutation
   *
   * @param {Object} state This store's state
   * @param {Object} newData New data to replace in the state
   */
  initialized(state, newData) {
    const stateRef = state;
    stateRef.initialized = true;
    Object.keys(newData).forEach((x) => {
      stateRef[x] = newData[x];
    });
  },
  /**
   * Store uninitialized mutation
   *
   * @param {Object} state This store's state
   */
  unInitialized(state) {
    const stateRef = state;
    Object.keys(stateDefault).forEach((x) => {
      stateRef[x] = _.cloneDeep(stateDefault[x]);
    });
  },
  /**
   * Geting report list mutation
   *
   * @param {Object} state This store's state
   */
  listLoading(state) {
    const stateRef = state;
    stateRef.listLoading = true;
  },
  /**
   * Got report list mutation
   *
   * @param {Object} state This store's state
   * @param {Array} reportRows List of report
   */
  listLoaded(state, { reportRows }) {
    const stateRef = state;
    stateRef.reportRows = reportRows;
    stateRef.listLoading = false;
    stateRef.listLoaded = true;
  },
  /**
   *  Get report list failed
   *
   * @param {Object} state This store's state
   * @param {Object} error Failed error
   */
  listLoadedFailed(state /* , {error} */) {
    const stateRef = state;
    stateRef.listLoading = false;
    stateRef.listLoaded = true;
  },
  /**
   * Report list pagination changed
   *
   * @param {Object} state This store's state
   * @param {Array} pagination New pagination value
   */
  listPaginationChanged(state, pagination) {
    const stateRef = state;
    const key = `${listPaginationKey.replace('{USER_ID}', state.userId)}`;
    if (pagination) {
      LocalStorage.set(key, pagination);
    } else {
      LocalStorage.remove(key);
    }
    stateRef.listPagination = pagination;
  },
  /**
   * Report list filter changed
   *
   * @param {Object} state This store's state
   * @param {Array} filter New filter value
   */
  listFilterChanged(state, filter) {
    const stateRef = state;
    const key = `${listFilterKey.replace('{USER_ID}', state.userId)}`;
    if (filter) {
      LocalStorage.set(key, filter);
    } else {
      LocalStorage.remove(key);
    }
    stateRef.listFilter = filter;
  },

  /**
   * Create report mutation
   *
   * @param {Object} state This store's state
   * @param {Object} reportData New user data
   */
  reportCreated(/* state, {reportData} */) { },
  /**
   *  Create report failed muatation
   *
   * @param {Object} state This store's state
   * @param {Object} errorAndReportData Edited report data plus error
   */
  reportCreationFailed(/* state, {errorAndReportData} */) { },
  /**
   * Edit a report mutation
   *
   * @param {Object} state This store's state
   * @param {Object} reportData Edited report data
   */
  reportEdited(/* state, {reportData} */) { },
  /**
   *  Edit report failed mutation
   *
   * @param {Object} state This store's state
   * @param {Object} errorAndReportData Edited report data plus error
   */
  reportEditionFailed(/* state, {errorAndReportData} */) { },
  /**
   * Delete one or multiple report mutation
   *
   * @param {Object} state This store's state
   * @param {Object} reportData Deleted report(s) data
   */
  reportDeleted(/* state, {reportData} */) { },
  /**
   *  Delete report failed mutation
   *
   * @param {Object} state This store's state
   * @param {Object} errorAndReportData Deleted report(s) data plus error
   */
  reportDeletetionFailed(/* state, {errorAndReportData} */) { },

  /**
   * Geting tag list mutation
   *
   * @param {Object} state This store's state
   */
  listTagLoading(state) {
    const stateRef = state;
    stateRef.listTagLoading = true;
  },
  /**
   * Got tag list mutation
   *
   * @param {Object} state This store's state
   * @param {Array} tagRows List of tag
   */
  listTagLoaded(state, { tagRows }) {
    const stateRef = state;
    stateRef.tagRows = tagRows;
    stateRef.listTagLoading = false;
    stateRef.listTagLoaded = true;
  },
  /**
   *  Get tag list failed
   *
   * @param {Object} state This store's state
   * @param {Object} error Failed error
   */
  listTagLoadedFailed(state /* , {error} */) {
    const stateRef = state;
    stateRef.listTagLoading = false;
    stateRef.listTagLoaded = true;
  },
  /**
   * Tag list filter changed
   *
   * @param {Object} state This store's state
   * @param {Array} filter New filter value
   */
  listTagFilterChanged(state, filter) {
    const stateRef = state;
    const key = `${listTagFilterKey.replace('{USER_ID}', state.userId)}`;
    if (filter) {
      LocalStorage.set(key, filter);
    } else {
      LocalStorage.remove(key);
    }
    stateRef.listFilter = filter;
  },

  /**
   * Geting a report's tag list mutation
   *
   * @param {Object} state This store's state
   */
  listReportTagLoading(state) {
    const stateRef = state;
    stateRef.listReportTagLoading = true;
  },
  /**
   * Got a report's tag list mutation
   *
   * @param {Object} state This store's state
   * @param {Array} tagRows List of tag
   */
  listReportTagLoaded(state, { tagRows }) {
    const stateRef = state;
    stateRef.reportTagRows = tagRows;
    stateRef.listReportTagLoading = false;
    stateRef.listReportTagLoaded = true;
  },
  /**
   *  Get report's tag list failed
   *
   * @param {Object} state This store's state
   * @param {Object} error Failed error
   */
  listReportTagLoadedFailed(state /* , {error} */) {
    const stateRef = state;
    stateRef.listReportTagLoading = false;
    stateRef.listReportTagLoaded = true;
  },
  /**
   * Report's tag list filter changed
   *
   * @param {Object} state This store's state
   * @param {Array} filter New filter value
   */
  listReportTagFilterChanged(state, filter) {
    const stateRef = state;
    const key = `${listReportTagFilterKey.replace('{USER_ID}', state.userId)}`;
    if (filter) {
      LocalStorage.set(key, filter);
    } else {
      LocalStorage.remove(key);
    }
    stateRef.listFilter = filter;
  },
};

// Action functions (Could be asyncronous)
// Actions are similar to mutations, the differences being that:
//   - Instead of mutating the state, actions commit mutations.
//   - Actions can contain arbitrary asynchronous operations.
//
// It is better to return a promise in the stock in order to be
// able to determine when it ends.
const actions = {
  /**
   * Initialize the store
   *
   * @param {Object} store Store
   * @param {Number} userId User ID of the owner of the store
   */
  initialize(store, userId) {
    // Initialize store one time only
    return new Promise((resolve) => {
      if (!store.state.initialized) {
        // Load user list settings
        const newData = { userId };
        newData.listPagination = LocalStorage.getItem(`${listPaginationKey.replace('{USER_ID}', userId)}`)
          || store.state.listPagination;
        newData.listFilter = LocalStorage.getItem(`${listFilterKey.replace('{USER_ID}', userId)}`)
          || store.state.listFilter;
        store.commit('initialized', newData);
      }
      return resolve();
    });
  },
  /**
   * Uninitialize the store
   *
   * @param {Object} store Store
   */
  unInitialize(store) {
    // Clean the store
    store.commit('unInitialized');
    return Promise.resolve();
  },
  /**
   * Get list of report
   *
   * @param {Object} store Store
   * @returns {Promise.<Object, Error>} An promise with
   *  {
   *      reportRows: [],
   *  }
   * if operation succeed to server, or an error if
   * operation failed.
   */
  getList(store) {
    store.commit('listLoading');
    return APIAdminReport.list()
      .then((response) => {
        store.commit('listLoaded', response.data);
      })
      .catch((err) => {
        // Error while getting list of report
        store.commit('listLoadedFailed', err);
        // Forward error to caller
        throw err;
      });
  },
  /**
   * Get list of tag
   *
   * @param {Object} store Store
   * @returns {Promise.<Object, Error>} An promise with
   *  {
   *      tagRows: [],
   *  }
   * if operation succeed to server, or an error if
   * operation failed.
   */
  getListTag(store) {
    store.commit('listTagLoading');
    return APIAdminReport.listTag()
      .then((response) => {
        store.commit('listTagLoaded', response.data);
      })
      .catch((err) => {
        // Error while getting list of report
        store.commit('listTagLoadedFailed', err);
        // Forward error to caller
        throw err;
      });
  },
  /**
   * Create a new report
   *
   * @param {Object} store Store
   * @param {Object} newReportData New report information
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  create(store, newReportData) {
    return APIAdminReport.create(newReportData)
      .then((response) => {
        store.commit('reportCreated', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while creating a new report
        store.commit('reportCreationFailed', { user: newReportData, err });
        // Forward error to caller
        throw err;
      });
  },

  /**
   * Get list of tag
   *
   * @param {Object} store Store
   * @param {Object} reportInfo Report information for which we
   * want to load tag
   * @returns {Promise.<Object, Error>} An promise with
   *  {
   *      tagRows: [],
   *  }
   * if operation succeed to server, or an error if
   * operation failed.
   */
  getReportListTag(store, reportInfo) {
    store.commit('listReportTagLoading');
    return APIAdminReport.listReportTag(reportInfo)
      .then((response) => {
        store.commit('listReportTagLoaded', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while getting list of tag
        store.commit('listReportTagLoadedFailed', err);
        // Forward error to caller
        throw err;
      });
  },

  /**
   * Edit a report
   *
   * @param {Object} store Store
   * @param {Object|Array} editReportData Existing report information to change
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  edit(store, editReportData) {
    return APIAdminReport.edit(editReportData)
      .then((response) => {
        store.commit('reportEdited', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while editing a report
        store.commit('reportEditionFailed', { user: editReportData, err });
        // Forward error to caller
        throw err;
      });
  },
  /**
   * Delete one or multiple report
   *
   * @param {Object} store Store
   * @param {Object|Array} deleteReportData Existing report(s) to delete
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  delete(store, deleteReportData) {
    return APIAdminReport.delete(deleteReportData)
      .then((response) => {
        store.commit('reportDeleted', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while deleting one or more report
        store.commit('reportDeletetionFailed', { user: deleteReportData, err });
        // Forward error to caller
        throw err;
      });
  },
};

// Getters function
// Usually used to compute derived state based on store state
const getters = {
};

// Single State Tree
export const state = _.cloneDeep(stateDefault);

// Export this module state information to the main state store
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
