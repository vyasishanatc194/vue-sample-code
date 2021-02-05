import Vue from 'vue';
import Vuex from 'vuex';

import user from './modules/user/user';
import home from './modules/home/home';
import device from './modules/device/device';
import adminUser from './modules/admin/user';
import adminEntity from './modules/admin/entity';
import adminEntityUser from './modules/admin/entity-user';
import adminEntityNotification from './modules/admin/entity-notification';
import adminDevice from './modules/admin/device';
import adminReport from './modules/admin/report';
import adminReportEntity from './modules/admin/report-entity';
import adminReportEmail from './modules/admin/report-email';
import adminPoultryCurve from './modules/admin/poultry-curve';
import adminTags from './modules/admin/tags';
import layout from './modules/layout/layout';

Vue.use(Vuex);

const store = new Vuex.Store({
  // When strict is true then this
  //  * Ensures that all state mutations can be explicitly tracked by debugging tools
  //  * Whenever Vuex state is mutated outside of mutation handlers, an error will be thrown
  //  * Strict mode runs a synchronous deep watcher on the state tree for detecting inappropriate
  //    mutations, and it can be quite expensive when you make large amount of mutations to the
  //    state.Make sure to turn it off in production to avoid the performance cost
  strict: process.env.DEV,
  // When namespaces is true all of its getters, actions and mutations will be automatically
  // namespaced based on the path the module is registered at
  namespaced: true,
  modules: {
    user,
    home,
    device,
    admin: {
      namespaced: true,
      modules: {
        user: adminUser,
        entity: adminEntity,
        entityUser: adminEntityUser,
        entityNotification: adminEntityNotification,
        device: adminDevice,
        report: adminReport,
        reportEntity: adminReportEntity,
        reportEmail: adminReportEmail,
        poultryCurve: adminPoultryCurve,
        tags: adminTags,
      },
    },
    layout,
  },
});

export default store;
