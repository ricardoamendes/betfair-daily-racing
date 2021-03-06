// horseracing.js
'use strict';

import config from 'config';
import localstorage from 'node-localstorage';

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
            hostname: config.apiHostName,
            path: config.pathName,
            headers: {
                'X-Authentication': localStorage.getItem('ssID')
            }
        };

        // set operation and parameters
        payload = {
            jsonrpc: 2.0,
            id: 1,
            method: `${config.api}/listMarketCatalogue`,
            params: {
                filter: {
                    eventTypeIds: [config.eventTypeId],
                    marketCountries: ['GB', 'IE'],
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
            method: `${config.api}/listMarketBook`,
            params: {
                marketIds: [marketId],
                priceProjection: {
                    priceData: ['EX_BEST_OFFERS']
                }
            }
        };

        // initiate request
        this.connection.request(this.getHeaders(), JSON.stringify(payload), response => response.result && callback(response.result[0]));
    }

    /**
     * Return Betfair betting API request headers
     * @return {Object} Header parameters
     */
    static getHeaders() {
        return {
            hostname: config.apiHostName,
            path: config.pathName,
            headers: {
                'X-Authentication': localStorage.getItem('ssID')
            }
        };
    }

}
