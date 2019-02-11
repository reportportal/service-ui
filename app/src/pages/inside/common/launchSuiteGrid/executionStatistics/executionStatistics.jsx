import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { StatisticsLink } from 'pages/inside/common/statisticsLink';
import styles from './executionStatistics.scss';

const cx = classNames.bind(styles);

export const ExecutionStatistics = ({ value, title, bold, itemId, statuses, ownLinkParams }) => (
  <div className={cx('execution-statistics')}>
    <span className={cx('title')}>{title.full}</span>
    {!!Number(value) && (
      <StatisticsLink
        itemId={itemId}
        statuses={statuses}
        className={cx('value', { bold })}
        ownLinkParams={ownLinkParams}
      >
        {value}
      </StatisticsLink>
    )}
  </div>
);

ExecutionStatistics.propTypes = {
  value: PropTypes.number,
  title: PropTypes.object,
  bold: PropTypes.bool,
  itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  statuses: PropTypes.arrayOf(PropTypes.string).isRequired,
  ownLinkParams: PropTypes.shape({
    isOtherPage: PropTypes.bool,
    payload: PropTypes.object,
    page: PropTypes.string,
  }),
};
ExecutionStatistics.defaultProps = {
  bold: false,
  title: {},
  value: null,
  ownLinkParams: {},
};
