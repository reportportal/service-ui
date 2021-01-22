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

import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { DurationBlock } from 'pages/inside/common/durationBlock';
import { DurationTooltip } from './durationTooltip';
import styles from './duration.scss';

const cx = classNames.bind(styles);

@withTooltip({
  TooltipComponent: DurationTooltip,
  data: {
    width: 420,
    align: 'left',
    noArrow: true,
  },
})
export class Duration extends Component {
  static propTypes = {
    status: PropTypes.string,
    startTime: PropTypes.number,
    endTime: PropTypes.number,
    approxTime: PropTypes.number,
  };

  static defaultProps = {
    status: '',
    startTime: null,
    endTime: null,
    approxTime: null,
  };

  render() {
    const { status, startTime, endTime, approxTime } = this.props;
    return (
      <span className={cx('duration-block')}>
        <DurationBlock
          status={status}
          timing={{
            start: startTime,
            end: endTime,
            approxTime,
          }}
          iconClass={cx('icon')}
          durationClass={cx('duration')}
        />
      </span>
    );
  }
}
