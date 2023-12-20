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
import Parser from 'html-react-parser';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { NoItemMessage } from 'components/main/noItemMessage';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { dateFormat, setStorageItem } from 'common/utils';
import {
  logStackTraceItemsSelector,
  logStackTraceLoadingSelector,
  fetchLogPageStackTrace,
  isLoadMoreStackTraceVisible,
  setActiveTabIdAction,
  ERROR_LOG_INDEX_KEY,
  activeRetryIdSelector,
} from 'controllers/log';
import { logStackTraceAddonSelector } from 'controllers/plugins/uiExtensions';
import { StackTraceMessageBlock } from 'pages/inside/common/stackTraceMessageBlock';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import NavigateArrowIcon from 'common/img/navigate-arrow-inline.svg';
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
  jumpTo: {
    id: 'StackTrace.jumpTo',
    defaultMessage: 'Jump To',
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
    retryId: activeRetryIdSelector(state),
    extensions: logStackTraceAddonSelector(state),
  }),
  {
    fetchLogPageStackTrace,
    setActiveTabIdAction,
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
    setActiveTabIdAction: PropTypes.func,
    loadMore: PropTypes.bool,
    logItem: PropTypes.object,
    hideAdditionalCells: PropTypes.bool,
    minHeight: PropTypes.number,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    designMode: PropTypes.string,
    transparentBackground: PropTypes.bool,
    eventsInfo: PropTypes.object,
    retryId: PropTypes.number.isRequired,
    extensions: PropTypes.array,
  };

  static defaultProps = {
    items: [],
    loading: false,
    fetchLogPageStackTrace: () => {},
    setActiveTabIdAction: () => {},
    loadMore: false,
    logItem: {},
    hideAdditionalCells: false,
    minHeight: SCROLL_HEIGHT,
    designMode: '',
    transparentBackground: false,
    eventsInfo: {},
    extensions: [],
  };

  componentDidMount() {
    if (this.isItemsExist()) {
      return;
    }
    this.fetchItems();
  }

  componentDidUpdate(prevProps) {
    const { logItem, retryId } = this.props;
    if (prevProps.logItem.id !== logItem.id || prevProps.retryId !== retryId) {
      this.fetchItems();
    }
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

  navigateToError = (id) => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.CLICK_JUMP_TO_ERROR_LOG);
    setStorageItem(ERROR_LOG_INDEX_KEY, id);
    this.props.setActiveTabIdAction('logs');
  };

  createStackTraceItem = (item, extraRow, extraCell) => {
    const { intl, hideAdditionalCells, designMode, eventsInfo } = this.props;
    const maxRowHeight = this.getMaxRowHeight();

    return (
      <>
        {extraRow}
        <StackTraceMessageBlock
          level={item.level}
          maxHeight={maxRowHeight}
          designMode={designMode}
          eventsInfo={eventsInfo}
        >
          <div className={cx('message-container')}>
            <div className={cx('cell', 'message-cell')}>{item.message}</div>
            {!hideAdditionalCells && (
              <>
                <div className={cx('cell', 'time-cell')}>{dateFormat(item.time)}</div>
                {extraCell}
                <div className={cx('cell')}>
                  <div className={cx('navigate-btn')} onClick={() => this.navigateToError(item.id)}>
                    {!extraCell && <span>{intl.formatMessage(messages.jumpTo)}</span>}
                    <i className={cx('navigate-icon')} title={intl.formatMessage(messages.jumpTo)}>
                      {Parser(NavigateArrowIcon)}
                    </i>
                  </div>
                </div>
              </>
            )}
          </div>
        </StackTraceMessageBlock>
      </>
    );
  };

  renderStackTraceMessage = () => {
    const {
      items,
      loadMore,
      loading,
      intl,
      hideAdditionalCells,
      designMode,
      extensions,
    } = this.props;

    return (
      <React.Fragment>
        {hideAdditionalCells ? (
          <ScrollWrapper autoHeight autoHeightMax={this.getScrolledHeight()}>
            {items.map((item) => (
              <div
                key={item.id}
                className={cx('row', { [`design-mode-${designMode}`]: designMode })}
              >
                {this.createStackTraceItem(item)}
              </div>
            ))}
          </ScrollWrapper>
        ) : (
          items.map((item) => (
            <div key={item.id} className={cx('row', { [`design-mode-${designMode}`]: designMode })}>
              {extensions.length
                ? extensions.map((extension) => (
                    <extension.component key={extension.name} item={item}>
                      {this.createStackTraceItem}
                    </extension.component>
                  ))
                : this.createStackTraceItem(item)}
            </div>
          ))
        )}
        {loadMore && (
          <div
            className={cx('load-more-container', {
              loading,
              [`design-mode-${designMode}`]: designMode,
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
    const { intl, loading, transparentBackground } = this.props;

    if (loading && !this.isItemsExist()) {
      return <SpinningPreloader />;
    }
    if (this.isItemsExist()) {
      return this.renderStackTraceMessage();
    }
    return (
      <NoItemMessage
        message={intl.formatMessage(messages.noStackTrace)}
        transparentBackground={transparentBackground}
      />
    );
  };

  render() {
    return <div className={cx('stack-trace')}>{this.renderStackTrace()}</div>;
  }
}
