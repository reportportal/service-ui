import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { dateFormat } from 'common/utils/timeDateUtils';
import styles from '../common/tooltip/tooltipContent/tooltipContent.scss';

const cx = classNames.bind(styles);

export const FailedCasesTooltipContent = ({
  launchName,
  launchNumber,
  startTime,
  itemCases,
  itemCasesSuffix,
  color,
  itemName,
}) => (
  <React.Fragment>
    <div className={cx('launch-name')}>{`${launchName} #${launchNumber}`}</div>
    <div className={cx('launch-start-time')}>{dateFormat(startTime)}</div>
    <div className={cx('item-wrapper')}>
      <span className={cx('color-mark')} style={{ backgroundColor: color }} />
      <span className={cx('item-name')}>{`${itemName}:`}</span>
      <span className={cx('item-cases')}>
        <span>{`${itemCases} ${itemCasesSuffix}`}</span>
      </span>
    </div>
  </React.Fragment>
);

FailedCasesTooltipContent.propTypes = {
  launchName: PropTypes.string,
  launchNumber: PropTypes.number,
  startTime: PropTypes.number,
  itemCases: PropTypes.number,
  itemCasesSuffix: PropTypes.string,
  itemName: PropTypes.string,
  color: PropTypes.string.isRequired,
};

FailedCasesTooltipContent.defaultProps = {
  launchName: '',
  launchNumber: '',
  startTime: 0,
  itemCases: 0,
  itemCasesSuffix: '',
  itemName: '',
};
