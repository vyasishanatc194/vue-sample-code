import Promise from 'bluebird';
import _ from 'lodash';
import { LocalStorage } from 'quasar';
import APIAdminEntityUser from 'src/api/admin/entityUser';

// Misc keys
const storePrefixKey = 'admin/entity-user';
const listFilterKey = `${storePrefixKey}/filter/{USER_ID}`;
const listPaginationKey = `${storePrefixKey}/pagination/{USER_ID}`;

const stateDefault = {
  initialized: false,
  userId: undefined,
  userRows: [],
  listLoading: false,
  listLoaded: false,
  listFilter: '',
  listPagination: null,
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
   * Geting user list mutation
   *
   * @param {Object} This store's state
   */
  listLoading(state) {
    const stateRef = state;
    stateRef.listLoading = true;
  },
  /**
   * Got user list mutation
   *
   * @param {Object} This store's state
   * @param {Array} userRows List of user
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
   * @param {Object} This store's state
   * @param {Object} error Failed error
   */
  listLoadedFailed(state /* , {error} */) {
    const stateRef = state;
    stateRef.listLoading = false;
    stateRef.listLoaded = true;
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
   * Edited an entity user list mutation
   *
   * @param {Object} This store's state
   * @param {Object} entityData Edited entity data
   */
  edited(/* state, {entityData} */) {},
  /**
   *  Edit an entity user list failed mutation
   *
   * @param {Object} This store's state
   * @param {Object} errorAndEntityData Edited entity data plus error
   */
  editionFailed(/* state, {errorAndEntityData} */) {},
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
        // Load entity list settings
        const newData = { userId };
        newData.listPagination = LocalStorage.getItem(`${listPaginationKey.replace('{USER_ID}', userId)}`) || {};
        newData.listFilter = LocalStorage.getItem(`${listFilterKey.replace('{USER_ID}', userId)}`)
          || store.state.filter;
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
   * Get list of entity
   *
   * @param {Object} store Store
   * @param {Object} entity Entity for which we want to load user list
   * @returns {Promise.<Object, Error>} An promise with
   *  {
   *      userRows: [],
   *  }
   * if operation succeed to server, or an error if
   * operation failed.
   */
  getList(store, entity) {
    store.commit('listLoading');
    return APIAdminEntityUser.list(entity)
      .then((response) => {
        store.commit('listLoaded', response.data);
      })
      .catch((err) => {
        // Error while getting list of user for this entity
        store.commit('listLoadedFailed', err);
        // Forward error to caller
        throw err;
      });
  },
  /**
   * Edit an entity
   *
   * @param {Object} store Store
   * @param {Object} editEntityData Existing entity and user list information to change
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  edit(store, editEntityData) {
    return APIAdminEntityUser.edit(editEntityData)
      .then((response) => {
        store.commit('edited', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while editing the entity user list
        store.commit('editionFailed', { entity: editEntityData, err });
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
