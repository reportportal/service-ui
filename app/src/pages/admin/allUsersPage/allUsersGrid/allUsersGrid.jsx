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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
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
  <div className={cx('type-col', className)}>
    <span className={cx('mobile-label')}>
      <FormattedMessage id={'AllUsersGrid.typeCol'} defaultMessage={'Type'} />
    </span>
    {value.accountType.toLowerCase()}
  </div>
);
TypeColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
TypeColumn.defaultProps = {
  value: {},
};

const LoginColumn = ({ className, value }) => (
  <div className={cx('login-col', className)}>
    <div className={cx('login-block')} title={value.userId}>
      {value.userId}
    </div>
  </div>
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
    <div className={cx('email-block')} title={value.email}>
      <a className={cx('email-link')} href={`mailto:${value.email}`}>
        {value.email}
      </a>
    </div>
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
    <AbsRelTime startTime={value.metadata.last_login} customClass={cx('last-login-time')} />
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
    intl: PropTypes.object.isRequired,
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
      sortable: false,
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
