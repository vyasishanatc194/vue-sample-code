import { i18n } from '../boot/i18n';

import HTTPErrorWrapper from '../common/utils/http-error-wrapper';

function MessageSpecifications(message, html = false) {
  this.message = message;
  this.html = html;
}

function isErrorType(error) {
  return error instanceof Error;
}

function isHTTPErrorWrapper(error) {
  return error instanceof HTTPErrorWrapper;
}

function isErrorStringType(error) {
  return typeof error === 'string';
}

function isBackendValidationError(error) {
  return isHTTPErrorWrapper(error) === true
    && typeof error.data === 'object'
    && Array.isArray(error.data.data) === true
    && error.data.data.length > 0
    && typeof error.data.data[0].location === 'string';
}

function getMessageSpecsOfBackendValidationError(validationError) {
  const errors = validationError.data.data;
  let htmlError = `${i18n.t('plugins.notifyResponse.validationErrors')}<ul>`;
  errors.forEach((error) => {
    htmlError += `<li>${error.msg}</li>`;
  });
  htmlError += '</ul>';
  return new MessageSpecifications(htmlError, true);
}

function getStringMessage(error) {
  return new MessageSpecifications(error, false);
}

function getErrorMessage(error) {
  return new MessageSpecifications(error.message, false);
}

function getMessageSpecifications(error) {
  if (isErrorStringType(error) === true) {
    return getStringMessage(error);
  }

  if (isBackendValidationError(error) === true) {
    return getMessageSpecsOfBackendValidationError(error);
  }

  if (isErrorType(error) === true) {
    return getErrorMessage(error);
  }

  const type = typeof error;
  throw new Error(i18n.t('plugins.notifyResponse.invalidErrorType', { type }));
}

function showSuccessNotification(message) {
  return this.prototype.$q.notify({
    timeout: this.prototype.$alertTimeoutMs,
    color: 'positive',
    message,
    icon: 'thumb_up',
  });
}

function showErrorNotification(error) {
  const messageSpecification = getMessageSpecifications(error);
  return this.prototype.$q.notify({
    color: 'negative',
    message: messageSpecification.message,
    html: messageSpecification.html,
    icon: 'report_problem',
  });
}

export default {
  install(Vue) {
    Vue.prototype.$showSuccessNotification = showSuccessNotification.bind(Vue);
    Vue.showSuccessNotification = showSuccessNotification.bind(Vue);

    Vue.prototype.$showErrorNotification = showErrorNotification.bind(Vue);
    Vue.showErrorNotification = showErrorNotification.bind(Vue);
  },
};
