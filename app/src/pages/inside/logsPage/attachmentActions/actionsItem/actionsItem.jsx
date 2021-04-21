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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import styles from './actionsItem.scss';

const cx = classNames.bind(styles);

export const ActionsItem = ({ caption, hidden, icon, action, showCaption }) => (
  <span title={caption} onClick={hidden ? null : action} className={cx('actions-item', { hidden })}>
    <span className={cx('icon')}>{Parser(icon)}</span>
    {showCaption && <span className={cx('caption')}>{caption}</span>}
  </span>
);
ActionsItem.propTypes = {
  caption: PropTypes.string,
  hidden: PropTypes.bool,
  showCaption: PropTypes.bool,
  icon: PropTypes.any,
  action: PropTypes.func,
};
ActionsItem.defaultProps = {
  caption: '',
  hidden: false,
  showCaption: false,
  icon: '',
  action: null,
};
