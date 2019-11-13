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
import Parser from 'html-react-parser';
import styles from './textTooltip.scss';

const cx = classNames.bind(styles);

export const TextTooltip = ({ tooltipContent }) => (
  <div className={cx('text-tooltip')}>{Parser(tooltipContent)}</div>
);
TextTooltip.propTypes = {
  tooltipContent: PropTypes.string,
};
TextTooltip.defaultProps = {
  tooltipContent: '',
};
