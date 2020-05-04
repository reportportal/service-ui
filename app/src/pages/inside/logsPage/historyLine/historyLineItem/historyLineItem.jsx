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

import React, { Component } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Link from 'redux-first-router-link';
import classNames from 'classnames/bind';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { payloadSelector, PROJECT_LOG_PAGE, PROJECT_USERDEBUG_LOG_PAGE } from 'controllers/pages';
import { NOT_FOUND } from 'common/constants/testStatuses';
import { debugModeSelector } from 'controllers/launch';
import { defectTypesSelector } from 'controllers/project';
import { HistoryLineItemContent } from './historyLineItemContent';
import styles from './historyLineItem.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  pagePayload: payloadSelector(state),
  debugMode: debugModeSelector(state),
  defectTypes: defectTypesSelector(state),
}))
@track()
export class HistoryLineItem extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    defectTypes: PropTypes.object.isRequired,
    launchNumber: PropTypes.number,
    path: PropTypes.string,
    launchId: PropTypes.number,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    active: PropTypes.bool,
    isFirstItem: PropTypes.bool,
    isLastItem: PropTypes.bool,
    pagePayload: PropTypes.object,
    debugMode: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    path: '',
    launchNumber: null,
    launchId: 0,
    id: 0,
    status: '',
    active: false,
    isFirstItem: false,
    isLastItem: false,
    debugMode: false,
    pagePayload: {},
  };

  checkIfTheLinkIsActive = () => {
    const { status, isLastItem } = this.props;

    return !(status === NOT_FOUND || isLastItem);
  };

  createHistoryLineItemLink = () => {
    const { pagePayload, path, launchId, debugMode } = this.props;

    const parentIds = path.split('.');

    return {
      type: debugMode ? PROJECT_USERDEBUG_LOG_PAGE : PROJECT_LOG_PAGE,
      payload: {
        ...pagePayload,
        testItemIds: [launchId, ...parentIds].join('/'),
      },
    };
  };

  render() {
    const { launchNumber, active, ...rest } = this.props;

    return (
      <div className={cx('history-line-item', { active })}>
        <Link
          className={cx('history-line-item-title', {
            'active-link': this.checkIfTheLinkIsActive(),
          })}
          to={this.checkIfTheLinkIsActive() ? this.createHistoryLineItemLink() : ''}
          onClick={() => this.props.tracking.trackEvent(LOG_PAGE_EVENTS.HISTORY_LINE_ITEM)}
        >
          <span className={cx('launch-title')}>{'launch '}</span>
          <span>#{launchNumber}</span>
        </Link>
        <HistoryLineItemContent
          active={active}
          hasChildren={rest.hasChildren}
          startTime={rest.startTime}
          endTime={rest.endTime}
          {...rest}
        />
      </div>
    );
  }
}
