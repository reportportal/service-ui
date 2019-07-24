import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { Grid } from 'components/main/grid';
import { PersonalInfo } from './personalInfo';
import { LastLogin } from './lastLogin';
import { ProjectRole } from './projectRole';
import { UnassignButton } from './unassignButton';
import styles from './membersGrid.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  nameCol: { id: 'MembersGrid.nameCol', defaultMessage: 'Name / Login' },
  lastLoginCol: { id: 'MembersGrid.lastLoginCol', defaultMessage: 'Last login' },
  roleCol: { id: 'MembersGrid.roleCol', defaultMessage: 'Project role' },
  actionCol: { id: 'MembersGrid.actionCol', defaultMessage: 'Action' },
});

const NameColumn = ({ className, value }) => (
  <div className={cx('name-col', className)}>
    <PersonalInfo name={value.fullName} login={value.userId} userRole={value.userRole} />
  </div>
);
NameColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
NameColumn.defaultProps = {
  value: {},
};

const LastLoginColumn = ({ className, value }) => {
  const {
    metadata: { last_login: lastLogin = 0 },
  } = value;
  return (
    <div className={cx('last-login-col', className)}>
      <LastLogin time={lastLogin} />
    </div>
  );
};
LastLoginColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
LastLoginColumn.defaultProps = {
  value: {},
};

const RolesColumn = ({ className, value }) => (
  <div className={cx('roles-col', className)}>
    <ProjectRole
      assignedProjects={value.assignedProjects}
      accountRole={value.userRole}
      userId={value.userId}
    />
  </div>
);
RolesColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
RolesColumn.defaultProps = {
  value: {},
};

const UnassignColumn = ({ className, value, customProps }) => (
  <div className={cx('unassign-col', className)}>
    <UnassignButton userId={value.userId} fetchData={customProps.fetchData} />
  </div>
);
UnassignColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
  customProps: PropTypes.object,
};
UnassignColumn.defaultProps = {
  value: {},
  customProps: {},
};

@injectIntl
export class MembersGrid extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    fetchData: PropTypes.func,
    intl: intlShape.isRequired,
    loading: PropTypes.bool,
  };

  static defaultProps = {
    data: [],
    fetchData: () => {},
    loading: false,
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
      id: 'lastLogin',
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
    return (
      <Grid
        columns={this.COLUMNS}
        data={this.props.data}
        changeOnlyMobileLayout
        loading={this.props.loading}
      />
    );
  }
}
