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
import track from 'react-tracking';
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
import { UNIQUE_ERRORS_PAGE_EVENTS } from 'components/main/analytics/events';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import { UNIQUE_ERRORS_PAGE } from 'components/main/analytics/events/uniqueErrorsPageEvents';
import { UniqueErrorsToolbar } from './uniqueErrorsToolbar';

const POST_ISSUE_EVENTS_INFO = {
  postBtn: UNIQUE_ERRORS_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.POST_BTN_POST_ISSUE_MODAL,
  attachmentsSwitcher: UNIQUE_ERRORS_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.attachmentsSwitcher,
  logsSwitcher: UNIQUE_ERRORS_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.logsSwitcher,
  commentSwitcher: UNIQUE_ERRORS_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.commentSwitcher,
  cancelBtn: UNIQUE_ERRORS_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.CANCEL_BTN_POST_ISSUE_MODAL,
  closeIcon: UNIQUE_ERRORS_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.CLOSE_ICON_POST_ISSUE_MODAL,
};
const LINK_ISSUE_EVENTS_INFO = {
  loadBtn: UNIQUE_ERRORS_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.LOAD_BTN_LINK_ISSUE_MODAL,
  cancelBtn: UNIQUE_ERRORS_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.CANCEL_BTN_LINK_ISSUE_MODAL,
  addNewIssue: UNIQUE_ERRORS_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.ADD_NEW_ISSUE_BTN_LINK_ISSUE_MODAL,
  closeIcon: UNIQUE_ERRORS_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.CLOSE_ICON_LINK_ISSUE_MODAL,
};
const UNLINK_ISSUE_EVENTS_INFO = {
  unlinkAutoAnalyzedFalse:
    UNIQUE_ERRORS_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS
      .UNLINK_IN_UNLINK_ISSUE_MODAL_AUTO_ANALYZED_FALSE,
  unlinkAutoAnalyzedTrue:
    UNIQUE_ERRORS_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS
      .UNLINK_IN_UNLINK_ISSUE_MODAL_AUTO_ANALYZED_TRUE,
  unlinkBtn: UNIQUE_ERRORS_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.UNLINK_BTN_UNLINK_ISSUE_MODAL,
  cancelBtn: UNIQUE_ERRORS_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.CANCEL_BTN_UNLINK_ISSUE_MODAL,
  closeIcon: UNIQUE_ERRORS_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.CLOSE_ICON_UNLINK_ISSUE_MODAL,
};

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
    reloadClustersAction,
  },
)
@withPagination({
  paginationSelector: uniqueErrorsPaginationSelector,
  namespaceSelector,
})
@injectIntl
@track({ page: UNIQUE_ERRORS_PAGE })
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
    reloadClustersAction: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
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
    reloadClustersAction: () => {},
  };
  unselectItem = (item) => {
    this.props.toggleClusterItemSelectionAction(item);
  };
  unselectAndFetchItems = () => {
    this.props.unselectAllClusterItemsAction();
    this.props.reloadClustersAction();
  };
  onEditItem = (item) => {
    this.props.showModalAction({
      id: 'testItemDetails',
      data: {
        item,
        type: LAUNCH_ITEM_TYPES.item,
        fetchFunc: this.unselectAndFetchItems,
        eventsInfo: {
          stackTraceTab: UNIQUE_ERRORS_PAGE_EVENTS.EDIT_ITEMS_MODAL_EVENTS.STACK_TRACE_TAB_EVENT,
          addAttribute: UNIQUE_ERRORS_PAGE_EVENTS.EDIT_ITEMS_MODAL_EVENTS.ADD_ATTRIBUTE,
          clickSaveEvent:
            UNIQUE_ERRORS_PAGE_EVENTS.EDIT_ITEMS_MODAL_EVENTS.SAVE_BTN_EDIT_ITEM_MODAL,
          onOpenStackTraceEvent: () => UNIQUE_ERRORS_PAGE_EVENTS.CLICK_EXPAND_STACK_TRACE_ARROW,
        },
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
        eventsInfo: {
          saveBtn: UNIQUE_ERRORS_PAGE_EVENTS.EDIT_ITEMS_MODAL_EVENTS.SAVE_BTN_EDIT_ITEM_MODAL,
          editDescription: UNIQUE_ERRORS_PAGE_EVENTS.EDIT_ITEMS_MODAL_EVENTS.EDIT_ITEM_DESCRIPTION,
        },
      },
    });
    this.props.tracking.trackEvent(UNIQUE_ERRORS_PAGE_EVENTS.EDIT_ITEMS_ACTION);
  };
  handleEditDefects = (eventData) => {
    const { selectedItems, tracking } = this.props;
    const items = eventData && eventData.id ? [eventData] : selectedItems;
    this.props.editDefectsAction(items, {
      fetchFunc: this.unselectAndFetchItems,
      eventsInfo: {
        editDefectsEvents: UNIQUE_ERRORS_PAGE_EVENTS.MAKE_DECISION_MODAL_EVENTS,
        unlinkIssueEvents: UNLINK_ISSUE_EVENTS_INFO,
        linkIssueEvents: LINK_ISSUE_EVENTS_INFO,
        postIssueEvents: POST_ISSUE_EVENTS_INFO,
      },
    });
    tracking.trackEvent(
      UNIQUE_ERRORS_PAGE_EVENTS.MAKE_DECISION_MODAL_EVENTS.openModal(
        items.length === 1
          ? items[0].issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX)
          : undefined,
        eventData && eventData.id ? '' : 'ActionMenu',
      ),
    );
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
      onConfirm: (items) => {
        this.props.deleteTestItemsAction({
          items,
          callback: this.unselectAndFetchItems,
        });
        this.props.tracking.trackEvent(
          UNIQUE_ERRORS_PAGE_EVENTS.DELETE_ITEM_MODAL_EVENTS.DELETE_BTN_DELETE_ITEM_MODAL,
        );
      },
      userId,
      parentLaunch: this.props.parentLaunch,
      eventsInfo: {},
    });
    this.props.deleteClusterItemsAction(selectedItems, parameters);
    this.props.tracking.trackEvent(UNIQUE_ERRORS_PAGE_EVENTS.DELETE_ACTION);
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
                events={UNIQUE_ERRORS_PAGE_EVENTS}
              />
              <UniqueErrorsGrid
                parentLaunch={parentLaunch}
                data={clusters}
                loading={loading}
                onUnlinkSingleTicket={this.handleUnlinkSingleTicket}
                unselectAndFetchItems={this.unselectAndFetchItems}
                onEditItem={this.onEditItem}
                onEditDefect={this.handleEditDefects}
                events={UNIQUE_ERRORS_PAGE_EVENTS}
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
