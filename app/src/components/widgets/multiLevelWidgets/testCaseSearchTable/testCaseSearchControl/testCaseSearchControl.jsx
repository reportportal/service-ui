/*
 * Copyright 2025 EPAM Systems
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

import { FilterEntitiesContainer } from 'components/filterEntities/containers';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { commonValidators } from 'common/utils/validation';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import {
  EntityInputConditional,
  EntityInputConditionalAttributes,
} from 'components/filterEntities';
import {
  CONDITION_CNT,
  CONDITION_HAS,
  ENTITY_NAME,
  ENTITY_ATTRIBUTE,
} from 'components/filterEntities/constants';
import { useCallback } from 'react';
import styles from './testCaseSearchControl.scss';
import { messages } from '../messages';

const cx = classNames.bind(styles);

const TestCaseSearchNameEntity = ({ filterValues = {}, render, disabled = false, ...rest }) => {
  const { formatMessage } = useIntl();

  return render({
    filterEntities: [
      {
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
    ],
    disabled,
    ...rest,
  });
};

TestCaseSearchNameEntity.propTypes = {
  filterValues: PropTypes.object,
  render: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const TestCaseSearchAttributeEntity = ({
  filterValues = {},
  render,
  disabled = false,
  ...rest
}) => {
  const intl = useIntl();
  const projectId = useSelector(activeProjectSelector);

  return render({
    filterEntities: [
      {
        id: ENTITY_ATTRIBUTE,
        component: EntityInputConditionalAttributes,
        value: filterValues[ENTITY_ATTRIBUTE] || {
          condition: CONDITION_HAS,
        },
        validationFunc: commonValidators.requiredField,
        title: intl.formatMessage(messages.Attribute),
        active: true,
        removable: false,
        customProps: {
          projectId,
          keyURLCreator: URLS.launchAttributeKeysSearch,
          valueURLCreator: URLS.launchAttributeValuesSearch,
          conditions: [CONDITION_HAS],
          canAddSinglePair: true,
          isAttributeValueRequired: true,
          isAttributeKeyRequired: true,
          isWithValidationMessage: false,
        },
      },
    ],
    disabled,
    ...rest,
  });
};

TestCaseSearchAttributeEntity.propTypes = {
  filterValues: PropTypes.object,
  render: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export const TestCaseSearchControl = ({ filter = {}, onChange, onClear }) => {
  const isFilterEmpty = !filter || (!filter.name && !filter.compositeAttribute);
  const isSearchByAttribute = !isFilterEmpty && filter.compositeAttribute;
  const isSearchByName = !isFilterEmpty && filter.name;
  const { formatMessage } = useIntl();
  const handleEntitiesChange = (entity) => {
    if (entity?.[ENTITY_NAME]?.value || entity?.[ENTITY_ATTRIBUTE]?.value) {
      onChange(entity);
    } else if (entity?.[ENTITY_NAME]?.value === '' || entity?.[ENTITY_ATTRIBUTE]?.value === '') {
      onClear();
    }
  };
  const filterContainer = useCallback(
    (entityProvider, isDisabled = false) => {
      return (
        <FilterEntitiesContainer
          onChange={handleEntitiesChange}
          entities={filter}
          entitiesProvider={entityProvider}
          render={({
            onFilterAdd,
            onFilterRemove,
            onFilterValidate,
            onFilterChange,
            filterErrors,
            filterEntities,
          }) => (
            <EntitiesGroup
              browserTooltipTitle={isDisabled ? formatMessage(messages.oneOption) : ''}
              className={cx('filter-entity')}
              disabled={isDisabled}
              onChange={onFilterChange}
              onValidate={onFilterValidate}
              onRemove={onFilterRemove}
              onAdd={onFilterAdd}
              errors={filterErrors}
              entities={filterEntities}
              staticMode
            />
          )}
        />
      );
    },
    [filter, handleEntitiesChange],
  );

  return (
    <div className={cx('filter-controls')}>
      {filterContainer(TestCaseSearchNameEntity, isSearchByAttribute)}
      <span className={cx('separator')}>OR</span>
      {filterContainer(TestCaseSearchAttributeEntity, isSearchByName)}
    </div>
  );
};

TestCaseSearchControl.propTypes = {
  filter: PropTypes.object,
  setFilter: PropTypes.func,
  onChange: PropTypes.func,
  onClear: PropTypes.func,
};
