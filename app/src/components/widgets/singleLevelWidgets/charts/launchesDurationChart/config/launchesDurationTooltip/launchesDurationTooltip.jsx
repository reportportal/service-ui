import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { TooltipContent } from 'components/widgets/common/tooltip';
import styles from './launchesDurationTooltip.scss';

const cx = classNames.bind(styles);

export const LaunchesDurationTooltip = ({ itemName, duration }) => (
  <TooltipContent itemName={itemName}>
    <div className={cx('duration')}>{duration}</div>
  </TooltipContent>
);
LaunchesDurationTooltip.propTypes = {
  itemName: PropTypes.string.isRequired,
  duration: PropTypes.string,
};
LaunchesDurationTooltip.defaultProps = {
  itemName: '',
  duration: '',
};
