import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { PageLayout } from 'layouts/pageLayout';
import { GhostButton } from 'components/buttons/ghostButton';
import {
  fetchDashboardAction,
  changeVisibilityTypeAction,
  deleteDashboardAction,
  editDashboardAction,
  addDashboardAction,
  dashboardItemsSelector,
  dashboardGridTypeSelector,
  DASHBOARDS_TABLE_VIEW,
  DASHBOARDS_GRID_VIEW,
} from 'controllers/dashboard';
import { userInfoSelector } from 'controllers/user';
import { showModalAction } from 'controllers/modal';
import { withFilter } from 'controllers/filter';
import AddDashboardIcon from './img/ic-add-dash-inline.svg';
import { DashboardList } from './dashboardList';
import { DashboardPageToolbar } from './dashboardPageToolbar';
import styles from './dashboardPage.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  pageTitle: {
    id: 'DashboardPage.title',
    defaultMessage: 'All Dashboards',
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
    defaultMessage: 'Are you sure to delete dashboard {name}? It will no longer exist.',
  },
  deleteModalSubmitButtonText: {
    id: 'DashboardPage.modal.deleteModalSubmitButtonText',
    defaultMessage: 'Delete',
  },
  editModalTitle: {
    id: 'DashboardPage.modal.editModalTitle',
    defaultMessage: 'Edit Dashboard',
  },
  editModalSubmitButtonText: {
    id: 'DashboardPage.modal.editModalSubmitButtonText',
    defaultMessage: 'Update',
  },
  addModalTitle: {
    id: 'DashboardPage.modal.addModalTitle',
    defaultMessage: 'Add New Dashboard',
  },
  addModalSubmitButtonText: {
    id: 'DashboardPage.modal.addModalSubmitButtonText',
    defaultMessage: 'Add',
  },
});

@connect(
  (state) => ({
    gridType: dashboardGridTypeSelector(state),
    dashboardItems: dashboardItemsSelector(state),
    userInfo: userInfoSelector(state),
  }),
  {
    fetchDashboard: fetchDashboardAction,
    changeVisibilityType: changeVisibilityTypeAction,
    showModal: showModalAction,
    deleteDashboard: deleteDashboardAction,
    editDashboard: editDashboardAction,
    addDashboard: addDashboardAction,
  },
)
@withFilter
@injectIntl
export class DashboardPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showModal: PropTypes.func,
    deleteDashboard: PropTypes.func,
    editDashboard: PropTypes.func,
    addDashboard: PropTypes.func,
    fetchDashboard: PropTypes.func,
    userInfo: PropTypes.object,
    filter: PropTypes.string,
    dashboardItems: PropTypes.array,
    gridType: PropTypes.string,
    onFilterChange: PropTypes.func,
    changeVisibilityType: PropTypes.func,
  };

  static defaultProps = {
    showModal: () => {},
    deleteDashboard: () => {},
    editDashboard: () => {},
    addDashboard: () => {},
    fetchDashboard: () => {},
    userInfo: {},
    filter: '',
    dashboardItems: [],
    gridType: '',
    onFilterChange: () => {},
    changeVisibilityType: () => {},
  };

  componentDidMount() {
    const { fetchDashboard, changeVisibilityType } = this.props;

    fetchDashboard();
    changeVisibilityType();
  }

  onDeleteDashboardItem = (item) => {
    const {
      showModal,
      deleteDashboard,
      userInfo: { userId },
      intl,
    } = this.props;

    showModal({
      id: 'dashboardDeleteModal',
      data: {
        message: intl.formatMessage(messages.deleteModalConfirmationText, { name: item.name }),
        dashboardItem: item,
        onSubmit: deleteDashboard,
        title: intl.formatMessage(messages.deleteModalTitle),
        isCurrentUser: item.owner === userId,
        submitText: intl.formatMessage(messages.deleteModalSubmitButtonText),
        warningMessage: intl.formatMessage(messages.deleteModalWarningMessage),
        cancelText: intl.formatMessage(messages.modalCancelButtonText),
      },
    });
  };

  onEditDashboardItem = (item) => {
    const { showModal, editDashboard, intl } = this.props;

    showModal({
      id: 'dashboardAddEditModal',
      data: {
        dashboardItem: item,
        onSubmit: editDashboard,
        title: intl.formatMessage(messages.editModalTitle),
        submitText: intl.formatMessage(messages.editModalSubmitButtonText),
        cancelText: intl.formatMessage(messages.modalCancelButtonText),
      },
    });
  };

  onAddDashboardItem = () => {
    const { showModal, addDashboard, intl } = this.props;

    showModal({
      id: 'dashboardAddEditModal',
      data: {
        onSubmit: addDashboard,
        title: intl.formatMessage(messages.addModalTitle),
        submitText: intl.formatMessage(messages.addModalSubmitButtonText),
        cancelText: intl.formatMessage(messages.modalCancelButtonText),
      },
    });
  };

  getFilteredDashboardItems = () => {
    const { filter, dashboardItems } = this.props;

    if (!filter) {
      return dashboardItems;
    }

    const filterRule = new RegExp(filter.toLowerCase());

    return dashboardItems.filter((item) => filterRule.test(item.name.toLowerCase()));
  };

  toggleGridView = () => {
    this.props.changeVisibilityType(DASHBOARDS_GRID_VIEW);
  };

  toggleTableView = () => {
    this.props.changeVisibilityType(DASHBOARDS_TABLE_VIEW);
  };

  render() {
    const { gridType, userInfo, onFilterChange, filter, intl } = this.props;
    const dashboardItems = this.getFilteredDashboardItems();

    return (
      <PageLayout title={intl.formatMessage(messages.pageTitle)}>
        <div className={cx('add-dashboard-btn')}>
          <GhostButton onClick={this.onAddDashboardItem} icon={AddDashboardIcon}>
            {intl.formatMessage(messages.addModalTitle)}
          </GhostButton>
        </div>
        <DashboardPageToolbar
          dashboardItems={dashboardItems}
          onGridViewToggle={this.toggleGridView}
          onTableViewToggle={this.toggleTableView}
          gridType={gridType}
          filter={filter}
          onFilterChange={onFilterChange}
        />
        <DashboardList
          dashboardItems={dashboardItems}
          gridType={gridType}
          userInfo={userInfo}
          onDeleteItem={this.onDeleteDashboardItem}
          onEditItem={this.onEditDashboardItem}
          onAddItem={this.onAddDashboardItem}
        />
      </PageLayout>
    );
  }
}
