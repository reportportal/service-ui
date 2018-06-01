import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { getStorageItem, setStorageItem } from 'common/utils';
import { resetFetchHistory, HISTORY_DEPTH_CONFIG } from 'controllers/itemsHistory';
import { HistoryFiltersBlock } from './historyFiltersBlock';
import { HistoryTable } from './historyTable';
import styles from './historyView.scss';

const cx = classNames.bind(styles);

@connect(null, { resetFetchHistory })
export class HistoryView extends Component {
  static propTypes = {
    resetFetchHistory: PropTypes.func.isRequired,
  };

  state = {
    historyDepthValue:
      getStorageItem(HISTORY_DEPTH_CONFIG.name) || HISTORY_DEPTH_CONFIG.defaultValue,
  };

  historyDepthHandle = (newValue) => {
    this.setState({
      historyDepthValue: newValue,
    });
    setStorageItem(HISTORY_DEPTH_CONFIG.name, newValue);
    this.props.resetFetchHistory();
  };

  render() {
    return (
      <div className={cx('history-view-wrapper')}>
        <HistoryFiltersBlock
          historyDepth={this.state.historyDepthValue}
          historyDepthHandle={this.historyDepthHandle}
        />
        <HistoryTable historyDepth={this.state.historyDepthValue} />
      </div>
    );
  }
}
