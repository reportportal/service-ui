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

import { FocusEvent } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { AsyncAutocompleteV2 } from 'componentLibrary/autocompletes/asyncAutocompleteV2';

const DEFAULT_MIN_LENGTH = 3;
const DEFAULT_MAX_LENGTH = 256;

const messages = defineMessages({
  placeholder: {
    id: 'LaunchNameControl.placeholder',
    defaultMessage: 'Enter a launch name (min 3 characters)',
  },
});

interface LaunchNameControlProps {
  label: string;
  placeholder?: string;
  getURI: (searchValue: string) => string;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  value?: string | null | false;
  onChange?: (value: string | null) => void;
  onFocus?: () => void;
  onBlur?: (e?: FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
}

export const LaunchNameControl = ({
  label,
  placeholder,
  getURI,
  disabled = false,
  minLength = DEFAULT_MIN_LENGTH,
  maxLength = DEFAULT_MAX_LENGTH,
  value,
  onChange,
  onFocus,
  onBlur,
  error = '',
  touched = false,
}: LaunchNameControlProps) => {
  const { formatMessage } = useIntl();
  const selectedValue = typeof value === 'string' ? value : null;
  const menuPortalRoot = document.getElementById('tooltip-root') || document.body;

  return (
    <AsyncAutocompleteV2
      value={selectedValue}
      placeholder={placeholder ?? formatMessage(messages.placeholder)}
      getURI={getURI}
      onChange={(selected: string | null) => onChange?.(selected)}
      createWithoutConfirmation
      minLength={minLength}
      beforeSearchPrompt={formatMessage(COMMON_LOCALE_KEYS.SEARCH_MIN_SYMBOLS, {
        count: minLength,
      })}
      maxLength={maxLength}
      disabled={disabled}
      error={error}
      touched={touched}
      onFocus={onFocus}
      onBlur={onBlur}
      menuPortalRoot={menuPortalRoot}
      dropdownMatchInputWidth
      useFixedPositioning={false}
      shouldShowEmptyListMessage={false}
      inputProps={{
        label,
        clearable: true,
        onClear: () => onChange?.(null),
      }}
    />
  );
};
