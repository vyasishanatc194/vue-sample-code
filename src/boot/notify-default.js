import { Notify } from 'quasar';

export default ({ app }) => {
  // Setting default configuration that will apply to all Notifications
  // Ref: https://quasar.dev/quasar-plugins/notify#Installation
  Notify.setDefaults({
    position: 'bottom',
    timeout: 0,
    textColor: 'white',
    actions: [{
      label: app.i18n.t('boot.notifyDefault.close'),
      icon: 'close',
      color: 'white',
    }],
  });
};
