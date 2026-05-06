/*
 * Copyright 2026 EPAM Systems
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
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import IconLocked from 'common/img/locked-inline.svg';
import IconUnlocked from 'common/img/unlocked-inline.svg';
import styles from './lockedIcon.scss';

const cx = classNames.bind(styles);

export const LockedIcon = ({ className, locked = true }) => (
  <div className={cx('locked-icon', className)}>
    {Parser(locked ? IconLocked : IconUnlocked)}
  </div>
);

LockedIcon.propTypes = {
  className: PropTypes.string,
  locked: PropTypes.bool,
};

LockedIcon.defaultProps = {
  className: '',
  locked: true,
};
