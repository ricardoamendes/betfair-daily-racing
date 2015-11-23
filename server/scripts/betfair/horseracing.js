// horseracing.js
'use strict';

import localstorage from 'node-localstorage';

// Horse racing type
const EVENT_TYPE_ID = 7;
const API = 'SportsAPING/v1.0';
const HOST_NAME = 'api.betfair.com';
const PATH_NAME = '/exchange/betting/json-rpc/v1';

var localStorage = new localstorage.LocalStorage('./storage');

/**
 * Betfair Horse Racing API interface.
 */
export default class HorseRacing {
    /**
     * Initializes the horse racing class.
     * @param  {Object} connection The connection handler instance
     * @return {void}
     */
    static init(connection) {
        this.connection = connection;
    }

    /**
     * Requests horse racing events (UK,IRE) for the day.
     * @param  {Function} callback Response handler.
     * @return {void}
     */
    static getDailyEvents(callback) {
        var payload,
            headers,
            actualDate = new Date(),
            endOfDayDate = new Date(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDate(), 23, 59, 59);

        headers = {
            hostname: HOST_NAME,
            path: PATH_NAME,
            headers: {
                'X-Authentication': localStorage.getItem('ssID')
            }
        };

        // set operation and parameters
        payload = {
            jsonrpc: 2.0,
            id: 1,
            method: `${API}/listMarketCatalogue`,
            params: {
                filter: {
                    eventTypeIds: [EVENT_TYPE_ID],
                    marketCountries: ['GB', 'IRE'],
                    marketTypeCodes: ['WIN'],
                    marketStartTime: {
                        from: actualDate.toJSON()
                            //to: endOfDayDate.toJSON()
                    }
                },
                sort: 'FIRST_TO_START',
                maxResults: '50',
                marketProjection: ['EVENT', 'COMPETITION', 'RUNNER_DESCRIPTION', 'MARKET_START_TIME']
            }
        };

        // initiate request
        this.connection.request(this.getHeaders(), JSON.stringify(payload), response => callback(response));
    }

    /**
     * Requests market prices with max depth 1.
     * @param  {String}   marketId The desired market id
     * @param  {Function} callback Response handler.
     * @return {void}
     */
    static getMarketPrices(marketId, callback) {

        // set operation and parameters
        var payload = {
            jsonrpc: 2.0,
            id: 1,
            method: `${API}/listMarketBook`,
            params: {
                marketIds: [marketId],
                priceProjection: {
                    priceData: ['EX_BEST_OFFERS']
                }
            }
        };

        // initiate request
        this.connection.request(this.getHeaders(), JSON.stringify(payload), response => callback(response.result[0]));
    }

    /**
     * Return Betfair betting API request headers
     * @return {Object} Header parameters
     */
    static getHeaders() {
        return {
            hostname: HOST_NAME,
            path: PATH_NAME,
            headers: {
                'X-Authentication': localStorage.getItem('ssID')
            }
        };
    }

}
