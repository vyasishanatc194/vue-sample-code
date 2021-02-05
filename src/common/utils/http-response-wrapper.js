function HTTPResponseWrapper({
  data,
  error,
  status,
  statusMessage,
  message,
  headers,
}) {
  this.data = data;
  this.error = error;
  this.status = status;
  this.statusMessage = statusMessage;
  this.message = message;
  this.headers = headers;
}
HTTPResponseWrapper.prototype = Object.create(Object.prototype);
HTTPResponseWrapper.prototype.constructor = HTTPResponseWrapper;

export default HTTPResponseWrapper;
