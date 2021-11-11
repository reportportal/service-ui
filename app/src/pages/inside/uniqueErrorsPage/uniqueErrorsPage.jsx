/*
 * Copyright 2021 EPAM Systems
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
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { connect } from 'react-redux';
import {
  deleteTestItemsAction,
  launchSelector,
  namespaceSelector,
  parentItemSelector,
} from 'controllers/testItem';
import {
  clustersSelector,
  fetchClustersAction,
  loadingSelector,
  pageLoadingSelector,
  uniqueErrorsPaginationSelector,
} from 'controllers/uniqueErrors';
import PropTypes from 'prop-types';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { DEFAULT_PAGINATION, PAGE_KEY, SIZE_KEY, withPagination } from 'controllers/pagination';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { UniqueErrorsGrid } from 'pages/inside/uniqueErrorsPage/uniqueErrorsGrid';
import {
  selectClusterItemsAction,
  selectedClusterItemsSelector,
  toggleAllClusterItemsAction,
  toggleClusterItemSelectionAction,
  unselectAllClusterItemsAction,
  validationErrorsSelector,
  deleteClusterItemsAction,
  unlinkIssueAction,
  editDefectsAction,
} from 'controllers/uniqueErrors/clusterItems';
import { showModalAction } from 'controllers/modal';
import { LAUNCH_ITEM_TYPES } from 'common/constants/launchItemTypes';
import { getDeleteItemsActionParameters } from 'pages/inside/testItemPage';
import { injectIntl } from 'react-intl';
import { userIdSelector } from 'controllers/user';
import { reloadClustersAction } from 'controllers/uniqueErrors/actionCreators';
import { UniqueErrorsToolbar } from './uniqueErrorsToolbar';

@connect(
  (state) => ({
    pageLoading: pageLoadingSelector(state),
    loading: loadingSelector(state),
    parentLaunch: launchSelector(state),
    parentItem: parentItemSelector(state),
    clusters: clustersSelector(state),
    selectedItems: selectedClusterItemsSelector(state),
    validationErrors: validationErrorsSelector(state),
    userId: userIdSelector(state),
  }),
  {
    toggleClusterItemSelectionAction,
    selectClusterItemsAction,
    unselectAllClusterItemsAction,
    toggleAllClusterItemsAction,
    showModalAction,
    onUnlinkIssue: unlinkIssueAction,
    deleteClusterItemsAction,
    deleteTestItemsAction,
    editDefectsAction,
    fetchClustersAction,
    reloadClusterAction: reloadClustersAction,
  },
)
@withPagination({
  paginationSelector: uniqueErrorsPaginationSelector,
  namespaceSelector,
})
@injectIntl
export class UniqueErrorsPage extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired,
    pageLoading: PropTypes.bool,
    loading: PropTypes.bool,
    parentLaunch: PropTypes.object,
    clusters: PropTypes.array,
    parentItem: PropTypes.object,
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    toggleClusterItemSelectionAction: PropTypes.func,
    selectClusterItemsAction: PropTypes.func,
    unselectAllClusterItemsAction: PropTypes.func,
    toggleAllClusterItemsAction: PropTypes.func,
    showModalAction: PropTypes.func,
    validationErrors: PropTypes.object,
    deleteTestItemsAction: PropTypes.func,
    deleteClusterItemsAction: PropTypes.func,
    onUnlinkIssue: PropTypes.func,
    editDefectsAction: PropTypes.func,
    reloadClusterAction: PropTypes.func,
  };
  static defaultProps = {
    pageLoading: false,
    loading: false,
    parentLaunch: {},
    clusters: [],
    parentItem: {},
    activePage: DEFAULT_PAGINATION[PAGE_KEY],
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    onChangePage: () => {},
    onChangePageSize: () => {},
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    toggleClusterItemSelectionAction: PropTypes.func,
    selectClusterItemsAction: PropTypes.func,
    unselectAllClusterItemsAction: PropTypes.func,
    toggleAllClusterItemsAction: PropTypes.func,
    showModalAction: PropTypes.func,
    validationErrors: {},
    deleteTestItemsAction: () => {},
    deleteClusterItemsAction: () => {},
    onUnlinkIssue: () => {},
    editDefectsAction: () => {},
    reloadClusterAction: () => {},
  };
  unselectItem = (item) => {
    this.props.toggleClusterItemSelectionAction(item);
  };
  unselectAndFetchItems = () => {
    this.props.unselectAllClusterItemsAction();
    this.props.reloadClusterAction();
  };
  onEditItem = (item) => {
    this.props.showModalAction({
      id: 'testItemDetails',
      data: {
        item,
        type: LAUNCH_ITEM_TYPES.item,
        fetchFunc: this.unselectAndFetchItems,
        eventsInfo: {},
      },
    });
  };
  onEditItems = () => {
    this.props.showModalAction({
      id: 'editItemsModal',
      data: {
        items: this.props.selectedItems,
        parentLaunch: this.props.parentLaunch,
        type: LAUNCH_ITEM_TYPES.item,
        fetchFunc: this.unselectAndFetchItems,
        eventsInfo: {},
      },
    });
  };
  handleEditDefects = (eventData) => {
    const { selectedItems } = this.props;
    const items = eventData && eventData.id ? [eventData] : selectedItems;
    this.props.editDefectsAction(items, {
      fetchFunc: this.unselectAndFetchItems,
      eventsInfo: {},
    });
  };
  handleUnlinkSingleTicket = (testItem) => (ticketId) => {
    const items = [
      {
        ...testItem,
        issue: {
          ...testItem.issue,
          externalSystemIssues: testItem.issue.externalSystemIssues.filter(
            (issue) => issue.ticketId === ticketId,
          ),
        },
      },
    ];
    this.props.onUnlinkIssue(items, {
      fetchFunc: this.unselectAndFetchItems,
      eventsInfo: {},
    });
  };
  deleteItems = () => {
    const {
      intl: { formatMessage },
      selectedItems,
      userId,
    } = this.props;
    const parameters = getDeleteItemsActionParameters(selectedItems, formatMessage, {
      onConfirm: (items) =>
        this.props.deleteTestItemsAction({
          items,
          callback: this.unselectAndFetchItems,
        }),
      userId,
      parentLaunch: this.props.parentLaunch,
      eventsInfo: {},
    });
    this.props.deleteClusterItemsAction(selectedItems, parameters);
  };

  render() {
    const {
      parentLaunch,
      clusters,
      parentItem,
      pageLoading,
      loading,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      selectedItems,
      validationErrors,
    } = this.props;
    return (
      <PageLayout>
        <PageSection>
          {pageLoading ? (
            <SpinningPreloader />
          ) : (
            <>
              <UniqueErrorsToolbar
                errors={validationErrors}
                selectedItems={selectedItems}
                onUnselect={this.unselectItem}
                onUnselectAll={this.props.unselectAllClusterItemsAction}
                onDelete={this.deleteItems}
                parentItem={parentItem}
                unselectAndFetchItems={this.unselectAndFetchItems}
                onEditItems={this.onEditItems}
                onEditDefects={this.handleEditDefects}
              />
              <UniqueErrorsGrid
                parentLaunch={parentLaunch}
                data={clusters}
                loading={loading}
                handleEditDefects={this.handleEditDefects}
                onUnlinkSingleTicket={this.handleUnlinkSingleTicket}
                unselectAndFetchItems={this.unselectAndFetchItems}
                onEditItem={this.onEditItem}
                onEditDefect={this.handleEditDefects}
              />
              {!!pageCount && !loading && (
                <PaginationToolbar
                  activePage={activePage}
                  itemCount={itemCount}
                  pageCount={pageCount}
                  pageSize={pageSize}
                  onChangePage={onChangePage}
                  onChangePageSize={onChangePageSize}
                />
              )}
            </>
          )}
        </PageSection>
      </PageLayout>
    );
  }
}
