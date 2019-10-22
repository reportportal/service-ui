import React, { Component } from 'react';
import PropTypes from 'prop-types';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { getStorageItem, setStorageItem } from 'common/utils';
import { HISTORY_DEPTH_CONFIG } from 'controllers/itemsHistory';
import { HISTORY_PAGE_EVENTS } from 'components/main/analytics/events';
import { HistoryFiltersBlock } from './historyFiltersBlock';
import { HistoryTable } from './historyTable';
import styles from './historyView.scss';

const cx = classNames.bind(styles);

@track()
export class HistoryView extends Component {
  static propTypes = {
    refreshHistory: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  state = {
    historyDepthValue:
      getStorageItem(HISTORY_DEPTH_CONFIG.name) || HISTORY_DEPTH_CONFIG.defaultValue,
  };

  onChangeHistoryDepth = (newValue) => {
    this.props.tracking.trackEvent(HISTORY_PAGE_EVENTS.SELECT_HISTORY_DEPTH);
    this.setState({
      historyDepthValue: newValue,
    });
    setStorageItem(HISTORY_DEPTH_CONFIG.name, newValue);
    this.props.refreshHistory();
  };

  render() {
    return (
      <div className={cx('history-view-wrapper')}>
        <HistoryFiltersBlock
          historyDepth={this.state.historyDepthValue}
          onChangeHistoryDepth={this.onChangeHistoryDepth}
        />
        <HistoryTable historyDepth={this.state.historyDepthValue} />
      </div>
    );
  }
}
