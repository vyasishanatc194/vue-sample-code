import { LocalStorage } from 'quasar';
import _ from 'lodash';
import APIAdminReportEmail from 'src/api/admin/reportEmail';

// Misc keys
const storePrefixKey = 'admin/entity-email';
const listPaginationKey = `${storePrefixKey}/list/{USER_ID}`;
const listFilterKey = `${storePrefixKey}/filter/{USER_ID}`;

const stateDefault = {
  initialized: false,
  userId: undefined,
  userListLoading: false,
  userListLoaded: false,
  userRows: [],
  listFilter: '',
  listPagination: {},
  deviceListLoading: false,
  deviceListLoaded: false,
  deviceRows: [],
  availableUserListLoading: false,
  availableUserListLoaded: false,
  availableUserRows: [],
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
   * Geting a report's user list mutation
   *
   * @param {Object} state This store's state
   */
  userListLoading(state) {
    const stateRef = state;
    stateRef.userListLoading = true;
  },
  /**
   * Got a report's user list mutation
   *
   * @param {Object} state This store's state
   * @param {Array} userRows List of user
   */
  userListLoaded(state, { userRows }) {
    const stateRef = state;
    stateRef.userRows = userRows;
    stateRef.userListLoading = false;
    stateRef.userListLoaded = true;
  },
  /**
   *  Get report's user list failed
   *
   * @param {Object} state This store's state
   * @param {Object} error Failed error
   */
  userListLoadedFailed(state /* , {error} */) {
    const stateRef = state;
    stateRef.userListLoading = false;
    stateRef.userListLoaded = true;
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
   * Delete one or multiple report's email mutation
   *
   * @param {Object} state This store's state
   * @param {Object} reportData Report and deleted report's email data
   */
  reportEmailDeleted(/* state, {reportData} */) { },
  /**
   *  Delete report's email failed mutation
   *
   * @param {Object} state This store's state
   * @param {Object} errorAndReportData Report and deleted report's email data plus error
   */
  reportEmailDeletetionFailed(/* state, {errorAndReportData} */) { },

  /**
   * Geting a report's email available device list mutation
   *
   * @param {Object} state This store's state
   */
  deviceListLoading(state) {
    const stateRef = state;
    stateRef.deviceListLoading = true;
  },
  /**
   * Got a report's email available device list mutation
   *
   * @param {Object} state This store's state
   * @param {Array} deviceRows List of user
   */
  deviceListLoaded(state, { deviceRows }) {
    const stateRef = state;
    stateRef.deviceRows = deviceRows;
    stateRef.deviceListLoading = false;
    stateRef.deviceListLoaded = true;
  },
  /**
   *  Got a report's email available device list failed mutation
   *
   * @param {Object} state This store's state
   * @param {Object} error Failed error
   */
  deviceListLoadedFailed(state /* , {error} */) {
    const stateRef = state;
    stateRef.deviceListLoading = false;
    stateRef.deviceListLoaded = true;
  },

  /**
   * Geting a report's email available user list mutation
   *
   * @param {Object} state This store's state
   */
  availableUserListLoading(state) {
    const stateRef = state;
    stateRef.availableUserListLoading = true;
  },
  /**
   * Got a report's email available user list mutation
   *
   * @param {Object} state This store's state
   * @param {Array} userRows List of user
   */
  availableUserListLoaded(state, { userRows }) {
    const stateRef = state;
    stateRef.availableUserRows = userRows;
    stateRef.availableUserListLoading = false;
    stateRef.availableUserListLoaded = true;
  },
  /**
   *  Got a report's email available user list failed mutation
   *
   * @param {Object} state This store's state
   * @param {Object} error Failed error
   */
  availableUserListLoadedFailed(state /* , {error} */) {
    const stateRef = state;
    stateRef.availableUserListLoading = false;
    stateRef.availableUserListLoaded = true;
  },

  /**
   * Created a report's email configuration mutation
   *
   * @param {Object} state This store's state
   * @param {Object} reportData Report, user and configuration data
   */
  reportEmailCreated(/* state, {reportData} */) { },
  /**
   *  Create report's email configuration failed mutation
   *
   * @param {Object} state This store's state
   * @param {Object} errorAndReportData Report, user and configuration data
   */
  reportEmailCreationFailed(/* state, {errorAndReportData} */) { },

  /**
   * Edited a report's email configuration mutation
   *
   * @param {Object} state This store's state
   * @param {Object} reportData Report, user and configuration data
   */
  reportEmailEdited(/* state, {reportData} */) { },
  /**
   *  Edit report's email configuration failed mutation
   *
   * @param {Object} state This store's state
   * @param {Object} errorAndReportData Report, user and configuration data
   */
  reportEmailEditFailed(/* state, {errorAndReportData} */) { },
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
   * Get list of user for a report
   *
   * @param {Object} store Store
   * @param {Object} reportInfo Report information for which we
   * want to load user
   * @returns {Promise.<Object, Error>} An promise with
   *  {
   *      userRows: [],
   *  }
   * if operation succeed to server, or an error if
   * operation failed.
   */
  getList(store, reportInfo) {
    store.commit('userListLoading');
    return APIAdminReportEmail.list(reportInfo)
      .then((response) => {
        store.commit('userListLoaded', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while getting list of user
        store.commit('userListLoadedFailed', err);
        // Forward error to caller
        throw err;
      });
  },

  /**
   * Delete one or multiple report's email
   *
   * @param {Object} store Store
   * @param {Object|Array} deleteReportData Existing report and email list to delete
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  delete(store, deleteReportData) {
    return APIAdminReportEmail.deleteEMail(deleteReportData)
      .then((response) => {
        store.commit('reportEmailDeleted', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while deleting one or more report's email
        store.commit('reportEmailDeletetionFailed', { user: deleteReportData, err });
        // Forward error to caller
        throw err;
      });
  },

  /**
   * Get list of available device for a report's email
   *
   * @param {Object} store Store
   * @param {Object} reportInfo Report and user information for which we
   * want to load available devices
   * @returns {Promise.<Object, Error>} An promise with
   *  {
   *      deviceRows: [],
   *  }
   * if operation succeed to server, or an error if
   * operation failed.
   */
  getDeviceList(store, reportAndUserInfo) {
    store.commit('deviceListLoading');
    return APIAdminReportEmail.listDevice(reportAndUserInfo)
      .then((response) => {
        store.commit('deviceListLoaded', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while getting list of user
        store.commit('deviceListLoadedFailed', err);
        // Forward error to caller
        throw err;
      });
  },

  /**
   * Get list of available user for a report's email
   *
   * @param {Object} store Store
   * @param {Object} reportInfo Report information for which we
   * want to load available user
   * @returns {Promise.<Object, Error>} An promise with
   *  {
   *      userRows: [],
   *  }
   * if operation succeed to server, or an error if
   * operation failed.
   */
  getAvailableUserList(store, reportInfo) {
    store.commit('availableUserListLoading');
    return APIAdminReportEmail.listAvailableUser(reportInfo)
      .then((response) => {
        store.commit('availableUserListLoaded', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while getting list of user
        store.commit('availableUserListLoadedFailed', err);
        // Forward error to caller
        throw err;
      });
  },


  /**
   * Create a report's email configuration
   *
   * @param {Object} store Store
   * @param {Object|Array} reportData Existing report and new
   * report's email configuration
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  create(store, reportData) {
    return APIAdminReportEmail.create(reportData)
      .then((response) => {
        store.commit('reportEmailCreated', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while creating a report's email configuration
        store.commit('reportEmailCreationFailed', { user: reportData, err });
        // Forward error to caller
        throw err;
      });
  },

  /**
   * Edit a report's email configuration
   *
   * @param {Object} store Store
   * @param {Object|Array} reportData Existing report and
   * report's email configuration
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  edit(store, reportData) {
    return APIAdminReportEmail.edit(reportData)
      .then((response) => {
        store.commit('reportEmailEdited', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while editing a report's email configuration
        store.commit('reportEmailEditFailed', { user: reportData, err });
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
