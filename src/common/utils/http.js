import axios from 'axios';
import _ from 'lodash';
import store from '../../store';
import HTTPErrorWrapper from './http-error-wrapper';
import HTTPResponseWrapper from './http-response-wrapper';
import localizeHTTPStatus from './localize-http-status';

function doesResponseContainLegacyError(response) {
  return typeof response.data.error === 'string';
}

// TODO: Remove this constructor when old API will be removed
function createResponseWrapperAPILegacy(response) {
  const params = {
    data: response.data,
    error: response.data.error,
    status: response.status,
    statusMessage: localizeHTTPStatus(response.status),
    message: '',
    headers: response.headers,
  };
  return new HTTPResponseWrapper(params);
}

function createResponseWrapper(response) {
  const params = {
    data: response.data.data,
    error: response.data.error,
    status: response.data.code,
    statusMessage: response.data.status,
    message: response.data.message,
    headers: response.headers,
  };
  return new HTTPResponseWrapper(params);
}

function doesUserJWTExist() {
  const exists = _.hasIn(store, 'state.user') === true
    && store.state.user.isStoreInitialized === true
    && _.isString(store.state.user.jwt) === true;
  return exists;
}

function injectJWTIntoRequest(config) {
  if (doesUserJWTExist() === true) {
    config.headers.Authorization = `Bearer ${store.state.user.jwt}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
}

function isResponseFromLegacyRoute(axiosConfig) {
  const versionedRouteRegex = /^\/api\/v(\d+).*/gm;
  const isVersionedRoute = versionedRouteRegex.test(axiosConfig.url);
  return isVersionedRoute === false;
}

function createResponseWrapperFromResponse(response) {
  if (doesResponseContainLegacyError(response) === true) {
    return Promise.reject(new HTTPErrorWrapper(response, true));
  }
  if (isResponseFromLegacyRoute(response.config) === true) {
    return Promise.resolve(createResponseWrapperAPILegacy(response));
  }
  return Promise.resolve(createResponseWrapper(response));
}

function createErrorWrapperFromError(error) {
  return Promise.reject(new HTTPErrorWrapper(error, false));
}

const axiosDefaultOptions = {
  // Indicates whether or not cross-site Access-Control requests
  // should be made using credentials
  withCredentials: true,
  // Will be prepended to `url` unless `url` is absolute.
  // It can be convenient to set `baseURL` for an instance of axios to pass relative URLs
  // to methods of that instance. This is mainly use on the Mobile version of the app.
  baseURL: process.env.APP_BASE_URL,
  // Default header
  headers: {
    // The Compass client type like (Desktop, Mobile, APP)
    'Compass-Client-Type': 'Desktop',
    // Include a custom header to specify the Compass client's version
    'Compass-Client-Version': process.env.APP_VERSION,
  },
};

// Specifies the number of milliseconds before the request times out.
// If the request takes longer than `timeout`, the request will be aborted.
axiosDefaultOptions.timeout = process.env.APP_HTTP_REQUEST_TIMEOUT;

const instance = axios.create(axiosDefaultOptions);

instance.interceptors.request.use(
  injectJWTIntoRequest,
  createErrorWrapperFromError,
);
instance.interceptors.response.use(
  createResponseWrapperFromResponse,
  createErrorWrapperFromError,
);

// Export axios instance
export default instance;
