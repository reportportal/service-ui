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
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { commonValidators } from 'common/utils/validation';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import {
  STATS_TOTAL,
  STATS_FAILED,
  STATS_PASSED,
  STATS_SKIPPED,
} from 'common/constants/statistics';
import {
  EntityInputConditional,
  EntityItemStartTime,
  EntitySearch,
  EntityContains,
  EntityInputConditionalAttributes,
} from 'components/filterEntities';
import { bindDefaultValue } from 'components/filterEntities/utils';
import {
  CONDITION_CNT,
  CONDITION_GREATER_EQ,
  CONDITION_IN,
  CONDITION_BETWEEN,
  CONDITION_HAS,
  ENTITY_NAME,
  ENTITY_NUMBER,
  ENTITY_USER,
  ENTITY_START_TIME,
  ENTITY_DESCRIPTION,
  CONDITION_LESS_EQ,
  CONDITION_EQ,
  ENTITY_ATTRIBUTE,
} from 'components/filterEntities/constants';
import { defectTypesSelector } from 'controllers/project';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { getGroupedDefectTypesOptions } from 'pages/inside/common/utils';
import { NO_DEFECT } from 'common/constants/defectTypes';

const messages = defineMessages({
  NameTitle: {
    id: 'LaunchLevelEntities.NameTitle',
    defaultMessage: 'Launch name',
  },
  NumberTitle: {
    id: 'LaunchLevelEntities.NumberTitle',
    defaultMessage: 'Launch number',
  },
  DescriptionTitle: {
    id: 'LaunchLevelEntities.DescriptionTitle',
    defaultMessage: 'Description',
  },
  StartTimeTitle: {
    id: 'LaunchLevelEntities.StartTimeTitle',
    defaultMessage: 'Start time',
  },
  OwnerTitle: {
    id: 'LaunchLevelEntities.OwnerTitle',
    defaultMessage: 'Owner',
  },
  Attribute: {
    id: 'LaunchLevelEntities.AttributeTitle',
    defaultMessage: 'Attribute',
  },
  TotalTitle: {
    id: 'LaunchLevelEntities.TotalTitle',
    defaultMessage: 'Total',
  },
  PassedTitle: {
    id: 'LaunchLevelEntities.PassedTitle',
    defaultMessage: 'Passed',
  },
  FailedTitle: {
    id: 'LaunchLevelEntities.FailedTitle',
    defaultMessage: 'Failed',
  },
  SkippedTitle: {
    id: 'LaunchLevelEntities.SkippedTitle',
    defaultMessage: 'Skipped',
  },
  PRODUCT_BUG_title: {
    id: 'LaunchLevelEntities.PRODUCT_BUG_title',
    defaultMessage: 'Product bug',
  },
  PRODUCT_BUG_totalTitle: {
    id: 'LaunchLevelEntities.PRODUCT_BUG_totalTitle',
    defaultMessage: 'Total product bugs',
  },
  AUTOMATION_BUG_title: {
    id: 'LaunchLevelEntities.AUTOMATION_BUG_title',
    defaultMessage: 'Automation bug',
  },
  AUTOMATION_BUG_totalTitle: {
    id: 'LaunchLevelEntities.AUTOMATION_BUG_totalTitle',
    defaultMessage: 'Total automation bugs',
  },
  SYSTEM_ISSUE_title: {
    id: 'LaunchLevelEntities.SYSTEM_ISSUE_title',
    defaultMessage: 'System issue',
  },
  SYSTEM_ISSUE_totalTitle: {
    id: 'LaunchLevelEntities.SYSTEM_ISSUE_totalTitle',
    defaultMessage: 'Total system issues',
  },
  TO_INVESTIGATE_title: {
    id: 'LaunchLevelEntities.TO_INVESTIGATE_title',
    defaultMessage: 'To investigate',
  },
  TO_INVESTIGATE_totalTitle: {
    id: 'LaunchLevelEntities.TO_INVESTIGATE_totalTitle',
    defaultMessage: 'Total to investigate',
  },
  NO_DEFECT_title: {
    id: 'LaunchLevelEntities.NO_DEFECT_title',
    defaultMessage: 'No Defect',
  },
  NO_DEFECT_totalTitle: {
    id: 'LaunchLevelEntities.NO_DEFECT_totalTitle',
    defaultMessage: 'No Defect Total',
  },
  LAUNCH_NUMBER_PLACEHOLDER: {
    id: 'LaunchLevelEntities.launchNumberPlaceholder',
    defaultMessage: 'Enter number',
  },
  DESCRIPTION_PLACEHOLDER: {
    id: 'LaunchLevelEntities.descriptionPlaceholder',
    defaultMessage: 'Enter description',
  },
  STATS_PLACEHOLDER: {
    id: 'LaunchLevelEntities.entityItemStatistics.placeholder',
    defaultMessage: 'Enter quantity',
  },
  LAUNCH_NAME_PLACEHOLDER: {
    id: 'LaunchLevelEntities.launchName.placeholder',
    defaultMessage: 'Enter name',
  },
  OWNER_NAME_PLACEHOLDER: {
    id: 'LaunchLevelEntities.ownerName.placeholder',
    defaultMessage: 'Enter owner name',
  },
});

@injectIntl
@connect((state) => ({
  defectTypes: defectTypesSelector(state),
  activeProject: activeProjectSelector(state),
}))
export class LaunchLevelEntities extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    defectTypes: PropTypes.object.isRequired,
    filterValues: PropTypes.object,
    render: PropTypes.func.isRequired,
    activeProject: PropTypes.string.isRequired,
    visibleFilters: PropTypes.array,
  };
  static defaultProps = {
    filterValues: {},
    visibleFilters: [],
  };

  getStaticEntities = () => {
    const { intl, activeProject, visibleFilters } = this.props;
    return [
      {
        id: ENTITY_NAME,
        component: EntityInputConditional,
        value: this.bindDefaultValue(ENTITY_NAME, {
          condition: CONDITION_CNT,
        }),
        validationFunc: commonValidators.itemNameEntity,
        title: intl.formatMessage(messages.NameTitle),
        active: true,
        removable: false,
        static: true,
        customProps: {
          placeholder: intl.formatMessage(messages.LAUNCH_NAME_PLACEHOLDER),
        },
      },
      {
        id: ENTITY_NUMBER,
        component: EntityInputConditional,
        value: this.bindDefaultValue(ENTITY_NUMBER, {
          condition: CONDITION_GREATER_EQ,
        }),
        validationFunc: commonValidators.launchNumericEntity,
        title: intl.formatMessage(messages.NumberTitle),
        active: visibleFilters.includes(ENTITY_NUMBER),
        removable: true,
        customProps: {
          conditions: [CONDITION_EQ, CONDITION_GREATER_EQ, CONDITION_LESS_EQ],
          placeholder: intl.formatMessage(messages.LAUNCH_NUMBER_PLACEHOLDER),
        },
      },
      {
        id: ENTITY_DESCRIPTION,
        component: EntityInputConditional,
        value: this.bindDefaultValue(ENTITY_DESCRIPTION, {
          condition: CONDITION_CNT,
        }),
        title: intl.formatMessage(messages.DescriptionTitle),
        validationFunc: commonValidators.descriptionEntity,
        active: visibleFilters.includes(ENTITY_DESCRIPTION),
        removable: true,
        customProps: {
          placeholder: intl.formatMessage(messages.DESCRIPTION_PLACEHOLDER),
          maxLength: 18,
        },
      },
      {
        id: ENTITY_USER,
        component: EntitySearch,
        value: this.bindDefaultValue(ENTITY_USER, {
          condition: CONDITION_IN,
        }),
        title: intl.formatMessage(messages.OwnerTitle),
        active: visibleFilters.includes(ENTITY_USER),
        removable: true,
        customProps: {
          getURI: URLS.launchOwnersSearch(activeProject),
          placeholder: intl.formatMessage(messages.OWNER_NAME_PLACEHOLDER),
        },
      },
      {
        id: ENTITY_START_TIME,
        component: EntityItemStartTime,
        value: this.bindDefaultValue(ENTITY_START_TIME, {
          value: '',
          condition: CONDITION_BETWEEN,
        }),
        title: intl.formatMessage(messages.StartTimeTitle),
        active: visibleFilters.includes(ENTITY_START_TIME),
        removable: true,
        customProps: {
          events: LAUNCHES_PAGE_EVENTS.REFINE_FILTERS_PANEL_EVENTS.commonEvents,
        },
      },
      {
        id: ENTITY_ATTRIBUTE,
        component: EntityInputConditionalAttributes,
        value: this.bindDefaultValue(ENTITY_ATTRIBUTE, {
          condition: CONDITION_HAS,
        }),
        title: intl.formatMessage(messages.Attribute),
        active: visibleFilters.includes(ENTITY_ATTRIBUTE),
        removable: true,
        customProps: {
          projectId: activeProject,
          keyURLCreator: URLS.launchAttributeKeysSearch,
          valueURLCreator: URLS.launchAttributeValuesSearch,
        },
      },
      {
        id: STATS_TOTAL,
        component: EntityInputConditional,
        value: this.bindDefaultValue(STATS_TOTAL, {
          condition: CONDITION_GREATER_EQ,
        }),
        validationFunc: commonValidators.launchNumericEntity,
        title: intl.formatMessage(messages.TotalTitle),
        active: visibleFilters.includes(STATS_TOTAL),
        removable: true,
        customProps: {
          conditions: [CONDITION_GREATER_EQ, CONDITION_LESS_EQ, CONDITION_EQ],
          placeholder: intl.formatMessage(messages.STATS_PLACEHOLDER),
        },
      },
      {
        id: STATS_PASSED,
        component: EntityInputConditional,
        value: this.bindDefaultValue(STATS_PASSED, {
          condition: CONDITION_GREATER_EQ,
        }),
        validationFunc: commonValidators.launchNumericEntity,
        title: intl.formatMessage(messages.PassedTitle),
        active: visibleFilters.includes(STATS_PASSED),
        removable: true,
        customProps: {
          conditions: [CONDITION_GREATER_EQ, CONDITION_LESS_EQ, CONDITION_EQ],
          placeholder: intl.formatMessage(messages.STATS_PLACEHOLDER),
        },
      },
      {
        id: STATS_FAILED,
        component: EntityInputConditional,
        value: this.bindDefaultValue(STATS_FAILED, {
          condition: CONDITION_GREATER_EQ,
        }),
        validationFunc: commonValidators.launchNumericEntity,
        title: intl.formatMessage(messages.FailedTitle),
        active: visibleFilters.includes(STATS_FAILED),
        removable: true,
        customProps: {
          conditions: [CONDITION_GREATER_EQ, CONDITION_LESS_EQ, CONDITION_EQ],
          placeholder: intl.formatMessage(messages.STATS_PLACEHOLDER),
        },
      },
      {
        id: STATS_SKIPPED,
        component: EntityInputConditional,
        value: this.bindDefaultValue(STATS_SKIPPED, {
          condition: CONDITION_GREATER_EQ,
        }),
        validationFunc: commonValidators.launchNumericEntity,
        title: intl.formatMessage(messages.SkippedTitle),
        active: visibleFilters.includes(STATS_SKIPPED),
        removable: true,
        customProps: {
          conditions: [CONDITION_GREATER_EQ, CONDITION_LESS_EQ, CONDITION_EQ],
          placeholder: intl.formatMessage(messages.STATS_PLACEHOLDER),
        },
      },
    ];
  };

  getDynamicEntities = () => {
    const { defectTypes, intl, visibleFilters } = this.props;
    return getGroupedDefectTypesOptions(defectTypes, intl.formatMessage)
      .filter(
        (option) =>
          option.groupId !== NO_DEFECT.toUpperCase() && option.groupRef !== NO_DEFECT.toUpperCase(),
      )
      .map((option) => {
        const meta = option.meta;
        return {
          ...option,
          id: option.value,
          component: EntityInputConditional,
          value: this.bindDefaultValue(option.value, {
            condition: CONDITION_GREATER_EQ,
          }),
          validationFunc: commonValidators.launchNumericEntity,
          title: meta && meta.subItemLabel ? meta.subItemLabel : option.label,
          customProps: {
            conditions: [CONDITION_GREATER_EQ, CONDITION_LESS_EQ, CONDITION_EQ],
            placeholder: intl.formatMessage(messages.STATS_PLACEHOLDER),
          },
          removable: true,
          active: visibleFilters.includes(option.value),
        };
      });
  };

  collectLostEntities = (entities) => {
    const lostKeys = Object.keys(this.props.filterValues).filter(
      (key) => !entities.find((entity) => entity.id === key),
    );
    return lostKeys.map((key) => ({
      id: key,
      value: this.props.filterValues[key],
      active: true,
      static: true,
      title: key.split('$').pop(),
      component: EntityContains,
      removable: true,
      customProps: {
        disabled: true,
        error: 'error',
      },
    }));
  };

  bindDefaultValue = bindDefaultValue;

  render() {
    const { render, ...rest } = this.props;

    const entities = this.getStaticEntities().concat(this.getDynamicEntities());
    const lostEntities = this.collectLostEntities(entities);
    return render({
      ...rest,
      filterEntities: [...entities, ...lostEntities],
    });
  }
}
