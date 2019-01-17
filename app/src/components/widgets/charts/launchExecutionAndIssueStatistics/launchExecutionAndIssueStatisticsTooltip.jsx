import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './launchExecutionAndIssueStatisticsTooltip.scss';

const cx = classNames.bind(styles);

export const LaunchExecutionAndIssueStatisticsTooltip = ({
  launchNumber,
  itemName,
  duration,
  color,
}) => (
  <React.Fragment>
    {launchNumber} {`(${duration}%)`}
    <div className={cx('item-wrapper')}>
      <span className={cx('color-mark')} style={{ backgroundColor: color }} />
      <span className={cx('item-name')}>{itemName}</span>
    </div>
  </React.Fragment>
);

LaunchExecutionAndIssueStatisticsTooltip.propTypes = {
  launchNumber: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  itemName: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
};
