import { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { validate } from 'common/utils';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { FAILED, PASSED, SKIPPED, INTERRUPTED, IN_PROGRESS } from 'common/constants/launchStatuses';
import { DEFECT_TYPES_SEQUENCE } from 'common/constants/defectTypes';
import {
  BEFORE_SUITE,
  BEFORE_GROUPS,
  BEFORE_CLASS,
  BEFORE_TEST,
  TEST,
  BEFORE_METHOD,
  STEP,
  AFTER_METHOD,
  AFTER_TEST,
  AFTER_CLASS,
  AFTER_GROUPS,
  AFTER_SUITE,
} from 'common/constants/methodTypes';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  EntityInputConditional,
  EntityItemStartTime,
  EntityInputConditionalTags,
  EntityDropdown,
} from 'components/filterEntities';
import { bindDefaultValue } from 'components/filterEntities/utils';
import {
  CONDITION_CNT,
  CONDITION_BETWEEN,
  CONDITION_HAS,
  CONDITION_IN,
  CONDITION_EX,
  ENTITY_NAME,
  ENTITY_START_TIME,
  ENTITY_DESCRIPTION,
  ENTITY_ATTRIBUTE_KEYS,
  ENTITY_ATTRIBUTE_VALUES,
  ENTITY_STATUS,
  ENTITY_DEFECT_TYPE,
  ENTITY_METHOD_TYPE,
  ENTITY_DEFECT_COMMENT,
  ENTITY_BTS_ISSUES,
  ENTITY_IGNORE_ANALYZER,
  ENTITY_AUTOANALYZE,
  CONDITION_EQ,
} from 'components/filterEntities/constants';
import { defectTypesSelector } from 'controllers/project';
import { launchIdSelector } from 'controllers/pages';

const messages = defineMessages({
  NameTitle: {
    id: 'StepLevelEntities.NameTitle',
    defaultMessage: 'Test name',
  },
  DescriptionTitle: {
    id: 'StepLevelEntities.DescriptionTitle',
    defaultMessage: 'Description',
  },
  DescriptionPlaceholder: {
    id: 'StepLevelEntities.DescriptionPlaceholder',
    defaultMessage: 'Enter description',
  },
  StatusTitle: {
    id: 'StepLevelEntities.StatusTitle',
    defaultMessage: 'Status',
  },
  StartTimeTitle: {
    id: 'StepLevelEntities.StartTimeTitle',
    defaultMessage: 'Start time',
  },
  DefectCommentTitle: {
    id: 'StepLevelEntities.DefectCommentTitle',
    defaultMessage: 'Defect comment',
  },
  DefectCommentPlaceholder: {
    id: 'StepLevelEntities.DefectCommentPlaceholder',
    defaultMessage: 'Enter comment',
  },
  AttributeKeysTitle: {
    id: 'LaunchLevelEntities.AttributeKeysTitle',
    defaultMessage: 'Attribute keys',
  },
  AttributeValuesTitle: {
    id: 'LaunchLevelEntities.AttributeValuesTitle',
    defaultMessage: 'Attribute values',
  },
  BtsIssueTitle: {
    id: 'StepLevelEntities.BtsIssueTitle',
    defaultMessage: 'Issue in BTS',
  },
  BtsIssueOption1: {
    id: 'StepLevelEntities.BtsIssueOption1',
    defaultMessage: 'Linked bug',
  },
  BtsIssueOption2: {
    id: 'StepLevelEntities.BtsIssueOption2',
    defaultMessage: 'No linked bug',
  },
  IgnoreAATitle: {
    id: 'StepLevelEntities.IgnoreAATitle',
    defaultMessage: 'Ignore in AA',
  },
  IgnoreAAOption1: {
    id: 'StepLevelEntities.IgnoreAAOption1',
    defaultMessage: 'With "Ignore AA" mark',
  },
  IgnoreAAOption2: {
    id: 'StepLevelEntities.IgnoreAAOption2',
    defaultMessage: 'Without "Ignore AA" mark',
  },
  AnalyseTitle: {
    id: 'StepLevelEntities.AnalyseTitle',
    defaultMessage: 'Analysed by RP (AA)',
  },
  AnalyseOption1: {
    id: 'StepLevelEntities.AnalyseOption1',
    defaultMessage: 'With "AA" mark',
  },
  AnalyseOption2: {
    id: 'StepLevelEntities.AnalyseOption2',
    defaultMessage: 'Without "AA" mark',
  },
  LaunchStatusPassed: {
    id: 'StepLevelEntities.LaunchStatusPassed',
    defaultMessage: 'Passed',
  },
  LaunchStatusFailed: {
    id: 'StepLevelEntities.LaunchStatusFailed',
    defaultMessage: 'Failed',
  },
  LaunchStatusSkipped: {
    id: 'StepLevelEntities.LaunchStatusSkipped',
    defaultMessage: 'Skipped',
  },
  LaunchStatusInterrupted: {
    id: 'StepLevelEntities.LaunchStatusInterrupted',
    defaultMessage: 'Interrupted',
  },
  LaunchStatusInProgress: {
    id: 'StepLevelEntities.LaunchStatusInProgress',
    defaultMessage: 'In progress',
  },
  MethodTypeTitle: {
    id: 'StepLevelEntities.MethodTypeTitle',
    defaultMessage: 'Method type',
  },
  DefectTypeTitle: {
    id: 'StepLevelEntities.DefectTypeTitle',
    defaultMessage: 'Defect type',
  },
  TypeBeforeSuite: {
    id: 'StepLevelEntities.TypeBeforeSuite',
    defaultMessage: 'Before suite',
  },
  TypeBeforeGroups: {
    id: 'StepLevelEntities.TypeBeforeGroups',
    defaultMessage: 'Before groups',
  },
  TypeBeforeClass: {
    id: 'StepLevelEntities.TypeBeforeClass',
    defaultMessage: 'Before class',
  },
  TypeBeforeTest: {
    id: 'StepLevelEntities.TypeBeforeTest',
    defaultMessage: 'Before test',
  },
  TypeTest: {
    id: 'StepLevelEntities.TypeTest',
    defaultMessage: 'Test class',
  },
  TypeBeforeMethod: {
    id: 'StepLevelEntities.TypeBeforeMethod',
    defaultMessage: 'Before method',
  },
  TypeStep: {
    id: 'StepLevelEntities.TypeStep',
    defaultMessage: 'Test',
  },
  TypeAfterMethod: {
    id: 'StepLevelEntities.TypeAfterMethod',
    defaultMessage: 'After method',
  },
  TypeAfterTest: {
    id: 'StepLevelEntities.TypeAfterTest',
    defaultMessage: 'After test',
  },
  TypeAfterClass: {
    id: 'StepLevelEntities.TypeAfterClass',
    defaultMessage: 'After class',
  },
  TypeAfterGroups: {
    id: 'StepLevelEntities.TypeAfterGroups',
    defaultMessage: 'After groups',
  },
  TypeAfterSuite: {
    id: 'StepLevelEntities.TypeAfterSuite',
    defaultMessage: 'After suite',
  },
  PRODUCT_BUG_ALL: {
    id: 'StepLevelEntities.PRODUCT_BUG_ALL',
    defaultMessage: 'All product bugs',
  },
  AUTOMATION_BUG_ALL: {
    id: 'StepLevelEntities.AUTOMATION_BUG_ALL',
    defaultMessage: 'All automation bug',
  },
  SYSTEM_ISSUE_ALL: {
    id: 'StepLevelEntities.SYSTEM_ISSUE_ALL',
    defaultMessage: 'All system issues',
  },
  NO_DEFECT_ALL: {
    id: 'StepLevelEntities.NO_DEFECT_ALL',
    defaultMessage: 'All no defects',
  },
  TO_INVESTIGATE_ALL: {
    id: 'StepLevelEntities.TO_INVESTIGATE_ALL',
    defaultMessage: 'All to investigate',
  },
  Defect_Type_AB001: {
    id: 'StepLevelEntities.Defect_Type_AB001',
    defaultMessage: 'Automation bug',
  },
  Defect_Type_PB001: {
    id: 'StepLevelEntities.Defect_Type_PB001',
    defaultMessage: 'Product bug',
  },
  Defect_Type_SI001: {
    id: 'StepLevelEntities.Defect_Type_SI001',
    defaultMessage: 'System issue',
  },
  Defect_Type_TI001: {
    id: 'StepLevelEntities.Defect_Type_TI001',
    defaultMessage: 'To investigate',
  },
  Defect_Type_ND001: {
    id: 'StepLevelEntities.Defect_Type_ND001',
    defaultMessage: 'No defect',
  },
  ATTRIBUTE_KEYS_PLACEHOLDER: {
    id: 'StepLevelEntities.entityItemAttributeKeys.placeholder',
    defaultMessage: 'Enter attribute keys',
  },
  ATTRIBUTE_VALUES_PLACEHOLDER: {
    id: 'StepLevelEntities.entityItemAttributeValues.placeholder',
    defaultMessage: 'Enter attribute values',
  },
});

@injectIntl
@connect((state) => ({
  defectTypes: defectTypesSelector(state),
  projectId: activeProjectSelector(state),
  launchId: launchIdSelector(state),
}))
export class StepLevelEntities extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    defectTypes: PropTypes.object.isRequired,
    filterValues: PropTypes.object,
    render: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    launchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    visibleFilters: PropTypes.array,
  };
  static defaultProps = {
    filterValues: {},
    visibleFilters: [],
  };
  getDefectTypeEntity = () => {
    const { intl, defectTypes, filterValues, visibleFilters } = this.props;
    let initChecked = [];
    let options = [];
    DEFECT_TYPES_SEQUENCE.forEach((defectTypeId) => {
      const defectTypeGroup = defectTypes[defectTypeId];
      const hasSubTypes = defectTypeGroup.length > 1;
      initChecked = initChecked.concat(defectTypeGroup.map((defectType) => defectType.locator));
      if (hasSubTypes) {
        options.push({
          label: intl.formatMessage(messages[`${defectTypeGroup[0].typeRef}_ALL`]),
          value: defectTypeGroup[0].typeRef,
          groupId: defectTypeGroup[0].typeRef,
        });
        options = options.concat(
          defectTypeGroup.map((defectType) => ({
            groupRef: defectType.typeRef,
            value: defectType.locator,
            label: messages[defectType.locator]
              ? intl.formatMessage(messages[`Defect_Type_${defectType.locator}`])
              : defectType.longName,
          })),
        );
      } else {
        options = options.concat(
          defectTypeGroup.map((defectType) => ({
            value: defectType.locator,
            label: messages[defectType.locator]
              ? intl.formatMessage(messages[`Defect_Type_${defectType.locator}`])
              : defectType.longName,
          })),
        );
      }
    });
    return {
      id: ENTITY_DEFECT_TYPE,
      component: EntityDropdown,
      value: filterValues[ENTITY_DEFECT_TYPE] || {
        condition: CONDITION_IN,
      },
      title: intl.formatMessage(messages.DefectTypeTitle),
      active: visibleFilters.includes(ENTITY_DEFECT_TYPE),
      removable: true,
      customProps: {
        options,
        multiple: true,
        selectAll: true,
      },
    };
  };
  getEntities = () => {
    const { intl, filterValues, projectId, launchId, visibleFilters } = this.props;
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
        eventInfo: STEP_PAGE_EVENTS.REFINE_BY_NAME,
      },
      {
        id: ENTITY_METHOD_TYPE,
        component: EntityDropdown,
        value: this.bindDefaultValue(ENTITY_METHOD_TYPE, {
          condition: CONDITION_IN,
        }),
        title: intl.formatMessage(messages.MethodTypeTitle),
        active: visibleFilters.includes(ENTITY_METHOD_TYPE),
        removable: true,
        customProps: {
          options: [
            {
              label: intl.formatMessage(messages.TypeBeforeSuite),
              value: BEFORE_SUITE,
            },
            {
              label: intl.formatMessage(messages.TypeBeforeGroups),
              value: BEFORE_GROUPS,
            },
            {
              label: intl.formatMessage(messages.TypeBeforeClass),
              value: BEFORE_CLASS,
            },
            {
              label: intl.formatMessage(messages.TypeBeforeTest),
              value: BEFORE_TEST,
            },
            {
              label: intl.formatMessage(messages.TypeTest),
              value: TEST,
            },
            {
              label: intl.formatMessage(messages.TypeBeforeMethod),
              value: BEFORE_METHOD,
            },
            {
              label: intl.formatMessage(messages.TypeStep),
              value: STEP,
            },
            {
              label: intl.formatMessage(messages.TypeAfterMethod),
              value: AFTER_METHOD,
            },
            {
              label: intl.formatMessage(messages.TypeAfterTest),
              value: AFTER_TEST,
            },
            {
              label: intl.formatMessage(messages.TypeAfterClass),
              value: AFTER_CLASS,
            },
            {
              label: intl.formatMessage(messages.TypeAfterGroups),
              value: AFTER_GROUPS,
            },
            {
              label: intl.formatMessage(messages.TypeAfterSuite),
              value: AFTER_SUITE,
            },
          ],
          multiple: true,
          selectAll: true,
        },
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
        active: visibleFilters.includes(ENTITY_DESCRIPTION),
        removable: true,
        customProps: {
          placeholder: intl.formatMessage(messages.DescriptionPlaceholder),
        },
      },
      {
        id: ENTITY_STATUS,
        component: EntityDropdown,
        value: this.bindDefaultValue(ENTITY_STATUS, {
          condition: CONDITION_IN,
        }),
        title: intl.formatMessage(messages.StatusTitle),
        active: visibleFilters.includes(ENTITY_STATUS),
        removable: true,
        customProps: {
          options: [
            {
              label: intl.formatMessage(messages.LaunchStatusPassed),
              value: PASSED.toUpperCase(),
            },
            {
              label: intl.formatMessage(messages.LaunchStatusFailed),
              value: FAILED.toUpperCase(),
            },
            {
              label: intl.formatMessage(messages.LaunchStatusSkipped),
              value: SKIPPED.toUpperCase(),
            },
            {
              label: intl.formatMessage(messages.LaunchStatusInterrupted),
              value: INTERRUPTED.toUpperCase(),
            },
            {
              label: intl.formatMessage(messages.LaunchStatusInProgress),
              value: IN_PROGRESS.toUpperCase(),
            },
          ],
          multiple: true,
          selectAll: true,
        },
      },
      {
        id: ENTITY_START_TIME,
        component: EntityItemStartTime,
        value: this.bindDefaultValue(ENTITY_START_TIME, {
          CONDITION_BETWEEN,
        }),
        title: intl.formatMessage(messages.StartTimeTitle),
        active: visibleFilters.includes(ENTITY_START_TIME),
        removable: true,
      },
      this.getDefectTypeEntity(),
      {
        id: ENTITY_DEFECT_COMMENT,
        component: EntityInputConditional,
        value: this.bindDefaultValue(ENTITY_DEFECT_COMMENT, {
          CONDITION_CNT,
        }),
        title: intl.formatMessage(messages.DefectCommentTitle),
        validationFunc: (entityObject) =>
          (!entityObject ||
            !entityObject.value ||
            !validate.launchDescriptionEntity(entityObject.value)) &&
          'launchDescriptionEntityHint',
        active: visibleFilters.includes(ENTITY_DEFECT_COMMENT),
        removable: true,
        customProps: {
          placeholder: intl.formatMessage(messages.DefectCommentPlaceholder),
        },
      },
      {
        id: ENTITY_ATTRIBUTE_KEYS,
        component: EntityInputConditionalTags,
        value: this.bindDefaultValue(ENTITY_ATTRIBUTE_KEYS, {
          condition: CONDITION_HAS,
        }),
        title: intl.formatMessage(messages.AttributeKeysTitle),
        active: visibleFilters.includes(ENTITY_ATTRIBUTE_KEYS),
        removable: true,
        customProps: {
          uri: URLS.testItemAttributeKeysSearch(projectId, launchId),
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
        active: visibleFilters.includes(ENTITY_ATTRIBUTE_VALUES),
        removable: true,
        customProps: {
          uri: URLS.testItemAttributeValuesSearch(
            projectId,
            launchId,
            (filterValues[ENTITY_ATTRIBUTE_KEYS] || {}).value || '',
          ),
          placeholder: intl.formatMessage(messages.ATTRIBUTE_VALUES_PLACEHOLDER),
        },
      },
      {
        id: ENTITY_AUTOANALYZE,
        component: EntityDropdown,
        value: this.bindDefaultValue(ENTITY_AUTOANALYZE, {
          condition: CONDITION_EQ,
        }),
        title: intl.formatMessage(messages.AnalyseTitle),
        active: visibleFilters.includes(ENTITY_AUTOANALYZE),
        removable: true,
        customProps: {
          options: [
            {
              label: intl.formatMessage(messages.AnalyseOption1),
              value: 'TRUE',
            },
            {
              label: intl.formatMessage(messages.AnalyseOption2),
              value: 'FALSE',
            },
          ],
        },
      },
      {
        id: ENTITY_IGNORE_ANALYZER,
        component: EntityDropdown,
        value: this.bindDefaultValue(ENTITY_IGNORE_ANALYZER, {
          condition: CONDITION_IN,
        }),
        title: intl.formatMessage(messages.IgnoreAATitle),
        active: visibleFilters.includes(ENTITY_IGNORE_ANALYZER),
        removable: true,
        customProps: {
          options: [
            {
              label: intl.formatMessage(messages.IgnoreAAOption1),
              value: 'TRUE',
            },
            {
              label: intl.formatMessage(messages.IgnoreAAOption2),
              value: 'FALSE',
            },
          ],
        },
      },
      {
        id: ENTITY_BTS_ISSUES,
        component: EntityDropdown,
        value: this.bindDefaultValue(ENTITY_BTS_ISSUES, {
          condition: CONDITION_EX,
        }),
        title: intl.formatMessage(messages.BtsIssueTitle),
        active: visibleFilters.includes(ENTITY_BTS_ISSUES),
        removable: true,
        customProps: {
          options: [
            {
              label: intl.formatMessage(messages.BtsIssueOption1),
              value: 'TRUE',
            },
            {
              label: intl.formatMessage(messages.BtsIssueOption2),
              value: 'FALSE',
            },
          ],
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
