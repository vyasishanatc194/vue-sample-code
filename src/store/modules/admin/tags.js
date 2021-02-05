import Promise from 'bluebird';
import _ from 'lodash';
import APIAdminTags from 'src/api/admin/tags';

const stateDefault = {
  initialized: false,
  tagList: [],
  tagListLoading: false,
  tagListLoaded: false,
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
   * Getting tag list mutation
   *
   * @param {Object} state This store's state
   */
  tagListLoading(state) {
    const stateRef = state;
    stateRef.tagListLoading = true;
  },
  /**
   * Got tag list mutation
   *
   * @param {Object} state This store's state
   * @param {Array} tagList List of tag
   */
  tagListLoaded(state, { tagList }) {
    const stateRef = state;
    stateRef.tagList = tagList;
    stateRef.taglistLoading = false;
    stateRef.tagListLoaded = true;
  },
  /**
   *  Get tag list failed
   *
   * @param {Object} state This store's state
   * @param {Object} error Failed error
   */
  tagListLoadedFailed(state /* , {error} */) {
    const stateRef = state;
    stateRef.tagListLoading = false;
    stateRef.tagListLoaded = true;
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
   */
  initialize(store) {
    // Initialize store one time only
    return new Promise((resolve) => {
      if (store.state.initialized === false) {
        // Load user list settings
        const newData = {};
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
   * Get list of tag
   *
   * @param {Object} store Store
   * @returns {Promise.<Object, Error>} A promise with
   *  {
   *      tagList: [],
   *      error: '',
   *  }
   * if operation succeed to server, or an error if
   * operation failed.
   */
  getTagList(store) {
    store.commit('tagListLoading');
    return APIAdminTags.listTag()
      .then((response) => {
        store.commit('tagListLoaded', { tagList: response.data.tagList });
      })
      .catch((err) => {
        // Error while getting list of tag
        store.commit('tagListLoadedFailed', err);
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
