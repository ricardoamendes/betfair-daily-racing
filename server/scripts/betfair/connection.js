// connection.js
'use strict';

import _ from 'lodash';
import config from 'config';
import localstorage from 'node-localstorage';
import https from 'https';
import session from './session';

var localStorage = new localstorage.LocalStorage('./storage');

/**
 * Betfair connection handler API.
 */
export default class Connection {

    /**
     * Initialize and set defaults to connect to the Betfair services.
     * @param  {String} appKey  Betfair API Application Key
     * @param  {Object} options Set of options e.g. logging for http requests.
     * @return {void}
     */
    static init(appKey, options) {
        this.appKey = appKey;
        this.retryAttempts = 0;
        this.options = {
            logger: true
        };
    }

    /**
     * Initiate an http request.
     * @param  {Object} headers   Request headers
     * @param  {Object} payload   Request parameters
     * @param  {Object} callback  Callback handler
     * @return {void}
     */
    static request(headers, payload, callback) {
        var response,
            request,
            requestHeaders = _.merge(this.getDefaultHeaders(), headers);

        // if (this.options.logger) {
        //
        //     let log = {
        //         date: new Date().toUTCString(),
        //         host: requestHeaders.hostname,
        //         path: requestHeaders.path,
        //         method: requestHeaders.hostname === session.getHostName() ? 'NA' : JSON.parse(payload).method
        //     };
        //
        //     console.log(`${log.date} - Request - Host ${log.host} | Path ${log.path} | Method ${log.method}`);
        // }

        // create request
        request = https.request(requestHeaders, (response) => {
            this.responseHandler.apply(this, [response, headers, payload, callback]);
        });

        // handle connection errors
        request.on('error', e => {
            if (!this.options.logger) {
                ['Request Failure',
                JSON.stringify(e.message, null, ' ')].map(msg => console.log(msg));
            }
        });

        // set request payload
        request.write(payload, 'utf-8');

        // finishes sending the request
        request.end();
    }

    /**
     * Handle incoming chunks, retry attempts, session state and final response.
     * @param  {Object} response  The request response instance
     * @param  {Object} headers   Request headers
     * @param  {Object} payload   Request parameters
     * @param  {Object} callback  Callback handler
     * @return {void}
     */
    static responseHandler(response, headers, payload, callback) {
        var data = '',
            retry,
            onResponseEnd;

        // build original call for retry attempts
        retry = (ssID) => {

            // retries request along with a fresh session token
            this.request.apply(this, [_.merge(headers, {
                headers: {
                    'X-Authentication': ssID
                }
            }), payload, callback]);
        };

        // response end event handler
        onResponseEnd = (chunk) => {

            // scoped response
            let response = JSON.parse(data);

            // session expired ?
            if (session.isInvalidSession(response)) {

                if (this.options.logger) {
                    console.log('Retrying...');
                }

                // check attempted retries
                if (this.retryAttempts <= config.retryLimit) {
                    this.retryAttempts += 1; // + try
                    session.authenticate(retry);
                }

                return;
            }

            // valid response ?
            if (this.isValid(response)) {

                this.retryAttempts = 0; // reset
                callback(response);

                return;
            }

            if (this.options.logger) {
                ['Invalid Response',
                JSON.stringify(headers, null, ' '),
                JSON.stringify(payload, null, ' '),
                JSON.stringify(response, null, ' ')].map(msg => console.log(msg));
            }
        };

        // listen and handle incoming response data
        response.setEncoding('utf-8')
            .on('data', chunk => data += chunk)
            .on('end', onResponseEnd);
    }

    /**
     * Return Betfair request headers defaults.
     * @return {Object} Header parameters
     */
    static getDefaultHeaders() {
        return {
            port: 443,
            method: 'POST',
            headers: {
                'X-Application': this.appKey,
                'Accept': 'application/json'
            }
        };
    }

    /**
     * Whether the response provided is valid or not.
     * @param  {Object} response The server response
     * @return {Boolean} Returns true when errors found.
     */
    static isValid(response) {

        // when no response state available verify existing errors
        return typeof response.error === 'undefined' || !response.error.length;
    }
}
