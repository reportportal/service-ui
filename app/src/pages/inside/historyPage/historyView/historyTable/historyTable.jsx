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
  itemsHistorySelector,
  historySelector,
  visibleItemsCountSelector,
  fetchItemsHistoryAction,
} from 'controllers/itemsHistory';
import { nameLinkSelector } from 'controllers/testItem';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { MANY, NOT_FOUND, RESETED } from 'common/constants/launchStatuses';
import { PROJECT_LOG_PAGE, TEST_ITEM_PAGE } from 'controllers/pages';
import { ItemNameBlock } from './itemNameBlock';
import { HistoryItem } from './historyItem';
import { HistoryCell } from './historyCell';

import styles from './historyTable.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  loadHistoryErrorNotification: {
    id: 'HistoryTable.loadHistoryErrorNotification',
    defaultMessage: 'Failed to load history for current item',
  },
  loadItemInfoErrorNotification: {
    id: 'HistoryTable.loadItemInfoErrorNotification',
    defaultMessage: 'Failed to load info for item',
  },
  loadMoreHistoryItemsTitle: {
    id: 'HistoryTable.loadMoreHistoryItemsTitle',
    defaultMessage: 'Click here to load more items',
  },
  itemNamesHeaderTitle: {
    id: 'HistoryTable.itemNamesHeaderTitle',
    defaultMessage: 'Name',
  },
  launchNumberTitle: {
    id: 'HistoryTable.launchNumberTitle',
    defaultMessage: 'Launch #',
  },
});

@connect(
  (state) => ({
    items: itemsHistorySelector(state),
    history: historySelector(state),
    visibleItemsCount: visibleItemsCountSelector(state),
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
    items: PropTypes.array,
    history: PropTypes.array,
    visibleItemsCount: PropTypes.number,
    fetchItemsHistoryAction: PropTypes.func,
    link: PropTypes.func,
    navigate: PropTypes.func,
  };

  static defaultProps = {
    items: [],
    history: [],
    visibleItemsCount: 0,
    fetchItemsHistoryAction: () => {},
    link: () => {},
    navigate: () => {},
  };

  getItems = () => {
    const { items, visibleItemsCount } = this.props;
    return items.slice(0, visibleItemsCount);
  };

  getHistoryItemProps = (filteredLaunchHistoryItem) => {
    let itemProps = {};

    if (!filteredLaunchHistoryItem.length) {
      itemProps = {
        status: NOT_FOUND.toUpperCase(),
        defects: {},
      };
    } else if (filteredLaunchHistoryItem.length > 1) {
      const itemIdsArray = filteredLaunchHistoryItem[0].path.split('.');
      const itemIds = itemIdsArray.slice(0, itemIdsArray.length - 1).join('/');
      itemProps = {
        status: MANY.toUpperCase(),
        defects: {},
        itemIds,
      };
    } else {
      const itemIdsArray = filteredLaunchHistoryItem[0].path.split('.');
      const itemIds = itemIdsArray.slice(0, itemIdsArray.length - 1).join('/');
      itemProps = {
        status: filteredLaunchHistoryItem[0].status,
        issue: filteredLaunchHistoryItem[0].issue,
        defects: filteredLaunchHistoryItem[0].statistics.defects,
        itemIds,
      };
    }
    return itemProps;
  };

  getCorrespondingHistoryItem = (historyItemProps, currentHistoryItem, launchId, isLastItem) => {
    const { navigate, link } = this.props;
    switch (historyItemProps.status) {
      case NOT_FOUND.toUpperCase():
      case RESETED.toUpperCase():
        return (
          <HistoryCell status={historyItemProps.status} key={launchId}>
            <HistoryItem {...historyItemProps} />
          </HistoryCell>
        );
      case MANY.toUpperCase(): {
        const clickHandler = () => {
          const ownProps = {
            ownLinkParams: {
              page: isLastItem ? null : TEST_ITEM_PAGE,
              testItemIds: historyItemProps.itemIds
                ? `${launchId}/${historyItemProps.itemIds}`
                : launchId,
            },
            uniqueId: isLastItem ? null : currentHistoryItem.uniqueId,
            itemId: isLastItem ? currentHistoryItem.id : null,
          };
          navigate(link(ownProps));
        };
        return (
          <HistoryCell
            status={historyItemProps.status}
            onClick={clickHandler}
            key={currentHistoryItem.id}
          >
            <HistoryItem {...historyItemProps} />
          </HistoryCell>
        );
      }
      default: {
        const clickHandler = () => {
          const ownProps = {
            ownLinkParams: {
              page: currentHistoryItem.hasChildren ? null : PROJECT_LOG_PAGE,
              testItemIds: historyItemProps.itemIds
                ? `${launchId}/${historyItemProps.itemIds}`
                : launchId,
            },
            itemId: currentHistoryItem.id,
          };
          navigate(link(ownProps));
        };
        return (
          <HistoryCell
            status={historyItemProps.status}
            onClick={clickHandler}
            key={currentHistoryItem.id}
          >
            <HistoryItem {...historyItemProps} />
          </HistoryCell>
        );
      }
    }
  };

  loadMoreHistoryItems = () => {
    this.props.fetchItemsHistoryAction({
      historyDepth: this.props.historyDepth,
      loadMore: true,
    });
  };

  renderHeader = () => {
    const { history, intl } = this.props;
    return history.map((historyItem) => (
      <HistoryCell status={historyItem.launchStatus} key={historyItem.launchId} header>
        {`${intl.formatMessage(messages.launchNumberTitle)}${historyItem.launchNumber}`}
      </HistoryCell>
    ));
  };
  renderBody = () => {
    const { history } = this.props;
    return this.getItems().map((launch) => (
      <tr key={launch.uniqueId}>
        <HistoryCell first>
          <div className={cx('history-grid-name')}>
            <ItemNameBlock data={launch} />
          </div>
        </HistoryCell>
        {history.map((historyItem, index) => {
          const currentLaunchHistoryItem = historyItem.resources.filter(
            (item) => item.uniqueId === launch.uniqueId,
          );
          const historyItemProps = this.getHistoryItemProps(currentLaunchHistoryItem);
          const isLastItem = index === history.length - 1;
          return this.getCorrespondingHistoryItem(
            historyItemProps,
            currentLaunchHistoryItem[0],
            historyItem.launchId,
            isLastItem,
          );
        })}
      </tr>
    ));
  };
  render() {
    const { intl, history, items, visibleItemsCount } = this.props;

    return (
      <Fragment>
        {!history.length ? (
          <div className={cx('spinner-wrapper')}>
            <SpinningPreloader />
          </div>
        ) : (
          <ScrollWrapper autoHeight>
            <table>
              <thead>
                <tr>
                  <HistoryCell header first>
                    <div className={cx('history-grid-name')}>
                      {intl.formatMessage(messages.itemNamesHeaderTitle)}
                    </div>
                  </HistoryCell>
                  {this.renderHeader()}
                </tr>
              </thead>
              <tbody>{this.renderBody()}</tbody>
            </table>
          </ScrollWrapper>
        )}
        {!!history.length &&
          visibleItemsCount < items.length && (
            <div className={cx('load-more-container')}>
              <button className={cx('load-more')} onClick={this.loadMoreHistoryItems}>
                <h3 className={cx('load-more-title')}>
                  {intl.formatMessage(messages.loadMoreHistoryItemsTitle)}
                </h3>
              </button>
            </div>
          )}
      </Fragment>
    );
  }
}
