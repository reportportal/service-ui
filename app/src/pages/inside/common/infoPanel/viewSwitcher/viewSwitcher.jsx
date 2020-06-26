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
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import LogIcon from 'common/img/log-view-inline.svg';
import ListIcon from 'common/img/list-view-tiny-inline.svg';
import { LIST_VIEW, LOG_VIEW } from 'controllers/testItem';
import styles from './viewSwitcher.scss';

const cx = classNames.bind(styles);

export const ViewSwitcher = ({ viewMode, onToggleView }) => (
  <div className={cx('view-switcher')}>
    <button
      className={cx('switcher-button', viewMode === LIST_VIEW ? 'list-view-active' : 'list-view')}
      onClick={() => viewMode === LOG_VIEW && onToggleView(LIST_VIEW)}
    >
      <i className={cx('icon')}>{Parser(ListIcon)}</i>
    </button>
    <button
      className={cx('switcher-button', viewMode === LOG_VIEW ? 'log-view-active' : 'log-view')}
      onClick={() => viewMode === LIST_VIEW && onToggleView(LOG_VIEW)}
    >
      <i className={cx('icon')}>{Parser(LogIcon)}</i>
    </button>
  </div>
);

ViewSwitcher.propTypes = {
  viewMode: PropTypes.string,
  onToggleView: PropTypes.func.isRequired,
};

ViewSwitcher.defaultProps = {
  viewMode: LIST_VIEW,
};
