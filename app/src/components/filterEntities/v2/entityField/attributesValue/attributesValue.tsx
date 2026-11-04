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
import { BaseIconButton, Button, CloseIcon, Dropdown, PlusIcon } from '@reportportal/ui-kit';
import { formatAttribute, parseQueryAttributes } from 'common/utils/attributeUtils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';
import { AttributeEditor } from 'componentLibrary/attributeEditor';
import {
  CONDITION_ANY,
  CONDITION_HAS,
  CONDITION_NOT_ANY,
  CONDITION_NOT_HAS,
} from 'components/filterEntities/constants';
import { messages as launchFormMessages } from 'pages/inside/common/launchFormFields/messages';
import { generateUUID } from 'pages/inside/common/launchFormFields/utils';
import { ConditionOption, FilterEntityCustomProps, FilterEntityValue } from '../../types';
import styles from './attributesValue.scss';

const cx = createClassnames(styles);

const menuPortalRoot =
  typeof document === 'undefined' ? undefined : document.getElementById('tooltip-root') || document.body;

const DEFAULT_CONDITIONS = [CONDITION_HAS, CONDITION_NOT_HAS, CONDITION_ANY, CONDITION_NOT_ANY];

const messages = defineMessages({
  condition: {
    id: 'AttributesValue.condition',
    defaultMessage: 'Condition:',
  },
});

interface AttributeRow {
  id: string;
  // Stable mount value for AttributeEditor — do not replace after create.
  attribute: { key: string; value: string };
  key: string;
  value: string;
}

interface AttributesValueProps {
  title: string;
  value: FilterEntityValue;
  customProps: FilterEntityCustomProps;
  condition: string;
  conditionOptions: ConditionOption[];
  disabled?: boolean;
  removable?: boolean;
  shouldFocus?: boolean;
  browserTooltipTitle?: string;
  onConditionChange: (condition: string) => void;
  onChange: (value: FilterEntityValue) => void;
  onRemove: () => void;
  onAutoFocus?: () => void;
}

const createRowsFromValue = (raw?: string): AttributeRow[] => {
  const parsed = parseQueryAttributes({ value: raw });

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map((item: { key?: string; value?: string }) => {
    const attribute = { key: item.key || '', value: item.value || '' };

    return {
      id: generateUUID(),
      attribute,
      key: attribute.key,
      value: attribute.value,
    };
  });
};

const toFilterValue = (rows: AttributeRow[], nextCondition: string): FilterEntityValue => {
  const attributes = rows
    .filter((row) => row.key.trim() || row.value.trim())
    .map(({ key, value }) => ({ key, value }));

  return {
    value: attributes.map((attribute) => String(formatAttribute(attribute))).join(','),
    condition: nextCondition,
  };
};

export const getAttributeConditions = (customProps: FilterEntityCustomProps) =>
  customProps.conditions?.length ? customProps.conditions : DEFAULT_CONDITIONS;

export const AttributesValue = ({
  title,
  value,
  customProps,
  condition,
  conditionOptions,
  disabled = false,
  removable = false,
  shouldFocus = false,
  browserTooltipTitle = '',
  onConditionChange,
  onChange,
  onRemove,
  onAutoFocus,
}: AttributesValueProps) => {
  const { formatMessage } = useIntl();
  const attributeValue = value.value;
  const [rows, setRows] = useState<AttributeRow[]>(() => createRowsFromValue(attributeValue));
  const [sourceValue, setSourceValue] = useState(attributeValue);
  const isInternalChangeRef = useRef(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const {
    projectKey = '',
    keyURLCreator,
    valueURLCreator,
    isAttributeKeyRequired = false,
    isAttributeValueRequired = false,
    canAddSinglePair = false,
  } = customProps;

  const syncFilter = useCallback(
    (nextRows: AttributeRow[], nextCondition = condition || CONDITION_HAS) => {
      isInternalChangeRef.current = true;
      onChange(toFilterValue(nextRows, nextCondition));
    },
    [condition, onChange],
  );

  if (attributeValue !== sourceValue) {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      setSourceValue(attributeValue);
    } else {
      setSourceValue(attributeValue);
      setRows(createRowsFromValue(attributeValue));
    }
  }

  useEffect(() => {
    if (!shouldFocus) {
      return;
    }

    const focusTarget = blockRef.current?.querySelector<HTMLElement>(
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

  const hasRows = rows.length > 0;
  const hideAdd = canAddSinglePair && hasRows;

  const handleAdd = () => {
    const attribute = { key: '', value: '' };
    const nextRows = [...rows, { id: generateUUID(), attribute, key: '', value: '' }];
    setRows(nextRows);
    syncFilter(nextRows);
  };

  const handleRemoveRow = (rowId: string) => {
    const nextRows = rows.filter((row) => row.id !== rowId);
    setRows(nextRows);
    syncFilter(nextRows);
  };

  const handleValuesChange = (rowId: string, nextValue: { key: string; value: string }) => {
    const current = rows.find((row) => row.id === rowId);

    if (current && current.key === nextValue.key && current.value === nextValue.value) {
      return;
    }

    const nextRows = rows.map((row) =>
      row.id === rowId ? { ...row, key: nextValue.key, value: nextValue.value } : row,
    );

    setRows(nextRows);
    syncFilter(nextRows);
  };

  return (
    <div ref={blockRef} className={cx('attributes-block')} title={browserTooltipTitle}>
      <div className={cx('header')}>
        <p className={cx('title')}>{title}</p>
        {hasRows && (
          <div className={cx('condition')}>
            <span className={cx('condition-label')}>{formatMessage(messages.condition)}</span>
            <Dropdown
              className={cx('condition-dropdown')}
              toggleButtonClassName={cx('condition-toggle')}
              selectListClassName={cx('condition-menu')}
              options={conditionOptions}
              value={condition || CONDITION_HAS}
              disabled={disabled}
              variant="ghost"
              menuPortalRoot={menuPortalRoot}
              onChange={(nextValue) => onConditionChange(String(nextValue))}
            />
          </div>
        )}
        {removable && (
          <BaseIconButton
            className={cx('section-remove')}
            onClick={onRemove}
            disabled={disabled}
            aria-label={formatMessage(COMMON_LOCALE_KEYS.REMOVE)}
          >
            <CloseIcon />
          </BaseIconButton>
        )}
      </div>

      {hasRows && (
        <div className={cx('rows')}>
          {rows.map((row) => (
            <div key={row.id} className={cx('row')}>
              <div className={cx('editor')}>
                <AttributeEditor
                  attribute={row.attribute}
                  attributes={rows
                    .filter((item) => item.id !== row.id)
                    .map(({ key, value: attrValue }) => ({ key, value: attrValue }))}
                  getURIKey={getURIKey}
                  getURIValue={getURIValue}
                  isAttributeKeyRequired={isAttributeKeyRequired}
                  isAttributeValueRequired={isAttributeValueRequired}
                  hideActionButtons
                  onValuesChange={(nextValue: { key: string; value: string }) =>
                    handleValuesChange(row.id, nextValue)
                  }
                />
              </div>
              <Button
                className={cx('remove')}
                adjustWidthOn="content"
                variant="ghost"
                onClick={() => handleRemoveRow(row.id)}
                disabled={disabled}
                aria-label={formatMessage(COMMON_LOCALE_KEYS.REMOVE)}
              >
                <CloseIcon />
              </Button>
            </div>
          ))}
        </div>
      )}

      {!hideAdd && !disabled && (
        <Button
          className={cx('add-attribute')}
          variant="text"
          adjustWidthOn="content"
          icon={<PlusIcon />}
          onClick={handleAdd}
        >
          {formatMessage(launchFormMessages.addAttributes)}
        </Button>
      )}
    </div>
  );
};
