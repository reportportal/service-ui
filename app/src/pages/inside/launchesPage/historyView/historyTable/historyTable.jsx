import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { showNotification } from 'controllers/notification';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { historyItemsToLoad, stillMinHistoryItems } from '../constants';
import { ItemNameBlock } from './itemNameBlock/itemNameBlock';
import { HistoryItem } from './historyItem/historyItem';
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
  launchNumberTitle: {
    id: 'HistoryTable.launchNumberTitle',
    defaultMessage: 'Launch #',
  },
  loadMoreHistoryItemsTitle: {
    id: 'HistoryTable.loadMoreHistoryItemsTitle',
    defaultMessage: 'Click here to load more items',
  },
  itemNamesHeaderTitle: {
    id: 'HistoryTable.itemNamesHeaderTitle',
    defaultMessage: 'Name',
  },
});

@connect(
  (state) => ({
    baseUrl: URLS.launchItem(activeProjectSelector(state)),
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
    baseUrl: PropTypes.string,
    historyDepth: PropTypes.string.isRequired,
    launchInfoUrlParams: PropTypes.string,
  };

  static defaultProps = {
    baseUrl: '',
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
    const { launchInfoUrlParams } = this.props;
    const launchInfoUrl = this.props.baseUrl + launchInfoUrlParams;

    fetch(launchInfoUrl, {
      method: 'get',
    })
      .then((response) => {
        const launchContentToRender = this.mapLaunchInfoToRender(response.content);
        this.setState({
          launchContent: launchContentToRender,
          visibleItemsCount:
            (launchContentToRender.length <= historyItemsToLoad && launchContentToRender.length) ||
            historyItemsToLoad,
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
          type: 'error',
        });
      });
  };

  getLaunchesHistoryUrl = (historyDepth, defaultVisibleItems, isForLoadMore) => {
    let startSliceIndex = 0;
    let endSliceIndex = defaultVisibleItems;
    if (isForLoadMore) {
      startSliceIndex = endSliceIndex;
      endSliceIndex += historyItemsToLoad;
    }
    const launchIdsArray = this.state.launchContent
      .slice(startSliceIndex, endSliceIndex)
      .map((item) => item.id);

    const launchesHistoryUrlParams = `/history?ids=${launchIdsArray.join(
      ',',
    )}&history_depth=${historyDepth}`;
    return this.props.baseUrl + launchesHistoryUrlParams;
  };

  getLaunchHistoryItems = (historyDepth) => {
    const defaultVisibleItems =
      (this.state.launchContent.length <= historyItemsToLoad && this.state.launchContent.length) ||
      historyItemsToLoad;
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
          type: 'error',
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
          visibleItemsCount: this.state.visibleItemsCount + historyItemsToLoad,
          isLoading: false,
        });
      })
      .catch(() => {
        this.setState({
          isLoading: false,
        });
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.loadHistoryErrorNotification),
          type: 'error',
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

  isTheBigDepth = () => this.state.itemsHistory.length > stillMinHistoryItems;

  render() {
    const { intl } = this.props;

    return (
      <React.Fragment>
        <div className={cx('history-table-wrapper')}>
          {this.state.isLoading ? (
            <div className={cx('spinner-wrapper')}>
              <SpinningPreloader />
            </div>
          ) : (
            <React.Fragment>
              {this.state.itemsHistory && (
                <React.Fragment>
                  <div
                    className={cx('history-table-grid', 'history-names-grid', {
                      'many-items': this.isTheBigDepth(),
                    })}
                  >
                    <div className={cx('history-grid-head')}>
                      <div className={cx('history-grid-column')}>
                        <div className={cx('history-grid-header')}>
                          <span>{intl.formatMessage(messages.itemNamesHeaderTitle)}</span>
                        </div>
                      </div>
                    </div>
                    {this.getItemsForLoad().map((item) => (
                      <div key={item.uniqueId} className={cx('history-grid-row')}>
                        <div className={cx('history-grid-column')}>
                          <div>
                            <ItemNameBlock data={item} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className={cx('history-content-wrapper', {
                      'many-items': this.isTheBigDepth(),
                    })}
                  >
                    <ScrollWrapper autoHeight autoHeightMax={'100%'} autoHide>
                      <div className={cx('history-table-grid', 'history-items-grid')}>
                        <div className={cx('history-grid-head')}>
                          {this.state.itemsHistory.map((item) => (
                            <div key={item.launchNumber} className={cx('history-grid-column')}>
                              <div
                                className={cx(
                                  'history-grid-header',
                                  `launch-status-${item.launchStatus}`,
                                )}
                              >
                                <span>
                                  {`${intl.formatMessage(messages.launchNumberTitle)}${
                                    item.launchNumber
                                  }`}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {this.getItemsForLoad().map((launch) => (
                          <div key={launch.uniqueId} className={cx('history-grid-row')}>
                            {this.state.itemsHistory.map((historyItem) => {
                              let itemProps = {};
                              const currentLaunchHistoryItem = historyItem.resources.filter(
                                (item) => item.uniqueId === launch.uniqueId,
                              );
                              if (!currentLaunchHistoryItem.length) {
                                itemProps = {
                                  status: 'NOT_FOUND',
                                  defects: {},
                                };
                              } else if (currentLaunchHistoryItem.length > 1) {
                                itemProps = {
                                  status: 'MANY',
                                  defects: {},
                                };
                              } else {
                                itemProps = {
                                  status: currentLaunchHistoryItem[0].status,
                                  issue: currentLaunchHistoryItem[0].issue,
                                  defects: currentLaunchHistoryItem[0].statistics.defects,
                                };
                              }
                              return (
                                <div
                                  key={historyItem.startTime}
                                  className={cx('history-grid-column')}
                                >
                                  <HistoryItem {...itemProps} />
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </ScrollWrapper>
                  </div>
                </React.Fragment>
              )}
            </React.Fragment>
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
      </React.Fragment>
    );
  }
}
