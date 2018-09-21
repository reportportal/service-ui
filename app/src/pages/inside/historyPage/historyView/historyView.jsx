import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { getStorageItem, setStorageItem } from 'common/utils';
import { refreshHistory, HISTORY_DEPTH_CONFIG } from 'controllers/itemsHistory';
import { HistoryFiltersBlock } from './historyFiltersBlock';
import { HistoryTable } from './historyTable';
import styles from './historyView.scss';

const cx = classNames.bind(styles);

@connect(null, { refreshHistory })
export class HistoryView extends Component {
  static propTypes = {
    refreshHistory: PropTypes.func.isRequired,
  };

  state = {
    historyDepthValue:
      getStorageItem(HISTORY_DEPTH_CONFIG.name) || HISTORY_DEPTH_CONFIG.defaultValue,
  };

  onChangeHistoryDepth = (newValue) => {
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
