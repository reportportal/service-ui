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
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import {
  historyItemsSelector,
  activeLogIdSelector,
  NAMESPACE,
  NUMBER_OF_ITEMS_TO_LOAD,
  DEFAULT_HISTORY_DEPTH,
  HISTORY_DEPTH_LIMIT,
  fetchHistoryItemsAction,
  setShouldShowLoadMoreAction,
  shouldShowLoadMoreSelector,
} from 'controllers/log';
import { NOT_FOUND } from 'common/constants/testStatuses';
import { connectRouter } from 'common/utils';
import { PAGE_KEY, DEFAULT_PAGINATION } from 'controllers/pagination';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { HistoryLineItem } from './historyLineItem';
import styles from './historyLine.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  loadMoreItemsTitle: {
    id: 'HistoryLine.loadMore',
    defaultMessage: '+{number} More',
  },
});

@connectRouter(
  undefined,
  {
    changeActiveItem: (itemId) => ({
      history: itemId,
      retryId: null,
      [PAGE_KEY]: DEFAULT_PAGINATION[PAGE_KEY],
    }),
  },
  { namespace: NAMESPACE },
)
@connect(
  (state) => ({
    historyItems: historyItemsSelector(state),
    activeItemId: activeLogIdSelector(state),
    shouldShowLoadMore: shouldShowLoadMoreSelector(state),
  }),
  {
    fetchHistoryItemsAction,
    setShouldShowLoadMoreAction,
  },
)
@injectIntl
export class HistoryLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      prevItemsCount: DEFAULT_HISTORY_DEPTH,
    };
  }
  static propTypes = {
    intl: PropTypes.object.isRequired,
    historyItems: PropTypes.array,
    activeItemId: PropTypes.number,
    shouldShowLoadMore: PropTypes.bool,
    changeActiveItem: PropTypes.func,
    fetchHistoryItemsAction: PropTypes.func,
    setShouldShowLoadMoreAction: PropTypes.func,
  };

  static defaultProps = {
    historyItems: [],
    activeItemId: 0,
    shouldShowLoadMore: false,
    changeActiveItem: () => {},
    fetchHistoryItemsAction: () => {},
    setShouldShowLoadMoreAction: () => {},
  };

  checkIfTheItemLinkIsActive = (item) =>
    item.id !== this.props.activeItemId && item.status !== NOT_FOUND;

  finishLoading = () => {
    const { historyItems } = this.props;
    const loadedItems = historyItems.length - DEFAULT_HISTORY_DEPTH;
    const shouldShowLoadMore =
      this.state.prevItemsCount !== historyItems.length &&
      historyItems.length < HISTORY_DEPTH_LIMIT &&
      loadedItems >= 0 &&
      loadedItems % NUMBER_OF_ITEMS_TO_LOAD === 0;
    this.setState({ isLoading: false });
    this.props.setShouldShowLoadMoreAction(shouldShowLoadMore);
  };

  loadMoreItems = () => {
    const { historyItems } = this.props;
    if (this.state.isLoading) {
      return;
    }
    this.setState({ isLoading: true, prevItemsCount: historyItems.length });
    this.props.fetchHistoryItemsAction(true, this.finishLoading);
  };

  componentDidMount() {
    const { historyItems } = this.props;
    const loadedItems = historyItems.length - DEFAULT_HISTORY_DEPTH;
    this.props.setShouldShowLoadMoreAction(loadedItems === 0);
  }

  render() {
    const { historyItems, activeItemId, changeActiveItem, intl, shouldShowLoadMore } = this.props;
    return (
      <div className={cx('history-line')}>
        <ScrollWrapper autoHeight hideTracksWhenNotNeeded autoHide initialScrollRight>
          <div className={cx('history-line-items')}>
            {shouldShowLoadMore && (
              <button className={cx('load-more')} onClick={this.loadMoreItems}>
                {this.state.isLoading ? (
                  <SpinningPreloader />
                ) : (
                  intl.formatMessage(messages.loadMoreItemsTitle, {
                    number: NUMBER_OF_ITEMS_TO_LOAD,
                  })
                )}
              </button>
            )}
            {historyItems.map((item, index) => (
              <HistoryLineItem
                key={item.id}
                active={item.id === activeItemId}
                isLastItem={index === historyItems.length - 1}
                onClick={() =>
                  this.checkIfTheItemLinkIsActive(item) ? changeActiveItem(item.id) : {}
                }
                {...item}
              />
            ))}
          </div>
        </ScrollWrapper>
      </div>
    );
  }
}
