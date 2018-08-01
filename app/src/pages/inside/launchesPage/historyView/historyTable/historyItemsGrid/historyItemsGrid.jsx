import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { MANY, NOT_FOUND } from 'common/constants/historyItemStatuses';
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
      itemProps = {
        status: MANY.toUpperCase(),
        defects: {},
      };
    } else {
      itemProps = {
        status: filteredLaunchHistoryItem[0].status,
        issue: filteredLaunchHistoryItem[0].issue,
        defects: filteredLaunchHistoryItem[0].statistics.defects,
      };
    }
    return itemProps;
  };

  getHistoryItemsToRender = () => {
    const { items, itemsHistory } = this.props;

    return items.map((launch) => (
      <div key={launch.uniqueId} className={cx('history-grid-row')}>
        {itemsHistory.map((historyItem) => {
          const currentLaunchHistoryItem = historyItem.resources.filter(
            (item) => item.uniqueId === launch.uniqueId,
          );
          const historyItemProps = this.getHistoryItemProps(currentLaunchHistoryItem);
          return (
            <div key={historyItem.startTime} className={cx('history-grid-column')}>
              <HistoryItem {...historyItemProps} />
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
        <ScrollWrapper autoHeight autoHeightMax={'100%'} autoHide>
          <div className={cx('history-items-grid')}>
            <div className={cx('history-grid-head')}>
              {itemsHistory.map((item) => (
                <div
                  key={item.launchNumber}
                  className={cx('history-grid-header-column', `launch-status-${item.launchStatus}`)}
                >
                  <span>
                    {`${intl.formatMessage(messages.launchNumberTitle)}${item.launchNumber}`}
                  </span>
                </div>
              ))}
            </div>
            {this.getHistoryItemsToRender()}
          </div>
        </ScrollWrapper>
      </div>
    );
  }
}
