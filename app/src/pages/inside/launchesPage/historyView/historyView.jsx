import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { getStorageItem, setStorageItem } from 'common/utils';
import { historyDepthConfig } from './constants';
import { HistoryFiltersBlock } from './historyFiltersBlock';
import { HistoryTable } from './historyTable';
import styles from './historyView.scss';

const cx = classNames.bind(styles);
const filterSizePathExample = 0;
const launchExample = '5b11056b149b3f0001f36f90';

@injectIntl
export class HistoryView extends Component {
  static propTypes = {
    activePage: PropTypes.number,
    sortingColumn: PropTypes.string,
    pageSize: PropTypes.number,
  };

  static defaultProps = {
    activePage: 1,
    sortingColumn: null,
    pageSize: null,
  };

  state = {
    historyDepthValue: getStorageItem(historyDepthConfig.name) || historyDepthConfig.defaultValue,
  };

  historyDepthHandle = (newValue) => {
    this.setState({
      historyDepthValue: newValue,
    });
    setStorageItem(historyDepthConfig.name, newValue);
  };

  render() {
    const { activePage, pageSize, sortingColumn } = this.props;

    const params = `?page.page=${activePage}&page.size=${pageSize}&page.sort=${sortingColumn}%2CASC&filter.eq.launch=${launchExample}&filter.size.path=${filterSizePathExample}`;

    return (
      <div className={cx('history-view-wrapper')}>
        <HistoryFiltersBlock
          historyDepth={this.state.historyDepthValue}
          historyDepthHandle={this.historyDepthHandle}
        />
        <HistoryTable historyDepth={this.state.historyDepthValue} launchInfoUrlParams={params} />
      </div>
    );
  }
}
