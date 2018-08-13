import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import classNames from 'classnames/bind';
import { PASSED, FAILED, MANY, NOT_FOUND } from 'common/constants/launchStatuses';
import { HistoryLineItem } from './historyLineItem';
import styles from './historyLine.scss';

const cx = classNames.bind(styles);

const itemExample = '5b6d9713857aba00013ab62b';
const DEFAULT_HISTORY_DEPTH = 10;

const messages = defineMessages({
  loadHistoryErrorNotification: {
    id: 'HistoryLine.loadHistoryErrorNotification',
    defaultMessage: 'Failed to load history for current item',
  },
});

@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
  }),
  {
    showNotification,
  },
)
@injectIntl
export class HistoryLine extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showNotification: PropTypes.func.isRequired,
    projectId: PropTypes.string,
  };

  static defaultProps = {
    projectId: '',
  };

  state = {
    itemsToRender: [],
    selectedLaunch: null,
  };

  componentDidMount() {
    this.getLaunchHistoryItems();
  }

  onLineItemClick = (item) => {
    if (
      item.launchNumber !== this.state.selectedLaunch &&
      (item.status.toLowerCase() !== MANY && item.status.toLowerCase() !== NOT_FOUND)
    ) {
      this.setState({
        selectedLaunch: item.launchNumber,
      });
    }
  };

  getLaunchHistoryItems = () => {
    fetch(URLS.launchItemHistory(this.props.projectId, itemExample, DEFAULT_HISTORY_DEPTH), {
      method: 'get',
    })
      .then((response) => {
        this.getHistoryItemsToRender(response.reverse());
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.loadHistoryErrorNotification),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  getHistoryItemProps = (filteredLaunchHistoryItem) => {
    const itemProps = filteredLaunchHistoryItem[0];
    let itemStatus = '';

    if (!filteredLaunchHistoryItem.length) {
      itemStatus = NOT_FOUND.toUpperCase();
    } else if (filteredLaunchHistoryItem.length > 1) {
      itemStatus = MANY.toUpperCase();
      delete itemProps.issue;
      delete itemProps.statistics;
    } else {
      itemStatus = itemProps.status;
    }
    return {
      ...itemProps,
      status: itemStatus,
    };
  };

  getHistoryItemsToRender = (itemsHistory) => {
    const currentLaunch = itemsHistory.pop();
    const currentLaunchItem = currentLaunch.resources.find((item) => item.id === itemExample);

    const historyItems = itemsHistory.map((historyItem) => {
      const filteredSameHistoryItems = historyItem.resources.filter(
        (item) => item.uniqueId === currentLaunchItem.uniqueId,
      );

      return {
        ...this.getHistoryItemProps(filteredSameHistoryItems),
        launchNumber: historyItem.launchNumber,
      };
    });

    currentLaunchItem.launchNumber = currentLaunch.launchNumber;
    historyItems.push(currentLaunchItem);

    this.setState({
      itemsToRender: this.calculateGrowthDuration(historyItems.reverse()),
      selectedLaunch: currentLaunch.launchNumber,
    });
  };

  calculateGrowthDuration = (historyItems) => {
    const historyItemsLastIndex = historyItems.length - 1;

    historyItems.forEach((item, index) => {
      const newItemData = item;

      if (index < historyItemsLastIndex && this.validForDurationGrowth(item)) {
        let prevItemIndex = index + 1;
        while (
          !this.validForDurationGrowth(historyItems[prevItemIndex]) &&
          prevItemIndex < historyItemsLastIndex
        ) {
          prevItemIndex += 1;
        }

        if (prevItemIndex <= historyItemsLastIndex) {
          const prevDuration =
            historyItems[prevItemIndex].end_time - historyItems[prevItemIndex].start_time;
          const currentDuration = item.end_time - item.start_time;
          const growth = currentDuration / prevDuration - 1;
          growth > 0 && (newItemData.growthDuration = `+${Math.round(growth * 100)}%`);
        }
      }

      return newItemData;
    });

    return historyItems.reverse();
  };

  validForDurationGrowth = (item) =>
    item.status === FAILED.toUpperCase() || item.status === PASSED.toUpperCase();

  render() {
    return (
      <div className={cx('history-line')}>
        {this.state.itemsToRender &&
          this.state.itemsToRender.map((item, index) => (
            <HistoryLineItem
              key={item.launchNumber}
              active={item.launchNumber === this.state.selectedLaunch}
              isFirstItem={index === 0}
              isLastItem={index === this.state.itemsToRender.length - 1}
              onClick={() => this.onLineItemClick(item)}
              {...item}
            />
          ))}
      </div>
    );
  }
}
