import { LocalStorage } from 'quasar';
import _ from 'lodash';
import APIAdminReportEntity from 'src/api/admin/reportEntity';
import utilEntity from 'src/common/utils/entity';

// Misc keys
const storePrefixKey = 'admin/report-entity';
const reportEntityOptionsKey = `${storePrefixKey}/options/{USER_ID}`;

const stateDefault = {
  initialized: false,
  listLoading: false,
  listLoaded: false,
  listFilter: '',
  options: {
    keepEntityInSearch: true,
    filter: '',
  },
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
   * Geting a report's entity list mutation
   *
   * @param {Object} state This store's state
   */
  listLoading(state) {
    const stateRef = state;
    stateRef.listLoading = true;
  },
  /**
   * Got a report's entity list mutation
   *
   * @param {Object} state This store's state
   * @param {Array} entityRows List of entity
   */
  listLoaded(state, { entityRows }) {
    const stateRef = state;
    stateRef.entityRows = entityRows;
    stateRef.listLoading = false;
    stateRef.listLoaded = true;
  },
  /**
   *  Get report's entity list failed
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
   * Set report's list entity
   *
   * @param {Object} state This store's state
   * @param {Object} response Response from server
   */
  setListEntity(/* state, {response} */) { },
  /**
   * Set report's list entity
   *
   * @param {Object} state This store's state
   * @param {Object} error Failed error
   */
  setListEntityFailed(/* state, {error} */) { },

  /**
   * Report entity options changed
   *
   * @param {Object} state This store's state
   * @param {Array} options New options
   */
  optionsChanged(state, options) {
    const stateRef = state;
    const key = `${reportEntityOptionsKey.replace('{USER_ID}', state.userId)}`;
    if (options) {
      LocalStorage.set(key, options);
    } else {
      LocalStorage.remove(key);
    }
    stateRef.options = options;
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
        // Load settings
        const newData = { userId };
        newData.options = LocalStorage.getItem(`${reportEntityOptionsKey.replace('{USER_ID}', userId)}`)
          || store.state.options;
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
   * Get list of entity for a report
   *
   * @param {Object} store Store
   * @param {Object} reportInfo Report information for which we
   * want to load entity
   * @returns {Promise.<Object, Error>} An promise with
   *  {
   *      entityRows: [],
   *  }
   * if operation succeed to server, or an error if
   * operation failed.
   */
  list(store, reportInfo) {
    store.commit('listLoading');
    return APIAdminReportEntity.list(reportInfo)
      .then((response) => {
        store.commit('listLoaded', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while getting list of entity
        store.commit('listLoadedFailed', err);
        // Forward error to caller
        throw err;
      });
  },

  /**
   * Set report's list of entity
   *
   * @param {Object} store Store
   * @param {Object} reportInfo Report information for which we
   * want to modify its entity
   * @returns {Promise.<Object, Error>} An empty promise if operation succeed to
   * server, or an error ifoperation failed.
   */
  save(store, reportAndTagInfo) {
    return APIAdminReportEntity.save(reportAndTagInfo)
      .then((response) => {
        store.commit('setListEntity', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while setting list of entity
        store.commit('setListEntityFailed', err);
        // Forward error to caller
        throw err;
      });
  },
};

// Getters function
// Usually used to compute derived state based on store state
const getters = {
  // Get entity row to a tree
  entitiesListToTree(state) {
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
