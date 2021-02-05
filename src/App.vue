<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState, mapGetters, mapActions } from 'vuex';
import http from './common/utils/http';

// Set default timeout of positive alert
Vue.prototype.$alertTimeoutMs = 5000;

// Set default debouncing time for input field
Vue.prototype.$debouncingInputMs = 1000;
// Set Zoho Chat global object
Vue.prototype.$zohoChat = window.$zoho;

export default {
  name: 'App',
  computed: {
    ...mapState('user', {
      language: state => state.language,
    }),
  },
  data() {
    return {
      // Hold a function to dismiss the session expired notify
      sessionExpiredDismissNotify: undefined,
    };
  },
  methods: {
    ...mapGetters('user', ['getCurrentLanguageMessage']),
    ...mapActions('user', ['logout']),
    changeUILanguage(local) {
      // Change UI langauge
      this.$i18n.locale = local;

      // Update moment locale
      this.$moment.locale(local);

      // Change UI framework language
      let quasarFileLoaded = false;
      import(`quasar/lang/${local}.js`)
        .then((lang) => {
          // Apply language file
          this.$q.lang.set(lang.default);
          quasarFileLoaded = true;
        })
        .catch(() => {
          // Maybe this locale file with major-minor does not exists
          // Try only with the major
          const dashIdx = local.indexOf('-');
          if (dashIdx !== -1) {
            const localeWithoutMinor = local.substring(0, dashIdx);
            return import(`quasar/lang/${localeWithoutMinor}.js`);
          }
          throw new Error(this.$t('app.quasarFileNotFound', { localeFile: local }));
        })
        .then((lang) => {
          // Apply language file if it failed first time
          if (!quasarFileLoaded) {
            this.$q.lang.set(lang.default);

            // Force the Vue instance to re-render.
            // Note :
            //    This will not re- render child component
            this.$forceUpdate();
          }
        });
    },
  },
  created() {
    // Get message before getting in the store's subscribe callback else
    // the error `Uncaught TypeError: Cannot read property '$t' of undefined` is thrown
    // https://github.com/kazupon/vue-i18n/pull/690
    // https://github.com/kazupon/vue-i18n/issues/184
    const sessionExpiredMessage = this.$t('app.needAuthorization');
    // Subscribe to store mutations
    this.$store.subscribe((mutation) => {
      if (mutation.type === 'user/storeInitialized') {
        // Set UI language
        this.changeUILanguage(this.language);
      } else if (mutation.type === 'user/sessionExpired') {
        // Close existing notify (if any)
        if (typeof this.sessionExpiredDismissNotify !== 'undefined') {
          this.sessionExpiredDismissNotify();
          this.sessionExpiredDismissNotify = undefined;
        }
        // Warn the user when its session expired
        this.sessionExpiredDismissNotify = this.$q.notify({
          color: 'negative',
          message: sessionExpiredMessage,
          icon: 'report_problem',
        });
      } else if (mutation.type === 'user/loginSuccessful') {
        // Make sure the session expired notify is closed once the
        // user successfully logged in
        if (typeof this.sessionExpiredDismissNotify !== 'undefined') {
          this.sessionExpiredDismissNotify();
          this.sessionExpiredDismissNotify = undefined;
        }
      }
    });

    // Setup an axios http interceptor
    http.interceptors.response.use(null, (httpErrorWrapper) => {
      // When the http status is 401, logout the user
      //  * 401 if not logged-in or session expired
      //  * 403 if user does not have permission to access resource (file, json, ...)
      // Ref: https://stackoverflow.com/a/28672217
      let ret;
      if (httpErrorWrapper.status === 401
        || httpErrorWrapper.status === 403) {
        ret = this.logout();
      } else {
        // Unknown error, do nothing
        ret = Promise.resolve();
      }
      return ret
        .then(() => Promise.reject(httpErrorWrapper));
    });
  },
  watch: {
    // Watch for locale/language change
    language(newValue /* , oldValue */) {
      // Change UI language
      this.changeUILanguage(newValue);
    },
  },
};
</script>

<style lang="stylus" scoped>
</style>
