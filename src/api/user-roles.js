import http from 'src/common/utils/http';

function request(verb, routeURL, requestParameters) {
  return http[verb](routeURL, requestParameters);
}

function get(routeURL, requestParameters) {
  return request('get', routeURL, requestParameters);
}

export default {
  getList() {
    return get('/api/v1/user-roles/');
  },
};
