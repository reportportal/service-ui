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

import { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Dropdown } from '@reportportal/ui-kit';
import { DropdownOptionProps, DropdownOptionType } from '@reportportal/ui-kit/dropdown';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { formatAttribute, parseQueryAttributes } from 'common/utils/attributeUtils';
import { createClassnames } from 'common/utils';
import { AttributeList } from 'componentLibrary/attributeList';
import {
  CONDITION_ANY,
  CONDITION_HAS,
  CONDITION_NOT_ANY,
  CONDITION_NOT_HAS,
} from 'components/filterEntities/constants';
import { messages as launchFormMessages } from 'pages/inside/common/launchFormFields/messages';
import { ConditionOption, FilterEntityCustomProps, FilterEntityValue } from '../../types';
import styles from './attributesValue.scss';

const cx = createClassnames(styles);

const menuPortalRoot =
  typeof document === 'undefined' ? undefined : document.getElementById('tooltip-root') || document.body;

const DEFAULT_CONDITIONS = [CONDITION_HAS, CONDITION_NOT_HAS, CONDITION_ANY, CONDITION_NOT_ANY];

const messages = defineMessages({
  operator: {
    id: 'AttributesValue.operator',
    defaultMessage: 'Operator:',
  },
});

interface FilterAttribute {
  key?: string;
  value?: string;
  edited?: boolean;
  new?: boolean;
  system?: boolean;
}

interface AttributesValueProps {
  title: string;
  value: FilterEntityValue;
  customProps: FilterEntityCustomProps;
  condition: string;
  conditionOptions: ConditionOption[];
  disabled?: boolean;
  shouldFocus?: boolean;
  browserTooltipTitle?: string;
  onConditionChange: (condition: string) => void;
  onChange: (value: FilterEntityValue) => void;
  onAutoFocus?: () => void;
}

type ConditionDropdownOptionType = ConditionOption & DropdownOptionType;

interface ConditionDropdownOptionProps extends DropdownOptionProps {
  option: ConditionDropdownOptionType;
}

const createAttributesFromValue = (raw?: string): FilterAttribute[] => {
  const parsed = parseQueryAttributes({ value: raw });

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map((item: { key?: string; value?: string }) => ({
    key: item.key || '',
    value: item.value || '',
  }));
};

const toFilterValue = (attributes: FilterAttribute[]): string =>
  attributes
    .filter((attribute) => !attribute.new && (attribute.key?.trim() || attribute.value?.trim()))
    .map(({ key, value }) => String(formatAttribute({ key, value })))
    .join(',');

export const getAttributeConditions = (customProps: FilterEntityCustomProps) =>
  customProps.conditions?.length ? customProps.conditions : DEFAULT_CONDITIONS;

export const AttributesValue = ({
  title,
  value,
  customProps,
  condition,
  conditionOptions,
  disabled = false,
  shouldFocus = false,
  browserTooltipTitle = '',
  onConditionChange,
  onChange,
  onAutoFocus,
}: AttributesValueProps) => {
  const { formatMessage } = useIntl();
  const [attributes, setAttributes] = useState<FilterAttribute[]>(() =>
    createAttributesFromValue(value.value),
  );
  const listRef = useRef<HTMLDivElement>(null);
  const pushedValueRef = useRef(value.value || '');
  const {
    projectKey = '',
    keyURLCreator,
    valueURLCreator,
    isAttributeKeyRequired = false,
    isAttributeValueRequired = false,
    canAddSinglePair = false,
  } = customProps;

  useEffect(() => {
    const incoming = value.value || '';

    if (incoming === pushedValueRef.current) {
      return;
    }

    pushedValueRef.current = incoming;
    setAttributes(createAttributesFromValue(incoming));
  }, [value.value]);

  useEffect(() => {
    if (!shouldFocus) {
      return;
    }

    const focusTarget = listRef.current?.querySelector<HTMLElement>(
      'input:not([type="hidden"]), textarea, button, [role="button"][tabindex]:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
    );

    if (focusTarget) {
      focusTarget.focus();
      if (focusTarget.getAttribute('role') === 'button') {
        focusTarget.click();
      }
    }

    onAutoFocus?.();
  }, [shouldFocus, onAutoFocus]);

  const getURIKey = useCallback(
    (search = '') => (keyURLCreator ? keyURLCreator(projectKey)(search) : ''),
    [keyURLCreator, projectKey],
  );

  const getURIValue = useCallback(
    (key?: string) =>
      (search = '') =>
        valueURLCreator ? valueURLCreator(projectKey, key)(search) : '',
    [projectKey, valueURLCreator],
  );

  const hasAttributes = attributes.some(
    (attribute) => !attribute.new && Boolean(attribute.key?.trim() || attribute.value?.trim()),
  );

  const handleAttributesChange = (nextAttributes: FilterAttribute[]) => {
    setAttributes(nextAttributes);

    const nextValue = toFilterValue(nextAttributes);

    if (nextValue === (value.value || '')) {
      return;
    }

    pushedValueRef.current = nextValue;
    onChange({
      value: nextValue,
      condition: condition || CONDITION_HAS,
    });
  };

  return (
    <div className={cx('attributes-block')} title={browserTooltipTitle}>
      <div className={cx('header')}>
        <span className={cx('title')}>{title}</span>
        {hasAttributes && (
          <div className={cx('operator')}>
            <span className={cx('operator-label')}>{formatMessage(messages.operator)}</span>
            <Dropdown
              className={cx('operator-dropdown')}
              toggleButtonClassName={cx('operator-toggle')}
              selectListClassName={cx('operator-menu')}
              options={conditionOptions}
              value={condition || CONDITION_HAS}
              disabled={disabled}
              variant="ghost"
              menuPortalRoot={menuPortalRoot}
              menuMatchTriggerWidth={false}
              placement="bottom-end"
              fallbackPlacements={['top-end', 'bottom-start', 'top-start']}
              renderOption={(renderProps: ConditionDropdownOptionProps) => (
                <>
                  <span>{renderProps.option.label}</span>
                  <div className={cx('operator-option-description')}>
                    {renderProps.option.description}
                  </div>
                </>
              )}
              onChange={(nextValue) => onConditionChange(String(nextValue))}
            />
          </div>
        )}
      </div>

      <div ref={listRef} className={cx('list')}>
        <AttributeList
          attributes={attributes}
          disabled={disabled}
          editable
          showButton
          customClass=""
          defaultOpen={false}
          maxLength={canAddSinglePair ? 1 : Infinity}
          newAttrMessage={formatMessage(launchFormMessages.addAttributes)}
          getURIKey={getURIKey}
          getURIValue={getURIValue}
          isAttributeKeyRequired={isAttributeKeyRequired}
          isAttributeValueRequired={isAttributeValueRequired}
          keyLabel={formatMessage(COMMON_LOCALE_KEYS.KEY)}
          valueLabel={formatMessage(COMMON_LOCALE_KEYS.VALUE)}
          onChange={handleAttributesChange}
          editorAfterList
          addButtonClassName={cx('add-button')}
          attributesListClassname={cx('attributes-list')}
        />
      </div>
    </div>
  );
};
