import _ from 'lodash';
import VueAnalytics from 'vue-analytics';

// To get application name and version
const packageJSON = require('../../package.json');

export default ({ router, store, Vue }) => {
  const isKeyDefined = !_.isEmpty(process.env.APP_GOOGLE_ANALYTICS.KEY);
  const isDebug = process.env.DEV && isKeyDefined;
  const isSendHitTask = isDebug
    ? isKeyDefined && Boolean(process.env.APP_GOOGLE_ANALYTICS.SEND_HIT_TASK || false)
    : isKeyDefined && Boolean(process.env.APP_GOOGLE_ANALYTICS.SEND_HIT_TASK || true);
  const isTrace = isDebug
    && isKeyDefined
    && Boolean(process.env.APP_GOOGLE_ANALYTICS.TRACE || false);
  Vue.use(VueAnalytics, {
    // Disable plugin if no key is defined
    disabled: !isKeyDefined,
    // The measurement ID / web property ID. The format is UA-XXXX-Y.
    // All collected data is associated by this ID
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference
    id: process.env.APP_GOOGLE_ANALYTICS.KEY || 'UA-XXXX-Y',
    // Instance of Vue Router
    router,
    // Debug mode settings
    debug: {
      // Debug version of Google Analytics file
      enabled: isDebug,
      // Enable tracing when on debug mode
      trace: isTrace,
      // Send hit information to Google Analytics servers when on debug
      sendHitTask: isSendHitTask,
    },
    set: [{
      // User-id information set to empty string
      field: 'userId', value: '',
    }, {
      // Custom dimension for User-id information is set to empty string
      field: 'dimension1', value: '',
    },
    ],
  });

  // Logic to execute after each route
  router.afterEach(() => {
    // Send user-id an property to Google Analytics
    const userIdStr = typeof store.state.user.userId === 'number'
      ? store.state.user.userId.toString()
      : '';
    Vue.$ga.set({
      appName: packageJSON.productName,
      appVersion: packageJSON.version,
      userId: userIdStr,
      dimension1: userIdStr,
      language: store.state.user.language,
    });
  });
};
