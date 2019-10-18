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

import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import SquarePlusIcon from 'common/img/square-plus-inline.svg';
import SquareMinusIcon from 'common/img/square-minus-inline.svg';

import styles from './toggler.scss';

const cx = classNames.bind(styles);

export const Toggler = ({ disabled, expanded, onToggleExpand }) => (
  <div className={cx('toggler', { disabled })} onClick={onToggleExpand}>
    {!disabled && Parser(expanded ? SquareMinusIcon : SquarePlusIcon)}
  </div>
);
Toggler.propTypes = {
  expanded: PropTypes.bool,
  onToggleExpand: PropTypes.func,
  disabled: PropTypes.bool,
};
Toggler.defaultProps = {
  expanded: false,
  onToggleExpand: () => {},
  disabled: false,
};
