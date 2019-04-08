import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { dateFormat } from 'common/utils/timeDateUtils';
import { formatValue } from 'common/utils';
import styles from './tooltipContent.scss';

const cx = classNames.bind(styles);

export const TooltipContent = ({
  launchName,
  launchNumber,
  startTime,
  itemCases,
  color,
  itemName,
}) => (
  <React.Fragment>
    <div className={cx('launch-name')}>
      {launchName}
      {launchNumber && ` #${launchNumber}`}
    </div>
    {startTime && <div className={cx('launch-start-time')}>{dateFormat(startTime)}</div>}
    <div className={cx('item-wrapper')}>
      <span className={cx('color-mark')} style={{ backgroundColor: color }} />
      <span className={cx('item-name')}>{`${itemName}:`}</span>
      <span className={cx('item-cases')}>
        <span>{formatValue(itemCases)}%</span>
      </span>
    </div>
  </React.Fragment>
);

TooltipContent.propTypes = {
  launchName: PropTypes.string,
  launchNumber: PropTypes.number,
  startTime: PropTypes.number,
  itemCases: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  itemName: PropTypes.string,
  color: PropTypes.string.isRequired,
};

TooltipContent.defaultProps = {
  launchName: '',
  launchNumber: '',
  startTime: 0,
  itemCases: 0,
  itemName: '',
};
