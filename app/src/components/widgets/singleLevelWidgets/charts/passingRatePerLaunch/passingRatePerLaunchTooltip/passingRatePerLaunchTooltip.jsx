import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { TooltipWrapper } from '../../../../common/tooltip/tooltipWrapper';
import styles from './passingRatePerLaunchTooltip.scss';

const cx = classNames.bind(styles);

export const PassingRatePerLaunchTooltip = ({ launchPercent, launchNumber, color, itemName }) => (
  <TooltipWrapper>
    <div className={cx('launch-name')}>{`${launchNumber} (${launchPercent}%)`}</div>
    <div className={cx('item-wrapper')}>
      <span className={cx('color-mark')} style={{ backgroundColor: color }} />
      <span className={cx('item-name')}>{`${itemName}`}</span>
    </div>
  </TooltipWrapper>
);

PassingRatePerLaunchTooltip.propTypes = {
  launchPercent: PropTypes.string,
  launchNumber: PropTypes.number,
  itemName: PropTypes.string,
  color: PropTypes.string.isRequired,
};

PassingRatePerLaunchTooltip.defaultProps = {
  launchPercent: '',
  launchNumber: 0,
  itemName: '',
};
