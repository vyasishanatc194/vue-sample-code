import http from 'src/common/utils/http';

export default ({ Vue }) => {
  Vue.prototype.$http = http;
};
