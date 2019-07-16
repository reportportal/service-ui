/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { Component, Fragment } from 'react';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { approximateTimeFormat, dateFormat, getDuration } from 'common/utils';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import moment from 'moment';
import PropTypes from 'prop-types';
import InProgressGif from 'common/img/item-in-progress.gif';
import ClockIcon from './img/clock-icon-inline.svg';

import styles from './durationBlock.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
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
  stopped: {
    id: 'DurationBlock.stopped',
    defaultMessage: 'Run STOPPED after: { durationTime }. Stopped at: { endTime }',
  },
  interrupted: {
    id: 'DurationBlock.interrupted',
    defaultMessage: 'Run INTERRUPTED after: { durationTime }. Stopped at: { endTime }',
  },
  finished: {
    id: 'DurationBlock.finished',
    defaultMessage: 'Duration: { durationTime }. Finish time: { endTime }',
  },
  overApproximate: {
    id: 'DurationBlock.overApproximate',
    defaultMessage: 'Average executions time - { end }, current overlap - { over }',
  },
  left: {
    id: 'DurationBlock.left',
    defaultMessage: 'left',
  },
});

@injectIntl
export class DurationBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
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

  getStatusTitle = () => {
    const { intl, timing } = this.props;
    const { formatMessage } = intl;
    const durationTime = getDuration(timing.start, timing.end);
    const endTime = dateFormat(timing.end, true);
    const approxTime = this.getApproximateTime();
    const approxTimeIsOver = approxTime < 0;

    if (this.isInvalidDuration()) {
      return formatMessage(
        this.hasStartAndEndTime() ? messages.inProgressWithEnd : messages.notInProgressWithoutEnd,
      );
    }

    if (this.isInProgress()) {
      if (this.validateForApproximateTime() && approxTimeIsOver) {
        return this.getOverApproximateTitle();
      }

      return formatMessage(messages.inProgress);
    }

    if (this.isSkipped()) {
      return formatMessage(messages.skipped, { durationTime });
    }

    if (this.isStopped()) {
      return formatMessage(messages.stopped, { durationTime, endTime });
    }

    if (this.isInterrupted()) {
      return formatMessage(messages.interrupted, { durationTime, endTime });
    }

    return formatMessage(messages.finished, { durationTime, endTime });
  };

  getOverApproximateTitle = () => {
    const { intl, timing } = this.props;
    const time = this.getApproximateTime();
    const end = getDuration(timing.start, timing.start + timing.approxTime * 1000);
    const over = approximateTimeFormat(-time);

    return intl.formatMessage(messages.overApproximate, { end, over });
  };

  getApproximateTime = () => {
    const { timing } = this.props;
    const approxTime = Math.round(timing.approxTime * 1000);

    return Math.round((timing.start + approxTime - moment().unix() * 1000) / 1000);
  };

  isInvalidDuration = () =>
    (this.isInProgress() && this.hasStartAndEndTime()) ||
    (!this.isInProgress() && this.hasStartNoEndTime());

  hasStartAndEndTime = () => !!(this.props.timing.start && this.props.timing.end);
  hasStartNoEndTime = () => this.props.timing.start && !this.props.timing.end;

  isInProgress = () => this.props.status === 'IN_PROGRESS';
  isStopped = () => this.props.status === 'STOPPED';
  isSkipped = () => this.props.status === 'SKIPPED';
  isInterrupted = () => this.props.status === 'INTERRUPTED';

  validateForApproximateTime = () => {
    const { type } = this.props;
    const isLaunch = type === 'LAUNCH' || !type;

    return this.isInProgress() && isLaunch;
  };

  renderInProgressDuration = () => {
    const { timing, intl } = this.props;
    const approxTime = this.getApproximateTime();
    const approxTimeIsOver = approxTime < 0;

    return (
      <Fragment>
        <span className={cx('in-progress')}>
          <img src={InProgressGif} alt="In progress" />
        </span>

        {timing.approxTime > 0 &&
          !approxTimeIsOver && (
            <span className={cx('duration')}>
              ~{getDuration(Date.now(), timing.start + timing.approxTime * 1000)}{' '}
              {intl.formatMessage(messages.left)}
            </span>
          )}
      </Fragment>
    );
  };

  render() {
    const { timing, iconClass, durationClass } = this.props;

    return (
      <div
        className={cx('duration-block', { error: this.isStopped() || this.isInterrupted() })}
        title={this.getStatusTitle()}
      >
        <div className={cx('icon', iconClass)}>{Parser(ClockIcon)}</div>
        {this.isInProgress() ? (
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
