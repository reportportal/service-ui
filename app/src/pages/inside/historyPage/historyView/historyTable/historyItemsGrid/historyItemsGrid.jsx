import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { MANY, NOT_FOUND, RESETED } from 'common/constants/launchStatuses';
import { PROJECT_LOG_PAGE, TEST_ITEM_PAGE } from 'controllers/pages';
import { NameLink } from 'pages/inside/common/nameLink';
import { HistoryItem } from './historyItem';
import styles from './historyItemsGrid.scss';

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
  launchNumberTitle: {
    id: 'HistoryTable.launchNumberTitle',
    defaultMessage: 'Launch #',
  },
});

@injectIntl
export class HistoryItemsGrid extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    items: PropTypes.array,
    itemsHistory: PropTypes.array,
    customClass: PropTypes.string,
  };

  static defaultProps = {
    items: [],
    itemsHistory: [],
    customClass: '',
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

  switchCorrespondHistoryItem = (historyItemProps, currentHistoryItem, launchId) => {
    switch (historyItemProps.status) {
      case NOT_FOUND.toUpperCase():
      case RESETED.toUpperCase():
        return <HistoryItem {...historyItemProps} />;
      case MANY.toUpperCase():
        return (
          <NameLink
            page={TEST_ITEM_PAGE}
            uniqueId={currentHistoryItem.uniqueId}
            testItemIds={
              historyItemProps.itemIds ? `${launchId}/${historyItemProps.itemIds}` : launchId
            }
          >
            <HistoryItem {...historyItemProps} />
          </NameLink>
        );
      default:
        return (
          <NameLink
            itemId={currentHistoryItem.id}
            page={currentHistoryItem.has_children ? null : PROJECT_LOG_PAGE}
            testItemIds={
              historyItemProps.itemIds ? `${launchId}/${historyItemProps.itemIds}` : launchId
            }
          >
            <HistoryItem {...historyItemProps} />
          </NameLink>
        );
    }
  };

  renderHistoryItems = () => {
    const { items, itemsHistory } = this.props;
    return items.map((launch) => (
      <div key={launch.uniqueId} className={cx('history-grid-row')}>
        {itemsHistory.map((historyItem) => {
          const currentLaunchHistoryItem = historyItem.resources.filter(
            (item) => item.uniqueId === launch.uniqueId,
          );
          const historyItemProps = this.getHistoryItemProps(currentLaunchHistoryItem);
          return (
            <div key={historyItem.launchId} className={cx('history-grid-column')}>
              {this.switchCorrespondHistoryItem(
                historyItemProps,
                currentLaunchHistoryItem[0],
                historyItem.launchId,
              )}
            </div>
          );
        })}
      </div>
    ));
  };

  render() {
    const { intl, customClass, itemsHistory } = this.props;
    return (
      <div className={cx('history-content-wrapper', customClass)}>
        <ScrollWrapper autoHeight>
          <div className={cx('history-items-grid')}>
            <div className={cx('history-grid-head')}>
              {itemsHistory.map((item) => (
                <div
                  key={item.launchNumber}
                  className={cx('history-grid-header-column', `launch-status-${item.launchStatus}`)}
                >
                  {`${intl.formatMessage(messages.launchNumberTitle)}${item.launchNumber}`}
                </div>
              ))}
            </div>
            {this.renderHistoryItems()}
          </div>
        </ScrollWrapper>
      </div>
    );
  }
}
