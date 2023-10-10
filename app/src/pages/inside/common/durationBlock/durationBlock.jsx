/*
 * Copyright 2023 EPAM Systems
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
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { DottedPreloader } from 'components/preloaders/dottedPreloader';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { getDuration, getApproximateTime } from 'common/utils';
import ClockIcon from './img/clock-icon-inline.svg';
import { DurationTooltip } from '../infoLine/parentInfo/duration/durationTooltip/durationTooltip';
import { messages } from './messages';
import { isInProgress, isStopped, isInterrupted } from './utils';

import styles from './durationBlock.scss';

const cx = classNames.bind(styles);

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
