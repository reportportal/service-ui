/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { approximateTimeFormat, dateFormat, getDuration, getApproximateTime } from 'common/utils';
import {
  isInProgress,
  isStopped,
  isInterrupted,
  isSkipped,
  messages,
} from 'pages/inside/common/durationBlock/durationBlock';

import styles from './durationTooltip.scss';

const cx = classNames.bind(styles);

export const DurationTooltip = ({ status, timing, type }) => {
  const { formatMessage } = useIntl();

  const getOverApproximateTitle = () => {
    const time = getApproximateTime(timing);
    const end = getDuration(timing.start, timing.start + timing.approxTime * 1000);
    const over = approximateTimeFormat(-time);

    return formatMessage(messages.overApproximate, { end, over });
  };

  const hasStartAndEndTime = () => !!(timing.start && timing.end);
  const hasStartNoEndTime = () => timing.start && !timing.end;

  const isInvalidDuration = () =>
    (isInProgress(status) && hasStartAndEndTime()) ||
    (!isInProgress(status) && hasStartNoEndTime());

  const validateForApproximateTime = () => {
    const isLaunch = type === 'LAUNCH' || !type;

    return isInProgress(status) && isLaunch && timing.approxTime > 0;
  };

  const getStatusTitle = () => {
    const durationTime = getDuration(timing.start, timing.end);
    const endTime = dateFormat(timing.end, true);
    const approxTime = getApproximateTime(timing);
    const approxTimeIsOver = approxTime < 0;

    if (isInvalidDuration()) {
      return formatMessage(
        hasStartAndEndTime() ? messages.inProgressWithEnd : messages.notInProgressWithoutEnd,
      );
    }

    if (isInProgress(status)) {
      if (validateForApproximateTime() && approxTimeIsOver) {
        return getOverApproximateTitle();
      }

      return formatMessage(messages.inProgress);
    }

    if (isSkipped(status)) {
      return formatMessage(messages.skipped, { durationTime });
    }

    if (isStopped(status)) {
      return (
        <>
          <div className={cx('duration-tooltip-status-stopped')}>
            {formatMessage(messages.stoppedDuration, { durationTime })}
          </div>
          <div>{formatMessage(messages.stoppedTime, { endTime })}</div>
        </>
      );
    }

    if (isInterrupted(status)) {
      return formatMessage(messages.interrupted, { durationTime, endTime });
    }

    return (
      <>
        <div>{formatMessage(messages.finishedDuration, { durationTime })}</div>
        <div>{formatMessage(messages.finishedTime, { endTime })}</div>
      </>
    );
  };

  return (
    <div className={cx('duration-tooltip')}>
      <div className={cx('duration-tooltip-status')}>{getStatusTitle()}</div>
      {formatMessage(messages.tooltipDescribe)}
    </div>
  );
};

DurationTooltip.propTypes = {
  intl: PropTypes.object.isRequired,
  type: PropTypes.string,
  timing: PropTypes.shape({
    start: PropTypes.number,
    end: PropTypes.number,
    approxTime: PropTypes.number,
  }).isRequired,
  status: PropTypes.string,
};
