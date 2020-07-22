/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { InfoLine, InfoLineListView } from 'pages/inside/common/infoLine';
import {
  listViewLinkSelector,
  logViewLinkSelector,
  isTestItemsListSelector,
  isFilterParamsExistsSelector,
  filteredItemStatisticsSelector,
  LOG_VIEW,
  LIST_VIEW,
  FILTERED_ITEM_STATISTICS_INITIAL_STATE,
} from 'controllers/testItem';
import { activeFilterSelector } from 'controllers/filter';
import { ViewSwitcher } from './viewSwitcher';
import styles from './infoPanel.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    listViewLink: listViewLinkSelector(state),
    logViewLink: logViewLinkSelector(state),
    currentFilter: activeFilterSelector(state),
    isTestItemsList: isTestItemsListSelector(state),
    isFilterParamsExists: isFilterParamsExistsSelector(state),
    filteredItemStatistics: filteredItemStatisticsSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
@track()
export class InfoPanel extends Component {
  static propTypes = {
    viewMode: PropTypes.string,
    data: PropTypes.object,
    events: PropTypes.object,
    logViewLink: PropTypes.object,
    listViewLink: PropTypes.object,
    currentFilter: PropTypes.object,
    navigate: PropTypes.func.isRequired,
    isTestItemsList: PropTypes.bool.isRequired,
    isFilterParamsExists: PropTypes.bool,
    filteredItemStatistics: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    events: {},
    viewMode: LIST_VIEW,
    data: {},
    logViewLink: {},
    listViewLink: {},
    currentFilter: null,
    isFilterParamsExists: false,
    filteredItemStatistics: FILTERED_ITEM_STATISTICS_INITIAL_STATE,
  };

  onToggleView = (viewMode) => {
    let link;
    if (viewMode === LOG_VIEW) {
      const { logViewLink, tracking, events } = this.props;
      tracking.trackEvent(events.LOG_VIEW_SWITCHER);
      link = logViewLink;
    } else {
      link = this.props.listViewLink;
    }
    this.props.navigate(link);
  };

  renderInfoLineListView = () =>
    !!this.props.currentFilter && <InfoLineListView data={this.props.currentFilter} />;

  render() {
    const {
      viewMode,
      data,
      events,
      isTestItemsList,
      isFilterParamsExists,
      filteredItemStatistics,
    } = this.props;

    return (
      <div className={cx('info-panel')}>
        {isTestItemsList ? (
          this.renderInfoLineListView()
        ) : (
          <Fragment>
            <ViewSwitcher viewMode={viewMode} onToggleView={this.onToggleView} />
            <InfoLine
              data={data}
              events={events}
              detailedView={isFilterParamsExists}
              detailedStatistics={filteredItemStatistics}
            />
          </Fragment>
        )}
      </div>
    );
  }
}
