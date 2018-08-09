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
  EntityItemDescription,
  EntityItemStartTime,
  EntityItemTags,
  EntityItemStatistics,
} from 'components/filterEntities';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import {
  CONDITION_CNT,
  CONDITION_GREATER_EQ,
  CONDITION_BETWEEN,
  CONDITION_HAS,
  ENTITY_NAME,
  ENTITY_START_TIME,
  ENTITY_DESCRIPTION,
  ENTITY_TAGS,
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
  TagsTitle: {
    id: 'SuiteLevelEntities.TagsTitle',
    defaultMessage: 'Tags',
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
export class SuiteLevelEntities extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    defectTypes: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  };
  static defaultProps = {
    onChange: () => {},
  };
  getStaticEntities = () => {
    const { intl } = this.props;
    return [
      {
        id: ENTITY_NAME,
        component: EntityItemName,
        value: {
          value: '',
          condition: CONDITION_CNT,
        },
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value.value ||
            !validate.itemNameEntity(entityObject.value.value)) &&
          'itemNameEntityHint',
        title: intl.formatMessage(messages.NameTitle),
        active: true,
        removable: false,
        static: true,
      },
      {
        id: ENTITY_START_TIME,
        component: EntityItemStartTime,
        value: {
          value: `${moment()
            .startOf('day')
            .subtract(1, 'months')
            .valueOf()},${moment()
            .endOf('day')
            .valueOf() + 1}`,
          condition: CONDITION_BETWEEN,
        },
        title: intl.formatMessage(messages.StartTimeTitle),
        active: false,
        removable: true,
      },
      {
        id: ENTITY_DESCRIPTION,
        component: EntityItemDescription,
        value: {
          value: '',
          condition: CONDITION_CNT,
        },
        title: intl.formatMessage(messages.DescriptionTitle),
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value.value ||
            !validate.launchDescriptionEntity(entityObject.value.value)) &&
          'launchDescriptionEntityHint',
        active: false,
        removable: true,
      },
      {
        id: ENTITY_TAGS,
        component: EntityItemTags,
        value: {
          value: '',
          condition: CONDITION_HAS,
        },
        title: intl.formatMessage(messages.TagsTitle),
        active: false,
        removable: true,
      },
      {
        id: STATS_TOTAL,
        component: EntityItemStatistics,
        value: {
          value: '',
          condition: CONDITION_GREATER_EQ,
        },
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value.value ||
            !validate.launchNumericEntity(entityObject.value.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.TotalTitle),
        active: false,
        removable: true,
      },
      {
        id: STATS_PASSED,
        component: EntityItemStatistics,
        value: {
          value: '',
          condition: CONDITION_GREATER_EQ,
        },
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value.value ||
            !validate.launchNumericEntity(entityObject.value.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.PassedTitle),
        active: false,
        removable: true,
      },
      {
        id: STATS_FAILED,
        component: EntityItemStatistics,
        value: {
          value: '',
          condition: CONDITION_GREATER_EQ,
        },
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value.value ||
            !validate.launchNumericEntity(entityObject.value.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.FailedTitle),
        active: false,
        removable: true,
      },
      {
        id: STATS_SKIPPED,
        component: EntityItemStatistics,
        value: {
          value: '',
          condition: CONDITION_GREATER_EQ,
        },
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value.value ||
            !validate.launchNumericEntity(entityObject.value.value)) &&
          'launchNumericEntityHint',
        title: intl.formatMessage(messages.SkippedTitle),
        active: false,
        removable: true,
      },
    ];
  };

  getDynamicEntities = () => {
    let defectTypeEntities = [];
    DEFECT_TYPES_SEQUENCE.forEach((defectTypeRef) => {
      const defectTypeGroup = this.props.defectTypes[defectTypeRef];
      const hasSubtypes = defectTypeGroup.length > 1;

      defectTypeEntities.push({
        id: `${DEFECT_ENTITY_ID_BASE}${defectTypeRef.toLowerCase()}$total`,
        component: EntityItemStatistics,
        value: {
          value: '',
          condition: CONDITION_GREATER_EQ,
        },
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value.value ||
            !validate.launchNumericEntity(entityObject.value.value)) &&
          'launchNumericEntityHint',
        title: this.props.intl.formatMessage(
          messages[`${defectTypeRef}_${hasSubtypes ? 'totalTitle' : 'title'}`],
        ),
        active: false,
        removable: true,
      });
      if (hasSubtypes) {
        defectTypeEntities = defectTypeEntities.concat(
          defectTypeGroup.map((defectType) => ({
            id: `${DEFECT_ENTITY_ID_BASE}${defectType.typeRef.toLowerCase()}$${defectType.locator}`,
            component: EntityItemStatistics,
            value: {
              value: '',
              condition: CONDITION_GREATER_EQ,
            },
            validationFunc: (entityObject) =>
              (!entityObject ||
                !entityObject.value.value ||
                !validate.launchNumericEntity(entityObject.value.value)) &&
              'launchNumericEntityHint',
            title: `${this.props.intl.formatMessage(messages[`${defectTypeRef}_title`])} ${
              defectType.shortName
            }`,
            active: false,
            removable: true,
            meta: {
              longName: defectType.longName,
              subItem: true,
            },
          })),
        );
      }
    });
    return defectTypeEntities;
  };

  render() {
    return (
      <EntitiesGroup
        entitiesSet={this.getStaticEntities().concat(this.getDynamicEntities())}
        onChangeOwn={this.props.onChange}
      />
    );
  }
}
