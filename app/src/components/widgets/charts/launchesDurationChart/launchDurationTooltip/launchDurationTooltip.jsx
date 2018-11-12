import React from 'react';
import PropTypes from 'prop-types';
import { duration } from 'moment';
import classNames from 'classnames/bind';
import { isValueInterrupted } from '../../common/utils';
import styles from './launchDurationTooltip.scss';

const cx = classNames.bind(styles);

export const LaunchDurationTooltip = ({ launchData, timeType }) => {
  const abs = Math.abs(launchData.duration / timeType.value);
  const humanDuration = duration(abs, timeType.type).humanize(true);
  return (
    <React.Fragment>
      <div className={cx('launch-name')}>
        {launchData.name} #{launchData.number}
      </div>
      <div className={cx('launch-duration')}>
        {isValueInterrupted(launchData) ? launchData.text.widgets.launchInterrupted : humanDuration}
      </div>
    </React.Fragment>
  );
};

LaunchDurationTooltip.propTypes = {
  launchData: PropTypes.object.isRequired,
  timeType: PropTypes.object.isRequired,
};
