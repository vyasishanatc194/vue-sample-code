// Configuration for your app
// For more information see: https://quasar.dev/quasar-cli/quasar-conf-js

// Retrieve package information
const packageJSON = require('./package.json');

// Timeout in development environment before the request times out
const httpRequestTimeoutDevMs = 3600000;
// Timeout in production environment before the request times out
const httpRequestTimeoutProdMs = 60000;


module.exports = ctx => ({
  // app boot file (/src/boot)
  // --> boot files are part of "main.js"
  // https://quasar.dev/quasar-cli/cli-documentation/boot-files
  boot: [
    'i18n',
    'axios',
    'moment',
    'http',
    'notify-default',
    'vuelidate',
    'vue-scroll',
    'google-analytics',
    'vue-croppa',
    'notify-response',
    'vue-flag-icon',
    'quasar-ui-qcalendar',
  ],

  // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
  css: [
    'app.styl',
  ],

  // https://github.com/quasarframework/quasar/tree/dev/extras
  extras: [
    // 'ionicons-v4',
    // 'mdi-v4',
    // 'fontawesome-v5',
    // 'eva-icons',
    // 'themify',
    // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

    'material-icons',
    'fontawesome-v5',
  ],

  // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
  framework: {
    // iconSet: 'ionicons-v4', // Quasar icon set
    // lang: 'de', // Quasar language pack

    // Possible values for "all":
    // * 'auto' - Auto-import needed Quasar components & directives
    //            (slightly higher compile time; next to minimum bundle size; most convenient)
    // * false  - Manually specify what to import
    //            (fastest compile time; minimum bundle size; most tedious)
    // * true   - Import everything from Quasar
    //            (not treeshaking Quasar; biggest bundle size; convenient)
    all: 'auto',

    components: [
      'QBtn',
      'QBtnDropdown',
      'QCheckbox',
      'QDate',
      'QDialog',
      'QDrawer',
      'QExpansionItem',
      'QField',
      'QFooter',
      'QHeader',
      'QIcon',
      'QInput',
      'QItem',
      'QItemLabel',
      'QSeparator',
      'QItemSection',
      'QLayout',
      'QList',
      'QMenu',
      'QOptionGroup',
      'QPage',
      'QPageContainer',
      'QRadio',
      'QResizeObserver',
      'QScrollArea',
      'QSelect',
      'QSpinnerOval',
      'QTab',
      'QTable',
      'QTabs',
      'QTabPanels',
      'QTd',
      'QTh',
      'QToolbar',
      'QToolbarTitle',
      'QTr',
      'QTree',
      'QSpace',
      'QCard',
      'QCardSection',
    ],

    directives: [
      'ClosePopup',
      'Ripple',
    ],

    // Quasar plugins
    plugins: [
      'Notify',
      'Cookies',
      'LocalStorage',
      'Loading',
      'Dialog',
    ],
  },

  // https://quasar.dev/quasar-cli/cli-documentation/supporting-ie
  supportIE: true,

  // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
  build: {
    // https://webpack.js.org/configuration
    scopeHoisting: true,
    vueRouterMode: 'hash',
    // vueRouterMode: 'history',
    // showProgress: false,
    // gzip: true,
    // analyze: true,
    // preloadChunks: false,
    // extractCSS: false,

    // https://quasar.dev/quasar-cli/cli-documentation/handling-webpack
    extendWebpack(cfg) {
      cfg.module.rules.push({
        enforce: 'pre',
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
        options: {
          // eslint-disable-next-line global-require
          formatter: require('eslint').CLIEngine.getFormatter('stylish'),
        },
      });

      // Prevent error for xlsx-populate plugin
      cfg.node = {
        fs: 'empty',
      };
    },

    // https://quasar.dev/app-extensions/tips-and-tricks/chain-webpack
    // When you want to ensure that a Webpack Loader is chained into
    // the hosting app, because you depend on it for your own App Extension to work.
    // Here we have override the url-loader of webpack to preprocess files.
    chainWebpack(chain) {
      chain.module.rule('images')
        .use('url-loader')
        .tap((options) => {
          options.name = 'img/[path][name].[ext]';
          return options;
        });
    },

    env: {
      // Injects application version
      APP_VERSION: JSON.stringify(packageJSON.version),

      // Retrieve google analytics information
      // https://matteogabriele.gitbooks.io/vue-analytics/content/docs
      APP_GOOGLE_ANALYTICS: {
        KEY: JSON.stringify(
          process.env.COMPASS_CLIENT_GOOGLE_ANALYTICS_KEY || '',
        ),
        TRACE: JSON.stringify(
          process.env.COMPASS_CLIENT_GOOGLE_ANALYTICS_TRACE || '',
        ),
        SEND_HIT_TASK: JSON.stringify(
          process.env.COMPASS_CLIENT_GOOGLE_ANALYTICS_SEND_HIT_TASK || '',
        ),
      },

      // Specifies the number of milliseconds before an HTTP request times out.
      APP_HTTP_REQUEST_TIMEOUT: (process.env.COMPASS_CLIENT_HTTP_REQUEST_TIMEOUT)
        || (ctx.dev === true ? httpRequestTimeoutDevMs : httpRequestTimeoutProdMs),

      // Base URL to reach the backend for REST API communication.
      APP_BASE_URL: JSON.stringify(
        process.env.COMPASS_BASE_URL || '',
      ),
    },
  },

  // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
  devServer: {
    // https: true,
    // port: 8080,
    open: true, // opens browser window automatically
    proxy: {
      '/api/**': {
        target: 'http://localhost:8585/',
        changeOrigin: true,
      },
    },
  },

  // animations: 'all', // --- includes all animations
  // https://quasar.dev/options/animations
  animations: [
    'bounceInLeft',
    'bounceOutRight',
  ],

  // https://quasar.dev/quasar-cli/developing-ssr/configuring-ssr
  ssr: {
    pwa: false,
  },

  // https://quasar.dev/quasar-cli/developing-pwa/configuring-pwa
  pwa: {
    // workboxPluginMode: 'InjectManifest',
    // workboxOptions: {}, // only for NON InjectManifest
    manifest: {
      // name: 'Compass',
      // short_name: 'Compass',
      // description: 'Compass!',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#ffffff',
      theme_color: '#027be3',
      icons: [
        {
          src: 'statics/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png',
        },
        {
          src: 'statics/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'statics/icons/icon-256x256.png',
          sizes: '256x256',
          type: 'image/png',
        },
        {
          src: 'statics/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png',
        },
        {
          src: 'statics/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
  },

  // https://quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
  cordova: {
    // id: 'org.cordova.quasar.app'
    // noIosLegacyBuildFlag: true // uncomment only if you know what you are doing
  },

  // https://quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
  electron: {
    // bundler: 'builder', // or 'packager'

    extendWebpack(/* cfg */) {
      // do something with Electron main process Webpack cfg
      // chainWebpack also available besides this extendWebpack
    },

    packager: {
      // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

      // OS X / Mac App Store
      // appBundleId: '',
      // appCategoryType: '',
      // osxSign: '',
      // protocol: 'myapp://path',

      // Window only
      // win32metadata: { ... }
    },

    builder: {
      // https://www.electron.build/configuration/configuration

      // appId: 'quasar-app'
    },
  },
});
