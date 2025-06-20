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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import BinIcon from 'common/img/bin-icon-inline.svg';
import styles from './deleteFilterButton.scss';

const cx = classNames.bind(styles);

export const DeleteFilterButton = ({ onDelete, filter, disabled }) => (
  <div className={cx('bin-icon', { disabled })} onClick={disabled ? null : () => onDelete(filter)}>
    {Parser(BinIcon)}
  </div>
);
DeleteFilterButton.propTypes = {
  onDelete: PropTypes.func,
  filter: PropTypes.object,
  disabled: PropTypes.bool,
};
DeleteFilterButton.defaultProps = {
  onDelete: () => {},
  filter: {},
  disabled: false,
};
