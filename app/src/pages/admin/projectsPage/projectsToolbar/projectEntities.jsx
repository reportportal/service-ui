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
import { commonValidators } from 'common/utils/validation';
import {
  EntityContains,
  EntityInputConditional,
  EntityDropdown,
  EntityItemStartTime,
} from 'components/filterEntities';
import {
  CONDITION_CNT,
  CONDITION_EQ,
  CONDITION_BETWEEN,
  CONDITION_GREATER_EQ,
  CONDITION_LESS_EQ,
  CONDITION_IN,
} from 'components/filterEntities/constants';
import { bindDefaultValue } from 'components/filterEntities/utils';
import {
  PROJECT_TYPE_INTERNAL,
  PROJECT_TYPE_PERSONAL,
  PROJECT_TYPE_UPSA,
  TYPE,
  NAME,
  ORGANIZATION,
  USERS_QUANTITY,
  LAST_RUN,
  LAUNCHES_QUANTITY,
  PROJECTS,
} from 'common/constants/projectsObjectTypes';

const messages = defineMessages({
  contains: { id: 'projectsGrid.contains', defaultMessage: 'Contains' },
  type: { id: 'projectsGrid.type', defaultMessage: 'Type' },
  lastRun: {
    id: 'projectsGrid.lastRun',
    defaultMessage: 'Last run',
  },
  numberOfLaunches: {
    id: 'projectsGrid.numberOfLaunches',
    defaultMessage: 'Launches',
  },
  numberOfMembers: {
    id: 'projectsGrid.numberOfMembers',
    defaultMessage: 'Members',
  },
  organizationName: {
    id: 'projectsGrid.organizationName',
    defaultMessage: 'Organization ',
  },
  projectTypeInternal: {
    id: 'projectsGrid.projectTypeInternal',
    defaultMessage: 'Internal',
  },
  projectName: {
    id: 'projectsGrid.projectName',
    defaultMessage: 'Project',
  },
  projectTypePersonal: {
    id: 'projectsGrid.projectTypePersonal',
    defaultMessage: 'Personal',
  },
  projectTypeUpsa: {
    id: 'projectsGrid.projectTypeUpsa',
    defaultMessage: 'UPSA',
  },
});

@injectIntl
export class ProjectEntities extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    filterValues: PropTypes.object,
    render: PropTypes.func.isRequired,
  };

  static defaultProps = {
    loading: false,
    filterValues: {},
  };
  getEntities = () => {
    const { intl } = this.props;
    return [
      {
        id: PROJECTS,
        component: EntityContains,
        value: this.bindDefaultValue(PROJECTS),
        title: intl.formatMessage(messages.contains),
        active: true,
        removable: false,
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
              label: intl.formatMessage(messages.projectTypeInternal),
              value: PROJECT_TYPE_INTERNAL,
            },
            {
              label: intl.formatMessage(messages.projectTypePersonal),
              value: PROJECT_TYPE_PERSONAL,
            },
            {
              label: intl.formatMessage(messages.projectTypeUpsa),
              value: PROJECT_TYPE_UPSA,
            },
          ],
          multiple: true,
          selectAll: true,
        },
      },
      {
        id: LAST_RUN,
        component: EntityItemStartTime,
        value: this.bindDefaultValue(LAST_RUN, {
          value: '',
          condition: CONDITION_BETWEEN,
        }),
        title: intl.formatMessage(messages.lastRun),
        active: true,
        removable: false,
        customProps: {
          withoutDynamic: true,
        },
      },
      {
        id: LAUNCHES_QUANTITY,
        component: EntityInputConditional,
        value: this.bindDefaultValue(LAUNCHES_QUANTITY, {
          condition: CONDITION_GREATER_EQ,
        }),
        validationFunc: commonValidators.launchNumericEntity,
        title: intl.formatMessage(messages.numberOfLaunches),
        active: true,
        removable: false,
        customProps: {
          conditions: [CONDITION_EQ, CONDITION_GREATER_EQ, CONDITION_LESS_EQ],
          placeholder: null,
          maxLength: 18,
        },
      },
      {
        id: USERS_QUANTITY,
        component: EntityInputConditional,
        value: this.bindDefaultValue(USERS_QUANTITY, {
          condition: CONDITION_GREATER_EQ,
        }),
        validationFunc: commonValidators.launchNumericEntity,
        title: intl.formatMessage(messages.numberOfMembers),
        active: true,
        removable: false,
        customProps: {
          conditions: [CONDITION_EQ, CONDITION_GREATER_EQ, CONDITION_LESS_EQ],
          placeholder: null,
          maxLength: 18,
        },
      },
      {
        id: NAME,
        component: EntityInputConditional,
        value: this.bindDefaultValue(NAME, {
          condition: CONDITION_CNT,
        }),
        title: intl.formatMessage(messages.projectName),
        active: true,
        removable: false,
        customProps: {
          placeholder: null,
          maxLength: 256,
        },
      },
      {
        id: ORGANIZATION,
        component: EntityInputConditional,
        value: this.bindDefaultValue(ORGANIZATION, {
          condition: CONDITION_CNT,
        }),
        title: intl.formatMessage(messages.organizationName),
        active: true,
        removable: false,
        customProps: {
          placeholder: null,
          maxLength: 256,
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
