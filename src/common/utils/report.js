// Export all functions of this module
export default {
  /**
   * Convert report's frequency to string representation
   *
   * @param {Function} languageFct Language conversion function
   * @param {String} reportConfig Database report's configuration
   * @returns Returns the report's configuration to string otherwise 'deactivated'.
   */
  mailFrequencyToString(languageFct, reportConfig) {
    if (reportConfig.interval_hour) {
      return languageFct('common.utils.report.frequencyHour');
    } if (reportConfig.interval_day) {
      return languageFct('common.utils.report.frequencyDay');
    } if (reportConfig.interval_week) {
      return languageFct('common.utils.report.frequencyWeek');
    } if (reportConfig.interval_month) {
      return languageFct('common.utils.report.frequencyMonth');
    }
    return languageFct('common.utils.report.frequencyDeactivated');
  },

  /**
   * Get list of report's frequency to present them in a list
   *
   * @param {Function} languageFct Language conversion function
   * @returns Returns the list of available report's email configuration frequency.
   */
  mailGetFrequencyList(languageFct) {
    return [
      {
        interval_hour: 1,
        interval_day: 0,
        interval_week: 0,
        interval_month: 0,
        name: languageFct('common.utils.report.frequencyHour'),
      },
      {
        interval_hour: 0,
        interval_day: 1,
        interval_week: 0,
        interval_month: 0,
        name: languageFct('common.utils.report.frequencyDay'),
      },
      {
        interval_hour: 0,
        interval_day: 0,
        interval_week: 1,
        interval_month: 0,
        name: languageFct('common.utils.report.frequencyWeek'),
      },
      {
        interval_hour: 0,
        interval_day: 0,
        interval_week: 0,
        interval_month: 1,
        name: languageFct('common.utils.report.frequencyMonth'),
      },
      {
        interval_hour: 0,
        interval_day: 0,
        interval_week: 0,
        interval_month: 0,
        name: languageFct('common.utils.report.frequencyDeactivated'),
      },
    ].map(x => ({
      label: x.name,
      value: x,
    }));
  },

  /**
   * Convert report's frequency to string representation
   *
   * @param {Function} mailFrequencyToList Mail frequency list items, must be
   * retrieved using the mailGetFrequencyList function
   * @param {String} reportConfig Database report's configuration
   * @returns Returns the mail frequency list item that match with
   * report's configuration.
   */
  mailFrequencyToListElement(mailFrequencyToList, reportConfig) {
    if (reportConfig.interval_hour) {
      return mailFrequencyToList[0];
    } if (reportConfig.interval_day) {
      return mailFrequencyToList[1];
    } if (reportConfig.interval_week) {
      return mailFrequencyToList[2];
    } if (reportConfig.interval_month) {
      return mailFrequencyToList[3];
    }
    return mailFrequencyToList[4];
  },

};
