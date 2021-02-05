import VueI18n from 'vue-i18n';
import messages from 'src/i18n';

// eslint-disable-next-line import/no-mutable-exports
let i18n;

export default ({ app, store, Vue }) => {
  Vue.use(VueI18n);

  // Set i18n instance on app
  // This way we can use it in middleware and pages asyncData/fetch
  app.i18n = new VueI18n({
    locale: store.state.user.locale || 'en-us',
    fallbackLocale: 'en-us',
    messages,
  });

  // Take a copy of the i18n reference
  ({ i18n } = app);
};

export {
  i18n,
};
