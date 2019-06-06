import moment from 'moment';
import PropTypes from 'prop-types';
import { DEFAULT_DATE_FORMAT } from 'common/constants/dateFormats';

export const getWeekRange = (date = '') => {
  const endDate = moment(date).format(DEFAULT_DATE_FORMAT);
  const startDate = moment(date)
    .subtract(1, 'week')
    .format(DEFAULT_DATE_FORMAT);

  return `${startDate} - ${endDate}`;
};

getWeekRange.propTypes = {
  date: PropTypes.string.isRequired,
};
