/*
 * Copyright 2020 EPAM Systems
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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './itemListCell.scss';

const cx = classNames.bind(styles);

const defaultFormatter = (value) => String(value);

export const ItemListCell = ({ component: Component, align, bold, withIcon, formatter, value }) => (
  <td className={cx('cell', `align-${align}`, { bold, 'with-icon': withIcon })}>
    {Component ? <Component value={value} /> : formatter(value)}
  </td>
);
ItemListCell.propTypes = {
  component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  value: PropTypes.object,
  label: PropTypes.string,
  formatter: PropTypes.func,
  align: PropTypes.string,
  withIcon: PropTypes.bool,
  bold: PropTypes.bool,
};
ItemListCell.defaultProps = {
  component: null,
  value: null,
  label: null,
  formatter: defaultFormatter,
  align: null,
  withIcon: false,
  bold: false,
};
