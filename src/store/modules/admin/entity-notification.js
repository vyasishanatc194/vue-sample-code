import Promise from 'bluebird';
import _ from 'lodash';
import APIAdminEntityNotification from 'src/api/admin/entityNotification';

const defaultState = {
  initialized: false,
  entityId: undefined,
  notificationRows: [],
  listLoading: false,
  listLoaded: false,
};

// Mutation functions (Always synchronous)
// The only way to change a state in a vuex store is by committing a mutation
const mutations = {
  /**
   * Initialization mutation
   *
   * @param {Object} state This store's state
   * @param {Object} newState State data to replace in this store's state
   */
  initialized(state, newState) {
    const stateRef = state;
    stateRef.initialized = true;
    Object.keys(newState).forEach((x) => {
      stateRef[x] = newState[x];
    });
  },
  /**
   * Uninitialize mutation
   *
   * @param {Object} state This store's state
   */
  uninitialize(state) {
    const stateRef = state;
    Object.keys(defaultState).forEach((x) => {
      stateRef[x] = _.cloneDeep(defaultState[x]);
    });
  },
  /**
   * Getting notification list mutation
   *
   * @param {Object} state This store's state
   */
  listLoading(state) {
    const stateRef = state;
    stateRef.listLoading = true;
  },
  /**
   * Got notification list mutation
   *
   * @param {Object} state This store's state
   * @param {Array} notificationRows List of notifications
   */
  listLoaded(state, { notificationRows }) {
    const stateRef = state;
    stateRef.notificationRows = notificationRows;
    stateRef.listLoading = false;
    stateRef.listLoaded = true;
  },
  /**
   * Got notification list failed mutation
   *
   * @param {Object} state This store's state
   * @param {Object} error Failed error reason
   */
  listLoadedFailed(state /* , {error} */) {
    const stateRef = state;
    stateRef.listLoading = false;
    stateRef.listLoaded = true;
  },
  /**
   * Edited an entity's notification mutation
   *
   * @param {Object} state This store's state
   * @param {Object} entityData Edited notification data
   */
  edited(/* state, {notificationData} */) {},
  /**
   *  Edit an entity's notification failed mutation
   *
   * @param {Object} state This store's state
   * @param {Object} errorAndNotificationData Edited notification data plus error
   */
  editionFailed(/* state, {errorAndNotificationData} */) {},
};

// Action functions (usually asynchronous)
// Actions are similar to mutations, the differences being that:
//  - Instead of mutating the state, actions commit mutations.
//  - Actions can contain arbitrary asynchronous operations.
//
// But, it's better to return a promise in order to be able to determine
// when it ends.
const actions = {
  /**
   * Initialize the store
   *
   * @param {Object} store This store
   */
  initialize(store) {
    // Initialize store one time only
    return new Promise((resolve) => {
      if (store.state.initialized === false) {
        store.commit('initialized', {});
      }
      return resolve();
    });
  },
  /**
   * Uninitialize the store
   *
   * @param {Object} store This store
   */
  uninitialize(store) {
    // Clean the store
    store.commit('uninitialize');
    return Promise.resolve();
  },
  /**
   * Get list of notifications
   *
   * @param {Object} store This store
   * @param {Object} entity Entity for which we want to load the notification list
   * @returns {Promise.<Object, Error>} An promise with
   *  {
   *      notificationRows: [],
   *  }
   * if operation succeed to server otherwise an error if operation failed.
   */
  getList(store, entity) {
    store.commit('listLoading');
    return APIAdminEntityNotification.list(entity)
      .then((response) => {
        store.commit('listLoaded', response.data);
      })
      .catch((err) => {
        // Error while getting this entity's notification list
        store.commit('listLoadedFailed', err);
        // Forward error to caller
        throw err;
      });
  },
  /**
   * Edit an entity's notifications
   *
   * @param {Object} store This store
   * @param {Object} editNotificationsData Existing entity and its notifications information to
   * update
   * @returns {Promise} A promise with an empty object or an error if operation failed.
   */
  edit(store, editNotificationsData) {
    return APIAdminEntityNotification.edit(editNotificationsData)
      .then((response) => {
        store.commit('edited', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while editing this entity's notification user list
        store.commit('editionFailed', { notifications: editNotificationsData, err });
        // Forward error to caller
        throw err;
      });
  },
};

// Getters function
// Usually used to compute derived state based on this store's state
const getters = {
};

// Single State Tree
export const state = _.cloneDeep(defaultState);

// Export this module state information to the main state store
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
