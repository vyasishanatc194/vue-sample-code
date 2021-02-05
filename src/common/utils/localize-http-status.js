import { i18n } from '../../boot/i18n';

function getLocalizeHTTPStatus(statusCode) {
  let message = '';
  switch (statusCode) {
    case 200:
      message = i18n.t('common.utils.localizeHTTPStatus.done');
      break;
    case 201:
      message = i18n.t('common.utils.localizeHTTPStatus.created');
      break;
    case 400:
      message = i18n.t('common.utils.localizeHTTPStatus.badRequest');
      break;
    case 401:
      message = i18n.t('common.utils.localizeHTTPStatus.unauthenticated');
      break;
    case 403:
      message = i18n.t('common.utils.localizeHTTPStatus.unauthorized');
      break;
    case 404:
      message = i18n.t('common.utils.localizeHTTPStatus.notFound');
      break;
    case 503:
      message = i18n.t('common.utils.localizeHTTPStatus.serviceUnavailable');
      break;
    case 504:
      message = i18n.t('common.utils.localizeHTTPStatus.gatewayTimeout');
      break;
    default:
      message = i18n.t('common.utils.localizeHTTPStatus.unknownError');
      break;
  }
  return message;
}

export default getLocalizeHTTPStatus;
