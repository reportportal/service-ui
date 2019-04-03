import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import { Grid } from 'components/main/grid';
import { AbsRelTime } from 'components/main/absRelTime';
import {
  FULL_NAME,
  USER,
  EMAIL,
  LAST_LOGIN,
  TYPE,
  PROJECT,
} from 'common/constants/userObjectTypes';
import { ProjectsAndRolesColumn } from './projectsAndRolesColumn';
import { NameColumn } from './nameColumn';
import styles from './allUsersGrid.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  nameCol: { id: 'AllUsersGrid.nameCol', defaultMessage: 'Name' },
  typeCol: { id: 'AllUsersGrid.typeCol', defaultMessage: 'Type' },
  loginCol: { id: 'AllUsersGrid.loginCol', defaultMessage: 'Login' },
  emailCol: { id: 'AllUsersGrid.emailCol', defaultMessage: 'Email' },
  lastLoginCol: { id: 'AllUsersGrid.lastLoginCol', defaultMessage: 'Last Login' },
  projectsAndRolesCol: {
    id: 'AllUsersGrid.projectsAndRolesCol',
    defaultMessage: 'Projects and roles',
  },
});

const TypeColumn = ({ className, value }) => (
  <div className={cx('type-col', className)}>{value.accountType.toLowerCase()}</div>
);
TypeColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
TypeColumn.defaultProps = {
  value: {},
};

const LoginColumn = ({ className, value }) => (
  <div className={cx('login-col', className)}>{value.userId}</div>
);
LoginColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
LoginColumn.defaultProps = {
  value: {},
};

const EmailColumn = ({ className, value }) => (
  <div className={cx('email-col', className)}>
    <span className={cx('mobile-label')}>
      <FormattedMessage id={'AllUsersGrid.emailCol'} defaultMessage={'Email'} />
    </span>
    {value.email}
  </div>
);
EmailColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
EmailColumn.defaultProps = {
  value: {},
};

const LastLoginColumn = ({ className, value }) => (
  <div className={cx('last-login-col', className)}>
    <span className={cx('mobile-label', 'last-login-label')}>
      <FormattedMessage id={'AllUsersGrid.loginCol'} defaultMessage={'Login'} />
    </span>
    <AbsRelTime startTime={value.metadata.last_login} />
  </div>
);
LastLoginColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
LastLoginColumn.defaultProps = {
  value: {},
};

@injectIntl
export class AllUsersGrid extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    intl: intlShape.isRequired,
    loading: PropTypes.bool,
    onToggleSelection: PropTypes.func,
    onToggleSelectAll: PropTypes.func,
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    excludeFromSelection: PropTypes.arrayOf(PropTypes.object),
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    loading: false,
    onToggleSelectAll: () => {},
    onToggleSelection: () => {},
    selectedItems: [],
    excludeFromSelection: [],
    sortingColumn: null,
    sortingDirection: null,
    onChangeSorting: () => {},
  };

  getColumns = () => [
    {
      id: FULL_NAME,
      title: {
        full: this.props.intl.formatMessage(messages.nameCol),
      },
      maxHeight: 170,
      component: NameColumn,
      sortable: true,
    },
    {
      id: USER,
      title: {
        full: this.props.intl.formatMessage(messages.loginCol),
      },
      component: LoginColumn,
      sortable: true,
    },
    {
      id: EMAIL,
      title: {
        full: this.props.intl.formatMessage(messages.emailCol),
      },
      component: EmailColumn,
      sortable: true,
    },
    {
      id: LAST_LOGIN,
      title: {
        full: this.props.intl.formatMessage(messages.lastLoginCol),
      },
      component: LastLoginColumn,
      sortable: true,
    },
    {
      id: TYPE,
      title: {
        full: this.props.intl.formatMessage(messages.typeCol),
      },
      component: TypeColumn,
      sortable: true,
    },
    {
      id: PROJECT,
      title: {
        full: this.props.intl.formatMessage(messages.projectsAndRolesCol),
      },
      component: ProjectsAndRolesColumn,
      sortable: true,
    },
  ];

  COLUMNS = this.getColumns();

  render() {
    const {
      onToggleSelection,
      selectedItems,
      excludeFromSelection,
      onToggleSelectAll,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
    } = this.props;
    return (
      <Grid
        columns={this.COLUMNS}
        data={this.props.data}
        loading={this.props.loading}
        onToggleSelection={onToggleSelection}
        onToggleSelectAll={onToggleSelectAll}
        sortingColumn={sortingColumn}
        sortingDirection={sortingDirection}
        onChangeSorting={onChangeSorting}
        changeOnlyMobileLayout
        selectedItems={selectedItems}
        selectable
        excludeFromSelection={excludeFromSelection}
      />
    );
  }
}
