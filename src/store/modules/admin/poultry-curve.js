import Promise from 'bluebird';
import _ from 'lodash';
import { LocalStorage } from 'quasar';
import APIAdminPoultryCurve from 'src/api/admin/poultry-curve';

// Misc keys
const storePrefixKey = 'admin/poultry-curve';
const listPaginationKey = `${storePrefixKey}/list/{USER_ID}`;
const listFilterKey = `${storePrefixKey}/filter/{USER_ID}`;

const stateDefault = {
  // Indicate if store is initialized or not
  initialized: false,
  // Id of the current user
  userId: undefined,

  // True if list of curve is loading
  listLoading: false,
  // True if list of curve has loaded
  listLoaded: false,
  // Hold the list of curves
  curveRows: [],

  // Curve's list pagination preferences
  listPagination: null,
  // Curve's list filter preferences
  listFilter: '',

  // True if curve attributes is loading
  attributesLoading: false,
  // True if curve attributes has loaded
  attributesLoaded: false,
  // List of visibilities (attributes)
  visibilityRows: [],
  // List of states (states)
  stateRows: [],

  // True if a curve is loading
  curveLoading: false,
  // True if a curve has loaded
  curveLoaded: false,
  // Hold a curve fetch from the server
  curve: null,

  // Hold a loading message (use to wait for API call)
  loadingMessage: null,
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
   * Getting curve list mutation
   *
   * @param {Object} This store's state
   */
  listLoading(state) {
    const stateRef = state;
    stateRef.listLoading = true;
  },
  /**
   * Got curve list mutation
   *
   * @param {Object} This store's state
   * @param {Array} data List of curves rows, visibility list and state list
   */
  listLoaded(state, data) {
    const stateRef = state;
    stateRef.curveRows = data.curves;
    stateRef.listLoading = false;
    stateRef.listLoaded = true;
  },
  /**
   *  Get curve list failed
   *
   * @param {Object} This store's state
   * @param {Object} error Failed error
   */
  listLoadedFailed(state /* , {error} */) {
    const stateRef = state;
    stateRef.listLoading = false;
    stateRef.listLoaded = false;
  },
  /**
   * Getting curve attributes mutation
   *
   * @param {Object} This store's state
   */
  attributesLoading(state) {
    const stateRef = state;
    stateRef.attributesLoading = true;
    stateRef.attributesLoaded = false;
  },
  /**
   * Get attributes mutation
   *
   * @param {Object} state This store's state
   * @param {Array[Object]} visibility List of curve's visibility
   * @param {Array[Object]} _state List of curve's state
   */
  attributesLoaded(state, { visibilityList, stateList }) {
    const stateRef = state;
    stateRef.visibilityRows = visibilityList;
    stateRef.stateRows = stateList;
    stateRef.attributesLoading = false;
    stateRef.attributesLoaded = true;
  },
  /**
   *  Get attributes failed mutation
   *
   * @param {Object} This store's state
   * @param {Object} error Failed error
   */
  attributesLoadedFailed(state /* , {error} */) {
    const stateRef = state;
    stateRef.attributesLoading = false;
    stateRef.attributesLoaded = false;
  },
  /**
   * Created curve muatation
   *
   * @param {Object} This store's state
   * @param {Object} curveData New curve data
   */
  curveCreated(/* state, {curve} */) {},
  /**
   *  Create curve failed muatation
   *
   * @param {Object} This store's state
   * @param {Object} errorAndCurveData Edited curve data plus error
   */
  curveCreationFailed(/* state, {errorAndCurveData} */) {},
  /**
   * Edited an curve mutation
   *
   * @param {Object} This store's state
   * @param {Object} curveData Edited curve data
   */
  curveEdited(/* state, {curveData} */) {},
  /**
   *  Edit curve failed mutation
   *
   * @param {Object} This store's state
   * @param {Object} errorAndCurveData Edited curve data plus error
   */
  curveEditionFailed(/* state, {errorAndCurveData} */) {},
  /**
   * Delete one or multiple curve mutation
   *
   * @param {Object} This store's state
   * @param {Object} curveData Deleted curve(s) data
   */
  curveDeleted(/* state, {curveData} */) {},
  /**
   *  Delete curve failed mutation
   *
   * @param {Object} This store's state
   * @param {Object} errorAndCurveData Deleted curve(s) data plus error
   */
  curveDeletetionFailed(/* state, {errorAndCurveData} */) { },
  /**
   * Poultry curve list pagination changed
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
   * Poultry curve list filter changed
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
   * Getting curve mutation
   *
   * @param {Object} This store's state
   */
  curveLoading(state) {
    const stateRef = state;
    stateRef.curveLoading = true;
    stateRef.curveLoaded = false;
  },
  /**
   * Got curve mutation
   *
   * @param {Object} state This store's state
   * @param {Object} curve Information of the curve (info + data)
   */
  curveLoaded(state, { curve }) {
    const stateRef = state;
    stateRef.curve = curve;
    stateRef.curveLoading = false;
    stateRef.curveLoaded = true;
  },
  /**
   *  Get curve list failed
   *
   * @param {Object} This store's state
   * @param {Object} error Failed error
   */
  getCurveFailed(state /* , {error} */) {
    const stateRef = state;
    stateRef.curveLoading = false;
    stateRef.curveLoaded = false;
  },
  /**
   * Get attributes mutation
   *
   * @param {Object} state This store's state
   * @param {String} msg New loading message
   */
  loadingMessageUpdated(state, msg) {
    state.loadingMessage = msg;
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
        // Load curve list settings
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
   * Get list of curve
   *
   * @param {Object} store Store
   * @param {Number} loadingMessage Loading message use to wait for the action
   * @returns {Promise.<{}|Error>} An empty promise that fill the following states of the store
   *  - curveRows
   * otherwise an error if operation failed.
   */
  getList(store, { loadingMessage }) {
    // Set loading message
    store.commit('loadingMessageUpdated', loadingMessage);
    // Do get list
    store.commit('listLoading');
    return APIAdminPoultryCurve.list()
      .then((response) => {
        store.commit('listLoaded', response.data);
      })
      .catch((err) => {
        // Error while getting list of curve
        store.commit('listLoadedFailed', err);
        // Clear loading message
        store.commit('loadingMessageUpdated', null);
        // Forward error to caller
        throw err;
      })
      .then(() => {
        // Clear loading message
        store.commit('loadingMessageUpdated', null);
      });

    // TODO: Use Promise.finally instead of repeating the call to
    // store.commit('loadingMessageUpdated', null); two times
    // This problem affect multiple files.
    // Ideally, we should use that
    //    .catch((err) => {
    //    })
    //    .finally(() => {
    //      store.commit('loadingMessageUpdated', null);
    //    })
    // But Microsoft Edge 17 does not support Promise.finally method, 18 does.
    // Quasar has a polyfill but it does fill only when Promise is not supported at all.
    // https://github.com/quasarframework/quasar/issues/3427
  },
  /**
   * Get attributes for handling poultry curve
   *
   * @param {Object} store Store
   * @param {Number} loadingMessage Loading message use to wait for the action
   * @returns {Promise.<{}|Error>} An empty promise that fill the following states of the store
   *  - visibilityRows
   *  - stateRows
   * otherwise an error if operation failed.
   */
  getAttributes(store, { loadingMessage }) {
    // Set loading message
    store.commit('loadingMessageUpdated', loadingMessage);
    // Do get attributes
    store.commit('attributesLoading');
    return APIAdminPoultryCurve.getAttributes()
      .then((response) => {
        store.commit('attributesLoaded', response.data);
      })
      .catch((err) => {
        // Error while getting the attributes
        store.commit('attributesLoadedFailed', err);
        // Clear loading message
        store.commit('loadingMessageUpdated', null);
        // Forward error to caller
        throw err;
      })
      .then(() => {
        // Clear loading message
        store.commit('loadingMessageUpdated', null);
      });
  },
  /**
   * Get a curve
   *
   * @param {Object} store Store
   * @param {Number} curveId Id of the requested curve
   * @param {Number} loadingMessage Loading message use to wait for the action
   * @returns {Promise.<{}|Error>} An empty promise that fill the following states of the store
   *  - curve
   * otherwise an error if operation failed.
   */
  get(store, { curveId, loadingMessage }) {
    // Set loading message
    store.commit('loadingMessageUpdated', loadingMessage);
    // Do get
    store.commit('curveLoading');
    return APIAdminPoultryCurve.get(curveId)
      .then((response) => {
        store.commit('curveLoaded', response.data);
      })
      .catch((err) => {
        // Error while getting the curve
        store.commit('getCurveFailed', err);
        // Clear loading message
        store.commit('loadingMessageUpdated', null);
        // Forward error to caller
        throw err;
      })
      .then(() => {
        // Clear loading message
        store.commit('loadingMessageUpdated', null);
      });
  },
  /**
   * Download a curve
   *
   * @param {Object} store Store
   * @param {Number} curveId Id of the requested curve
   * @param {Number} loadingMessage Loading message use to wait for the action
   * @returns {Promise.<{Array}|Error>} An promise with the file data otherwise an error
   * if operation failed.
   */
  download(store, { curveId, loadingMessage }) {
    // Set loading message
    store.commit('loadingMessageUpdated', loadingMessage);
    // Do download
    return APIAdminPoultryCurve
      .download(curveId)
      .catch((err) => {
        // Clear loading message
        store.commit('loadingMessageUpdated', null);
        // Forward error to caller
        throw err;
      })
      .then((data) => {
        // Clear loading message
        store.commit('loadingMessageUpdated', null);
        // Return curve's data
        return data;
      });
  },
  /**
   * Create a new curve
   *
   * @param {Object} store Store
   * @param {Object} newCurveData New curve information
   * @param {Number} loadingMessage Loading message use to wait for the action
   * @returns {Promise.<{}|Error} Promise with an empty object or an error if operation failed.
   */
  create(store, { newCurveData, loadingMessage }) {
    // Set loading message
    store.commit('loadingMessageUpdated', loadingMessage);
    // Do creation
    return APIAdminPoultryCurve.create(newCurveData)
      .then((response) => {
        store.commit('curveCreated', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while creating a new curve
        store.commit('curveCreationFailed', { curve: newCurveData, err });
        // Clear loading message
        store.commit('loadingMessageUpdated', null);
        // Forward error to caller
        throw err;
      })
      .then(() => {
        // Clear loading message
        store.commit('loadingMessageUpdated', null);
      });
  },
  /**
   * Edit a curve
   *
   * @param {Object} store Store
   * @param {Object|Array} curveData Existing curve information to change
   * @param {Number} loadingMessage Loading message use to wait for the action
   * @returns {Promise.<{}|Error} Promise with an empty object or an error if operation failed.
   */
  edit(store, { curveData, loadingMessage }) {
    // Set loading message
    store.commit('loadingMessageUpdated', loadingMessage);
    // Do edit
    return APIAdminPoultryCurve.edit(curveData)
      .then((response) => {
        store.commit('curveEdited', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while editing the curve
        store.commit('curveEditionFailed', { curve: curveData, err });
        // Clear loading message
        store.commit('loadingMessageUpdated', null);
        // Forward error to caller
        throw err;
      })
      .then(() => {
        // Clear loading message
        store.commit('loadingMessageUpdated', null);
      });
  },
  /**
   * Delete one or multiple curve
   *
   * @param {Object} store Store
   * @param {Object|Array} deleteCurveInfo Existing curve(s) to delete. Each curve should
   * contains at least the Id and the las updated date.
   * @param {Number} loadingMessage Loading message use to wait for the action
   * @returns {Promise.<{}|Error} Promise with an empty object or an error if operation failed.
   */
  delete(store, { deleteCurveInfo, loadingMessage }) {
    // Set loading message
    store.commit('loadingMessageUpdated', loadingMessage);
    // Do delete
    return APIAdminPoultryCurve.delete(deleteCurveInfo)
      .then((response) => {
        store.commit('curveDeleted', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while deleting one or more curve
        store.commit('curveDeletetionFailed', { curve: deleteCurveInfo, err });
        // Clear loading message
        store.commit('loadingMessageUpdated', null);
        // Forward error to caller
        throw err;
      })
      .then((res) => {
        // Clear loading message
        store.commit('loadingMessageUpdated', null);
        return res;
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
