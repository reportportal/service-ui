/*
 * Copyright 2026 EPAM Systems
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

import { ChangeEvent } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Dropdown, FieldText } from '@reportportal/ui-kit';
import { DropdownValue } from '@reportportal/ui-kit/components/dropdown/types';
import { GROUP_TO_ACTION_MAP } from 'common/constants/actionTypes';
import { createClassnames } from 'common/utils';
import {
  CONDITION_CNT,
  CONDITION_EQ,
  CONDITION_HAS,
  CONDITION_NOT_CNT,
  CONDITION_NOT_EQ,
  FILTER_ENTITY_KIND,
} from 'components/filterEntities/constants';
import { FieldRow } from '../fieldRow';
import { useConditionOptions } from '../conditionOptions';
import { FilterEntity, FilterEntityCustomProps, FilterEntityValue } from '../types';
import { AttributesValue, getAttributeConditions } from './attributesValue';
import { SearchField } from './searchField';
import { StartTimeField } from './startTimeField';
import styles from './entityFieldV2.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  placeholder: {
    id: 'entityInputConditional.defaultPlaceholder',
    defaultMessage: 'Enter name',
  },
  all: {
    id: 'Conditions.all',
    defaultMessage: 'All',
  },
  itemNameEntityHint: {
    id: 'LaunchLevelEntities.itemNameEntityHint',
    defaultMessage: 'At least 3 symbols required',
  },
  launchNumericEntityHint: {
    id: 'LaunchLevelEntities.launchNumberEntityHint',
    defaultMessage: 'This filter accepts only digits',
  },
  descriptionEntityHint: {
    id: 'LaunchLevelEntities.descriptionEntityHint',
    defaultMessage: 'Description should have size from 1 to 256',
  },
});

const TEXT_CONDITIONS = [CONDITION_CNT, CONDITION_NOT_CNT, CONDITION_EQ, CONDITION_NOT_EQ];
const menuPortalRoot =
  typeof document === 'undefined' ? undefined : document.getElementById('tooltip-root') || document.body;

const ERROR_MESSAGES = {
  itemNameEntityHint: messages.itemNameEntityHint,
  launchNumericEntityHint: messages.launchNumericEntityHint,
  descriptionEntityHint: messages.descriptionEntityHint,
};

interface EntityFieldV2Props {
  entity: FilterEntity;
  error?: string;
  disabled?: boolean;
  shouldFocus?: boolean;
  browserTooltipTitle?: string;
  onChange: (value: FilterEntityValue, isConditionChange?: boolean) => void;
  onRemove: () => void;
  onAutoFocus?: () => void;
}

const getMultiValue = (value: string | undefined, actionToGroup?: Record<string, string>) => {
  if (!value) {
    return [];
  }

  return [...new Set(value.split(',').map((item) => actionToGroup?.[item] || item))];
};

const toStoredMultiValue = (value: DropdownValue[]) =>
  value
    .map((item) => {
      const groupActions =
        GROUP_TO_ACTION_MAP[String(item) as keyof typeof GROUP_TO_ACTION_MAP];

      return groupActions || item;
    })
    .join(',');

/**
 * Renders a single filter condition/field row via `FieldRow`, picking the right
 * sub-component from `entity.kind`. For entities with a real operator choice
 * (text, attributes) an operator dropdown is passed to `FieldRow`; for entities
 * whose condition is fixed (dropdown, search, start time), no operator options
 * are passed, so `FieldRow` renders the title as a plain label.
 *
 * Shared *LevelEntities catalogs also carry a legacy `component` for V1
 * (`EntitiesGroup` mounts it). When `kind` is missing, V2 falls back to that
 * component so new catalog entries can ship before a V2 field exists.
 */
export const EntityFieldV2 = ({
  entity,
  error,
  disabled = false,
  shouldFocus = false,
  browserTooltipTitle = '',
  onChange,
  onRemove,
  onAutoFocus,
}: EntityFieldV2Props) => {
  const { kind, component: LegacyComponent, title, value, removable, customProps = {} } = entity;
  const isDisabled = disabled || Boolean(customProps.disabled);
  const condition = value.condition || '';

  const handleConditionChange = (nextCondition: string) => {
    if (nextCondition === condition) {
      return;
    }

    onChange({ ...value, condition: nextCondition }, true);
  };

  switch (kind) {
    case FILTER_ENTITY_KIND.TEXT:
      return (
        <TextCondition
          title={title}
          value={value}
          condition={condition}
          customProps={customProps}
          error={error}
          disabled={isDisabled}
          removable={removable}
          shouldFocus={shouldFocus}
          browserTooltipTitle={browserTooltipTitle}
          onConditionChange={handleConditionChange}
          onChange={onChange}
          onRemove={onRemove}
          onAutoFocus={onAutoFocus}
        />
      );
    case FILTER_ENTITY_KIND.DROPDOWN:
      return (
        <DropdownField
          title={title}
          value={value}
          customProps={customProps}
          disabled={isDisabled}
          removable={removable}
          shouldFocus={shouldFocus}
          onChange={onChange}
          onRemove={onRemove}
          onAutoFocus={onAutoFocus}
        />
      );
    case FILTER_ENTITY_KIND.SEARCH:
      return (
        <SearchField
          title={title}
          value={value}
          customProps={customProps}
          disabled={isDisabled}
          removable={removable}
          shouldFocus={shouldFocus}
          onChange={onChange}
          onRemove={onRemove}
          onAutoFocus={onAutoFocus}
        />
      );
    case FILTER_ENTITY_KIND.START_TIME:
      return (
        <StartTimeField
          title={title}
          value={value}
          removable={removable}
          disabled={isDisabled}
          customProps={customProps}
          shouldFocus={shouldFocus}
          onChange={onChange}
          onRemove={onRemove}
          onAutoFocus={onAutoFocus}
        />
      );
    case FILTER_ENTITY_KIND.ATTRIBUTES:
      return (
        <AttributesCondition
          title={title}
          value={value}
          condition={condition}
          customProps={customProps}
          disabled={isDisabled}
          shouldFocus={shouldFocus}
          browserTooltipTitle={browserTooltipTitle}
          onConditionChange={handleConditionChange}
          onChange={onChange}
          onAutoFocus={onAutoFocus}
        />
      );
    case FILTER_ENTITY_KIND.CONTAINS:
      return (
        <ContainsField
          title={title}
          value={value}
          customProps={customProps}
          error={error || customProps.error}
          disabled={isDisabled}
          removable={removable}
          shouldFocus={shouldFocus}
          onChange={onChange}
          onRemove={onRemove}
          onAutoFocus={onAutoFocus}
        />
      );
    default:
      if (!LegacyComponent) {
        return null;
      }

      return (
        <LegacyComponent
          entityId={entity.id}
          title={title}
          value={value}
          removable={removable}
          error={error}
          disabled={isDisabled}
          active={shouldFocus}
          browserTooltipTitle={browserTooltipTitle}
          customProps={customProps}
          onRemove={onRemove}
          onChange={(nextValue: FilterEntityValue, isConditionChange?: boolean) =>
            onChange(nextValue, isConditionChange)
          }
          onFocus={onAutoFocus}
        />
      );
  }
};

interface TextConditionProps {
  title: string;
  value: FilterEntityValue;
  condition: string;
  customProps: FilterEntityCustomProps;
  error?: string;
  disabled: boolean;
  removable: boolean;
  shouldFocus: boolean;
  browserTooltipTitle: string;
  onConditionChange: (condition: string) => void;
  onChange: (value: FilterEntityValue, isConditionChange?: boolean) => void;
  onRemove: () => void;
  onAutoFocus?: () => void;
}

const TextCondition = ({
  title,
  value,
  condition,
  customProps,
  error,
  disabled,
  removable,
  shouldFocus,
  browserTooltipTitle,
  onConditionChange,
  onChange,
  onRemove,
  onAutoFocus,
}: TextConditionProps) => {
  const { formatMessage } = useIntl();
  const conditionOptions = useConditionOptions(customProps.conditions || TEXT_CONDITIONS);
  const formattedError =
    error && error in ERROR_MESSAGES
      ? formatMessage(ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES])
      : error;

  return (
    <FieldRow
      title={title}
      condition={condition}
      conditionOptions={conditionOptions}
      onConditionChange={onConditionChange}
      removable={removable}
      disabled={disabled}
      shouldFocus={shouldFocus}
      onRemove={onRemove}
      onAutoFocus={onAutoFocus}
    >
      <FieldText
        value={value.value || ''}
        placeholder={customProps.placeholder || formatMessage(messages.placeholder)}
        maxLength={customProps.maxLength ?? 128}
        disabled={disabled}
        error={formattedError}
        touched={Boolean(formattedError)}
        title={browserTooltipTitle}
        defaultWidth={false}
        className={cx('value-input')}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange({ value: event.target.value, condition });
        }}
      />
    </FieldRow>
  );
};

interface DropdownFieldProps {
  title: string;
  value: FilterEntityValue;
  customProps: FilterEntityCustomProps;
  disabled: boolean;
  removable: boolean;
  shouldFocus: boolean;
  onChange: (value: FilterEntityValue, isConditionChange?: boolean) => void;
  onRemove: () => void;
  onAutoFocus?: () => void;
}

/** Execution type / status / defect type etc. — condition is fixed, no operator choice. */
const DropdownField = ({
  title,
  value,
  customProps,
  disabled,
  removable,
  shouldFocus,
  onChange,
  onRemove,
  onAutoFocus,
}: DropdownFieldProps) => {
  const { formatMessage } = useIntl();
  const condition = value.condition || '';
  const { options = [], multiple = false, selectAll = false, actionToGroup, placeholder } =
    customProps;
  const dropdownValue = multiple
    ? getMultiValue(value.value, actionToGroup)
    : value.value || '';

  return (
    <FieldRow
      title={title}
      removable={removable}
      disabled={disabled}
      shouldFocus={shouldFocus}
      onRemove={onRemove}
      onAutoFocus={onAutoFocus}
    >
      <Dropdown
        options={options}
        value={dropdownValue}
        placeholder={typeof placeholder === 'string' ? placeholder : ''}
        disabled={disabled}
        multiSelect={multiple}
        isOptionAllVisible={selectAll}
        optionAll={{ value: 'all', label: formatMessage(messages.all) }}
        menuPortalRoot={menuPortalRoot}
        onChange={(nextValue) => {
          onChange({
            condition,
            value: Array.isArray(nextValue)
              ? toStoredMultiValue(nextValue)
              : String(nextValue ?? ''),
          });
        }}
      />
    </FieldRow>
  );
};

interface AttributesConditionProps {
  title: string;
  value: FilterEntityValue;
  condition: string;
  customProps: FilterEntityCustomProps;
  disabled: boolean;
  shouldFocus: boolean;
  browserTooltipTitle: string;
  onConditionChange: (condition: string) => void;
  onChange: (value: FilterEntityValue, isConditionChange?: boolean) => void;
  onAutoFocus?: () => void;
}

const AttributesCondition = ({
  title,
  value,
  condition,
  customProps,
  disabled,
  shouldFocus,
  browserTooltipTitle,
  onConditionChange,
  onChange,
  onAutoFocus,
}: AttributesConditionProps) => {
  const conditionOptions = useConditionOptions(getAttributeConditions(customProps));

  return (
    <AttributesValue
      title={title}
      value={value}
      customProps={customProps}
      condition={condition || CONDITION_HAS}
      conditionOptions={conditionOptions}
      disabled={disabled}
      shouldFocus={shouldFocus}
      browserTooltipTitle={browserTooltipTitle}
      onConditionChange={onConditionChange}
      onChange={onChange}
      onAutoFocus={onAutoFocus}
    />
  );
};

interface ContainsFieldProps {
  title: string;
  value: FilterEntityValue;
  customProps: FilterEntityCustomProps;
  error?: string;
  disabled: boolean;
  removable: boolean;
  shouldFocus: boolean;
  onChange: (value: FilterEntityValue, isConditionChange?: boolean) => void;
  onRemove: () => void;
  onAutoFocus?: () => void;
}

/** Fallback for a filter condition whose entity definition is no longer known. */
const ContainsField = ({
  title,
  value,
  customProps,
  error,
  disabled,
  removable,
  shouldFocus,
  onChange,
  onRemove,
  onAutoFocus,
}: ContainsFieldProps) => (
  <FieldRow
    title={title}
    removable={removable}
    disabled={disabled}
    shouldFocus={shouldFocus}
    onRemove={onRemove}
    onAutoFocus={onAutoFocus}
  >
    <FieldText
      value={value.value || ''}
      placeholder={customProps.placeholder}
      maxLength={customProps.maxLength ?? 128}
      disabled={disabled}
      error={error}
      touched={Boolean(error)}
      defaultWidth={false}
      className={cx('value-input')}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        onChange({ value: event.target.value, condition: value.condition });
      }}
    />
  </FieldRow>
);
