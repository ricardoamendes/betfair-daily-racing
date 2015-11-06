// horseracing.js
'use strict';

const EVENT_TYPE_ID = 7;

/**
 * Betfair Horse Racing API interface.
 */
class HorseRacing {
  /**
   * Initializes the horse racing class.
   * @param  {Class} connection The connection handler instance
   * @return {void}
   */
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * Requests a list containing horse racing events (UK,IRE) for the day.
   * @return {Object}
   */
  getDailyHorseRacingEvents(callback) {
    var actualDate = new Date(),
      endOfDayDate = new Date(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDate(), 23, 59, 59);

    var filters = {
      filter: {
        eventTypeIds: [EVENT_TYPE_ID],
        marketCountries: ['GB', 'IRE'],
        marketTypeCodes: ['WIN'],
        marketStartTime: {
          from: actualDate.toJSON(),
          to: endOfDayDate.toJSON()
        }
      },
      sort: 'FIRST_TO_START',
      maxResults: '100',
      marketProjection: ['EVENT', 'COMPETITION', 'RUNNER_DESCRIPTION']
    };

    this.connection.request('listMarketCatalogue', filters, callback);
  }
}

module.exports = HorseRacing;
