import Promise from 'bluebird';
import _ from 'lodash';
import utilEntity from 'src/common/utils/entity';
import { LocalStorage } from 'quasar';
import APIAdminDevice from 'src/api/admin/device';

// Misc keys
const storePrefixKey = 'admin/device';
const listPaginationKey = `${storePrefixKey}/list/{USER_ID}`;
const listFilterKey = `${storePrefixKey}/filter/{USER_ID}`;

const stateDefault = {
  initialized: false,
  userId: undefined,
  entityRows: [],
  deviceRows: [],
  listLoading: false,
  listLoaded: false,
  listPagination: null,
  listFilter: '',
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
   * Geting device list mutation
   *
   * @param {Object} This store's state
   */
  listLoading(state) {
    const stateRef = state;
    stateRef.listLoading = true;
  },
  /**
   * Got device list mutation
   *
   * @param {Object} This store's state
   * @param {Array} entityRows List of entities
   * @param {Array} deviceRows List of devices
   */
  listLoaded(state, { entityRows, deviceRows }) {
    const stateRef = state;
    stateRef.entityRows = entityRows;
    stateRef.deviceRows = deviceRows;
    stateRef.listLoading = false;
    stateRef.listLoaded = true;
  },
  /**
   *  Get device list failed
   *
   * @param {Object} This store's state
   * @param {Object} error Failed error
   */
  listLoadedFailed(state /* , {error} */) {
    const stateRef = state;
    stateRef.listLoading = false;
    stateRef.listLoaded = true;
  },
  /**
   * Device list pagination changed
   *
   * @param {Object} This store's state
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
   * Device list filter changed
   *
   * @param {Object} This store's state
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
   * Created device mutation
   *
   * @param {Object} This store's state
   * @param {Object} deviceData New device data
   */
  deviceCreated(/* state, {deviceData} */) {},
  /**
   *  Create device failed muatation
   *
   * @param {Object} This store's state
   * @param {Object} errorAndDeviceData Edited device(s) data plus error
   */
  deviceCreationFailed(/* state, {errorAndDeviceData} */) {},
  /**
   * Edit one or multiple device mutation
   *
   * @param {Object} This store's state
   * @param {Object} deviceData Edited device(s) data
   */
  deviceEdited(/* state, {deviceData} */) {},
  /**
   *  Edit device failed mutation
   *
   * @param {Object} This store's state
   * @param {Object} errorAndDeviceData Edited device(s) data plus error
   */
  deviceEditionFailed(/* state, {errorAndDeviceData} */) {},
  /**
   * Delete one or multiple device mutation
   *
   * @param {Object} This store's state
   * @param {Object} deviceData Deleted device(s) data
   */
  deviceDeleted(/* state, {deviceData} */) {},
  /**
   *  Delete device failed mutation
   *
   * @param {Object} This store's state
   * @param {Object} errorAndDeviceData Deleted device(s) data plus error
   */
  deviceDeletetionFailed(/* state, {errorAndDeviceData} */) {},
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
        // Load device list settings
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
   * Get list of device
   *
   * @param {Object} store Store
   * @returns {Promise.<Object, Error>} An promise with
   *  {
   *      entityRows: [],
   *      deviceRows: [],
   *  }
   * if operation succeed to server, or an error if
   * operation failed.
   */
  getList(store) {
    store.commit('listLoading');
    return APIAdminDevice.list()
      .then((response) => {
        store.commit('listLoaded', response.data);
      })
      .catch((err) => {
        // Error while getting list of device
        store.commit('listLoadedFailed', err);
        // Forward error to caller
        throw err;
      });
  },
  /**
   * Create a new device
   *
   * @param {Object} store Store
   * @param {Object} newDeviceData New device information
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  create(store, newDeviceData) {
    return APIAdminDevice.create(newDeviceData)
      .then((response) => {
        store.commit('deviceCreated', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while creating a new device
        store.commit('deviceCreationFailed', { device: newDeviceData, err });
        // Forward error to caller
        throw err;
      });
  },
  /**
   * Edit one or multiple device
   *
   * @param {Object} store Store
   * @param {Object|Array} editDeviceData Existing device information to change
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  edit(store, editDeviceData) {
    return APIAdminDevice.edit(editDeviceData)
      .then((response) => {
        store.commit('deviceEdited', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while editing one or more device
        store.commit('deviceEditionFailed', { device: editDeviceData, err });
        // Forward error to caller
        throw err;
      });
  },
  /**
   * Delete one or multiple device
   *
   * @param {Object} store Store
   * @param {Object|Array} editDeviceData Existing device to delete
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  delete(store, deleteDeviceData) {
    return APIAdminDevice.delete(deleteDeviceData)
      .then((response) => {
        store.commit('deviceDeleted', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while deleting one or more device
        store.commit('deviceDeletetionFailed', { device: deleteDeviceData, err });
        // Forward error to caller
        throw err;
      });
  },
};

// Getters function
// Usually used to compute derived state based on store state
const getters = {
  // Get entity row to a tree
  entitiesToTree(state) {
    return utilEntity.entityToTree(state.entityRows);
  },
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
