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

import React, { Component } from 'react';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Link from 'redux-first-router-link';
import classNames from 'classnames/bind';
import LogIcon from 'common/img/log-view-inline.svg';
import HistoryIcon from 'common/img/history-inline.svg';
import ListIcon from 'common/img/stack-trace-inline.svg';
import {
  LOG_VIEW,
  LIST_VIEW,
  HISTORY_VIEW,
  UNIQUE_ERRORS_VIEW,
  listViewLinkSelector,
  logViewLinkSelector,
  historyViewLinkSelector,
} from 'controllers/testItem';
import { debugModeSelector } from 'controllers/launch';
import styles from './viewTabs.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  debugMode: debugModeSelector(state),
  listViewLink: listViewLinkSelector(state),
  logViewLink: logViewLinkSelector(state),
  historyViewLink: historyViewLinkSelector(state),
}))
export class ViewTabs extends Component {
  static propTypes = {
    debugMode: PropTypes.bool,
    isTestItemsList: PropTypes.bool,
    viewMode: PropTypes.string,
    logViewLink: PropTypes.object,
    listViewLink: PropTypes.object,
    historyViewLink: PropTypes.object,
  };

  static defaultProps = {
    debugMode: false,
    isTestItemsList: false,
    viewMode: LIST_VIEW,
    logViewLink: {},
    listViewLink: {},
    historyViewLink: {},
  };

  getPages = () => {
    const { listViewLink, logViewLink, historyViewLink, debugMode, isTestItemsList } = this.props;

    const pages = [
      {
        id: LIST_VIEW,
        title: 'List view',
        link: listViewLink,
        icon: ListIcon,
        available: true,
      },
      {
        id: UNIQUE_ERRORS_VIEW,
        title: 'Unique errors',
        link: listViewLink,
        icon: ListIcon,
        available: !isTestItemsList,
      },
      {
        id: LOG_VIEW,
        title: 'Parent logs',
        link: logViewLink,
        icon: LogIcon,
        available: !isTestItemsList,
      },
      {
        id: HISTORY_VIEW,
        title: 'History',
        link: historyViewLink,
        icon: HistoryIcon,
        available: !debugMode,
      },
    ];

    return pages.filter((page) => page.available);
  };

  render() {
    const { viewMode } = this.props;
    const pages = this.getPages();

    return (
      <div className={cx('view-tabs')}>
        {pages.map((page) => (
          <Link
            key={page.id}
            to={page.link}
            className={cx('view-tab-link', { active: viewMode === page.id })}
          >
            {page.icon && <i className={cx('icon')}>{Parser(page.icon)}</i>}
            {page.title}
          </Link>
        ))}
      </div>
    );
  }
}
