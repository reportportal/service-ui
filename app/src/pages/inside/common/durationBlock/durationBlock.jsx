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

import React, { Component, Fragment } from 'react';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { DottedPreloader } from 'components/preloaders/dottedPreloader';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { getDuration, getApproximateTime } from 'common/utils';
import ClockIcon from './img/clock-icon-inline.svg';
import { DurationTooltip } from '../infoLine/parentInfo/duration/durationTooltip';

import styles from './durationBlock.scss';

const cx = classNames.bind(styles);
export const messages = defineMessages({
  inProgressWithEnd: {
    id: 'DurationBlock.inProgressWithEnd',
    defaultMessage: "Wrong status: 'In progress' with finish time",
  },
  notInProgressWithoutEnd: {
    id: 'DurationBlock.notInProgressWithoutEnd',
    defaultMessage: "Wrong state: item is not 'In progress', but has no finish time",
  },
  inProgress: {
    id: 'DurationBlock.inProgress',
    defaultMessage: 'In progress',
  },
  skipped: {
    id: 'DurationBlock.skipped',
    defaultMessage: 'SKIPPED. Duration: { durationTime }',
  },
  stoppedDuration: {
    id: 'DurationBlock.stoppedDuration',
    defaultMessage: 'Run STOPPED after: { durationTime }.',
  },
  stoppedTime: {
    id: 'DurationBlock.stoppedTime',
    defaultMessage: 'Stopped at: { endTime }',
  },
  interrupted: {
    id: 'DurationBlock.interrupted',
    defaultMessage: 'Run INTERRUPTED after: { durationTime }. Stopped at: { endTime }',
  },
  finishedDuration: {
    id: 'DurationBlock.finishedDuration',
    defaultMessage: 'Duration: { durationTime }.',
  },
  finishedTime: {
    id: 'DurationBlock.finishedTime',
    defaultMessage: 'Finish time: { endTime }',
  },
  overApproximate: {
    id: 'DurationBlock.overApproximate',
    defaultMessage: 'Average executions time - { end }, current overlap - { over }',
  },
  left: {
    id: 'DurationBlock.left',
    defaultMessage: 'left',
  },
  tooltipDescribe: {
    id: 'DurationTooltip.message',
    defaultMessage:
      'Duration is interval between first child starts and last child ends. But if child run in parallel, end time is a time of longest child, in this case duration will not be equal to child duration sum.',
  },
});

export const isInProgress = (status) => status === 'IN_PROGRESS';
export const isStopped = (status) => status === 'STOPPED';
export const isSkipped = (status) => status === 'SKIPPED';
export const isInterrupted = (status) => status === 'INTERRUPTED';

@injectIntl
@withTooltip({
  TooltipComponent: DurationTooltip,
  data: {
    width: 460,
    align: 'left',
    noArrow: true,
    customClassName: cx('tooltip-duration'),
  },
})
export class DurationBlock extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    type: PropTypes.string,
    timing: PropTypes.shape({
      start: PropTypes.number,
      end: PropTypes.number,
      approxTime: PropTypes.number,
    }).isRequired,
    status: PropTypes.string,
    itemNumber: PropTypes.number,
    iconClass: PropTypes.string,
    durationClass: PropTypes.string,
  };

  static defaultProps = {
    type: '',
    status: '',
    itemNumber: null,
    iconClass: '',
    durationClass: '',
  };

  renderInProgressDuration = () => {
    const { timing, intl } = this.props;
    const approxTime = getApproximateTime(timing);
    const approxTimeIsOver = approxTime < 0;

    return (
      <Fragment>
        <span className={cx('in-progress')}>
          <DottedPreloader color="charcoal" />
        </span>

        {timing.approxTime > 0 && !approxTimeIsOver && (
          <span className={cx('duration')}>
            ~{getDuration(Date.now(), timing.start + timing.approxTime * 1000)}{' '}
            {intl.formatMessage(messages.left)}
          </span>
        )}
      </Fragment>
    );
  };

  render() {
    const { timing, iconClass, durationClass, status } = this.props;

    return (
      <div className={cx('duration-block', { error: isStopped(status) || isInterrupted(status) })}>
        <div className={cx('icon', iconClass)}>{Parser(ClockIcon)}</div>
        {isInProgress(status) ? (
          this.renderInProgressDuration()
        ) : (
          <span className={cx('duration', durationClass)}>
            {getDuration(timing.start, timing.end)}
          </span>
        )}
      </div>
    );
  }
}
