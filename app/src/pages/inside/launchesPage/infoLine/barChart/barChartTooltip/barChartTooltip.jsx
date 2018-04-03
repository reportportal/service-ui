import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styles from './barChartTooltip.scss';

const cx = classNames.bind(styles);

export const BarChartTooltip = ({ passed, failed, skipped }) => (
  <div className={cx('bar-chart-tooltip')}>
    <div className={cx('stats-item')}>
      <FormattedMessage id="BarChartTooltip.passed" defaultMessage="Passed:" />
      <span>{ `${passed.toFixed(2)}%` }</span>
    </div>
    <div className={cx('stats-item')}>
      <FormattedMessage id="BarChartTooltip.failed" defaultMessage="Failed:" />
      <span>{ `${failed.toFixed(2)}%` }</span>
    </div>
    <div className={cx('stats-item')}>
      <FormattedMessage id="BarChartTooltip.skipped" defaultMessage="Skipped:" />
      <span>{ `${skipped.toFixed(2)}%` }</span>
    </div>
  </div>
  );

BarChartTooltip.propTypes = {
  passed: PropTypes.number.isRequired,
  failed: PropTypes.number.isRequired,
  skipped: PropTypes.number.isRequired,
};
