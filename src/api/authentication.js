import http from 'src/common/utils/http';

function request(verb, routeURL, requestParameters) {
  return http[verb](routeURL, requestParameters);
}

function get(routeURL, requestParameters) {
  return request('get', routeURL, requestParameters);
}

function getNewToken() {
  return get('/api/v1/authentication/token');
}

export default {
  getNewToken,
};
