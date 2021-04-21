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
import Parser from 'html-react-parser';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import TooltipIcon from 'common/img/tooltip-icon-inline.svg';
import { DescriptionTooltip } from './descriptionTooltip';
import styles from './description.scss';

const cx = classNames.bind(styles);

@withHoverableTooltip({
  TooltipComponent: DescriptionTooltip,
  data: {
    width: 420,
    placement: 'bottom-start',
    noArrow: true,
  },
})
export class Description extends Component {
  static propTypes = {
    description: PropTypes.string,
  };

  static defaultProps = {
    description: '',
  };

  render() {
    return (
      <div className={cx('description-block')}>
        <div className={cx('description-icon')}>{Parser(TooltipIcon)}</div>
      </div>
    );
  }
}
