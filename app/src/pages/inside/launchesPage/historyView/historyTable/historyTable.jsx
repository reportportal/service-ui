import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { HISTORY_ITEMS_TO_LOAD, STILL_MIN_HISTORY_ITEMS } from '../constants';
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
    projectId: activeProjectSelector(state),
  }),
  {
    showNotification,
  },
)
@injectIntl
export class HistoryTable extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showNotification: PropTypes.func.isRequired,
    projectId: PropTypes.string,
    historyDepth: PropTypes.string.isRequired,
    launchInfoUrlParams: PropTypes.string,
  };

  static defaultProps = {
    projectId: '',
    launchInfoUrlParams: '',
  };

  state = {
    launchContent: false,
    itemsHistory: false,
    visibleItemsCount: false,
    isLoading: false,
  };

  componentDidMount() {
    this.getLaunchInfo();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps && this.state.launchContent) {
      this.getLaunchHistoryItems(nextProps.historyDepth);
    }
  }

  getItemsForLoad = () => this.state.launchContent.slice(0, this.state.visibleItemsCount);

  getLaunchInfo = () => {
    const { projectId, launchInfoUrlParams } = this.props;
    const launchInfoUrl = URLS.launchItem(projectId) + launchInfoUrlParams;

    fetch(launchInfoUrl, {
      method: 'get',
    })
      .then((response) => {
        const launchContentToRender = this.mapLaunchInfoToRender(response.content);
        this.setState({
          launchContent: launchContentToRender,
          visibleItemsCount:
            (launchContentToRender.length <= HISTORY_ITEMS_TO_LOAD &&
              launchContentToRender.length) ||
            HISTORY_ITEMS_TO_LOAD,
          isLoading: false,
        });
        this.getLaunchHistoryItems();
      })
      .catch(() => {
        this.setState({
          isLoading: false,
        });
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.loadItemInfoErrorNotification),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  getLaunchesHistoryUrl = (historyDepth, defaultVisibleItems, isForLoadMore) => {
    let startSliceIndex = 0;
    let endSliceIndex = defaultVisibleItems;
    if (isForLoadMore) {
      startSliceIndex = endSliceIndex;
      endSliceIndex += HISTORY_ITEMS_TO_LOAD;
    }
    const launchIds = this.state.launchContent
      .slice(startSliceIndex, endSliceIndex)
      .map((item) => item.id)
      .join(',');

    return URLS.launchItemHistory(this.props.projectId, launchIds, historyDepth);
  };

  getLaunchHistoryItems = (historyDepth) => {
    const defaultVisibleItems =
      (this.state.launchContent.length <= HISTORY_ITEMS_TO_LOAD &&
        this.state.launchContent.length) ||
      HISTORY_ITEMS_TO_LOAD;
    const launchesHistoryUrl = this.getLaunchesHistoryUrl(
      historyDepth || this.props.historyDepth,
      defaultVisibleItems,
    );
    this.fetchHistoryItems(launchesHistoryUrl)
      .then((response) => {
        this.setState({
          itemsHistory: response.reverse(),
          visibleItemsCount: defaultVisibleItems,
          isLoading: false,
        });
      })
      .catch(() => {
        this.setState({
          isLoading: false,
        });
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.loadHistoryErrorNotification),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  loadMoreHistoryItems = () => {
    if (this.state.visibleItemsCount === this.state.launchContent.length) {
      return;
    }
    const launchesHistoryUrl = this.getLaunchesHistoryUrl(
      this.props.historyDepth,
      this.state.visibleItemsCount,
      true,
    );
    this.fetchHistoryItems(launchesHistoryUrl)
      .then((response) => {
        response.reverse();
        const newItemsHistory = this.state.itemsHistory.map((item, index) => ({
          ...item,
          resources: item.resources.concat(response[index].resources),
        }));
        this.setState({
          itemsHistory: newItemsHistory,
          visibleItemsCount: this.state.visibleItemsCount + HISTORY_ITEMS_TO_LOAD,
          isLoading: false,
        });
      })
      .catch(() => {
        this.setState({
          isLoading: false,
        });
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.loadHistoryErrorNotification),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  mapLaunchInfoToRender = (content) => {
    const launchesToRender = [];

    content.forEach((item) => {
      const sameName = launchesToRender.filter((obj) => obj.uniqueId === item.uniqueId);
      if (!sameName.length) {
        launchesToRender.push(item);
      }
    });
    return launchesToRender;
  };

  fetchHistoryItems = (launchesHistoryUrl) => {
    this.setState({
      isLoading: true,
    });
    return fetch(launchesHistoryUrl, { method: 'get' });
  };

  isTheBigDepth = () => this.state.itemsHistory.length > STILL_MIN_HISTORY_ITEMS;

  render() {
    const { intl } = this.props;

    return (
      <Fragment>
        <div className={cx('history-table-wrapper')}>
          {this.state.isLoading ? (
            <div className={cx('spinner-wrapper')}>
              <SpinningPreloader />
            </div>
          ) : (
            <Fragment>
              {this.state.itemsHistory && (
                <Fragment>
                  <HistoryNamesGrid
                    items={this.getItemsForLoad()}
                    customClass={this.isTheBigDepth() ? cx('many-items') : ''}
                  />
                  <HistoryItemsGrid
                    items={this.getItemsForLoad()}
                    itemsHistory={this.state.itemsHistory}
                    customClass={this.isTheBigDepth() ? cx('large-items-history') : ''}
                  />
                </Fragment>
              )}
            </Fragment>
          )}
        </div>
        <div
          className={cx('load-more-container', {
            'not-all-items-loaded': this.state.visibleItemsCount < this.state.launchContent.length,
          })}
        >
          <button className={cx('load-more')} onClick={this.loadMoreHistoryItems}>
            <h3 className={cx('load-more-title')}>
              {intl.formatMessage(messages.loadMoreHistoryItemsTitle)}
            </h3>
          </button>
        </div>
      </Fragment>
    );
  }
}
