import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { TooltipContent } from 'components/widgets/common/tooltip';
import styles from './launchDurationTooltip.scss';

const cx = classNames.bind(styles);

export const LaunchDurationTooltip = ({ itemName, duration }) => (
  <TooltipContent itemName={itemName}>
    <div className={cx('duration')}>{duration}</div>
  </TooltipContent>
);
LaunchDurationTooltip.propTypes = {
  itemName: PropTypes.string.isRequired,
  duration: PropTypes.string,
};
LaunchDurationTooltip.defaultProps = {
  itemName: '',
  duration: '',
};
