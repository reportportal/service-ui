import React, { Component, Fragment } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { activeProjectSelector, activeProjectRoleSelector } from 'controllers/user';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { Grid } from 'components/main/grid';
import { EmptyDashboards } from 'pages/inside/dashboardPage/dashboardList/EmptyDashboards';
import {
  NameColumn,
  DescriptionColumn,
  OwnerColumn,
  SharedColumn,
  EditColumn,
  DeleteColumn,
} from './dashboardTableColumns';
import styles from './dashboardTable.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  dashboardName: {
    id: 'DashboardTable.dashboardName',
    defaultMessage: 'Dashboard Name',
  },
  description: {
    id: 'DashboardTable.description',
    defaultMessage: 'Description',
  },
  owner: {
    id: 'DashboardTable.owner',
    defaultMessage: 'Owner',
  },
  shared: {
    id: 'DashboardTable.shared',
    defaultMessage: 'Shared',
  },
  edit: {
    id: 'DashboardTable.edit',
    defaultMessage: 'Edit',
  },
  deleteDashboard: {
    id: 'DashboardTable.deleteDashboard',
    defaultMessage: 'Delete',
  },
});

@injectIntl
@connect((state) => ({
  projectId: activeProjectSelector(state),
  projectRole: activeProjectRoleSelector(state),
}))
export class DashboardTable extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onDeleteItem: PropTypes.func,
    onEditItem: PropTypes.func,
    onAddItem: PropTypes.func,
    userInfo: PropTypes.object,
    projectId: PropTypes.string,
    projectRole: PropTypes.string,
    dashboardItems: PropTypes.array,
    loading: PropTypes.bool,
  };

  static defaultProps = {
    onDeleteItem: () => {},
    onEditItem: () => {},
    onAddItem: () => {},
    userInfo: {},
    projectId: '',
    projectRole: '',
    dashboardItems: [],
    loading: false,
  };

  getTableColumns() {
    const { onDeleteItem, onEditItem, userInfo, intl, projectId, projectRole } = this.props;

    return [
      {
        title: {
          full: intl.formatMessage(messages.dashboardName),
          short: intl.formatMessage(messages.dashboardName),
        },
        component: NameColumn,
        customProps: {
          projectId,
        },
      },
      {
        title: {
          full: intl.formatMessage(messages.description),
          short: intl.formatMessage(messages.description),
        },
        component: DescriptionColumn,
        formatter: (value) => value.description,
      },
      {
        title: {
          full: intl.formatMessage(messages.owner),
          short: intl.formatMessage(messages.owner),
        },
        formatter: (value) => value.owner,
        component: OwnerColumn,
      },
      {
        title: {
          full: intl.formatMessage(messages.shared),
          short: intl.formatMessage(messages.shared),
        },
        component: SharedColumn,
        customProps: {
          currentUser: userInfo,
        },
      },
      {
        title: {
          full: intl.formatMessage(messages.edit),
          short: intl.formatMessage(messages.edit),
        },
        component: EditColumn,
        customProps: {
          onEdit: onEditItem,
          currentUser: userInfo,
          projectRole,
        },
      },
      {
        title: {
          full: intl.formatMessage(messages.deleteDashboard),
          short: intl.formatMessage(messages.deleteDashboard),
        },
        component: DeleteColumn,
        customProps: {
          onDelete: onDeleteItem,
          currentUser: userInfo,
          projectRole,
        },
      },
    ];
  }

  COLUMNS = this.getTableColumns();

  render() {
    const { dashboardItems, loading, onAddItem } = this.props;

    return (
      <Fragment>
        <Grid
          className={cx('dashboard-table')}
          columns={this.COLUMNS}
          data={dashboardItems}
          loading={loading}
        />
        {dashboardItems.length === 0 && <EmptyDashboards userDashboards action={onAddItem} />}
      </Fragment>
    );
  }
}
