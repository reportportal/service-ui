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
import classNames from 'classnames/bind';
import { Pagination } from '@reportportal/ui-kit';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { PreservedText } from 'components/preservedText';
import { PageHeaderWithBreadcrumbsAndActions } from 'pages/inside/common/pageHeaderWithBreadcrumbsAndActions';
import { projectNameSelector } from 'controllers/project';
import { PROJECT_DASHBOARD_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
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
import { DEFAULT_PAGE_SIZE_OPTIONS } from 'controllers/members/constants';
import { messages as paginationMessages } from 'hooks/usePagination';
import { DASHBOARD_EVENTS, DASHBOARDS } from 'analyticsEvents/dashboardsPageEvents';
import { userInfoSelector } from 'controllers/user';
import { showModalAction } from 'controllers/modal';
import { withFilter } from 'controllers/filter';
import { DeleteDashboardConfirmationMessage } from 'pages/inside/common/modals/deleteDashboardConfirmationMessage';
import { DashboardList } from './dashboardList';
import { DashboardPageToolbar } from './dashboardPageToolbar';
import styles from './dashboardPage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  pageTitle: {
    id: 'DashboardPage.title',
    defaultMessage: 'All Dashboards',
  },
  projectDashboardsTitle: {
    id: 'DashboardPage.projectDashboardsTitle',
    defaultMessage: 'Project Dashboards',
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
    projectName: projectNameSelector(state),
    slugs: urlOrganizationAndProjectSelector(state),
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
@track({ page: DASHBOARDS })
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
    loading: PropTypes.bool,
    projectName: PropTypes.string,
    slugs: PropTypes.shape({
      organizationSlug: PropTypes.string,
      projectSlug: PropTypes.string,
    }),
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
    projectName: '',
    slugs: {},
    pageCount: null,
    activePage: DEFAULT_PAGINATION[PAGE_KEY],
    itemCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    onChangePage: () => {},
    onChangePageSize: () => {},
  };

  state = {
    resetScroll: false,
  };

  componentDidUpdate(prevProps) {
    const { activePage, pageSize, filter } = this.props;

    if (
      prevProps.activePage !== activePage ||
      prevProps.pageSize !== pageSize ||
      prevProps.filter !== filter
    ) {
      this.setState({ resetScroll: true });
    }
  }

  onScrollReset = () => {
    this.setState({ resetScroll: false });
  };

  onDeleteDashboardItem = (item) => {
    const {
      intl: { formatMessage },
      userInfo: { userId },
      showModal,
      deleteDashboard,
    } = this.props;
    const { id } = item;

    const warning = item.owner === userId ? '' : formatMessage(messages.deleteModalWarningMessage);
    showModal({
      id: 'deleteItemsModal',
      data: {
        items: [item],
        onConfirm: () => deleteDashboard(item),
        header: formatMessage(messages.deleteModalTitle),
        mainContent: <DeleteDashboardConfirmationMessage name={item.name} />,
        warning,
        eventsInfo: {
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
    const { showModal, addDashboard } = this.props;

    showModal({
      id: 'dashboardAddEditModal',
      data: {
        onSubmit: addDashboard,
        type: 'add',
      },
    });
  };

  getBreadcrumbDescriptors = () => {
    const {
      projectName,
      slugs: { organizationSlug, projectSlug },
    } = this.props;

    return [
      {
        id: 'project',
        title: <PreservedText>{projectName}</PreservedText>,
        link: { type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } },
      },
    ];
  };

  getPaginationCaptions = () => {
    const { formatMessage } = this.props.intl;

    return {
      items: formatMessage(paginationMessages.items),
      of: formatMessage(paginationMessages.of),
      page: formatMessage(paginationMessages.page),
      goTo: formatMessage(paginationMessages.goToPage),
      goAction: formatMessage(paginationMessages.go),
      perPage: formatMessage(paginationMessages.perPage),
    };
  };

  toggleGridView = () => {
    this.props.changeVisibilityType(DASHBOARDS_GRID_VIEW);
  };

  toggleTableView = () => {
    this.props.changeVisibilityType(DASHBOARDS_TABLE_VIEW);
  };

  render() {
    const {
      intl,
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

    // no dashboards at all: the empty state has its own create button, the header controls are hidden
    const isEmptyState = !dashboardItems.length && !filter && !loading;

    return (
      <SettingsLayout>
        <ScrollWrapper resetRequired={this.state.resetScroll} onReset={this.onScrollReset}>
          <PageHeaderWithBreadcrumbsAndActions
            title={intl.formatMessage(messages.projectDashboardsTitle)}
            breadcrumbDescriptors={this.getBreadcrumbDescriptors()}
            actions={
              !isEmptyState && (
                <DashboardPageToolbar
                  filter={filter}
                  gridType={gridType}
                  onFilterChange={onFilterChange}
                  onGridViewToggle={this.toggleGridView}
                  onTableViewToggle={this.toggleTableView}
                  onAddItem={this.onAddDashboardItem}
                />
              )
            }
          />
          <div className={cx('content-wrapper', { 'content-wrapper--loading': loading })}>
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
          </div>
          {!!pageCount && !loading && (
            <div className={cx('pagination')}>
              <Pagination
                activePage={activePage}
                totalPages={pageCount}
                totalItems={itemCount}
                pageSize={pageSize}
                pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
                captions={this.getPaginationCaptions()}
                changePage={onChangePage}
                changePageSize={onChangePageSize}
              />
            </div>
          )}
        </ScrollWrapper>
      </SettingsLayout>
    );
  }
}
