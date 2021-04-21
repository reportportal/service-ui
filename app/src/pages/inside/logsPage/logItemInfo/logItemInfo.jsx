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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import track from 'react-tracking';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  activeLogSelector,
  historyItemsSelector,
  activeRetryIdSelector,
  retriesSelector,
  RETRY_ID,
  NAMESPACE,
} from 'controllers/log';
import RetryIcon from 'common/img/retry-inline.svg';
import { connectRouter } from 'common/utils';
import { LogItemInfoTabs } from './logItemInfoTabs';
import { Retry } from './retry';
import { DefectDetails } from './defectDetails';
import styles from './logItemInfo.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  retries: {
    id: 'LogItemInfo.retries',
    defaultMessage: 'Retries',
  },
});

@connect((state) => ({
  logItem: activeLogSelector(state),
  historyItems: historyItemsSelector(state),
  retryItemId: activeRetryIdSelector(state),
  retries: retriesSelector(state),
}))
@track()
@connectRouter(
  () => {},
  {
    updateRetryId: (id) => ({ [RETRY_ID]: id }),
  },
  { namespace: NAMESPACE },
)
@injectIntl
export class LogItemInfo extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    onChangePage: PropTypes.func.isRequired,
    onChangeLogLevel: PropTypes.func.isRequired,
    historyItems: PropTypes.array.isRequired,
    fetchFunc: PropTypes.func.isRequired,
    onToggleSauceLabsIntegrationView: PropTypes.func.isRequired,
    isSauceLabsIntegrationView: PropTypes.bool.isRequired,
    debugMode: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    logItem: PropTypes.object,
    updateRetryId: PropTypes.func,
    retryItemId: PropTypes.number,
    retries: PropTypes.arrayOf(PropTypes.object),
  };
  static defaultProps = {
    logItem: null,
    updateRetryId: () => {},
    retryItemId: null,
    retries: [],
  };

  hasRetries = () => {
    const { retries } = this.props;
    return retries.length > 1;
  };
  isDefectTypeVisible = () => {
    const { logItem } = this.props;
    return logItem.issue && logItem.issue.issueType;
  };
  addExtraSpaceTop = () => this.isDefectTypeVisible() && this.hasRetries();

  renderRetries = () => {
    const { retryItemId, retries } = this.props;
    return retries.map((item, index) => {
      const selected = item.id === retryItemId;
      const retryNumber = index + 1;
      const updateActiveRetry = () => {
        this.props.tracking.trackEvent(LOG_PAGE_EVENTS.RETRY_CLICK);
        this.props.updateRetryId(item.id);
      };
      return (
        <Retry
          key={item.id}
          retry={item}
          index={retryNumber}
          selected={selected}
          onClick={updateActiveRetry}
        />
      );
    });
  };
  render() {
    const {
      logItem,
      loading,
      fetchFunc,
      onChangePage,
      onChangeLogLevel,
      onToggleSauceLabsIntegrationView,
      isSauceLabsIntegrationView,
      debugMode,
      intl: { formatMessage },
    } = this.props;

    return (
      logItem && (
        <div className={cx('log-item-info')}>
          <div className={cx('details')}>
            <DefectDetails logItem={logItem} debugMode={debugMode} fetchFunc={fetchFunc} />
            {this.hasRetries() && (
              <div
                className={cx('retries', {
                  'extra-space-top': this.addExtraSpaceTop(),
                })}
              >
                <span className={cx('caption')}>
                  <span className={cx('retry-icon')}>{Parser(RetryIcon)}</span>
                  {formatMessage(messages.retries)}
                </span>
                {this.renderRetries()}
              </div>
            )}
          </div>
          <LogItemInfoTabs
            onChangePage={onChangePage}
            onChangeLogLevel={onChangeLogLevel}
            onToggleSauceLabsIntegrationView={onToggleSauceLabsIntegrationView}
            isSauceLabsIntegrationView={isSauceLabsIntegrationView}
            loading={loading}
          />
        </div>
      )
    );
  }
}
