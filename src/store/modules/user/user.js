import axios from 'axios';
import _ from 'lodash';
import { Cookies, LocalStorage } from 'quasar';
import JWTDecode from 'jwt-decode';
import router from 'src/router';
import apiUser from 'src/api/user';
import apiSetting from 'src/api/setting';
import apiUserSettings from 'src/api/user-settings';
import authenticationAPI from 'src/api/authentication';
import { i18n } from 'src/boot/i18n';

// Default locale fallback
const languageFallback = 'en-us';

// Supported languages
const languageWhiteList = ['en-us', 'fr-ca'];

// String name used to store the JWT locally
const JWTName = 'user_jwt';

// Storage roles key
const roleListKey = 'compass_role_list';

// Storage units key
const unitListKey = 'compass_unit_list';

// Timer id for keep alive session mechanism
let sessionKeepAliveTimerID;

/**
 * Extract navigator language.
 * Use a white list array to return only supported language.
 * If language is not found, try to find the first major match and return it.
 *
 * @returns {string} The locale id (language) of the browser
 */
function extractLanguageInvariant() {
  const l = Cookies.get('user_language')
    || (navigator.languages ? navigator.languages[0] : navigator.language || navigator.userLanguage)
    || 'en';
  const targetLanguage = l.length > 0 ? l.toLowerCase() : languageFallback;
  if (languageWhiteList.indexOf(targetLanguage) !== -1) {
    // We found requested language, use it
    return targetLanguage;
  }
  if (targetLanguage.length < 2) {
    // Target language bad format, return fallback language
    return languageFallback;
  }
  // Find the first language that his major match
  // Ex:
  //  * Requested language is 'en-ca'
  //  * White list is 'en-us, fr-ca'
  //  * We return 'en-us' because the first major match is 'en'
  const major = targetLanguage.substring(0, 2);
  const firstMajorMatch = languageWhiteList.find(
    x => x.length >= 2 && x.substring(0, 2).toLowerCase() === major,
  );
  if (firstMajorMatch) {
    // First major match, return this language
    return firstMajorMatch;
  }
  return languageFallback;
}

// Mutation functions (Synchronous)
// The only way to actually change state
// in a Vuex store is by committing a mutation
const mutations = {
  /**
   * Store has been initialized
   *
   * @param {Object} state User state
   */
  storeInitialized(state) {
    const stateRef = state;
    stateRef.isStoreInitialized = true;
  },

  /**
   * Save roles and units list to local storage
   *
   * @param {Object} state User state
   * @param {Array} roleList Roles list to save
   * @param {Array} unitList Unit list to save
   */
  saveRoleAndUnitList(state, { roleList, unitList }) {
    const stateRef = state;
    LocalStorage.set(roleListKey, roleList);
    stateRef.roleList = roleList;
    LocalStorage.set(unitListKey, unitList);
    stateRef.unitList = unitList;
  },

  /**
   * Save unit list to local storage
   *
   * @param {Object} state User state
   * @param {Array} unitList Unit list to save
   */
  saveUnitList(state, { unitList }) {
    const stateRef = state;
    LocalStorage.set(unitListKey, unitList);
    stateRef.unitList = unitList;
  },

  /**
   * Load roles and units list from local storage
   *
   * @param {Object} state User state
   */
  loadRoleAndUnitList(state) {
    const stateRef = state;
    stateRef.roleList = LocalStorage.getItem(roleListKey) || [];
    stateRef.unitList = LocalStorage.getItem(unitListKey) || [];
  },

  /**
   * Clear roles and units list from local storage
   *
   * @param {Object} state User state
   */
  clearRoleAndUnitList(state) {
    const stateRef = state;
    LocalStorage.remove(roleListKey);
    stateRef.roleListKey = [];
    LocalStorage.remove(unitListKey);
    stateRef.unitListKey = [];
  },

  /**
   * Commit jwt decoded successfully
   *
   * @param {Object} state User state
   * @param {String} jwt Original jwt
   * @param {any} tokenInfo Decoded jwt data
   */
  jwtDecodedSuccessfully(state, { jwt, decodedJwt }) {
    const stateRef = state;
    const { user } = decodedJwt;
    stateRef.userId = user.user_id;
    stateRef.userEmail = user.user_email;
    stateRef.firstName = user.first_name;
    stateRef.lastName = user.last_name;
    stateRef.timeZone = user.time_zone;
    stateRef.localeId = user.locale_id;
    stateRef.localeName = user.locale_name;
    stateRef.language = user.locale_name;
    stateRef.roleId = user.role_id;
    stateRef.roleName = user.role_name;
    stateRef.roleNameLocale = user.role_name_locale;
    stateRef.jwtIssueAt = parseInt(decodedJwt.iat, 10);
    stateRef.jwtExpireAt = parseInt(decodedJwt.exp, 10);
    stateRef.isLoggedIn = true;
    stateRef.jwt = jwt;

    // Save JWT into the local storage
    LocalStorage.set(JWTName, state.jwt);
  },

  /**
   * Commit refreshing session
   *
   * @param {Object} state User state
   */
  refreshingSession() {},

  /**
   * Commit refresh session successful
   *
   * @param {Object} state User state
   */
  refreshSessionSuccess() {},

  /**
   * Commit refresh session failed
   *
   * @param {Object} state User state
   * @param {Error} e Reasons of refresh session failed
   */
  refreshSessionFailed() {},

  /**
   * Commit session expired
   *
   * @param {Object} state User state
   */
  sessionExpired() {},

  /**
   * Commit route error
   *
   * @param {Object} state User state
   * @param {Error} e Reasons of route error
   */
  routeError() {},

  /**
   * Commit jwt decoded failed
   *
   * @param {Object} state User state
   */
  jwtDecodedFailed(state) {
    const stateRef = state;
    stateRef.jwt = undefined;
    stateRef.isLoggedIn = false;
  },

  /**
   * Commit authentication login success
   *
   * @param {Object} state User state
   */
  loginSuccessful(state) {
    const stateRef = state;
    stateRef.isLoggedIn = true;
  },

  /**
   * Commit authentication login failed
   *
   * @param {Object} state User state
   * @param {Error} err Login failed error
   */
  loginFailed(state) {
    const stateRef = state;
    stateRef.isLoggedIn = false;
  },

  /**
   * Logout user, clear cookie,
   * clear session keep alive service
   *
   * @param {Object} state User state
   */
  logout(state) {
    // Logout user
    const stateRef = state;
    stateRef.isLoggedIn = false;
    stateRef.jwt = undefined;

    // Remove JWT token from local storage
    LocalStorage.remove(JWTName);

    // Clear keep alive service timer
    if (sessionKeepAliveTimerID) {
      clearTimeout(sessionKeepAliveTimerID);
      sessionKeepAliveTimerID = undefined;
    }
  },

  /**
   * Commit set language
   *
   * @param {Object} state User state
   * @param {Object} language New locale identifier
   */
  languageSet(state, { language }) {
    // Set new language
    const stateRef = state;
    stateRef.language = language;

    // Update cookie language
    Cookies.set('user_language', language, { expires: 365 });
  },

  /**
   * Commit test reset password query
   *
   * @param {Object} state User state
   */
  validatingResetPasswordQuery() {},

  /**
   * Commit change password
   *
   * @param {Object} state User state
   */
  changingPassword() {},
};

// Action functions (Must be asynchronous)
// Actions are similar to mutations, the differences being that:
//   - Instead of mutating the state, actions commit mutations.
//   - Actions can contain arbitrary asynchronous operations.
//
// It is better to return a promise in the stock in order to be
// able to determine when it ends.
const actions = {
  /**
   * Decode JWT authentication token
   *
   * @param {Object} store Store
   * @param {String} jwt JWT token to decode
   * @returns {Promise} Promise an empty object or an error if operation failed.
   */
  decodeJwt(store, jwt) {
    // jwt should not be null and be a string
    if (jwt && typeof jwt === 'string') {
      try {
        store.commit('jwtDecodedSuccessfully', { jwt, decodedJwt: JWTDecode(jwt) });
        return Promise.resolve();
      } catch (e) {
        store.commit('jwtDecodedFailed', e);
        return Promise.reject(e);
      }
    }
    const ee = new Error('Invalid token');
    store.commit('jwtDecodedFailed', ee);
    return Promise.reject(ee);
  },

  /**
   * Refresh user session
   *
   * @param {Object} store Store
   * @returns {Promise} Promise an empty object or an error if operation failed.
   */
  refreshSession(store) {
    store.commit('refreshingSession');
    return apiUser.refreshSession();
  },

  /**
   * Start a timer to keep the session alive
   *
   * @param {Object} store Store
   * @returns {Promise} Promise an empty object or an error if operation failed.
   */
  scheduleKeepAliveService(store) {
    // Clear any old timer
    if (sessionKeepAliveTimerID) {
      clearTimeout(sessionKeepAliveTimerID);
      sessionKeepAliveTimerID = undefined;
    }

    // Start a timer to refresh the jwt token 1
    // minutes before the session end
    //
    // NOTES
    //  jwt dates are expressed with a number of seconds
    //  from 1970- 01 - 01T00: 00:00Z UTC until the specified
    //  UTC date/ time, ignoring leap seconds 0
    if (!store.state.isLoggedIn) {
      return Promise.resolve();
    }
    const millisecondsInMinute = 60000;
    const at = new Date(store.state.jwtExpireAt * 1000) - new Date() - millisecondsInMinute;
    if (at <= 0) {
      store.commit('sessionExpired');
      store.commit('logout');
    } else {
      sessionKeepAliveTimerID = setTimeout(() => {
        store
          .dispatch('refreshSession')

          // Read new JWT from response and decode it
          .then(res => store.dispatch('decodeJwt', res.data.jwt))

          // Session has been refreshed
          .then(() => store.commit('refreshSessionSuccess'))

          // Reschedule a new keep alive session
          .then(() => store.dispatch('scheduleKeepAliveService'))

          .catch((e) => {
            // Failed refreshing session
            store.commit('refreshSessionFailed', e);
            store.commit('sessionExpired');
            return store.dispatch('logout');
          });
      }, at);
    }
    return Promise.resolve();
  },

  /**
   * Login a user
   *
   * @param {Object} store Store
   * @param {String} username User name
   * @param {String} password User password
   * @param {Boolean} keepMeLoggedIn Indicate if user would stay
   * logged in
   * @param {String} redirectURL URL to redirect once logged in
   * @returns {Promise} Promise an empty object or an error if
   * operation failed.
   */
  login(store, {
    username, password, keepMeLoggedIn, redirectURL,
  }) {
    let responseRef;
    return apiUser
      .login(username, password, keepMeLoggedIn)
      .then((response) => {
        responseRef = response;
        return store.dispatch('decodeJwt', response.data.jwt);
      })
      .then(() => {
        store.commit('loginSuccessful', responseRef.data);

        // Save roles and unit list
        store.commit('saveRoleAndUnitList', responseRef.data);

        // Be sure local UI language is synchronized with user locale coming from database
        return store.dispatch('setLanguage', { language: store.state.language });
      })
      // Start a service to keep the session alive
      .then(() => store.dispatch('scheduleKeepAliveService'))
      .then(() => {
        // Navigate to redirect page or home page
        router.replace(redirectURL || '/home');
      })
      .catch((err) => {
        // Error while logged in user
        store.commit('loginFailed', err);
        // Forward error to caller
        throw err;
      });
  },

  /**
   * Logout a user
   *
   * @param {Object} store Store
   * @returns {Promise.<Object, Error>} Promise with an empty object or an
   *  error if operation failed.
   */
  logout(store) {
    // Clear roles and unit list
    store.commit('clearRoleAndUnitList');
    // Logout user
    store.commit('logout');
    // Redirect to login page
    // Make sure the actual route is not already `/login` else the replace
    // function will throw the error`NavigationDuplicated`
    return router.currentRoute.fullPath !== '/login'
      ? router.replace('/login')
      : Promise.resolve();
  },

  /**
   * Set language action, if it not already exists then
   * fetch it from the server
   *
   * @param {Object} store Store
   * @param {String} language New language locale identifier
   * @returns {Promise} Promise an empty object or an error if
   * operation failed.
   */
  setLanguage(store, { language }) {
    if (store.getters.isLanguageLoaded(language)) {
      // Language already exists, set it
      store.commit('languageSet', { language });
      return Promise.resolve();
    }
    // Fetch it using an async call from the server
    return axios
      .get(`i18n/${language}/${language}.json`)
      .then((res) => {
        // Add language messages
        i18n.setLocaleMessage(language, res);
        // Language is now changed
        store.commit('languageSet', { language });
      });
  },

  /**
   * Change user's preferences
   *
   * @param {Object} store Store
   * @param {String} timeZone New timezone
   * @param {String} language New language locale identifier
   * @param {Array} unit New unit preferences per context
   * @returns {Promise} Promise an empty object or an error if
   * operation failed.
   */
  changePreferences(store, {
    timeZone, language, unit,
  }) {
    // Get store language value before the jwt be decoded and overwrite its value
    const storeLanguageBeforeJwtDecode = store.state.language;
    // Update user's preferences
    return apiSetting.changePreferences(timeZone, language, unit)
      // Decode new jwt that may contains a new language and timezone
      .then(response => store.dispatch('decodeJwt', response.data.jwt)
        .then(() => {
          // Save roles and unit list
          store.commit('saveRoleAndUnitList', {
            unitList: response.data.unitList,
            roleList: response.data.roleList,
          });

          // Update UI language
          if (storeLanguageBeforeJwtDecode !== language) {
            if (store.getters.isLanguageLoaded(language)) {
              // Language already loaded, set it
              store.commit('languageSet', { language });
              return Promise.resolve();
            }
            // Fetch new language from server using an async call
            return axios
              .get(`i18n/${language}/${language}.json`)
              .then((res) => {
                // Add language messages
                i18n.setLocaleMessage(language, res);
                // Langage is now changed
                store.commit('languageSet', { language });
              });
          }

          // Language is the same, no need any action
          return Promise.resolve();
        }));
  },

  /**
   * Change password
   *
   * @param {Object} store Store
   * @param {any} id The id sent by the back-end
   * @param {any} token The short-time token sent by the back-end to check the operation
   * @param {any} newPassword The new password to set
   * @param {any} confirmPassword The new password to set
   */
  changePassword(store, {
    id, token, newPassword, confirmPassword,
  }) {
    store.commit('changingPassword', {
      id, token, newPassword, confirmPassword,
    });
    return apiUser.doSetNewPassword(id, token, newPassword, confirmPassword);
  },

  /**
   * Test if a password reset query is valid
   *
   * @param {Object} store Store
   * @param {String} id Id of the reset password query
   * @param {String} token Token of the reset password query
   * @param {String} lang Language/Locale ID of the user
   * @returns {Promise.<Boolean, Error>} A boolean indicating if the reset password query is valid
   * or not or an error if operation failed.
   */
  isResetPasswordQueryValid(store, { id, token, lang }) {
    store.commit('validatingResetPasswordQuery', { id, token, lang });
    return apiUser.isResetPasswordValid(id, token, lang);
  },

  /**
   * Initialize the user store
   *
   * @param {Object} store Store
   * @returns {Promise} Promise an empty object or an error if
   * operation failed.
   */
  initialize(store) {
    // Try reading jwt from browser's cookies
    if (store.state.isStoreInitialized) {
      return Promise.resolve();
    }
    return store
      .dispatch('decodeJwt', LocalStorage.getItem(JWTName))
      .then(() => {
        // Load role and unit list
        store.commit('loadRoleAndUnitList');
        // Start a service to keep the session alive
        return store.dispatch('scheduleKeepAliveService');
      })
      .catch((err) => {
        store.commit('jwtDecodedFailed', err);
        // Don't rethrow error as token may be invalid at
        // application startup
      })
      .then(() => {
        // Store is now initialized
        store.commit('storeInitialized');
        return null;
      });
  },

  /**
   * Change user's locale
   *
   * @param {Object} store Store
   * @param {Object} params Locale parameters
   * @param {String} params.locale New locale
   * @returns {Promise} Promise an empty object or an error if
   * operation failed.
   */
  setLocale(store, { locale }) {
    // Get store language value before the jwt be decoded and overwrite its value
    const storeLanguageBeforeJwtDecode = store.state.language;
    return apiUserSettings.setLocale(locale)
      // Decode new jwt that may contains a new language and timezone
      .then(() => authenticationAPI.getNewToken())
      .then(response => store.dispatch('decodeJwt', response.data.jwt)
        .then(() => {
          // Update UI language
          if (storeLanguageBeforeJwtDecode !== locale) {
            if (store.getters.isLanguageLoaded(locale)) {
              // Language already loaded, set it
              store.commit('languageSet', { language: locale });
              return Promise.resolve();
            }
            // Fetch new language from server using an async call
            return axios
              .get(`i18n/${locale}/${locale}.json`)
              .then((res) => {
                // Add language messages
                i18n.setLocaleMessage(locale, res);
                // Langage is now changed
                store.commit('languageSet', { language: locale });
              });
          }

          // Language is the same, no need any action
          return Promise.resolve();
        }));
  },

  /**
   * Change user's units
   *
   * @param {Object} store Store
   * @param {Array} units New units preferences per context
   * @returns {Promise} Promise an empty object or an error if
   * operation failed.
   */
  setUnits(store, { units }) {
    // Update user's units
    return apiUserSettings.setUnits(units)
      .then(() => apiUserSettings.getUnits())
      .then((response) => {
        // TODO: Object property names changed on V1
        // They cannot be changed in util/units as it would break the APP. For now simply
        // remap them to old names
        const unitsWithOldPropertyNames = {
          unit: response.data.units.units,
          category: response.data.units.unitCategories,
          context: response.data.units.unitContexts,
          contextPrecision: response.data.units.unitContextPrecisions,
        };
        // Save unit list
        store.commit('saveUnitList', {
          unitList: unitsWithOldPropertyNames,
        });
      });
  },
};

// Getters function
// Usually used to compute derived state based on store state
const getters = {
  getFullName: state => `${state.firstName} ${state.lastName}`,
  getRoleListByName: state => _.reduce(
    state.roleList,
    (obj, item) => {
      const objRef = obj;
      objRef[item.name] = item;
      return obj;
    },
    {},
  ),
  /**
   * Return a function to test if a language is loaded
   *
   * @param {string} local Language (locale id) to test
   * @returns {boolean} True if language is loaded, otherwise false.
   */
  isLanguageLoaded() {
    return local => local in i18n.messages;
  },
  /**
   * Return a function to get a language messages
   *
   * @param {string} local Language (locale id) of the messages
   * @returns {Object} An object with all messages of this local, otherwise false.
   */
  getLanguageMessage() {
    return local => i18n.messages[local];
  },
  /**
   * Get current language messages
   *
   * @param {string} local Language (locale id) of the messages
   * @returns {object} An object with all messages of the current local, otherwise false.
   */
  getCurrentLanguageMessage(_state) {
    return i18n.messages[_state.language];
  },
  /**
   *  Get current language keys (locale's name)
   *
   * @param {object} _state Current store's states
   * @param {object} _getters Current store's getters
   * @returns {[string]} An array of string with locale's keys.
   */
  getLanguageListKeys(_state, _getters /* , _rootState */) {
    return Object.keys(_getters.getCurrentLanguageMessage.language) || [];
  },
  /**
   * Get current locale (language) name
   *
   * @returns {string} Return the current locale's name
   */
  getCurrentLocalName(_state, _getters /* , _rootState */) {
    const keyLanguage = _getters.getLanguageListKeys[_state.language];
    if (keyLanguage) {
      return i18n.t(`language.${keyLanguage}`);
    }
    return '???';
  },
  /**
   * Get current locale (language) id
   *
   * @returns {string} Return the current locale's id
   */
  getCurrentLocalId() {
    return i18n.locale;
  },
};

// Single State Tree
export const state = {
  isStoreInitialized: false,
  jwt: undefined,
  isLoggedIn: false,
  jwtIssueAt: undefined,
  jwtExpireAt: undefined,
  localeId: undefined,
  localeName: undefined,
  language: extractLanguageInvariant(),
  userId: undefined,
  userEmail: undefined,
  firstName: undefined,
  lastName: undefined,
  timeZone: undefined,
  roleId: undefined,
  roleName: undefined,
  roleNameLocale: undefined,
  roleList: [],
  unitList: [],
};

// Export this module state information to the main state store
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
