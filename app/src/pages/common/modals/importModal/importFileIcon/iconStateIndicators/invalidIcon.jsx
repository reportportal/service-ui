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
import Parser from 'html-react-parser';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import WarningIcon from 'common/img/error-inline.svg';
import { InvalidIconTooltip } from './invalidIconTooltip';
import styles from './iconStateIndicators.scss';

const cx = classNames.bind(styles);

@withHoverableTooltip({
  TooltipComponent: InvalidIconTooltip,
  data: {
    width: 160,
    desktopOnly: true,
  },
})
export class InvalidIcon extends Component {
  static propTypes = {
    rejectMessage: PropTypes.string,
  };

  static defaultProps = {
    rejectMessage: '',
  };

  render() {
    return <div className={cx('indicator-icon')}>{Parser(WarningIcon)}</div>;
  }
}
