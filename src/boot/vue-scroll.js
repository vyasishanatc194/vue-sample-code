import router from 'src/router';
import VueScrollTo from 'vue-scrollto';
import vueScrollBehavior from 'vue-scroll-behavior';

export default ({ Vue }) => {
  Vue.use(VueScrollTo);

  Vue.use(vueScrollBehavior, {
    router,
    maxLength: 100, // Saved history List max length
    ignore: [], // Ignore some routes (regex), they will directly scroll to the top
    delay: 200, // Delay by a number of milliseconds
  });
};
