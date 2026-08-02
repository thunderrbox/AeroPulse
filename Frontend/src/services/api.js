import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';


//custom axios client
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  //this tells the browser to include cookies when sending requests to the backend
  headers: {
    'Content-Type': 'application/json', //this tells the backend that the request body contains JSON
  },
});

// Request interceptor —> for injecting access token
//an interceptor is basically that block of code which axios runs before every requst
api.interceptors.request.use(
  (config) => {   //it is the request configuration object that the Axios is about to send

    //     {    //config contains this
    //   method: 'get',
    //   url: '/bookings',
    //   headers: { ... }
    // }
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor —> handle 401 & auto refresh
let isRefreshing = false;
let failedQueue = [];  // stores waiting Promises for requests that received 401 while token refresh is already in progress

//this queue is implemented so that only a single request can hit /auth/refresh at a particular time and the others get pused in the failed queue
// it resolves all waiting requests with a new token if refresh succeeds,
// or rejects all waiting requests if refresh fails.
const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];  //after all the requests have been handled , make the queue empty
};


api.interceptors.response.use(
  (response) => response,   //if a response succeeds , return it normally without changing anything
  async (error) => {
    const originalRequest = error.config;

    const requestUrl = originalRequest?.url || "";

// login, register, and refresh requests must never trigger token refresh.
 const isAuthRequest =
  requestUrl.includes("/auth/login") ||
  requestUrl.includes("/auth/register") ||
  requestUrl.includes("/auth/refresh");

    //if the backend returned 401 unauthorized and this request has not already been retrired , then try refreshing the access token
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {

      if (isRefreshing) {  //some request is using the /auth/refresh api right now so admit current request in the failed queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {         // runs when refresh succeeds and this waiting request receives the new token
            originalRequest.headers.Authorization = `Bearer ${token}`;  //set the same token
            return api(originalRequest);  //the same request is sent again
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;  //mark the original request as already retried
      isRefreshing = true; //lock refresh so that other failed request join the queue


      //now we will call the refresh end point
      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {}, //no request body needed
          { withCredentials: true }   //the refresh tokens is sent automatically because of this
        );

        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);

        //update axios's default authorization header for future requests
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        //since refresh token request has been succeeded therefore we will pass on this new token to every requetst present in the failed queue
        processQueue(null, newToken);  

        //the original request is not present in the failed queue , therefore we will process it seperately
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);   //resend the request with new token

      } catch (refreshError) {
        processQueue(refreshError, null);  //all queueed requests are rejected because no new token is avalaible
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        // don't redirect if already on auth pages
        if (
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')
        ) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;  //unlocking refresh handling for future requests
      }
    }

    return Promise.reject(error);
  }
);

export default api;
