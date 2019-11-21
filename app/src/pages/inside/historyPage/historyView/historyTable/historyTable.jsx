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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import {
  historySelector,
  totalItemsCountSelector,
  loadingSelector,
  fetchItemsHistoryAction,
} from 'controllers/itemsHistory';
import { nameLinkSelector } from 'controllers/testItem';
import { PROJECT_LOG_PAGE } from 'controllers/pages';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { NOT_FOUND, RESETED } from 'common/constants/launchStatuses';
import { NoItemMessage } from 'components/main/noItemMessage';
import { ItemNameBlock } from './itemNameBlock';
import { EmptyHistoryItem } from './emptyHistoryItem';
import { HistoryItem } from './historyItem';
import { HistoryCell } from './historyCell';
import { calculateMaxRowItemsCount } from './utils';
import styles from './historyTable.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  loadMoreHistoryItemsTitle: {
    id: 'HistoryTable.loadMoreHistoryItemsTitle',
    defaultMessage: 'Click here to load more items',
  },
  itemNamesHeaderTitle: {
    id: 'HistoryTable.itemNamesHeaderTitle',
    defaultMessage: 'Name',
  },
  executionNumberTitle: {
    id: 'HistoryTable.launchNumberTitle',
    defaultMessage: 'Execution #',
  },
  noHistoryItems: {
    id: 'HistoryTable.noHistoryItems',
    defaultMessage: 'No history items',
  },
});

@connect(
  (state) => ({
    history: historySelector(state),
    loading: loadingSelector(state),
    totalItemsCount: totalItemsCountSelector(state),
    link: (ownProps) => nameLinkSelector(state, ownProps),
  }),
  {
    fetchItemsHistoryAction,
    navigate: (linkAction) => linkAction,
  },
)
@injectIntl
export class HistoryTable extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    historyDepth: PropTypes.string.isRequired,
    loading: PropTypes.bool,
    history: PropTypes.array,
    totalItemsCount: PropTypes.number,
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    withGroupOperations: PropTypes.bool,
    fetchItemsHistoryAction: PropTypes.func,
    link: PropTypes.func,
    navigate: PropTypes.func,
    onSelectItem: PropTypes.func,
  };

  static defaultProps = {
    history: [],
    loading: false,
    totalItemsCount: 0,
    selectedItems: [],
    withGroupOperations: false,
    fetchItemsHistoryAction: () => {},
    link: () => {},
    navigate: () => {},
    onSelectItem: () => {},
  };

  getCorrespondingHistoryItem = (historyItem) => {
    const { navigate, link, onSelectItem, selectedItems, withGroupOperations } = this.props;
    switch (historyItem.status) {
      case NOT_FOUND.toUpperCase():
      case RESETED.toUpperCase():
        return (
          <HistoryCell status={historyItem.status} key={historyItem.id}>
            <EmptyHistoryItem {...historyItem} />
          </HistoryCell>
        );
      default: {
        const clickHandler = () => {
          const ownProps = {
            ownLinkParams: this.calculateItemOwnLinkParams(historyItem),
            itemId: historyItem.id,
          };
          navigate(link(ownProps));
        };
        return (
          <HistoryCell status={historyItem.status} onClick={clickHandler} key={historyItem.id}>
            <HistoryItem
              testItem={historyItem}
              onSelectItem={onSelectItem}
              selectedItems={selectedItems}
              withGroupOperations={withGroupOperations}
            />
          </HistoryCell>
        );
      }
    }
  };

  calculateItemOwnLinkParams = (item) => {
    const itemIdsArray = item.path.split('.');
    const itemIds = itemIdsArray.slice(0, itemIdsArray.length - 1).join('/');

    return {
      page: item.hasChildren ? null : PROJECT_LOG_PAGE,
      testItemIds: itemIds ? `${item.launchId}/${itemIds}` : item.launchId,
    };
  };

  normalizeHistoryItem = (historyItem, index) => {
    if (!historyItem) {
      return {
        status: NOT_FOUND.toUpperCase(),
        id: `${NOT_FOUND}_${index}`,
      };
    }

    return historyItem;
  };

  loadMoreHistoryItems = () => {
    this.props.fetchItemsHistoryAction({
      historyDepth: this.props.historyDepth,
      loadMore: true,
    });
  };

  renderHeader = (maxRowItemsCount) => {
    const { intl } = this.props;
    const headerItems = [];
    for (let index = maxRowItemsCount; index > 0; index -= 1) {
      headerItems.push(
        <HistoryCell key={index} header>
          {`${intl.formatMessage(messages.executionNumberTitle)}${index}`}
        </HistoryCell>,
      );
    }
    return headerItems;
  };

  renderHistoryItems = (item, maxRowItemsCount) => {
    const itemLastIndex = maxRowItemsCount - 1;
    const itemResources = [...item.resources].reverse();
    const historyItems = [];

    for (let index = itemLastIndex; index >= 0; index -= 1) {
      const historyItem = itemResources[index];

      const normalizedHistoryItem = this.normalizeHistoryItem(historyItem, index);
      historyItems.push(this.getCorrespondingHistoryItem(normalizedHistoryItem));
    }

    return historyItems;
  };

  renderBody = (maxRowItemsCount) => {
    const { history } = this.props;
    return history.map((item) => (
      <tr key={item.testCaseId}>
        <HistoryCell first>
          <div className={cx('history-grid-name')}>
            <ItemNameBlock
              data={item.resources[0]}
              ownLinkParams={this.calculateItemOwnLinkParams(item.resources[0])}
            />
          </div>
        </HistoryCell>
        {this.renderHistoryItems(item, maxRowItemsCount)}
      </tr>
    ));
  };

  renderFooter = () => {
    const {
      intl: { formatMessage },
      history,
      loading,
      totalItemsCount,
    } = this.props;
    const visibleItemsCount = history.length;

    if (loading) {
      return (
        <div className={cx('spinner-wrapper')}>
          <SpinningPreloader />
        </div>
      );
    }

    return (
      !!visibleItemsCount &&
      visibleItemsCount < totalItemsCount && (
        <div className={cx('load-more-container')}>
          <button className={cx('load-more')} onClick={this.loadMoreHistoryItems}>
            <h3 className={cx('load-more-title')}>
              {formatMessage(messages.loadMoreHistoryItemsTitle)}
            </h3>
          </button>
        </div>
      )
    );
  };

  render() {
    const {
      intl: { formatMessage },
      history,
      loading,
    } = this.props;
    const maxRowItemsCount = calculateMaxRowItemsCount(history);

    return (
      <Fragment>
        {!history.length ? (
          !loading && <NoItemMessage message={formatMessage(messages.noHistoryItems)} />
        ) : (
          <ScrollWrapper autoHeight>
            <table>
              <thead>
                <tr>
                  <HistoryCell header first>
                    <div className={cx('history-grid-name')}>
                      {formatMessage(messages.itemNamesHeaderTitle)}
                    </div>
                  </HistoryCell>
                  {this.renderHeader(maxRowItemsCount)}
                </tr>
              </thead>
              <tbody>{this.renderBody(maxRowItemsCount)}</tbody>
            </table>
          </ScrollWrapper>
        )}
        {this.renderFooter()}
      </Fragment>
    );
  }
}
