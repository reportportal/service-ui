import React, { Component, Fragment } from 'react';
import classNames from 'classnames/bind';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { Grid } from 'components/main/grid';
import { Icon } from 'components/main/icon';
import styles from './dashboardTable.scss';
import { DashboardEmptyResults } from '../dashboardEmptyResults';

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

const DashboardNameColumn = props => (
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

const DashboardSimpleTextColumn = ({ value }) => (
  <div className={cx('cell')}>{value}</div>
  );
DashboardSimpleTextColumn.propTypes = {
  value: PropTypes.string,
};
DashboardSimpleTextColumn.defaultProps = {
  value: '',
};

const SharedColumn = ({ value: { share, owner }, customProps: { currentUser } }) => {
  const isShared = share || currentUser !== owner;

  return (
    <div className={cx('cell')}>
      {isShared && (<Icon type="icon-check" />)}
    </div>
  );
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
  const { onEdit, currentUser } = customProps;
  const { owner } = value;

  const editItemHandler = () => {
    onEdit(value);
  };

  return (
    <Fragment>
      <div className={cx('cell', 'with-button')}>
        {
          currentUser === owner &&
          (<div onClick={editItemHandler}>
            <Icon type="icon-pencil" />
          </div>)
        }
      </div>
    </Fragment>
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
  const { onDelete } = customProps;
  const deleteItemHandler = () => {
    onDelete(value);
  };

  return (
    <div className={cx('cell', 'with-button')} onClick={deleteItemHandler}>
      <Icon type="icon-delete" />
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
    const { onDeleteItem, onEditItem, userInfo: { userId }, intl } = this.props;

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
        component: DashboardSimpleTextColumn,
        formatter: value => value.description,
      },
      {
        title: {
          full: intl.formatMessage(messages.owner),
          short: intl.formatMessage(messages.owner),
        },
        formatter: value => value.owner,
        component: DashboardSimpleTextColumn,
      },
      {
        title: {
          full: intl.formatMessage(messages.shared),
          short: intl.formatMessage(messages.shared),
        },
        component: SharedColumn,
        customProps: {
          currentUser: userId,
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
          currentUser: userId,
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
        },
      },
    ];
  }


  COLUMNS = this.getTableColumns();

  render() {
    const {
      dashboardItems,
      onAddItem,
    } = this.props;

    return (
      <Fragment>
        <Grid
          columns={this.COLUMNS}
          data={dashboardItems}
          sortingDirection=""
        />
        {
          dashboardItems.length === 0 &&
          (<DashboardEmptyResults
            userDashboards
            action={onAddItem}
          />)
        }
      </Fragment>
    );
  }
}
