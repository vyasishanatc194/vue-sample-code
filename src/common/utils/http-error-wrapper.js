import { i18n } from '../../boot/i18n';

import localizeHTTPStatus from './localize-http-status';

function isConnectionTimeoutAxiosError(axiosError) {
  return axiosError.message.toString().indexOf('timeout') !== -1;
}

function getLocalizedTimeoutAxiosErrorMessage(axiosError) {
  const millisecondsInOneMinute = 60000;
  const timeoutInMinutes = (axiosError.config.timeout / millisecondsInOneMinute);
  const message = i18n.t('common.utils.httpErrorWrapper.axiosConnectionTimeout', { timeoutMin: timeoutInMinutes });
  return message;
}

function getLocalizedConnectionAbortedAxiosErrorMessage() {
  const message = i18n.t('common.utils.httpErrorWrapper.axiosConnectionAborted');
  return message;
}

function getAxiosInternalErrorLocalizedMessage(axiosError) {
  // https://github.com/axios/axios/blob/v0.19.2/lib/core/createError.js#L15
  if (axiosError.message === 'Network Error') {
    return i18n.t('common.utils.httpErrorWrapper.networkError');
  }

  if (axiosError.code === 'ECONNABORTED') {
    if (isConnectionTimeoutAxiosError(axiosError) === true) {
      return getLocalizedTimeoutAxiosErrorMessage(axiosError);
    }
    return getLocalizedConnectionAbortedAxiosErrorMessage();
  }

  return i18n.t('common.utils.httpErrorWrapper.axiosUnknownError', { error: axiosError.message });
}

function isErrorLocalOrNoResponseFromServer(error) {
  return typeof error.response === 'undefined'
    && typeof error.request !== 'undefined';
}

function isSettingUpRequestError(error) {
  return typeof error.response === 'undefined'
    && typeof error.request === 'undefined';
}

function getErrorLegacySimulatedMessage(error) {
  return error.data.error;
}

function isErrorReceivedFromUnknowServerOrUnknowError(error) {
  return typeof error.response.data !== 'object';
}

function isErrorSendThroughJSendSpecifications(error) {
  return typeof error.response.data === 'object'
    && typeof error.response.data.program === 'string';
}

function getErrorResponseStatus(error) {
  if (typeof error.response === 'undefined') {
    return error.status;
  }
  return error.response.status;
}

function getErrorResponseData(error, isLegacyError) {
  if (isLegacyError === true) {
    return error.data;
  }
  if (typeof error.response === 'undefined') {
    return null;
  }
  return error.response.data;
}

function getMessageFromErrorData(error, isLegacyError) {
  if (isLegacyError === true) {
    return getErrorLegacySimulatedMessage(error);
  }

  if (isErrorLocalOrNoResponseFromServer(error) === true
    || isSettingUpRequestError(error) === true) {
    return getAxiosInternalErrorLocalizedMessage(error);
  }

  if (isErrorReceivedFromUnknowServerOrUnknowError(error) === true) {
    return localizeHTTPStatus(getErrorResponseStatus(error));
  }

  if (isErrorSendThroughJSendSpecifications(error) === true) {
    return error.response.data.message;
  }

  return localizeHTTPStatus(getErrorResponseStatus(error));
}

function HTTPErrorWrapper(error, isLegacyError) {
  Error.call(this);
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, HTTPErrorWrapper);
  }
  this.name = 'ErrorWrapper';
  this.date = new Date();
  this.isLegacyError = isLegacyError;
  this.code = null;
  this.status = getErrorResponseStatus(error);
  this.statusMessage = localizeHTTPStatus(this.status);
  this.message = getMessageFromErrorData(error, isLegacyError);
  this.data = getErrorResponseData(error, isLegacyError);
}
HTTPErrorWrapper.prototype = Object.create(Error.prototype);
HTTPErrorWrapper.prototype.constructor = HTTPErrorWrapper;

export default HTTPErrorWrapper;
