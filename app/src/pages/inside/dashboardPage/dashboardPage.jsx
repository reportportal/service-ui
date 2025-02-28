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
import track from 'react-tracking';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import {
  changeVisibilityTypeAction,
  deleteDashboardAction,
  updateDashboardAction,
  addDashboardAction,
  duplicateDashboardAction,
  dashboardItemsSelector,
  dashboardGridTypeSelector,
  DASHBOARDS_TABLE_VIEW,
  DASHBOARDS_GRID_VIEW,
  loadingSelector,
  dashboardPaginationSelector,
} from 'controllers/dashboard';
import { DEFAULT_PAGINATION, PAGE_KEY, SIZE_KEY, withPagination } from 'controllers/pagination';
import { DASHBOARD_PAGE, DASHBOARD_PAGE_EVENTS } from 'components/main/analytics/events';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import { userInfoSelector } from 'controllers/user';
import { showModalAction } from 'controllers/modal';
import { withFilter } from 'controllers/filter';
import { DashboardPageHeader } from 'pages/inside/common/dashboardPageHeader';
import { DashboardList } from './dashboardList';
import { DashboardPageToolbar } from './dashboardPageToolbar';

const messages = defineMessages({
  pageTitle: {
    id: 'DashboardPage.title',
    defaultMessage: 'All Dashboards',
  },
  noResults: {
    id: 'DashboardPage.noResults',
    defaultMessage: 'No results found',
  },
  modalCancelButtonText: {
    id: 'DashboardPage.modal.modalCancelButtonText',
    defaultMessage: 'Cancel',
  },
  deleteModalWarningMessage: {
    id: 'DashboardPage.modal.deleteModalWarningMessage',
    defaultMessage:
      'You are going to delete not your own dashboard. This may affect other users information on the project.',
  },
  deleteModalTitle: {
    id: 'DashboardPage.modal.deleteModalTitle',
    defaultMessage: 'Delete Dashboard',
  },
  deleteModalConfirmationText: {
    id: 'DashboardPage.modal.deleteModalConfirmationText',
    defaultMessage:
      "Are you sure you want to delete dashboard ''<b>{name}</b>''? It will no longer exist.",
  },
  deleteModalSubmitButtonText: {
    id: 'DashboardPage.modal.deleteModalSubmitButtonText',
    defaultMessage: 'Delete',
  },
});

@connect(
  (state) => ({
    gridType: dashboardGridTypeSelector(state),
    dashboardItems: dashboardItemsSelector(state),
    userInfo: userInfoSelector(state),
    loading: loadingSelector(state),
  }),
  {
    changeVisibilityType: changeVisibilityTypeAction,
    showModal: showModalAction,
    deleteDashboard: deleteDashboardAction,
    editDashboard: updateDashboardAction,
    addDashboard: addDashboardAction,
    duplicateDashboard: duplicateDashboardAction,
  },
)
@withFilter()
@withPagination({
  paginationSelector: dashboardPaginationSelector,
})
@injectIntl
@track({ page: DASHBOARD_PAGE })
export class DashboardPage extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showModal: PropTypes.func,
    deleteDashboard: PropTypes.func,
    editDashboard: PropTypes.func,
    addDashboard: PropTypes.func,
    userInfo: PropTypes.object,
    filter: PropTypes.string,
    dashboardItems: PropTypes.array,
    gridType: PropTypes.string,
    onFilterChange: PropTypes.func,
    changeVisibilityType: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    loading: PropTypes.bool,
    pageCount: PropTypes.number,
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    duplicateDashboard: PropTypes.func,
  };

  static defaultProps = {
    showModal: () => {},
    deleteDashboard: () => {},
    editDashboard: () => {},
    addDashboard: () => {},
    duplicateDashboard: () => {},
    userInfo: {},
    filter: '',
    dashboardItems: [],
    gridType: '',
    onFilterChange: () => {},
    changeVisibilityType: () => {},
    loading: false,
    pageCount: null,
    activePage: DEFAULT_PAGINATION[PAGE_KEY],
    itemCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    onChangePage: () => {},
    onChangePageSize: () => {},
  };

  onDeleteDashboardItem = (item) => {
    const {
      intl: { formatMessage },
      userInfo: { userId },
      showModal,
      deleteDashboard,
      tracking,
    } = this.props;
    const { id } = item;

    const warning = item.owner === userId ? '' : formatMessage(messages.deleteModalWarningMessage);
    tracking.trackEvent(DASHBOARD_PAGE_EVENTS.DELETE_ICON_DASHBOARD_TILE);
    showModal({
      id: 'deleteItemsModal',
      data: {
        items: [item],
        onConfirm: () => deleteDashboard(item),
        header: formatMessage(messages.deleteModalTitle),
        mainContent: formatMessage(messages.deleteModalConfirmationText, {
          b: (data) => DOMPurify.sanitize(`<b>${data}</b>`),
          name: item.name,
        }),
        warning,
        eventsInfo: {
          closeIcon: DASHBOARD_PAGE_EVENTS.CLOSE_ICON_DELETE_DASHBOARD_MODAL,
          cancelBtn: DASHBOARD_PAGE_EVENTS.CANCEL_BTN_DELETE_DASHBOARD_MODAL,
          deleteBtn: DASHBOARD_EVENTS.clickOnButtonDeleteInModalDeleteDashboard(id),
        },
      },
    });
  };

  onDuplicateDashboardItem = (item) => {
    const { showModal, duplicateDashboard } = this.props;

    const duplicateItem = {
      ...item,
      name: `${item.name}_copy`,
    };

    showModal({
      id: 'dashboardAddEditModal',
      data: {
        dashboardItem: duplicateItem,
        onSubmit: duplicateDashboard,
        type: 'duplicate',
      },
    });
  };

  onEditDashboardItem = (item) => {
    const { showModal, editDashboard } = this.props;

    showModal({
      id: 'dashboardAddEditModal',
      data: {
        dashboardItem: item,
        onSubmit: editDashboard,
        type: 'edit',
      },
    });
  };

  onAddDashboardItem = () => {
    const { showModal, addDashboard, tracking } = this.props;

    tracking.trackEvent(DASHBOARD_PAGE_EVENTS.ADD_NEW_WIDGET_EMPTY_PAGE);
    showModal({
      id: 'dashboardAddEditModal',
      data: {
        onSubmit: addDashboard,
        type: 'add',
      },
    });
  };

  getBreadcrumbs = () => [
    {
      title: this.props.intl.formatMessage(messages.pageTitle),
      eventInfo: DASHBOARD_PAGE_EVENTS.BREADCRUMB_ALL_DASHBOARD,
    },
  ];

  toggleGridView = () => {
    this.props.changeVisibilityType(DASHBOARDS_GRID_VIEW);
  };

  toggleTableView = () => {
    this.props.changeVisibilityType(DASHBOARDS_TABLE_VIEW);
  };

  render() {
    const {
      gridType,
      userInfo,
      onFilterChange,
      filter,
      dashboardItems,
      loading,
      pageCount,
      activePage,
      itemCount,
      pageSize,
      onChangePage,
      onChangePageSize,
    } = this.props;

    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.getBreadcrumbs()}>
          <DashboardPageHeader />
        </PageHeader>
        <PageSection>
          <DashboardPageToolbar
            initialValues={{ filter }}
            onFilterChange={onFilterChange}
            isSearchDisabled={!dashboardItems.length && !filter && !loading}
            onGridViewToggle={this.toggleGridView}
            onTableViewToggle={this.toggleTableView}
            gridType={gridType}
          />
          <DashboardList
            dashboardItems={dashboardItems}
            gridType={gridType}
            userInfo={userInfo}
            loading={loading}
            onDeleteItem={this.onDeleteDashboardItem}
            onDuplicate={this.onDuplicateDashboardItem}
            onEditItem={this.onEditDashboardItem}
            onAddItem={this.onAddDashboardItem}
            filter={filter}
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
        </PageSection>
      </PageLayout>
    );
  }
}
