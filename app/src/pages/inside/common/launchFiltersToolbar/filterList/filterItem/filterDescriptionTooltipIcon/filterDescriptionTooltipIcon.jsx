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
import Parser from 'html-react-parser';
import { ALIGN_LEFT } from 'components/main/tooltips/constants';
import { withTooltip } from 'components/main/tooltips/tooltip';
import TooltipIcon from 'common/img/tooltip-icon-inline.svg';
import { MarkdownTooltip } from 'components/main/tooltips/markdownTooltip';
import styles from './filterDescriptionTooltipIcon.scss';

const cx = classNames.bind(styles);

export const FilterDescriptionTooltipIcon = withTooltip({
  TooltipComponent: MarkdownTooltip,
  data: {
    align: ALIGN_LEFT,
    leftOffset: -50,
    noArrow: true,
    dynamicWidth: true,
  },
})(() => <div className={cx('filter-tooltip-icon')}>{Parser(TooltipIcon)}</div>);
