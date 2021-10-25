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
import { injectIntl, defineMessages } from 'react-intl';
import Link from 'redux-first-router-link';
import classNames from 'classnames/bind';
import track from 'react-tracking';
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
  levelSelector,
} from 'controllers/testItem';
import { debugModeSelector } from 'controllers/launch';
import { pageEventsMap } from 'components/main/analytics';
import { uniqueErrorsLinkSelector } from 'controllers/testItem/selectors';
import { analyzerExtensionsSelector } from 'controllers/appInfo';
import styles from './viewTabs.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [LIST_VIEW]: {
    id: 'ViewTabs.listView',
    defaultMessage: 'List view',
  },
  [LOG_VIEW]: {
    id: 'ViewTabs.logView',
    defaultMessage: 'Log view',
  },
  [UNIQUE_ERRORS_VIEW]: {
    id: 'ViewTabs.uniqueErrorsView',
    defaultMessage: 'Unique errors',
  },
  [HISTORY_VIEW]: {
    id: 'ViewTabs.historyView',
    defaultMessage: 'History',
  },
  disabledAnalyzer: {
    id: 'ViewTabs.disabledAnalyzer',
    defaultMessage: 'Service ANALYZER is not running',
  },
});

@track()
@connect((state) => ({
  debugMode: debugModeSelector(state),
  listViewLink: listViewLinkSelector(state),
  logViewLink: logViewLinkSelector(state),
  historyViewLink: historyViewLinkSelector(state),
  uniqueErrorsLink: uniqueErrorsLinkSelector(state),
  isAnalyzerAvailable: !!analyzerExtensionsSelector(state).length,
  level: levelSelector(state),
}))
@injectIntl
export class ViewTabs extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    debugMode: PropTypes.bool,
    isTestItemsList: PropTypes.bool,
    viewMode: PropTypes.string,
    logViewLink: PropTypes.object,
    listViewLink: PropTypes.object,
    historyViewLink: PropTypes.object,
    uniqueErrorsLink: PropTypes.object,
    isAnalyzerAvailable: PropTypes.bool,
    level: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    debugMode: false,
    isTestItemsList: false,
    viewMode: LIST_VIEW,
    logViewLink: {},
    listViewLink: {},
    historyViewLink: {},
    uniqueErrorsLink: {},
    isAnalyzerAvailable: false,
    level: '',
  };

  getPages = () => {
    const {
      listViewLink,
      logViewLink,
      historyViewLink,
      uniqueErrorsLink,
      debugMode,
      isTestItemsList,
      intl: { formatMessage },
      isAnalyzerAvailable,
      level,
    } = this.props;
    const events = pageEventsMap[level] || {};

    const pages = [
      {
        id: LIST_VIEW,
        title: formatMessage(messages[LIST_VIEW]),
        link: listViewLink,
        icon: ListIcon,
        available: true,
        disabled: false,
        hint: '',
        event: events.LIST_VIEW_TAB,
      },
      {
        id: UNIQUE_ERRORS_VIEW,
        title: formatMessage(messages[UNIQUE_ERRORS_VIEW]),
        link: uniqueErrorsLink,
        icon: ListIcon,
        available: true,
        disabled: !isAnalyzerAvailable,
        hint: !isAnalyzerAvailable ? formatMessage(messages.disabledAnalyzer) : '',
      },
      {
        id: LOG_VIEW,
        title: formatMessage(messages[LOG_VIEW]),
        link: logViewLink,
        icon: LogIcon,
        available: !isTestItemsList,
        disabled: false,
        hint: '',
        event: events.LOG_VIEW_TAB,
      },
      {
        id: HISTORY_VIEW,
        title: formatMessage(messages[HISTORY_VIEW]),
        link: historyViewLink,
        icon: HistoryIcon,
        available: !debugMode,
        disabled: false,
        hint: '',
        event: events.HISTORY_VIEW_TAB,
      },
    ];

    return pages.filter((page) => page.available);
  };

  render() {
    const { viewMode, tracking } = this.props;
    const pages = this.getPages();

    return (
      <div className={cx('view-tabs')}>
        {pages.map((page) => {
          return (
            <Link
              key={page.id}
              to={page.link}
              title={page.hint}
              shouldDispatch={!page.disabled}
              className={cx('view-tab-link', {
                active: viewMode === page.id && !page.disabled,
                disabled: page.disabled,
              })}
              onClick={() => page.event && tracking.trackEvent(page.event)}
            >
              {page.icon && <i className={cx('icon')}>{Parser(page.icon)}</i>}
              {page.title}
            </Link>
          );
        })}
      </div>
    );
  }
}
