import { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
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
  EntityItemName,
  EntityLaunchNumber,
  EntityItemDescription,
  EntityLaunchOwner,
  EntityItemStartTime,
  EntityItemAttributeKeys,
  EntityItemAttributeValues,
  EntityItemStatistics,
} from 'components/filterEntities';
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
  ENTITY_ATTRIBUTE_KEYS,
  ENTITY_ATTRIBUTE_VALUES,
} from 'components/filterEntities/constants';
import { defectTypesSelector } from 'controllers/project';

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
  AttributeKeysTitle: {
    id: 'LaunchLevelEntities.AttributeKeysTitle',
    defaultMessage: 'Attribute keys',
  },
  AttributeValuesTitle: {
    id: 'LaunchLevelEntities.AttributeValuesTitle',
    defaultMessage: 'Attribute values',
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
}))
export class LaunchLevelEntities extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    defectTypes: PropTypes.object.isRequired,
    filterValues: PropTypes.object,
    render: PropTypes.func.isRequired,
  };
  static defaultProps = {
    filterValues: {},
  };
  getStaticEntities = () => {
    const { intl, filterValues } = this.props;

    return [
      {
        id: ENTITY_NAME,
        component: EntityItemName,
        value:
          ENTITY_NAME in filterValues
            ? filterValues[ENTITY_NAME]
            : {
                filteringField: ENTITY_NAME,
                value: '',
                condition: CONDITION_CNT,
              },
        validationFunc: (entityObject) =>
          (!entityObject || !entityObject.value || !validate.itemNameEntity(entityObject.value)) &&
          'itemNameEntityHint',
        title: intl.formatMessage(messages.NameTitle),
        active: true,
        removable: false,
        static: true,
      },
      {
        id: ENTITY_NUMBER,
        component: EntityLaunchNumber,
        value:
          ENTITY_NUMBER in filterValues
            ? filterValues[ENTITY_NUMBER]
            : {
                filteringField: ENTITY_NUMBER,
                value: '',
                condition: CONDITION_GREATER_EQ,
              },
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.launchNumericEntity(entityObject.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.NumberTitle),
        active: ENTITY_NUMBER in filterValues,
        removable: true,
      },
      {
        id: ENTITY_DESCRIPTION,
        component: EntityItemDescription,
        value:
          ENTITY_DESCRIPTION in filterValues
            ? filterValues[ENTITY_DESCRIPTION]
            : {
                filteringField: ENTITY_DESCRIPTION,
                value: '',
                condition: CONDITION_CNT,
              },
        title: intl.formatMessage(messages.DescriptionTitle),
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.launchDescriptionEntity(entityObject.value)) &&
          'launchDescriptionEntityHint',
        active: ENTITY_DESCRIPTION in filterValues,
        removable: true,
      },
      {
        id: ENTITY_USER,
        component: EntityLaunchOwner,
        value:
          ENTITY_USER in filterValues
            ? filterValues[ENTITY_USER]
            : {
                filteringField: ENTITY_USER,
                value: '',
                condition: CONDITION_IN,
              },
        title: intl.formatMessage(messages.OwnerTitle),
        active: ENTITY_USER in filterValues,
        removable: true,
      },
      {
        id: ENTITY_START_TIME,
        component: EntityItemStartTime,
        value:
          ENTITY_START_TIME in filterValues
            ? filterValues[ENTITY_START_TIME]
            : {
                filteringField: ENTITY_START_TIME,
                value: `${moment()
                  .startOf('day')
                  .subtract(1, 'months')
                  .valueOf()},${moment()
                  .endOf('day')
                  .valueOf() + 1}`,
                condition: CONDITION_BETWEEN,
              },
        title: intl.formatMessage(messages.StartTimeTitle),
        active: ENTITY_START_TIME in filterValues,
        removable: true,
      },
      {
        id: ENTITY_ATTRIBUTE_KEYS,
        component: EntityItemAttributeKeys,
        value:
          ENTITY_ATTRIBUTE_KEYS in filterValues
            ? filterValues[ENTITY_ATTRIBUTE_KEYS]
            : {
                filteringField: ENTITY_ATTRIBUTE_KEYS,
                value: '',
                condition: CONDITION_HAS,
              },
        title: intl.formatMessage(messages.AttributeKeysTitle),
        active: ENTITY_ATTRIBUTE_KEYS in filterValues,
        removable: true,
      },
      {
        id: ENTITY_ATTRIBUTE_VALUES,
        component: EntityItemAttributeValues,
        value:
          ENTITY_ATTRIBUTE_VALUES in filterValues
            ? filterValues[ENTITY_ATTRIBUTE_VALUES]
            : {
                filteringField: ENTITY_ATTRIBUTE_VALUES,
                value: '',
                condition: CONDITION_HAS,
              },
        title: intl.formatMessage(messages.AttributeValuesTitle),
        active: ENTITY_ATTRIBUTE_VALUES in filterValues,
        removable: true,
        meta: { attributeKey: (filterValues[ENTITY_ATTRIBUTE_KEYS] || {}).value },
      },
      {
        id: STATS_TOTAL,
        component: EntityItemStatistics,
        value:
          STATS_TOTAL in filterValues
            ? filterValues[STATS_TOTAL]
            : {
                filteringField: STATS_TOTAL,
                value: '',
                condition: CONDITION_GREATER_EQ,
              },
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.launchNumericEntity(entityObject.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.TotalTitle),
        active: STATS_TOTAL in filterValues,
        removable: true,
      },
      {
        id: STATS_PASSED,
        component: EntityItemStatistics,
        value:
          STATS_PASSED in filterValues
            ? filterValues[STATS_PASSED]
            : {
                filteringField: STATS_PASSED,
                value: '',
                condition: CONDITION_GREATER_EQ,
              },
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.launchNumericEntity(entityObject.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.PassedTitle),
        active: STATS_PASSED in filterValues,
        removable: true,
      },
      {
        id: STATS_FAILED,
        component: EntityItemStatistics,
        value:
          STATS_FAILED in filterValues
            ? filterValues[STATS_FAILED]
            : {
                filteringField: STATS_FAILED,
                value: '',
                condition: CONDITION_GREATER_EQ,
              },
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.launchNumericEntity(entityObject.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.FailedTitle),
        active: STATS_FAILED in filterValues,
        removable: true,
      },
      {
        id: STATS_SKIPPED,
        component: EntityItemStatistics,
        value:
          STATS_SKIPPED in filterValues
            ? filterValues[STATS_SKIPPED]
            : {
                filteringField: STATS_SKIPPED,
                value: '',
                condition: CONDITION_GREATER_EQ,
              },
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.launchNumericEntity(entityObject.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.SkippedTitle),
        active: STATS_SKIPPED in filterValues,
        removable: true,
      },
    ];
  };

  getDynamicEntities = () => {
    const { filterValues } = this.props;
    let defectTypeEntities = [];
    DEFECT_TYPES_SEQUENCE.forEach((defectTypeRef) => {
      const defectTypeGroup = this.props.defectTypes[defectTypeRef];
      const hasSubtypes = defectTypeGroup.length > 1;
      const totalEntityId = `${DEFECT_ENTITY_ID_BASE}${defectTypeRef.toLowerCase()}$total`;

      defectTypeEntities.push({
        id: totalEntityId,
        component: EntityItemStatistics,
        value:
          totalEntityId in filterValues
            ? filterValues[totalEntityId]
            : {
                filteringField: totalEntityId,
                value: '',
                condition: CONDITION_GREATER_EQ,
              },
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.launchNumericEntity(entityObject.value)) &&
          'launchNumericEntityHint',
        title: this.props.intl.formatMessage(
          messages[`${defectTypeRef}_${hasSubtypes ? 'totalTitle' : 'title'}`],
        ),
        active: totalEntityId in filterValues,
        removable: true,
      });
      if (hasSubtypes) {
        defectTypeEntities = defectTypeEntities.concat(
          defectTypeGroup.map((defectType) => {
            const entityId = `${DEFECT_ENTITY_ID_BASE}${defectType.typeRef.toLowerCase()}$${
              defectType.locator
            }`;
            return {
              id: entityId,
              component: EntityItemStatistics,
              value:
                entityId in filterValues
                  ? filterValues[entityId]
                  : {
                      filteringField: entityId,
                      value: '',
                      condition: CONDITION_GREATER_EQ,
                    },
              validationFunc: (entityObject) =>
                (!entityObject ||
                  !entityObject.value ||
                  !validate.launchNumericEntity(entityObject.value)) &&
                'launchNumericEntityHint',
              title: `${this.props.intl.formatMessage(messages[`${defectTypeRef}_title`])} ${
                defectType.shortName
              }`,
              active: entityId in filterValues,
              removable: true,
              meta: {
                longName: defectType.longName,
                subItem: true,
              },
            };
          }),
        );
      }
    });
    return defectTypeEntities;
  };

  render() {
    const { render, ...rest } = this.props;

    return render({
      ...rest,
      filterEntities: this.getStaticEntities().concat(this.getDynamicEntities()),
    });
  }
}
