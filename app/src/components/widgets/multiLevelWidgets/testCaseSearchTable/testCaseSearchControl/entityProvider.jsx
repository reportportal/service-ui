import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import {
  EntityDropdown,
  EntityInputConditional,
  EntityInputConditionalAttributes,
} from 'components/filterEntities';
import {
  CONDITION_CNT,
  CONDITION_HAS,
  CONDITION_IN,
  ENTITY_ATTRIBUTE,
  ENTITY_NAME,
  ENTITY_STATUS,
} from 'components/filterEntities/constants';
import { URLS } from 'common/urls';
import { commonValidators } from 'common/utils/validation';
import { FAILED, IN_PROGRESS, INTERRUPTED, PASSED, SKIPPED } from 'common/constants/testStatuses';
import { messages } from '../messages';

export const useEntityConfig = (entityType, filterValues) => {
  const { formatMessage } = useIntl();
  const projectId = useSelector(activeProjectSelector);

  const entityConfig = {
    [ENTITY_NAME]: {
      id: ENTITY_NAME,
      component: EntityInputConditional,
      value: filterValues[ENTITY_NAME] || {
        condition: CONDITION_CNT,
      },
      validationFunc: commonValidators.itemNameEntity,
      title: formatMessage(messages.testNameTitle),
      active: true,
      removable: false,
      static: true,
      customProps: {
        conditions: [CONDITION_CNT],
        placeholder: formatMessage(messages.testNamePlaceholder),
      },
    },
    [ENTITY_ATTRIBUTE]: {
      id: ENTITY_ATTRIBUTE,
      component: EntityInputConditionalAttributes,
      value: filterValues[ENTITY_ATTRIBUTE] || {
        condition: CONDITION_HAS,
      },
      validationFunc: commonValidators.requiredField,
      title: formatMessage(messages.Attribute),
      active: true,
      removable: false,
      customProps: {
        projectId,
        keyURLCreator: URLS.launchAttributeKeysSearch,
        valueURLCreator: URLS.launchAttributeValuesSearch,
        conditions: [CONDITION_HAS],
        canAddSinglePair: true,
        isAttributeValueRequired: true,
        isAttributeKeyRequired: false,
        withValidationMessage: false,
      },
    },
    [ENTITY_STATUS]: {
      id: ENTITY_STATUS,
      component: EntityDropdown,
      value: filterValues[ENTITY_STATUS] || {
        condition: CONDITION_IN,
      },
      title: formatMessage(messages.statusTitle),
      active: true,
      removable: false,
      customProps: {
        options: [
          {
            label: formatMessage(messages.statusPassed),
            value: PASSED.toUpperCase(),
          },
          {
            label: formatMessage(messages.statusFailed),
            value: FAILED.toUpperCase(),
          },
          {
            label: formatMessage(messages.statusSkipped),
            value: SKIPPED.toUpperCase(),
          },
          {
            label: formatMessage(messages.statusInterrupted),
            value: INTERRUPTED.toUpperCase(),
          },
          {
            label: formatMessage(messages.statusInProgress),
            value: IN_PROGRESS.toUpperCase(),
          },
        ],
        multiple: true,
        selectAll: true,
        placeholder: formatMessage(messages.statusPlaceholder),
      },
    },
  };
  return entityConfig[entityType];
};

export const createEntityFilterComponentByType = (entityType) => {
  return function TestCaseEntityComponent({ filterValues, render, disabled, ...rest }) {
    const entity = useEntityConfig(entityType, filterValues);

    return render({
      filterEntities: [entity],
      disabled,
      ...rest,
    });
  };
};

export const TestCaseSearchNameEntity = createEntityFilterComponentByType(ENTITY_NAME);
export const TestCaseSearchAttributeEntity = createEntityFilterComponentByType(ENTITY_ATTRIBUTE);
export const TestCaseSearchStatusEntity = createEntityFilterComponentByType(ENTITY_STATUS);
