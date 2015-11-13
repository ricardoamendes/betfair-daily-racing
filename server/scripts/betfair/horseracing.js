// horseracing.js
'use strict';

// Horse racing type
const EVENT_TYPE_ID = 7;

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
        var actualDate = new Date(),
            endOfDayDate = new Date(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDate(), 23, 59, 59);

        var filters = {
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
            maxResults: '10',
            marketProjection: ['EVENT', 'COMPETITION', 'RUNNER_DESCRIPTION', 'MARKET_START_TIME']
        };

        this.connection.request('listMarketCatalogue', filters, (response) => {

            for (let i = 0; i < response.result.length; i++) {

                // format date
                response.result[i].marketStartTime = this.formatDate(new Date(response.result[i].marketStartTime));
            }

            callback(response);
        });
    }

    static formatDate(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime;
    }

    /**
     * Requests market prices with max depth 1.
     * @param  {String}   marketId The desired market id
     * @param  {Function} callback Response handler.
     * @return {void}
     */
    static getMarketPrices(marketId, callback) {

        var filters = {
            marketIds: [marketId],
            priceProjection: {
                priceData: ['EX_BEST_OFFERS'],
                exBestOfferOverRides: {
                    bestPricesDepth: 1,
                    rollupModel: 'STAKE',
                    rollupLimit: 20
                },
                virtualise: false,
                rolloverStakes: false
            },
            orderProjection: 'ALL',
            matchProjection: 'ROLLED_UP_BY_PRICE'
        };

        this.connection.request('listMarketBook', filters, (response) => {

            callback(response.result[0]);
        });
    }

}
