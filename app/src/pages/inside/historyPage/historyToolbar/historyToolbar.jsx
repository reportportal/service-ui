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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { HISTORY_PAGE_EVENTS } from 'components/main/analytics/events';
import { RefineFiltersPanel } from 'pages/inside/common/refineFiltersPanel';
import { InfoPanel } from 'pages/inside/common/infoPanel';
import { HISTORY_VIEW } from 'controllers/testItem';
import { ActionPanel } from './actionPanel';
import { ActionPanelWithGroupOperations } from './actionPanelWithGroupOperations';

export const HistoryToolbar = ({
  selectedItems,
  onUnselect,
  onUnselectAll,
  onRefresh,
  onFilterAdd,
  onFilterRemove,
  onFilterValidate,
  onFilterChange,
  filterErrors,
  filterEntities,
  isTestItemsList,
  withGroupOperations,
  userId,
  parentItem,
}) => (
  <Fragment>
    {withGroupOperations ? (
      <ActionPanelWithGroupOperations
        onRefresh={onRefresh}
        selectedItems={selectedItems}
        onUnselect={onUnselect}
        onUnselectAll={onUnselectAll}
        userId={userId}
        parentItem={parentItem}
      />
    ) : (
      <ActionPanel onRefresh={onRefresh} selectedItems={selectedItems} parentItem={parentItem} />
    )}
    {(parentItem || isTestItemsList) && <InfoPanel viewMode={HISTORY_VIEW} data={parentItem} />}
    <RefineFiltersPanel
      onFilterAdd={onFilterAdd}
      onFilterRemove={onFilterRemove}
      onFilterValidate={onFilterValidate}
      onFilterChange={onFilterChange}
      filterErrors={filterErrors}
      filterEntities={filterEntities}
      events={HISTORY_PAGE_EVENTS.REFINE_FILTERS_PANEL_EVENTS}
    />
  </Fragment>
);
HistoryToolbar.propTypes = {
  selectedItems: PropTypes.arrayOf(PropTypes.object),
  userId: PropTypes.string,
  isTestItemsList: PropTypes.bool,
  filterErrors: PropTypes.object,
  filterEntities: PropTypes.array,
  withGroupOperations: PropTypes.bool,
  parentItem: PropTypes.object,
  onRefresh: PropTypes.func,
  onFilterAdd: PropTypes.func,
  onFilterRemove: PropTypes.func,
  onFilterValidate: PropTypes.func,
  onFilterChange: PropTypes.func,
  onUnselect: PropTypes.func,
  onUnselectAll: PropTypes.func,
};
HistoryToolbar.defaultProps = {
  selectedItems: [],
  userId: '',
  isTestItemsList: false,
  filterErrors: {},
  filterEntities: [],
  withGroupOperations: false,
  parentItem: null,
  onRefresh: () => {},
  onFilterAdd: () => {},
  onFilterRemove: () => {},
  onFilterValidate: () => {},
  onFilterChange: () => {},
  onUnselect: () => {},
  onUnselectAll: () => {},
};
