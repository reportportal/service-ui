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
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { withTooltip } from 'components/main/tooltips/tooltip';
import Parser from 'html-react-parser';
import styles from './messageBadge.scss';

const cx = classNames.bind(styles);

const MessageBadgeToolTip = ({ data }) => (
  <div className={cx('tooltip-content')}>
    {data.map((item) => (
      <div className={cx('content-container')} key={item.ticketId}>
        <span>{item.ticketId}</span>
      </div>
    ))}
  </div>
);
MessageBadgeToolTip.propTypes = {
  data: PropTypes.array,
};
MessageBadgeToolTip.defaultProps = {
  data: [],
};

@withTooltip({
  TooltipComponent: MessageBadgeToolTip,
  data: {
    width: 235,
    placement: 'right',
    noArrow: true,
    desktopOnly: true,
  },
})
export class MessageBadge extends Component {
  static propTypes = {
    data: PropTypes.array,
    icon: PropTypes.string,
  };

  static defaultProps = {
    data: [],
    icon: '',
  };

  render() {
    const { icon } = this.props;

    return <i className={cx('icon')}>{Parser(icon)}</i>;
  }
}
