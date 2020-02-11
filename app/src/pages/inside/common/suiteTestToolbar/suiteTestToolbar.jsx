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

import { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InfoPanel } from 'pages/inside/common/infoPanel';
import { SelectedItems } from 'pages/inside/common/selectedItems';
import { RefineFiltersPanel } from 'pages/inside/common/refineFiltersPanel';
import { LIST_VIEW } from 'controllers/testItem';
import { ActionPanel } from './actionPanel';
import styles from './suiteTestToolbar.scss';

const cx = classNames.bind(styles);

export const SuiteTestToolbar = ({
  parentItem,
  selectedItems,
  errors,
  onUnselect,
  onUnselectAll,
  onRefresh,
  onProceedValidItems,
  onIgnoreInAA,
  onIncludeInAA,
  onUnlinkIssue,
  onLinkIssue,
  onPostIssue,
  onEditDefects,
  onEditItems,
  debugMode,
  onDelete,
  events,
  onFilterAdd,
  onFilterRemove,
  onFilterValidate,
  onFilterChange,
  filterErrors,
  filterEntities,
  isTestItemsList,
}) => (
  <Fragment>
    <div className={cx({ 'sticky-toolbar': selectedItems.length })}>
      {!!selectedItems.length && (
        <SelectedItems
          selectedItems={selectedItems}
          errors={errors}
          onUnselect={onUnselect}
          onClose={onUnselectAll}
        />
      )}
      <ActionPanel
        debugMode={debugMode}
        hasErrors={selectedItems.some((item) => !!errors[item.id])}
        hasValidItems={selectedItems.length > Object.keys(errors).length}
        onProceedValidItems={onProceedValidItems}
        showBreadcrumbs={selectedItems.length === 0}
        onRefresh={onRefresh}
        selectedItems={selectedItems}
        onIgnoreInAA={onIgnoreInAA}
        onIncludeInAA={onIncludeInAA}
        onUnlinkIssue={onUnlinkIssue}
        onLinkIssue={onLinkIssue}
        onPostIssue={onPostIssue}
        onEditDefects={onEditDefects}
        onEditItems={onEditItems}
        onDelete={onDelete}
        deleteDisabled={!selectedItems.length}
      />
    </div>
    {(parentItem || isTestItemsList) && (
      <InfoPanel viewMode={LIST_VIEW} data={parentItem} events={events} />
    )}
    <RefineFiltersPanel
      onFilterAdd={onFilterAdd}
      onFilterRemove={onFilterRemove}
      onFilterValidate={onFilterValidate}
      onFilterChange={onFilterChange}
      filterErrors={filterErrors}
      filterEntities={filterEntities}
      events={events.REFINE_FILTERS_PANEL_EVENTS}
    />
  </Fragment>
);
SuiteTestToolbar.propTypes = {
  selectedItems: PropTypes.arrayOf(PropTypes.object),
  errors: PropTypes.object,
  onUnselect: PropTypes.func,
  onUnselectAll: PropTypes.func,
  parentItem: PropTypes.object,
  onRefresh: PropTypes.func,
  onProceedValidItems: PropTypes.func,
  onIgnoreInAA: PropTypes.func,
  onIncludeInAA: PropTypes.func,
  onUnlinkIssue: PropTypes.func,
  onLinkIssue: PropTypes.func,
  onPostIssue: PropTypes.func,
  onEditDefects: PropTypes.func,
  onEditItems: PropTypes.func,
  debugMode: PropTypes.bool,
  onDelete: PropTypes.func,
  events: PropTypes.object,
  onFilterAdd: PropTypes.func,
  onFilterRemove: PropTypes.func,
  onFilterValidate: PropTypes.func,
  onFilterChange: PropTypes.func,
  filterErrors: PropTypes.object,
  filterEntities: PropTypes.array,
  currentFilter: PropTypes.object,
  isTestItemsList: PropTypes.bool,
};
SuiteTestToolbar.defaultProps = {
  selectedItems: [],
  errors: {},
  onUnselect: () => {},
  onUnselectAll: () => {},
  parentItem: null,
  onRefresh: () => {},
  onProceedValidItems: () => {},
  onIgnoreInAA: () => {},
  onIncludeInAA: () => {},
  onUnlinkIssue: () => {},
  onLinkIssue: () => {},
  onPostIssue: PropTypes.func,
  onEditDefects: () => {},
  onEditItems: () => {},
  onDelete: () => {},
  debugMode: false,
  updateFilters: () => {},
  onFilterAdd: () => {},
  onFilterRemove: () => {},
  onFilterValidate: () => {},
  onFilterChange: () => {},
  filterErrors: {},
  filterEntities: [],
  events: {
    REFINE_FILTERS_PANEL_EVENTS: {},
  },
  currentFilter: null,
  isTestItemsList: false,
};
