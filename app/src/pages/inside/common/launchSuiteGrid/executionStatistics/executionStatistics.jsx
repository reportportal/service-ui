import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './executionStatistics.scss';
import { StatisticsLink } from './statisticsLink';

const cx = classNames.bind(styles);

export const ExecutionStatistics = ({ value, title, bold, itemId, statuses }) => (
  <div className={cx('execution-statistics')}>
    <span className={cx('title')}>{title.full}</span>
    {!!Number(value) && (
      <StatisticsLink itemId={itemId} statuses={statuses} className={cx('value', { bold })}>
        {value}
      </StatisticsLink>
    )}
  </div>
);

ExecutionStatistics.propTypes = {
  value: PropTypes.string.isRequired,
  title: PropTypes.object,
  bold: PropTypes.bool,
  itemId: PropTypes.string.isRequired,
  statuses: PropTypes.arrayOf(PropTypes.string).isRequired,
};
ExecutionStatistics.defaultProps = {
  bold: false,
  title: {},
};
