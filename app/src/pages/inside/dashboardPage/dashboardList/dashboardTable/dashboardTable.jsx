import React, { Component, Fragment } from 'react';
import classNames from 'classnames/bind';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { Grid } from 'components/main/grid';
import { Icon } from 'components/main/icon';
import { EmptyDashboards } from 'pages/inside/dashboardPage/dashboardList/EmptyDashboards';
import { hasPrevilegesForDashboardDeletion } from 'common/utils/validation';
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

const DashboardNameColumn = (props) => (
  <NavLink className={cx('name', 'cell')} to={`dashboard/${props.value.id}`}>
    {props.value.name}
  </NavLink>
);
DashboardNameColumn.propTypes = {
  value: PropTypes.object,
};
DashboardNameColumn.defaultProps = {
  value: {},
};

const DescriptionColumn = ({ value }) => <div className={cx('description', 'cell')}>{value}</div>;
DescriptionColumn.propTypes = {
  value: PropTypes.string,
};
DescriptionColumn.defaultProps = {
  value: '',
};

const OwnerColumn = ({ value }) => <div className={cx('owner', 'cell')}>{value}</div>;
OwnerColumn.propTypes = {
  value: PropTypes.string,
};
OwnerColumn.defaultProps = {
  value: '',
};

const SharedColumn = ({ value: { share, owner }, customProps: { currentUser: { userId } } }) => {
  const isShared = share || userId !== owner;

  return <div className={cx('shared', 'cell')}>{isShared && <Icon type="icon-check" />}</div>;
};
SharedColumn.propTypes = {
  value: PropTypes.object,
  customProps: PropTypes.object,
};
SharedColumn.defaultProps = {
  value: {},
  customProps: {},
};

const EditColumn = ({ value, customProps }) => {
  const { onEdit, currentUser: { userId } } = customProps;
  const { owner } = value;

  const editItemHandler = () => {
    onEdit(value);
  };

  return (
    <div className={cx('cell', 'with-button', 'edit')}>
      <div className={cx('icon-holder')}>
        {userId === owner && <Icon type="icon-pencil" onClick={editItemHandler} />}
      </div>
    </div>
  );
};
EditColumn.propTypes = {
  value: PropTypes.object,
  customProps: PropTypes.object,
};
EditColumn.defaultProps = {
  value: {},
  customProps: {},
};

const DeleteColumn = ({ value, customProps }) => {
  const { onDelete, currentUser: { userId, userRole } } = customProps;
  const { owner } = value;
  const deleteItemHandler = () => {
    onDelete(value);
  };

  return (
    <div className={cx('cell', 'with-button', 'delete')}>
      <div className={cx('icon-holder')}>
        {(userId === owner || hasPrevilegesForDashboardDeletion(userRole)) && (
          <Icon type="icon-delete" onClick={deleteItemHandler} />
        )}
      </div>
    </div>
  );
};
DeleteColumn.propTypes = {
  value: PropTypes.object,
  customProps: PropTypes.object,
};
DeleteColumn.defaultProps = {
  value: {},
  customProps: {},
};

@injectIntl
export class DashboardTable extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onDeleteItem: PropTypes.func,
    onEditItem: PropTypes.func,
    onAddItem: PropTypes.func,
    userInfo: PropTypes.object,
    dashboardItems: PropTypes.array,
  };

  static defaultProps = {
    onDeleteItem: () => {},
    onEditItem: () => {},
    onAddItem: () => {},
    userInfo: {},
    dashboardItems: [],
  };

  getTableColumns() {
    const { onDeleteItem, onEditItem, userInfo, intl } = this.props;

    return [
      {
        title: {
          full: intl.formatMessage(messages.dashboardName),
          short: intl.formatMessage(messages.dashboardName),
        },
        component: DashboardNameColumn,
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
        },
      },
    ];
  }

  COLUMNS = this.getTableColumns();

  render() {
    const { dashboardItems, onAddItem } = this.props;

    return (
      <Fragment>
        <Grid className={cx('dashboard-table')} columns={this.COLUMNS} data={dashboardItems} />
        {dashboardItems.length === 0 && <EmptyDashboards userDashboards action={onAddItem} />}
      </Fragment>
    );
  }
}
