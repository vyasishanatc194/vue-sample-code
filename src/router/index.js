import Vue from 'vue';
import VueRouter from 'vue-router';
import utilUser from 'src/common/utils/user';
import Store from 'src/store';
import routes from './routes';

Vue.use(VueRouter);

const Router = new VueRouter({
  /*
   * NOTE! Change Vue Router mode from quasar.conf.js -> build -> vueRouterMode
   *
   * If you decide to go with "history" mode, please also set "build.publicPath"
   * to something other than an empty string.
   * Example: '/' instead of ''
   */

  // Leave as is and change from quasar.conf.js instead!
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE,
  scrollBehavior: () => ({ y: 0 }),
  routes,
});

/*
  Logic to execute before each route
 */
Router.beforeEach((to, from, next) => {
  // Initialize user store before any route
  // If we don't return null for the promise, we will get this warning
  // warning-a-promise-was-created-in-a-handler-but-was-not-returned-from-it
  Store
    .dispatch('user/initialize')
    .then(() => {
      // Is user already logged-in ?
      if (Store.state.user.isLoggedIn) {
        // Is user trying to get login pages ?
        if (['/login'].includes(to.path)) {
          // Redirect to home page as the user
          // is already logged-in
          next({ path: '/home' });
          return null;
        }

        // User can navigate to any pages
        if (to.query.redirect) {
          next({ path: to.query.redirect });
          return null;
        }
      } else {
        // User is not logged-in
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
        if (requiresAuth) {
          // User is requested a protected page and
          // he is not logged-in, login him first
          next({
            path: '/login',
            query: {
              redirect: to.fullPath,
            },
          });
          return null;
        }
      }

      // Test for route meta
      if (to.meta && to.meta.rolesRequired
        && !utilUser.hasRole(Store, to.meta.rolesRequired)) {
        // User requested an unauthorized page
        next({ path: '403' });
        return null;
      }

      // User requested an autorise page
      next();
      return null;
    })
    .catch((e) => {
      // Fatal store initialization error
      Store.commit('user/routeError', e);
      next(false);
    });
});

export default Router;
