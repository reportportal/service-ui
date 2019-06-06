import moment from 'moment';
import PropTypes from 'prop-types';
import { DATE_FORMAT_TOOLTIP } from 'common/constants/timeDateFormat';

export const getWeekRange = (date = '') => {
  const endDate = moment(date).format(DATE_FORMAT_TOOLTIP);
  const startDate = moment(date)
    .subtract(1, 'week')
    .format(DATE_FORMAT_TOOLTIP);

  return `${startDate} - ${endDate}`;
};

getWeekRange.propTypes = {
  date: PropTypes.string.isRequired,
};
