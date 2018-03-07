import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { Grid } from 'components/main/grid';
import { PersonalInfo } from './personalInfo';
import { LastLogin } from './lastLogin';
import { ProjectRole } from './projectRole';
import { UnassignAction } from './unassignAction';
import styles from './membersGrid.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  nameCol: { id: 'MembersGrid.nameCol', defaultMessage: 'Name / Login' },
  lastLoginCol: { id: 'MembersGrid.lastLoginCol', defaultMessage: 'Last login' },
  roleCol: { id: 'MembersGrid.roleCol', defaultMessage: 'Project role' },
  actionCol: { id: 'MembersGrid.actionCol', defaultMessage: 'Action' },
});

const NameColumn = ({ className, ...rest }) => (
  <div className={cx('name-col', className)}>
    <PersonalInfo
      name={rest.value.full_name}
      login={rest.value.userId}
      userRole={rest.value.userRole}
    />
  </div>
);
NameColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const LastLoginColumn = ({ className, ...rest }) => (
  <div className={cx('last-login-col', className)}>
    <LastLogin time={rest.value.last_login} />
  </div>
);
LastLoginColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const RolesColumn = ({ className, ...rest }) => (
  <div className={cx('roles-col', className)}>
    <ProjectRole
      assignedProjects={rest.value.assigned_projects}
      accountRole={rest.value.userRole}
      userId={rest.value.userId}
    />
  </div>
);
RolesColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const UnassignColumn = ({ className, ...rest }) => (
  <div className={cx('unassign-col', className)}>
    <UnassignAction userId={rest.value.userId} fetchData={rest.customProps.fetchData} />
  </div>
);
UnassignColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

@injectIntl
export class MembersGrid extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    fetchData: PropTypes.func,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    data: [],
    fetchData: () => {},
  };

  getColumns = () => [
    {
      id: 'name',
      title: {
        full: this.props.intl.formatMessage(messages.nameCol),
      },
      maxHeight: 170,
      component: NameColumn,
    },
    {
      id: 'last_login',
      title: {
        full: this.props.intl.formatMessage(messages.lastLoginCol),
      },
      component: LastLoginColumn,
    },
    {
      id: 'roles',
      title: {
        full: this.props.intl.formatMessage(messages.roleCol),
      },
      component: RolesColumn,
    },
    {
      id: 'unassign',
      title: {
        full: this.props.intl.formatMessage(messages.actionCol),
      },
      component: UnassignColumn,
      customProps: {
        fetchData: this.props.fetchData,
      },
    },
  ];

  COLUMNS = this.getColumns();

  render() {
    return <Grid columns={this.COLUMNS} data={this.props.data} changeOnlyMobileLayout />;
  }
}
