import moment from 'moment';

export default {
  getLocaleDateShortFormat() {
    return moment.localeData().longDateFormat('LL');
  },
  getLocaleDateLongFormat() {
    return moment.localeData().longDateFormat('LLL');
  },
  formatDateToShortFormat(momentDate) {
    return momentDate.format(this.getLocaleDateShortFormat());
  },
  formatDateToLongFormat(momentDate) {
    return momentDate.format(this.getLocaleDateLongFormat());
  },
  formatHistoricalPeriodDate(date) {
    return moment(date, 'YYYY-MM-DD');
  },
  convertDaysToTimeStamp(days, timezone) {
    const offset = moment.tz(timezone).utcOffset();
    const timestamp = (days * 86400000) + (Math.abs(offset) * 60000);
    return timestamp;
  },
  convertTimeStampToDays(timestamp, timezone) {
    const offset = moment.tz(timezone).utcOffset();
    const days = (timestamp - (Math.abs(offset) * 60000)) / 86400000;
    return parseInt(days, 10);
  },
  convertDateToTimeStamp(date, timezone) {
    return moment(date).tz(timezone, true).valueOf();
  },

};
