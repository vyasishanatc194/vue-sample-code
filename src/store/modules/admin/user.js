import Promise from 'bluebird';
import _ from 'lodash';
import { LocalStorage } from 'quasar';
import APIAdminUser from 'src/api/admin/user';

// Misc keys
const storePrefixKey = 'admin/user';
const listPaginationKey = `${storePrefixKey}/list/{USER_ID}`;
const listFilterKey = `${storePrefixKey}/filter/{USER_ID}`;

// Default state
const stateDefault = {
  initialized: false,
  userId: undefined,
  userRows: [],
  listLoading: false,
  listLoaded: false,
  listPagination: null,
  listFilter: '',
};

// Mutation functions (Synchronous)
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
   * Getting users list mutation
   *
   * @param {Object} state This store's state
   */
  listLoading(state) {
    const stateRef = state;
    stateRef.listLoading = true;
  },
  /**
   * Got user list mutation
   *
   * @param {Object} state This store's state
   * @param {Array} userRows List of users
   */
  listLoaded(state, { userRows }) {
    const stateRef = state;
    stateRef.userRows = userRows;
    stateRef.listLoading = false;
    stateRef.listLoaded = true;
  },
  /**
   *  Get user list failed
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
   * User list pagination changed
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
   * User list filter changed
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
   * Create user mutation
   *
   * @param {Object} state This store's state
   * @param {Object} userData New user data
   */
  userCreated(/* state, {userData} */) {},
  /**
   *  Create user failed mutation
   *
   * @param {Object} state This store's state
   * @param {Object} errorAndUserData Edited user(s) data plus error
   */
  userCreationFailed(/* state, {errorAndUserData} */) {},
  /**
   * Edit one or multiple user mutation
   *
   * @param {Object} state This store's state
   * @param {Object} userData Edited user(s) data
   */
  userEdited(/* state, {userData} */) {},
  /**
   *  Edit user failed mutation
   *
   * @param {Object} state This store's state
   * @param {Object} errorAndUserData Edited user(s) data plus error
   */
  userEditionFailed(/* state, {errorAndUserData} */) {},
  /**
   * Delete one or multiple user mutation
   *
   * @param {Object} state This store's state
   * @param {Object} userData Deleted user(s) data
   */
  userDeleted(/* state, {userData} */) {},
  /**
   *  Delete user failed mutation
   *
   * @param {Object} state This store's state
   * @param {Object} errorAndUserData Deleted user(s) data plus error
   */
  userDeletionFailed(/* state, {errorAndUserData} */) {},
};

// Action functions (Could be asynchronous)
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
        newData.listPagination = LocalStorage.getItem(`${listPaginationKey.replace('{USER_ID}', userId)}`) || {};
        newData.listFilter = LocalStorage.getItem(`${listFilterKey.replace('{USER_ID}', userId)}`) || '';
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
   * Get list of user
   *
   * @param {Object} store Store
   * @returns {Promise.<Object, Error>} An promise with
   *  {
   *      userRows: [],
   *  }
   * if operation succeed to server, or an error if
   * operation failed.
   */
  getList(store) {
    store.commit('listLoading');
    return APIAdminUser.list()
      .then((response) => {
        store.commit('listLoaded', response.data);
      })
      .catch((err) => {
        // Error while getting list of users
        store.commit('listLoadedFailed', err);
        // Forward error to caller
        throw err;
      });
  },
  /**
   * Create a new user
   *
   * @param {Object} store Store
   * @param {Object} newUserData New user information
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  create(store, newUserData) {
    return APIAdminUser.create(newUserData)
      .then((response) => {
        store.commit('userCreated', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while creating a new user
        store.commit('userCreationFailed', { user: newUserData, err });
        // Forward error to caller
        throw err;
      });
  },
  /**
   * Edit one or multiple user
   *
   * @param {Object} store Store
   * @param {Object|Array} editUserData Existing user information to change
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  edit(store, editUserData) {
    return APIAdminUser.edit(editUserData)
      .then((response) => {
        store.commit('userEdited', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while editing one or more user
        store.commit('userEditionFailed', { user: editUserData, err });
        // Forward error to caller
        throw err;
      });
  },
  /**
   * Delete one or multiple user
   *
   * @param {Object} store Store
   * @param {Object|Array} editUserData Existing user to delete
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  delete(store, deleteUserData) {
    return APIAdminUser.delete(deleteUserData)
      .then((response) => {
        store.commit('userDeleted', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while deleting one or more user
        store.commit('userDeletionFailed', { user: deleteUserData, err });
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
