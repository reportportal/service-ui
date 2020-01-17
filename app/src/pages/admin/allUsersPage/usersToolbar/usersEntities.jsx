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

import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import {
  EntityContains,
  EntityInputConditional,
  EntityDropdown,
  EntityItemStartTime,
  EntitySearch,
} from 'components/filterEntities';
import {
  CONDITION_CNT,
  CONDITION_IN,
  CONDITION_BETWEEN,
  CONDITION_HAS,
} from 'components/filterEntities/constants';
import { bindDefaultValue } from 'components/filterEntities/utils';
import { USER, ADMINISTRATOR } from 'common/constants/accountRoles';
import { INTERNAL, LDAP, UPSA, GITHUB } from 'common/constants/accountType';
import {
  EMAIL,
  FULL_NAME,
  ROLE,
  TYPE,
  LAST_LOGIN,
  PROJECT,
  USER as LOGIN,
  USERS,
} from 'common/constants/userObjectTypes';

import { URLS } from 'common/urls';

const messages = defineMessages({
  contains: { id: 'usersGrid.contains', defaultMessage: 'Contains' },
  name: { id: 'usersGrid.name', defaultMessage: 'Name' },
  role: { id: 'usersGrid.role', defaultMessage: 'Role' },
  type: { id: 'usersGrid.type', defaultMessage: 'Type' },
  email: { id: 'usersGrid.email', defaultMessage: 'Email' },
  lastLogin: { id: 'usersGrid.lastLogin', defaultMessage: 'Last login' },
  user: { id: 'usersGrid.user', defaultMessage: 'Login' },
  project: { id: 'usersGrid.project', defaultMessage: 'Project' },
  roleAdmin: {
    id: 'usersGrid.roleAdmin',
    defaultMessage: 'Admin',
  },
  roleNonAdmin: {
    id: 'usersGrid.roleNonAdmin',
    defaultMessage: 'Non-admin',
  },
  accountTypeInternal: {
    id: 'usersGrid.accountTypeInternal',
    defaultMessage: 'Internal',
  },
  accountTypeLdap: {
    id: 'usersGrid.accountTypeLdap',
    defaultMessage: 'Ldap',
  },
  accountTypeUpsa: {
    id: 'usersGrid.accountTypeUpsa',
    defaultMessage: 'UPSA',
  },
  accountTypeGithub: {
    id: 'usersGrid.accountTypeGithub',
    defaultMessage: 'Github',
  },
});

@injectIntl
export class UsersEntities extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    filterValues: PropTypes.object,
    render: PropTypes.func.isRequired,
  };

  static defaultProps = {
    loading: false,
    events: [],
    filterValues: {},
  };
  getEntities = () => {
    const { intl } = this.props;
    return [
      {
        id: USERS,
        component: EntityContains,
        value: this.bindDefaultValue(USERS),
        title: intl.formatMessage(messages.contains),
        active: true,
        removable: false,
      },
      {
        id: FULL_NAME,
        component: EntityInputConditional,
        value: this.bindDefaultValue(FULL_NAME, {
          condition: CONDITION_CNT,
        }),
        title: intl.formatMessage(messages.name),
        active: true,
        removable: false,
        customProps: {
          maxLength: 256,
        },
      },
      {
        id: ROLE,
        component: EntityDropdown,
        value: this.bindDefaultValue(ROLE, {
          condition: CONDITION_IN,
        }),
        title: intl.formatMessage(messages.role),
        active: true,
        removable: false,
        customProps: {
          options: [
            {
              value: ADMINISTRATOR,
              label: intl.formatMessage(messages.roleAdmin),
            },
            {
              value: USER,
              label: intl.formatMessage(messages.roleNonAdmin),
            },
          ],
          multiple: true,
          selectAll: true,
        },
      },
      {
        id: TYPE,
        component: EntityDropdown,
        value: this.bindDefaultValue(TYPE, {
          condition: CONDITION_IN,
        }),
        title: intl.formatMessage(messages.type),
        active: true,
        removable: false,
        customProps: {
          options: [
            {
              label: intl.formatMessage(messages.accountTypeInternal),
              value: INTERNAL,
            },
            {
              label: intl.formatMessage(messages.accountTypeUpsa),
              value: UPSA,
            },
            {
              label: intl.formatMessage(messages.accountTypeGithub),
              value: GITHUB,
            },
            {
              label: intl.formatMessage(messages.accountTypeLdap),
              value: LDAP,
            },
          ],
          multiple: true,
          selectAll: true,
        },
      },
      {
        id: LOGIN,
        component: EntityInputConditional,
        value: this.bindDefaultValue(LOGIN, {
          condition: CONDITION_CNT,
        }),
        title: intl.formatMessage(messages.user),
        active: true,
        removable: false,
        customProps: {
          placeholder: null,
        },
      },
      {
        id: EMAIL,
        component: EntityInputConditional,
        value: this.bindDefaultValue(EMAIL, {
          condition: CONDITION_CNT,
        }),
        title: intl.formatMessage(messages.email),
        active: true,
        removable: false,
        customProps: {
          placeholder: null,
          maxLength: 256,
        },
      },
      {
        id: LAST_LOGIN,
        component: EntityItemStartTime,
        value: this.bindDefaultValue(LAST_LOGIN, {
          value: '',
          condition: CONDITION_BETWEEN,
        }),
        title: intl.formatMessage(messages.lastLogin),
        active: true,
        removable: false,
        customProps: {
          withoutDynamic: true,
        },
      },
      {
        id: PROJECT,
        component: EntitySearch,
        value: this.bindDefaultValue(PROJECT, {
          condition: CONDITION_HAS,
        }),
        title: intl.formatMessage(messages.project),
        active: true,
        removable: false,
        customProps: {
          getURI: URLS.projectNameSearch,
          placeholder: null,
          creatable: false,
          inputProps: {
            maxlength: 256,
          },
        },
      },
    ];
  };
  bindDefaultValue = bindDefaultValue;
  render() {
    const { render, ...rest } = this.props;
    return render({
      ...rest,
      filterEntities: this.getEntities(),
    });
  }
}
