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
import { BaseIconButton, CloseIcon, FieldLabel, FieldText } from '@reportportal/ui-kit';
import { AsyncAutocompleteV2 } from 'componentLibrary/autocompletes/asyncAutocompleteV2';
import { createClassnames } from 'common/utils';
import styles from './customColumnItem.scss';

const cx = createClassnames(styles);

const menuPortalRoot =
  typeof document === 'undefined'
    ? undefined
    : document.getElementById('tooltip-root') || document.body;

const messages = defineMessages({
  label: {
    id: 'CustomColumnItem.label',
    defaultMessage: 'Custom column {number}',
  },
  namePlaceholder: {
    id: 'CustomColumnItem.namePlaceholder',
    defaultMessage: 'Column name',
  },
  attributeKeyPlaceholder: {
    id: 'CustomColumnItem.attributeKeyPlaceholder',
    defaultMessage: 'Attribute key',
  },
  removeAriaLabel: {
    id: 'CustomColumnItem.removeAriaLabel',
    defaultMessage: 'Remove custom column',
  },
});

interface CustomColumnItemProps {
  name?: string;
  attributeKey?: string;
  index: number;
  getURI: (searchValue?: string) => string;
  onChange: (value: { name: string; value: string }, index: number) => void;
  onRemove: (index: number) => void;
  noRemove?: boolean;
}

export const CustomColumnItem = ({
  name = '',
  attributeKey = '',
  index,
  getURI,
  onChange,
  onRemove,
  noRemove = false,
}: CustomColumnItemProps) => {
  const { formatMessage } = useIntl();

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ name: e.target.value, value: attributeKey }, index);
  };

  const handleAttributeKeyChange = (value: string | null) => {
    onChange({ name, value: value || '' }, index);
  };

  return (
    <div className={cx('custom-column-item')}>
      <FieldLabel>{formatMessage(messages.label, { number: index + 1 })}</FieldLabel>
      <div className={cx('row')}>
        <div className={cx('fields')}>
          <FieldText
            className={cx('name-input')}
            value={name}
            placeholder={formatMessage(messages.namePlaceholder)}
            onChange={handleNameChange}
            defaultWidth={false}
            clearable
            onClear={() => onChange({ name: '', value: attributeKey }, index)}
          />
          <AsyncAutocompleteV2
            value={attributeKey || null}
            placeholder={formatMessage(messages.attributeKeyPlaceholder)}
            onChange={handleAttributeKeyChange}
            minLength={1}
            maxLength={512}
            getURI={getURI}
            createWithoutConfirmation
            menuPortalRoot={menuPortalRoot}
            dropdownMatchInputWidth
            useFixedPositioning={false}
            shouldShowEmptyListMessage={false}
            inputProps={{
              clearable: true,
              onClear: () => handleAttributeKeyChange(null),
            }}
          />
        </div>
        {!noRemove && (
          <BaseIconButton
            className={cx('remove-button')}
            aria-label={formatMessage(messages.removeAriaLabel)}
            onClick={() => onRemove(index)}
          >
            <CloseIcon />
          </BaseIconButton>
        )}
      </div>
    </div>
  );
};
