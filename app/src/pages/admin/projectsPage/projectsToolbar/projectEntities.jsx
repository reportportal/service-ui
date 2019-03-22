import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { validate } from 'common/utils';
import moment from 'moment';
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

import { URLS } from 'common/urls';

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
    intl: intlShape.isRequired,
    filterValues: PropTypes.object,
    render: PropTypes.func.isRequired,
    projectSearchUrl: PropTypes.string,
  };

  static defaultProps = {
    loading: false,
    events: [],
    filterValues: {},
    projectSearchUrl: URLS.projectNameSearch(),
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
          condition: CONDITION_EQ,
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
        },
      },
      {
        id: LAST_RUN,
        component: EntityItemStartTime,
        value: this.bindDefaultValue(LAST_RUN, {
          value: `${moment()
            .startOf('day')
            .subtract(1, 'months')
            .valueOf()},${moment()
            .endOf('day')
            .valueOf() + 1}`,
          condition: CONDITION_BETWEEN,
        }),
        title: intl.formatMessage(messages.lastRun),
        active: true,
        removable: false,
      },
      {
        id: LAUNCHES_QUANTITY,
        component: EntityInputConditional,
        value: this.bindDefaultValue(LAUNCHES_QUANTITY, {
          condition: CONDITION_GREATER_EQ,
        }),
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.projectNumericEntity(entityObject.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.numberOfLaunches),
        active: true,
        removable: false,
        customProps: {
          conditions: [CONDITION_EQ, CONDITION_GREATER_EQ, CONDITION_LESS_EQ],
          placeholder: null,
        },
      },
      {
        id: USERS_QUANTITY,
        component: EntityInputConditional,
        value: this.bindDefaultValue(USERS_QUANTITY, {
          condition: CONDITION_GREATER_EQ,
        }),
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.projectNumericEntity(entityObject.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.numberOfMembers),
        active: true,
        removable: false,
        customProps: {
          conditions: [CONDITION_EQ, CONDITION_GREATER_EQ, CONDITION_LESS_EQ],
          placeholder: null,
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
