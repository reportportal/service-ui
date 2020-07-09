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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import track from 'react-tracking';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { activeFilterSelector } from 'controllers/filter';
import {
  refreshHistoryAction,
  selectedHistoryItemsSelector,
  toggleHistoryItemSelectionAction,
  unselectAllHistoryItemsAction,
  HISTORY_BASE_DEFAULT_VALUE,
} from 'controllers/itemsHistory';
import {
  parentItemSelector,
  isTestItemsListSelector,
  isStepLevelSelector,
  isFilterParamsExistsSelector,
  filteredItemStatisticsSelector,
  FILTERED_ITEM_STATISTICS_INITIAL_STATE,
} from 'controllers/testItem';
import { HISTORY_PAGE_EVENTS } from 'components/main/analytics/events';
import { InfoLine, InfoLineListView } from 'pages/inside/common/infoLine';
import { HistoryToolbar } from './historyToolbar';
import { HistoryView } from './historyView';

@connect(
  (state) => ({
    selectedItems: selectedHistoryItemsSelector(state),
    parentItem: parentItemSelector(state),
    currentFilter: activeFilterSelector(state),
    isTestItemsList: isTestItemsListSelector(state),
    isStepLevel: isStepLevelSelector(state),
    isFilterParamsExists: isFilterParamsExistsSelector(state),
    filteredItemStatistics: filteredItemStatisticsSelector(state),
  }),
  {
    refreshHistoryAction,
    toggleItemSelection: toggleHistoryItemSelectionAction,
    onUnselectAll: unselectAllHistoryItemsAction,
  },
)
@track()
export class HistoryPage extends Component {
  static propTypes = {
    refreshHistoryAction: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    parentItem: PropTypes.object,
    currentFilter: PropTypes.object,
    filterErrors: PropTypes.object,
    filterEntities: PropTypes.array,
    isTestItemsList: PropTypes.bool,
    isStepLevel: PropTypes.bool,
    isFilterParamsExists: PropTypes.bool,
    filteredItemStatistics: PropTypes.object,
    onFilterAdd: PropTypes.func,
    onFilterRemove: PropTypes.func,
    onFilterValidate: PropTypes.func,
    onFilterChange: PropTypes.func,
    onUnselectAll: PropTypes.func,
    toggleItemSelection: PropTypes.func,
  };

  static defaultProps = {
    selectedItems: [],
    parentItem: null,
    currentFilter: null,
    filterErrors: {},
    filterEntities: [],
    isTestItemsList: false,
    isStepLevel: false,
    isFilterParamsExists: false,
    filteredItemStatistics: FILTERED_ITEM_STATISTICS_INITIAL_STATE,
    onFilterAdd: () => {},
    onFilterRemove: () => {},
    onFilterValidate: () => {},
    onFilterChange: () => {},
    onUnselectAll: () => {},
    toggleItemSelection: () => {},
  };

  state = {
    historyBase: HISTORY_BASE_DEFAULT_VALUE,
  };

  componentWillUnmount() {
    this.props.onUnselectAll();
  }

  onChangeHistoryBase = (historyBase) => {
    this.props.tracking.trackEvent(HISTORY_PAGE_EVENTS.SELECT_HISTORY_BASE);

    if (historyBase !== this.state.historyBase) {
      this.setState({
        historyBase,
      });
      this.props.refreshHistoryAction({ historyBase });
    }
  };

  onSelectItem = (item) => {
    this.props.tracking.trackEvent(HISTORY_PAGE_EVENTS.SELECT_HISTORY_ITEM);
    this.props.toggleItemSelection(item);
  };

  onUnselectItem = (item) => {
    this.props.tracking.trackEvent(HISTORY_PAGE_EVENTS.CLICK_CLOSE_ICON_FROM_SELECTION);
    this.props.toggleItemSelection(item);
  };

  onUnselectAllItems = () => {
    this.props.tracking.trackEvent(HISTORY_PAGE_EVENTS.CLICK_CLOSE_ICON_ALL_SELECTION);
    this.props.onUnselectAll();
  };

  getInfoLine = () => {
    const {
      isTestItemsList,
      currentFilter,
      parentItem,
      isFilterParamsExists,
      filteredItemStatistics,
    } = this.props;

    if (isTestItemsList) {
      return !!currentFilter && <InfoLineListView data={currentFilter} />;
    }

    return (
      !!parentItem && (
        <InfoLine
          data={parentItem}
          detailedView={isFilterParamsExists}
          detailedStatistics={filteredItemStatistics}
        />
      )
    );
  };

  refreshPage = () => {
    this.props.refreshHistoryAction({ historyBase: this.state.historyBase });
  };

  render() {
    const {
      currentFilter,
      parentItem,
      selectedItems,
      toggleItemSelection,
      onUnselectAll,
      isStepLevel,
      isTestItemsList,
      ...rest
    } = this.props;
    const infoLine = this.getInfoLine();

    return (
      <PageLayout>
        <PageSection>
          <HistoryToolbar
            onRefresh={this.refreshPage}
            infoLine={infoLine}
            onUnselect={this.onUnselectItem}
            onUnselectAll={this.onUnselectAllItems}
            selectedItems={selectedItems}
            withGroupOperations={isStepLevel}
            {...rest}
          />
          <HistoryView
            refreshHistory={this.refreshPage}
            historyBase={this.state.historyBase}
            onChangeHistoryBase={this.onChangeHistoryBase}
            onSelectItem={this.onSelectItem}
            selectedItems={selectedItems}
            withGroupOperations={isStepLevel}
            isTestItemsList={isTestItemsList}
          />
        </PageSection>
      </PageLayout>
    );
  }
}
