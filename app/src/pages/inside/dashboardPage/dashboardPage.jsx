import React, { Component } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import {
  changeVisibilityTypeAction,
  deleteDashboardAction,
  updateDashboardAction,
  addDashboardAction,
  dashboardItemsSelector,
  dashboardGridTypeSelector,
  DASHBOARDS_TABLE_VIEW,
  DASHBOARDS_GRID_VIEW,
} from 'controllers/dashboard';
import { DASHBOARD_PAGE, DASHBOARD_PAGE_EVENTS } from 'components/main/analytics/events';
import { NoItemMessage } from 'components/main/noItemMessage';
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
      "Are you sure you want to delete dashboard '<b>{name}</b>'? It will no longer exist.",
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
  }),
  {
    changeVisibilityType: changeVisibilityTypeAction,
    showModal: showModalAction,
    deleteDashboard: deleteDashboardAction,
    editDashboard: updateDashboardAction,
    addDashboard: addDashboardAction,
  },
)
@withFilter()
@injectIntl
@track({ page: DASHBOARD_PAGE })
export class DashboardPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
  };

  static defaultProps = {
    showModal: () => {},
    deleteDashboard: () => {},
    editDashboard: () => {},
    addDashboard: () => {},
    userInfo: {},
    filter: '',
    dashboardItems: [],
    gridType: '',
    onFilterChange: () => {},
    changeVisibilityType: () => {},
  };

  onDeleteDashboardItem = (item) => {
    const {
      showModal,
      deleteDashboard,
      userInfo: { userId },
      intl,
      tracking,
    } = this.props;
    const warningMessage =
      item.owner === userId ? '' : intl.formatMessage(messages.deleteModalWarningMessage);
    tracking.trackEvent(DASHBOARD_PAGE_EVENTS.DELETE_ICON_DASHBOARD_TILE);
    showModal({
      id: 'deleteItemsModal',
      data: {
        items: [item],
        onConfirm: () => deleteDashboard(item),
        header: intl.formatMessage(messages.deleteModalTitle),
        mainContent: intl.formatMessage(messages.deleteModalConfirmationText, {
          name: item.name,
        }),
        warningMessage,
        eventsInfo: {
          closeIcon: DASHBOARD_PAGE_EVENTS.CLOSE_ICON_DELETE_DASHBOARD_MODAL,
          cancelBtn: DASHBOARD_PAGE_EVENTS.CANCEL_BTN_DELETE_DASHBOARD_MODAL,
          deleteBtn: DASHBOARD_PAGE_EVENTS.DELETE_BTN_DELETE_DASHBOARD_MODAL,
        },
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
        eventsInfo: {
          closeIcon: DASHBOARD_PAGE_EVENTS.CLOSE_ICON_EDIT_DASHBOARD_MODAL,
          changeDescription: DASHBOARD_PAGE_EVENTS.ENTER_DESCRIPTION_EDIT_DASHBOARD_MODAL,
          shareSwitcher: DASHBOARD_PAGE_EVENTS.SHARE_SWITCHER_EDIT_DASHBOARD_MODAL,
          cancelBtn: DASHBOARD_PAGE_EVENTS.CANCEL_BTN_EDIT_DASHBOARD_MODAL,
          submitBtn: DASHBOARD_PAGE_EVENTS.UPDATE_BTN_EDIT_DASHBOARD_MODAL,
        },
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
        eventsInfo: {
          closeIcon: DASHBOARD_PAGE_EVENTS.CLOSE_ICON_ADD_NEW_DASHBOARD_MODAL,
          changeDescription: DASHBOARD_PAGE_EVENTS.ENTER_DESCRIPTION_ADD_NEW_DASHBOARD_MODAL,
          shareSwitcher: DASHBOARD_PAGE_EVENTS.SHARE_SWITCHER_ADD_NEW_DASHBOARD_MODAL,
          cancelBtn: DASHBOARD_PAGE_EVENTS.CANCEL_BTN_ADD_NEW_DASHBOARD_MODAL,
          submitBtn: DASHBOARD_PAGE_EVENTS.ADD_BTN_ADD_NEW_DASHBOARD_MODAL,
        },
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
    const { intl, gridType, userInfo, onFilterChange, filter, dashboardItems } = this.props;
    const eventsInfo = {
      closeIcon: DASHBOARD_PAGE_EVENTS.CLOSE_ICON_ADD_NEW_DASHBOARD_MODAL,
      changeDescription: DASHBOARD_PAGE_EVENTS.ENTER_DESCRIPTION_ADD_NEW_DASHBOARD_MODAL,
      shareSwitcher: DASHBOARD_PAGE_EVENTS.SHARE_SWITCHER_ADD_NEW_DASHBOARD_MODAL,
      cancelBtn: DASHBOARD_PAGE_EVENTS.CANCEL_BTN_ADD_NEW_DASHBOARD_MODAL,
      submitBtn: DASHBOARD_PAGE_EVENTS.ADD_BTN_ADD_NEW_DASHBOARD_MODAL,
    };
    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.getBreadcrumbs()}>
          <DashboardPageHeader eventsInfo={eventsInfo} />
        </PageHeader>
        <PageSection>
          <DashboardPageToolbar
            dashboardItems={dashboardItems}
            onGridViewToggle={this.toggleGridView}
            onTableViewToggle={this.toggleTableView}
            gridType={gridType}
            filter={filter}
            onFilterChange={onFilterChange}
          />
          {filter && dashboardItems.length === 0 ? (
            <NoItemMessage message={intl.formatMessage(messages.noResults)} />
          ) : (
            <DashboardList
              dashboardItems={dashboardItems}
              gridType={gridType}
              userInfo={userInfo}
              onDeleteItem={this.onDeleteDashboardItem}
              onEditItem={this.onEditDashboardItem}
              onAddItem={this.onAddDashboardItem}
            />
          )}
        </PageSection>
      </PageLayout>
    );
  }
}
