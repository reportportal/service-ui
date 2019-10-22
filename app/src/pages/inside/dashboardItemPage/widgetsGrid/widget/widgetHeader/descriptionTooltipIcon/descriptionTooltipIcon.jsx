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

import { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { ALIGN_LEFT } from 'components/main/tooltips/constants';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import TooltipIcon from 'common/img/tooltip-icon-inline.svg';
import styles from './descriptionTooltipIcon.scss';

const cx = classNames.bind(styles);

@withHoverableTooltip({
  TooltipComponent: TextTooltip,
  data: {
    width: 300,
    align: ALIGN_LEFT,
    leftOffset: -50,
    noArrow: true,
  },
})
export class DescriptionTooltipIcon extends Component {
  static propTypes = {
    tooltipContent: PropTypes.string,
  };
  static defaultProps = {
    tooltipContent: '',
  };

  render() {
    return (
      <div className={cx('description-tooltip-icon')} content={this.props.tooltipContent}>
        {Parser(TooltipIcon)}
      </div>
    );
  }
}
