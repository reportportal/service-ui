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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import track from 'react-tracking';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { NoItemMessage } from 'components/main/noItemMessage';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { dateFormat } from 'common/utils';
import {
  logStackTraceItemsSelector,
  logStackTraceLoadingSelector,
  fetchLogPageStackTrace,
  isLoadMoreStackTraceVisible,
} from 'controllers/log';
import { StackTraceMessageBlock } from 'pages/inside/common/stackTraceMessageBlock';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './stackTrace.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  messageRefCaption: {
    id: 'StackTrace.messageRefCaption',
    defaultMessage: 'Go to stack trace in log message',
  },
  noStackTrace: {
    id: 'StackTrace.noStackTrace',
    defaultMessage: 'No stack trace to display',
  },
  loadLabel: {
    id: 'StackTrace.loadLabel',
    defaultMessage: 'Load more',
  },
});

const MAX_ROW_HEIGHT = 120;
const SCROLL_HEIGHT = 300;
const LOAD_MORE_HEIGHT = 32;

@connect(
  (state) => ({
    items: logStackTraceItemsSelector(state),
    loading: logStackTraceLoadingSelector(state),
    loadMore: isLoadMoreStackTraceVisible(state),
  }),
  {
    fetchLogPageStackTrace,
  },
)
@injectIntl
@track()
export class StackTrace extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    items: PropTypes.array,
    loading: PropTypes.bool,
    fetchLogPageStackTrace: PropTypes.func,
    loadMore: PropTypes.bool,
    logItem: PropTypes.object,
    hideTime: PropTypes.bool,
    minHeight: PropTypes.number,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    items: [],
    loading: false,
    fetchLogPageStackTrace: () => {},
    loadMore: false,
    logItem: {},
    hideTime: false,
    minHeight: SCROLL_HEIGHT,
  };

  componentDidMount() {
    if (this.isItemsExist()) {
      return;
    }
    this.fetchItems();
  }

  getScrolledHeight = () =>
    this.props.loadMore ? this.props.minHeight - LOAD_MORE_HEIGHT : this.props.minHeight;

  getMaxRowHeight = () => {
    const { items } = this.props;
    const scrolledHeight = this.getScrolledHeight();
    if (scrolledHeight && items.length && scrolledHeight > items.length * MAX_ROW_HEIGHT) {
      return scrolledHeight / items.length;
    }
    return MAX_ROW_HEIGHT;
  };

  fetchItems = () => this.props.fetchLogPageStackTrace(this.props.logItem);

  loadMore = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.LOAD_MORE_CLICK_STACK_TRACE);
    this.fetchItems();
  };

  isItemsExist = () => {
    const { items } = this.props;
    return items.length;
  };

  renderStackTraceMessage = () => {
    const { items, loadMore, loading, intl, hideTime } = this.props;
    return (
      <React.Fragment>
        <ScrollWrapper autoHeight autoHeightMax={this.getScrolledHeight()}>
          {items.map((item) => (
            <div key={item.id} className={cx('row')}>
              <StackTraceMessageBlock level={item.level} maxHeight={this.getMaxRowHeight()}>
                <div className={cx('message-container')}>
                  <div className={cx('cell', 'message-cell')}>{item.message}</div>
                  {!hideTime && (
                    <div className={cx('cell', 'time-cell')}>{dateFormat(item.time)}</div>
                  )}
                </div>
              </StackTraceMessageBlock>
            </div>
          ))}
        </ScrollWrapper>
        {loadMore && (
          <div
            className={cx('load-more-container', {
              loading,
            })}
          >
            <div className={cx('load-more-label')} onClick={this.loadMore}>
              {intl.formatMessage(messages.loadLabel)}
            </div>
            {loading && (
              <div className={cx('loading-icon')}>
                <SpinningPreloader />
              </div>
            )}
          </div>
        )}
      </React.Fragment>
    );
  };

  renderStackTrace = () => {
    const { intl, loading } = this.props;

    if (loading && !this.isItemsExist()) {
      return <SpinningPreloader />;
    }
    if (this.isItemsExist()) {
      return this.renderStackTraceMessage();
    }
    return <NoItemMessage message={intl.formatMessage(messages.noStackTrace)} />;
  };

  render() {
    return <div className={cx('stack-trace')}>{this.renderStackTrace()}</div>;
  }
}
