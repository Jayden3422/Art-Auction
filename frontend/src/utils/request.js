import axios from "axios";
import Cookie from 'js-cookie';
const devBaseURL = '/api1';
const apiPort = process.env.VUE_APP_APP_PORT || '3000';
const prodBaseURL = `${window.location.protocol}//${window.location.hostname}:${apiPort}`;
const baseURL = process.env.NODE_ENV === 'development' ? devBaseURL : prodBaseURL;
const instance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'X-Custom-Header': 'foobar',
    'token': Cookie.get('token')
  }
});
// Add a response interceptor
instance.interceptors.response.use(function (response) {
  // Do something with the response data
  return response;
}, function (error) {
  // Do something with the response error
  // Common processing after successfully receiving the response data, such as closing the loading window

  return response
}, error => {
  /***** Start processing for an exception response *****/
  if (error && error.response) {
    // 1. Common error handling
    // 2. Specific processing based on the response code
    switch (error.response.status) {
      case 400:
        error.message = 'Bad request'
        break;
      case 401:
        error.message = 'Unauthorized, please log in again'
        break;
      case 403:
        error.message = 'Access denied'
        break;
      case 404:
        error.message = 'Request error, resource not found'
        window.location.href = "/NotFound"
        break;
      case 405:
        error.message = 'Request method not allowed'
        break;
      case 408:
        error.message = 'Request timeout'
        break;
      case 500:
        error.message = 'Server error'
        break;
      case 501:
        error.message = 'Network not available'
        break;
      case 502:
        error.message = 'Network error'
        break;
      case 503:
        error.message = 'Service unavailable'
        break;
      case 504:
        error.message = 'Network timeout'
        break;
      case 505:
        error.message = 'HTTP version does not support this request'
        break;
      default:
        error.message = `Connection error ${error.response.status}`
    }
  } else {
    // Timeout handling
    if (JSON.stringify(error).includes('timeout')) {
      Message.error('Server response timeout, please refresh the current page')
    }
    error.message = 'Failed to connect to the server'
  }

  Message.error(error.message)
  // Processing completed
  return Promise.reject(error);
});
export default instance
