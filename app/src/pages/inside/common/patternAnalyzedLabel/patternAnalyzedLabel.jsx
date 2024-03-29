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
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { PatternAnalyzedTooltip } from './patternAnalyzedTooltip';
import styles from './patternAnalyzedLabel.scss';

const cx = classNames.bind(styles);

export const PatternAnalyzedLabel = withTooltip({
  TooltipComponent: PatternAnalyzedTooltip,
  data: {
    dynamicWidth: true,
  },
})(({ className = '' }) => <div className={cx('pa-label', className)}>PA</div>);

PatternAnalyzedLabel.propTypes = {
  patternTemplates: PropTypes.array,
};

PatternAnalyzedLabel.defaultProps = {
  patternTemplates: [],
};
