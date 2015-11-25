// session.js
'use strict';

import config from 'config';
import localstorage from 'node-localstorage';

var localStorage = new localstorage.LocalStorage('./storage');

/**
 * Betfair session API interface.
 */
export default class Session {
    /**
     * Initializes session.
     * @param  {Object} connection The connection handler instance
     * @return {void}
     */
     static init(connection, username, password) {
         this.connection = connection;
         this.username = username;
         this.password = password;

         // revalidate session token continuosly
         setInterval(() => this.keepAlive(), config.keepAliveInterval);
     }

     /**
      * Login user to Betfair.
      * @param  {Function} callback Successul login callback.
      * @return {void}
      */
     static authenticate(callback) {
         var headers,
             payload;

         // build payload data
         payload = `username=${this.username}&password=${this.password}`;

         // prepare request headers
         headers = {
             hostname: config.ssoHostName,
             path: '/api/login',
             headers: {
                 'Content-type': 'application/x-www-form-urlencoded'
             }
         };

         // initiate request
         this.connection.request(headers, payload, (response) => {

             this.setSessionToken(response);

             callback(response.token);
         });
     }

     /**
      * Extend the session timeout period.
      * @param  {Function} callback Successful keepalive callback.
      * @return {void}
      */
     static keepAlive() {

         // prepare request headers
         var headers = {
             hostname: config.ssoHostName,
             path: '/api/keepAlive',
             headers: {
                 'X-Authentication': localStorage.getItem('ssID')
             }
         };

         // initiate request
         this.connection.request(headers, '', response => this.setSessionToken(response));
     }

     /**
      * Determines invalid sessions or expiry cases.
      * @param  {Object}  response Server response.
      * @return {Boolean}          True if invalid session.
      */
     static isInvalidSession(response) {

         if (typeof response.error === 'object' &&
             response.error.data &&
             response.error.data.APINGException) {

             if (response.error.data.APINGException.errorCode === 'INVALID_SESSION_INFORMATION') {
                 return true;
             }
         }

         if (typeof response.error === 'string' &&
             response.error == 'NO_SESSION') {
             return true;
         }

         return false;
     }

     /**
      * Persist session token.
      * @param {void}
      */
     static setSessionToken(response) {

         if (response.status === 'SUCCESS' && response.token) {
             localStorage.setItem('ssID', response.token);
         }
     }

     /**
      * Returns Session class host.
      * @param {String} The host name
      */
     static getHostName(response) {
         return config.ssoHostName;
     }

}
