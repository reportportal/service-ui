import { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { validate } from 'common/utils';
import {
  STATS_TOTAL,
  STATS_FAILED,
  STATS_PASSED,
  STATS_SKIPPED,
} from 'common/constants/statistics';
import {
  PRODUCT_BUG,
  AUTOMATION_BUG,
  SYSTEM_ISSUE,
  TO_INVESTIGATE,
} from 'common/constants/defectTypes';
import {
  EntityInputConditional,
  EntityItemStartTime,
  EntityInputConditionalTags,
} from 'components/filterEntities';
import { bindDefaultValue } from 'components/filterEntities/utils';
import {
  CONDITION_CNT,
  CONDITION_GREATER_EQ,
  CONDITION_BETWEEN,
  CONDITION_HAS,
  ENTITY_NAME,
  ENTITY_START_TIME,
  ENTITY_DESCRIPTION,
  ENTITY_ATTRIBUTE_KEYS,
  ENTITY_ATTRIBUTE_VALUES,
  CONDITION_LESS_EQ,
  CONDITION_EQ,
} from 'components/filterEntities/constants';
import { defectTypesSelector } from 'controllers/project';

const messages = defineMessages({
  NameTitle: {
    id: 'SuiteLevelEntities.NameTitle',
    defaultMessage: 'Suite name',
  },
  DescriptionTitle: {
    id: 'SuiteLevelEntities.DescriptionTitle',
    defaultMessage: 'Description',
  },
  StartTimeTitle: {
    id: 'SuiteLevelEntities.StartTimeTitle',
    defaultMessage: 'Start time',
  },
  AttributeKeysTitle: {
    id: 'LaunchLevelEntities.AttributeKeysTitle',
    defaultMessage: 'Attribute keys',
  },
  AttributeValuesTitle: {
    id: 'LaunchLevelEntities.AttributeValuesTitle',
    defaultMessage: 'Attribute values',
  },
  TotalTitle: {
    id: 'SuiteLevelEntities.TotalTitle',
    defaultMessage: 'Total',
  },
  PassedTitle: {
    id: 'SuiteLevelEntities.PassedTitle',
    defaultMessage: 'Passed',
  },
  FailedTitle: {
    id: 'SuiteLevelEntities.FailedTitle',
    defaultMessage: 'Failed',
  },
  SkippedTitle: {
    id: 'SuiteLevelEntities.SkippedTitle',
    defaultMessage: 'Skipped',
  },
  PRODUCT_BUG_title: {
    id: 'SuiteLevelEntities.PRODUCT_BUG_title',
    defaultMessage: 'Product bug',
  },
  PRODUCT_BUG_totalTitle: {
    id: 'SuiteLevelEntities.PRODUCT_BUG_totalTitle',
    defaultMessage: 'Total product bugs',
  },
  AUTOMATION_BUG_title: {
    id: 'SuiteLevelEntities.AUTOMATION_BUG_title',
    defaultMessage: 'Automation bug',
  },
  AUTOMATION_BUG_totalTitle: {
    id: 'SuiteLevelEntities.AUTOMATION_BUG_totalTitle',
    defaultMessage: 'Total automation bugs',
  },
  SYSTEM_ISSUE_title: {
    id: 'SuiteLevelEntities.SYSTEM_ISSUE_title',
    defaultMessage: 'System issue',
  },
  SYSTEM_ISSUE_totalTitle: {
    id: 'SuiteLevelEntities.SYSTEM_ISSUE_totalTitle',
    defaultMessage: 'Total system issues',
  },
  TO_INVESTIGATE_title: {
    id: 'SuiteLevelEntities.TO_INVESTIGATE_title',
    defaultMessage: 'To investigate',
  },
  LAUNCH_NUMBER_PLACEHOLDER: {
    id: 'SuiteLevelEntities.launchNumberPlaceholder',
    defaultMessage: 'Enter number',
  },
  DESCRIPTION_PLACEHOLDER: {
    id: 'SuiteLevelEntities.descriptionPlaceholder',
    defaultMessage: 'Enter description',
  },
  ATTRIBUTE_KEYS_PLACEHOLDER: {
    id: 'SuiteLevelEntities.entityItemAttributeKeys.placeholder',
    defaultMessage: 'Enter attribute keys',
  },
  ATTRIBUTE_VALUES_PLACEHOLDER: {
    id: 'SuiteLevelEntities.entityItemAttributeValues.placeholder',
    defaultMessage: 'Enter attribute values',
  },
  STATS_PLACEHOLDER: {
    id: 'SuiteLevelEntities.entityItemStatistics.placeholder',
    defaultMessage: 'Enter quantity',
  },
  SUITE_NAME_PLACEHOLDER: {
    id: 'SuiteLevelEntities.suiteName.placeholder',
    defaultMessage: 'Enter name',
  },
});

const DEFECT_TYPES_SEQUENCE = [
  PRODUCT_BUG.toUpperCase(),
  AUTOMATION_BUG.toUpperCase(),
  SYSTEM_ISSUE.toUpperCase(),
  TO_INVESTIGATE.toUpperCase(),
];
const DEFECT_ENTITY_ID_BASE = 'statistics$defects$';

@injectIntl
@connect((state) => ({
  defectTypes: defectTypesSelector(state),
  launchAttributeKeysSearch: URLS.launchAttributeKeysSearch(activeProjectSelector(state)),
  launchAttributeValuesSearch: URLS.launchAttributeValuesSearch(activeProjectSelector(state)),
}))
export class SuiteLevelEntities extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    defectTypes: PropTypes.object.isRequired,
    filterValues: PropTypes.object,
    render: PropTypes.func.isRequired,
    launchAttributeKeysSearch: PropTypes.string.isRequired,
    launchAttributeValuesSearch: PropTypes.string.isRequired,
  };
  static defaultProps = {
    filterValues: {},
  };

  getStaticEntities = () => {
    const { intl, filterValues } = this.props;
    return [
      {
        id: ENTITY_NAME,
        component: EntityInputConditional,
        value: this.bindDefaultValue(ENTITY_NAME, {
          condition: CONDITION_CNT,
        }),
        validationFunc: (entityObject) =>
          (!entityObject || !entityObject.value || !validate.itemNameEntity(entityObject.value)) &&
          'itemNameEntityHint',
        title: intl.formatMessage(messages.NameTitle),
        active: true,
        removable: false,
        static: true,
        customProps: {
          placeholder: intl.formatMessage(messages.SUITE_NAME_PLACEHOLDER),
        },
      },
      {
        id: ENTITY_START_TIME,
        component: EntityItemStartTime,
        value: this.bindDefaultValue(ENTITY_START_TIME, {
          value: `${moment()
            .startOf('day')
            .subtract(1, 'months')
            .valueOf()},${moment()
            .endOf('day')
            .valueOf() + 1}`,
          condition: CONDITION_BETWEEN,
        }),
        title: intl.formatMessage(messages.StartTimeTitle),
        active: ENTITY_START_TIME in filterValues,
        removable: true,
      },
      {
        id: ENTITY_DESCRIPTION,
        component: EntityInputConditional,
        value: this.bindDefaultValue(ENTITY_DESCRIPTION, {
          condition: CONDITION_CNT,
        }),
        title: intl.formatMessage(messages.DescriptionTitle),
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.launchDescriptionEntity(entityObject.value)) &&
          'launchDescriptionEntityHint',
        active: ENTITY_DESCRIPTION in filterValues,
        removable: true,
        customProps: {
          placeholder: intl.formatMessage(messages.DESCRIPTION_PLACEHOLDER),
        },
      },
      {
        id: ENTITY_ATTRIBUTE_KEYS,
        component: EntityInputConditionalTags,
        value: this.bindDefaultValue(ENTITY_ATTRIBUTE_KEYS, {
          condition: CONDITION_HAS,
        }),
        title: intl.formatMessage(messages.AttributeKeysTitle),
        active: ENTITY_ATTRIBUTE_KEYS in filterValues,
        removable: true,
        customProps: {
          uri: this.props.launchAttributeKeysSearch,
          placeholder: intl.formatMessage(messages.ATTRIBUTE_KEYS_PLACEHOLDER),
        },
      },
      {
        id: ENTITY_ATTRIBUTE_VALUES,
        component: EntityInputConditionalTags,
        value: this.bindDefaultValue(ENTITY_ATTRIBUTE_VALUES, {
          condition: CONDITION_HAS,
        }),
        title: intl.formatMessage(messages.AttributeValuesTitle),
        active: ENTITY_ATTRIBUTE_VALUES in filterValues,
        removable: true,
        customProps: {
          uri: this.props.launchAttributeValuesSearch,
          placeholder: intl.formatMessage(messages.ATTRIBUTE_VALUES_PLACEHOLDER),
        },
      },
      {
        id: STATS_TOTAL,
        component: EntityInputConditional,
        value: this.bindDefaultValue(STATS_TOTAL, {
          condition: CONDITION_GREATER_EQ,
        }),
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.launchNumericEntity(entityObject.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.TotalTitle),
        active: STATS_TOTAL in filterValues,
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
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.launchNumericEntity(entityObject.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.PassedTitle),
        active: STATS_PASSED in filterValues,
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
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.launchNumericEntity(entityObject.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.FailedTitle),
        active: STATS_FAILED in filterValues,
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
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.launchNumericEntity(entityObject.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.SkippedTitle),
        active: STATS_SKIPPED in filterValues,
        removable: true,
        customProps: {
          conditions: [CONDITION_GREATER_EQ, CONDITION_LESS_EQ, CONDITION_EQ],
          placeholder: intl.formatMessage(messages.STATS_PLACEHOLDER),
        },
      },
    ];
  };

  getDynamicEntities = () => {
    const { intl, filterValues } = this.props;
    let defectTypeEntities = [];
    DEFECT_TYPES_SEQUENCE.forEach((defectTypeRef) => {
      const defectTypeGroup = this.props.defectTypes[defectTypeRef];
      const hasSubtypes = defectTypeGroup.length > 1;

      defectTypeEntities.push({
        id: `${DEFECT_ENTITY_ID_BASE}${defectTypeRef.toLowerCase()}$total`,
        component: EntityInputConditional,
        value: this.bindDefaultValue(
          `${DEFECT_ENTITY_ID_BASE}${defectTypeRef.toLowerCase()}$total`,
          {
            condition: CONDITION_GREATER_EQ,
          },
        ),
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.launchNumericEntity(entityObject.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(
          messages[`${defectTypeRef}_${hasSubtypes ? 'totalTitle' : 'title'}`],
        ),
        active: `${DEFECT_ENTITY_ID_BASE}${defectTypeRef.toLowerCase()}$total` in filterValues,
        removable: true,
        customProps: {
          conditions: [CONDITION_GREATER_EQ, CONDITION_LESS_EQ, CONDITION_EQ],
          placeholder: intl.formatMessage(messages.STATS_PLACEHOLDER),
        },
      });
      if (hasSubtypes) {
        defectTypeEntities = defectTypeEntities.concat(
          defectTypeGroup.map((defectType) => ({
            id: `${DEFECT_ENTITY_ID_BASE}${defectType.typeRef.toLowerCase()}$${defectType.locator}`,
            component: EntityInputConditional,
            value: this.bindDefaultValue(
              `${DEFECT_ENTITY_ID_BASE}${defectType.typeRef.toLowerCase()}$${defectType.locator}`,
              {
                condition: CONDITION_GREATER_EQ,
              },
            ),
            validationFunc: (entityObject) =>
              (!entityObject ||
                !entityObject.value ||
                !validate.launchNumericEntity(entityObject.value)) &&
              'launchNumericEntityHint',
            title: `${intl.formatMessage(messages[`${defectTypeRef}_title`])} ${
              defectType.shortName
            }`,
            active:
              `${DEFECT_ENTITY_ID_BASE}${defectType.typeRef.toLowerCase()}$${defectType.locator}` in
              filterValues,
            removable: true,
            meta: {
              longName: defectType.longName,
              subItem: true,
            },
            customProps: {
              conditions: [CONDITION_GREATER_EQ, CONDITION_LESS_EQ, CONDITION_EQ],
              placeholder: intl.formatMessage(messages.STATS_PLACEHOLDER),
            },
          })),
        );
      }
    });
    return defectTypeEntities;
  };
  bindDefaultValue = bindDefaultValue;
  render() {
    const { render, ...rest } = this.props;

    return render({
      ...rest,
      filterEntities: this.getStaticEntities().concat(this.getDynamicEntities()),
    });
  }
}
