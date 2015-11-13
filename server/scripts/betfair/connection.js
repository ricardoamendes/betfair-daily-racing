// connection.js
'use strict';

import https from 'https';

const FIRST_INDEX = 0;
const DEFAULT_ENCODING = 'utf-8';
const DEFAULT_JSON_FORMAT = '\t';
const API = 'SportsAPING/v1.0';
const HOST_NAME = 'api.betfair.com';
const PATH_NAME = '/exchange/betting/json-rpc/v1';

/**
 * Betfair connection handler API.
 */
export default class Connection {

    /**
     * Set defaults to connect to the Betfair betting API.
     * @param  {String} appKey Betfair API Application Key
     * @param  {String} ssID   Betfair session token
     * @return {void}
     */
    static init(appKey, ssID) {

        // paths and headers
        this.options = {
            hostname: HOST_NAME,
            port: 443,
            path: PATH_NAME,
            method: 'POST',
            headers: {
                'X-Application': appKey,
                'Accept': 'application/json',
                'Content-type': 'application/json',
                'X-Authentication': ssID
            }
        };

        // json request
        this.payload = {
            jsonrpc: 2.0,
            id: 1
        };
    }

    /**
     * Perform a request to the Betfair betting API.
     * @param  {String} operation Method name
     * @param  {Object} filters   Request parameters
     * @param  {Object} callback  Callback handler
     * @return {void}
     */
    static request(operation, filters, callback) {
        var response,
            request;

        // response handler
        response = res => {
            let str = '';
            res.setEncoding(DEFAULT_ENCODING)
                .on('data', chunk => {
                    str += chunk;
                })
                .on('end', chunk => {
                    let response = JSON.parse(str);
                    if (this.isValid(response)) {
                        callback(response);
                    }
                });
        };

        // create request
        request = https.request(this.options, response);
        request.on('error', e => {
            console.log('Problem with request: ' + e.message);
        });

        // set operation, parameters and finalizes request
        this.payload.method = `${API}/${operation}`;
        this.payload.params = filters;
        request.write(JSON.stringify(this.payload), DEFAULT_ENCODING);
        request.end();
    }

    /**
     * Checks for error messages e.g. invalid session token.
     * @param  {Object} response The API response
     * @return {Boolean} Returns true when errors found.
     */
    static isValid(response) {
        // Check for errors in response body
        // Can not be checked against status code as jsonrpc will always return 200
        if (typeof response.error === 'object') {

            // When error contains solely two fields it will not provide a detailed
            // message on the exception thrown from API-NG
            if (Object.keys(response.error).length > 2) {
                console.log("Request error", JSON.stringify(response, null, DEFAULT_JSON_FORMAT));
                console.log("Exception Details:", JSON.stringify(response.error.data.APINGException, null, DEFAULT_JSON_FORMAT));
            }
            return false;
        }
        return true;
    }
}
