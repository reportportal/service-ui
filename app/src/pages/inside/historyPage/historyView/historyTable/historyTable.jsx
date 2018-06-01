import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import {
  itemsHistorySelector,
  historySelector,
  OPTIMAL_HISTORY_DEPTH_FOR_RENDER,
  visibleItemsCountSelector,
  fetchItemsHistoryAction,
} from 'controllers/itemsHistory';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { HistoryNamesGrid } from './historyNamesGrid';
import { HistoryItemsGrid } from './historyItemsGrid';
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
});

@connect(
  (state) => ({
    items: itemsHistorySelector(state),
    history: historySelector(state),
    visibleItemsCount: visibleItemsCountSelector(state),
  }),
  { fetchItemsHistoryAction },
)
@injectIntl
export class HistoryTable extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    items: PropTypes.array.isRequired,
    history: PropTypes.array.isRequired,
    historyDepth: PropTypes.string.isRequired,
    visibleItemsCount: PropTypes.number.isRequired,
    fetchItemsHistoryAction: PropTypes.func,
  };

  static defaultProps = {
    fetchItemsHistoryAction: () => {},
  };

  isTheBigDepth = () => this.props.history.length > OPTIMAL_HISTORY_DEPTH_FOR_RENDER;

  loadMoreHistoryItems = () => {
    this.props.fetchItemsHistoryAction({
      historyDepth: this.props.historyDepth,
      loadMore: true,
    });
  };

  render() {
    const { intl, history, items, visibleItemsCount } = this.props;

    return (
      <Fragment>
        <div className={cx('history-table-wrapper')}>
          {history.length === 0 ? (
            <div className={cx('spinner-wrapper')}>
              <SpinningPreloader />
            </div>
          ) : (
            <Fragment>
              <HistoryNamesGrid
                items={items.slice(0, visibleItemsCount)}
                customClass={this.isTheBigDepth() ? cx('many-items') : ''}
              />
              <HistoryItemsGrid
                items={items.slice(0, visibleItemsCount)}
                itemsHistory={history}
                customClass={this.isTheBigDepth() ? cx('large-items-history') : ''}
              />
            </Fragment>
          )}
        </div>
        {history.length &&
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
