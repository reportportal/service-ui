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

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useIntl } from 'react-intl';
import { Button, CloseIcon, FieldText, FieldTextFlex, PlusIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { PopoverControl } from 'pages/common/popoverControl';

import { messages } from './messages';
import {
  MULTILINE_SEARCH_FIELDS,
  SEARCH_FIELDS,
  type SearchCondition,
  type SearchField,
} from './utils';

import styles from './searchConditions.scss';

const cx = createClassnames(styles);

const MULTILINE_MIN_HEIGHT = 92;

interface SearchConditionsProps {
  conditions: SearchCondition[];
  onChange: (conditions: SearchCondition[]) => void;
}

/**
 * Search block of the filter panel: conditions "field contains text", combined with AND.
 * Each field can be added once; removing a condition returns its field to the popover.
 */
export const SearchConditions = ({ conditions, onChange }: SearchConditionsProps) => {
  const { formatMessage } = useIntl();
  const [isPopoverOpened, setIsPopoverOpened] = useState(false);
  const inputRefs = useRef<Partial<Record<SearchField, HTMLInputElement | HTMLTextAreaElement>>>(
    {},
  );
  const fieldToFocusRef = useRef<SearchField | null>(null);

  useEffect(() => {
    if (fieldToFocusRef.current) {
      inputRefs.current[fieldToFocusRef.current]?.focus();
      fieldToFocusRef.current = null;
    }
  }, [conditions]);

  const availableFields = SEARCH_FIELDS.filter(
    (field) => !conditions.some((condition) => condition.field === field),
  );

  const handleAdd = (field: SearchField) => {
    setIsPopoverOpened(false);
    fieldToFocusRef.current = field;
    onChange([...conditions, { field, value: '' }]);
  };

  const handleRemove = (field: SearchField) => {
    onChange(conditions.filter((condition) => condition.field !== field));
  };

  const handleValueChange =
    (field: SearchField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      onChange(
        conditions.map((condition) =>
          condition.field === field ? { ...condition, value } : condition,
        ),
      );
    };

  const setInputRef =
    (field: SearchField) => (element: HTMLInputElement | HTMLTextAreaElement | null) => {
      if (element) {
        inputRefs.current[field] = element;
      } else {
        delete inputRefs.current[field];
      }
    };

  const renderCondition = ({ field, value }: SearchCondition) => {
    const isMultiline = MULTILINE_SEARCH_FIELDS.includes(field);
    const label = formatMessage(messages[field]);
    const placeholder = formatMessage(messages.conditionPlaceholder);

    return (
      <div key={field} className={cx('search-condition')} data-search-field={field}>
        <div className={cx('search-condition__label')}>{label}</div>
        <div className={cx('search-condition__row')}>
          {isMultiline ? (
            <FieldTextFlex
              ref={setInputRef(field)}
              className={cx('search-condition__field')}
              value={value}
              onChange={handleValueChange(field)}
              placeholder={placeholder}
              minHeight={MULTILINE_MIN_HEIGHT}
              aria-label={label}
            />
          ) : (
            <FieldText
              ref={setInputRef(field)}
              className={cx('search-condition__field')}
              value={value}
              onChange={handleValueChange(field)}
              placeholder={placeholder}
              title={value}
              defaultWidth={false}
              aria-label={label}
            />
          )}
          <Button
            variant="ghost"
            adjustWidthOn="content"
            className={cx('search-condition__remove')}
            onClick={() => handleRemove(field)}
            aria-label={formatMessage(messages.removeCondition)}
          >
            <CloseIcon />
          </Button>
        </div>
        {isMultiline && (
          <div className={cx('search-conditions__help-text', 'search-condition__help-text')}>
            {formatMessage(messages.multilineHelpText)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cx('search-conditions')}>
      <div className={cx('search-conditions__header')}>
        <div className={cx('search-conditions__label')}>{formatMessage(messages.search)}</div>
        <div className={cx('search-conditions__help-text')}>
          {formatMessage(messages.searchHelpText)}
        </div>
      </div>
      <div className={cx('search-conditions__body')}>
        {conditions.map(renderCondition)}
        {availableFields.length > 0 && (
          <PopoverControl
            items={availableFields.map((field) => ({
              label: formatMessage(messages[field]),
              onClick: () => handleAdd(field),
            }))}
            placement="bottom-start"
            isOpened={isPopoverOpened}
            setIsOpened={setIsPopoverOpened}
          >
            <Button
              variant="text"
              adjustWidthOn="content"
              icon={<PlusIcon />}
              className={cx('search-conditions__add')}
            >
              {formatMessage(messages.addCondition)}
            </Button>
          </PopoverControl>
        )}
      </div>
    </div>
  );
};
