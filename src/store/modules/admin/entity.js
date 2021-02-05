import Promise from 'bluebird';
import _ from 'lodash';
import utilEntity from 'src/common/utils/entity';
import { LocalStorage } from 'quasar';
import APIAdminEntity from 'src/api/admin/entity';

// Misc keys
const storePrefixKey = 'admin/entity';
const optionsKey = `${storePrefixKey}/options/{USER_ID}`;

const stateDefault = {
  initialized: false,
  userId: undefined,
  entityRows: [],
  listLoading: false,
  listLoaded: false,
  options: {
    keepEntityInSearch: true,
    filter: '',
    expanded: [],
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
   * Geting entity list mutation
   *
   * @param {Object} This store's state
   */
  listLoading(state) {
    const stateRef = state;
    stateRef.listLoading = true;
  },
  /**
   * Got entity list mutation
   *
   * @param {Object} This store's state
   * @param {Array} entityRows List of entities
   */
  listLoaded(state, { entityRows }) {
    const stateRef = state;
    stateRef.entityRows = entityRows;
    stateRef.listLoading = false;
    stateRef.listLoaded = true;
  },
  /**
   *  Get entity list failed
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
   * Entity page options changed
   *
   * @param {Object} state This store's state
   * @param {Array} options New options
   */
  optionsChanged(state, options) {
    const stateRef = state;
    const key = `${optionsKey.replace('{USER_ID}', state.userId)}`;
    if (options) {
      LocalStorage.set(key, options);
    } else {
      LocalStorage.remove(key);
    }
    stateRef.options = options;
  },
  /**
   * Created entity muatation
   *
   * @param {Object} This store's state
   * @param {Object} entityData New entity data
   */
  entityCreated(/* state, {entity} */) {},
  /**
   *  Create entity failed muatation
   *
   * @param {Object} This store's state
   * @param {Object} errorAndEntityData Edited entity data plus error
   */
  entityCreationFailed(/* state, {errorAndEntityData} */) {},
  /**
   * Edited an entity mutation
   *
   * @param {Object} This store's state
   * @param {Object} entityData Edited entity data
   */
  entityEdited(/* state, {entityData} */) {},
  /**
   *  Edit entity failed mutation
   *
   * @param {Object} This store's state
   * @param {Object} errorAndEntityData Edited entity data plus error
   */
  entityEditionFailed(/* state, {errorAndEntityData} */) {},
  /**
   * Delete one or multiple entity mutation
   *
   * @param {Object} This store's state
   * @param {Object} entityData Deleted entity(s) data
   */
  entityDeleted(/* state, {entityData} */) {},
  /**
   *  Delete entity failed mutation
   *
   * @param {Object} This store's state
   * @param {Object} errorAndEntityData Deleted entity(s) data plus error
   */
  entityDeletetionFailed(/* state, {errorAndEntityData} */) {},
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
        newData.options = LocalStorage.getItem(`${optionsKey.replace('{USER_ID}', userId)}`)
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
   * Get list of entity
   *
   * @param {Object} store Store
   * @returns {Promise.<Object, Error>} An promise with
   *  {
   *      entityRows: [],
   *  }
   * if operation succeed to server, or an error if
   * operation failed.
   */
  getList(store) {
    store.commit('listLoading');
    return APIAdminEntity.list()
      .then((response) => {
        store.commit('listLoaded', response.data);
      })
      .catch((err) => {
        // Error while getting list of entity
        store.commit('listLoadedFailed', err);
        // Forward error to caller
        throw err;
      });
  },
  /**
   * Create a new entity
   *
   * @param {Object} store Store
   * @param {Object} newEntityData New entity information
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  create(store, newEntityData) {
    return APIAdminEntity.create(newEntityData)
      .then((response) => {
        store.commit('entityCreated', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while creating a new entity
        store.commit('entityCreationFailed', { entity: newEntityData, err });
        // Forward error to caller
        throw err;
      });
  },
  /**
   * Edit an entity
   *
   * @param {Object} store Store
   * @param {Object|Array} editEntityData Existing entity information to change
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  edit(store, editEntityData) {
    return APIAdminEntity.edit(editEntityData)
      .then((response) => {
        store.commit('entityEdited', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while editing the entity
        store.commit('entityEditionFailed', { entity: editEntityData, err });
        // Forward error to caller
        throw err;
      });
  },
  /**
   * Delete one or multiple entity
   *
   * @param {Object} store Store
   * @param {Object|Array} deleteEntityData Existing entity to delete
   * @returns {Promise} Promise with an empty object or an error if
   * operation failed.
   */
  delete(store, deleteEntityData) {
    return APIAdminEntity.delete(deleteEntityData)
      .then((response) => {
        store.commit('entityDeleted', response.data);
        return response.data;
      })
      .catch((err) => {
        // Error while deleting one or more entity
        store.commit('entityDeletetionFailed', { entity: deleteEntityData, err });
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
