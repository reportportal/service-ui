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
import { useIntl } from 'react-intl';
import { MultipleAutocomplete } from '@reportportal/ui-kit';
import { ControllerStateAndHelpers, StateChangeOptions } from 'downshift';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ERROR_CANCELED, fetch } from 'common/utils';
import { CONDITION_IN } from 'components/filterEntities/constants';
import { FieldRow } from '../../fieldRow';
import { FilterEntityCustomProps, FilterEntityValue } from '../../types';

const SEARCH_MIN_LENGTH = 3;

interface SearchFieldProps {
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

/** Owner etc. — multi-value search, condition is fixed to "has any of" under the hood. */
export const SearchField = ({
  title,
  value,
  customProps,
  disabled,
  removable,
  shouldFocus,
  onChange,
  onRemove,
  onAutoFocus,
}: SearchFieldProps) => {
  const { formatMessage } = useIntl();
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [fetchedTerm, setFetchedTerm] = useState('');
  const cancelTokenRef = useRef<(() => void) | null>(null);
  const searchRequestIdRef = useRef(0);
  const cancelDebounceRef = useRef<(() => void) | null>(null);
  const condition = value.condition || CONDITION_IN;
  const selectedValues = value.value ? value.value.split(',') : [];
  const trimmedInput = inputValue.trim();
  const canCreateOption = trimmedInput.length >= SEARCH_MIN_LENGTH;
  const showLoading =
    loading ||
    (trimmedInput.length >= SEARCH_MIN_LENGTH && trimmedInput !== fetchedTerm);

  const getURI = customProps.getURI;

  const searchOwners = useCallback(
    (searchTerm: string) => {
      const trimmedSearch = searchTerm.trim();

      searchRequestIdRef.current += 1;

      if (!getURI || trimmedSearch.length < SEARCH_MIN_LENGTH) {
        setOptions([]);
        setLoading(false);
        return;
      }

      const requestId = searchRequestIdRef.current;

      setLoading(true);
      cancelTokenRef.current?.();

      fetch(getURI(trimmedSearch), {
        abort: (cancelToken: () => void) => {
          cancelTokenRef.current = cancelToken;
        },
      })
        .then((response: string[]) => {
          if (requestId !== searchRequestIdRef.current) {
            return;
          }

          cancelTokenRef.current = null;
          setOptions(response || []);
        })
        .catch((error: Error) => {
          if (requestId !== searchRequestIdRef.current) {
            return;
          }

          if (error.message !== ERROR_CANCELED) {
            setOptions([]);
          }
          cancelTokenRef.current = null;
        })
        .finally(() => {
          if (requestId !== searchRequestIdRef.current) {
            return;
          }

          setFetchedTerm(trimmedSearch);
          setLoading(false);
        });
    },
    [getURI],
  );

  useEffect(
    () => () => {
      searchRequestIdRef.current += 1;
      cancelTokenRef.current?.();
      cancelDebounceRef.current?.();
    },
    [],
  );

  const getEmptyListMessage = () => {
    if (showLoading || trimmedInput.length === 0) {
      return undefined;
    }

    if (trimmedInput.length < SEARCH_MIN_LENGTH) {
      return formatMessage(COMMON_LOCALE_KEYS.SEARCH_MIN_SYMBOLS, {
        count: SEARCH_MIN_LENGTH,
      });
    }

    if (options.length === 0) {
      return formatMessage(COMMON_LOCALE_KEYS.NO_AVAILABLE_OPTIONS);
    }

    return undefined;
  };

  const handleStateChange = (
    changes: StateChangeOptions<string>,
    { inputValue: nextInput, closeMenu }: ControllerStateAndHelpers<string>,
  ) => {
    if (!('inputValue' in changes)) {
      return;
    }

    const searchTerm = (nextInput || '').trim();
    setInputValue(nextInput || '');

    if (searchTerm.length >= SEARCH_MIN_LENGTH) {
      setLoading(true);
      cancelDebounceRef.current?.();
      const timeoutId = window.setTimeout(() => {
        searchOwners(searchTerm);
      }, 300);
      cancelDebounceRef.current = () => window.clearTimeout(timeoutId);
      return;
    }

    cancelDebounceRef.current?.();
    cancelDebounceRef.current = null;
    cancelTokenRef.current?.();
    cancelTokenRef.current = null;
    searchRequestIdRef.current += 1;
    setOptions([]);
    setFetchedTerm('');
    setLoading(false);

    if (searchTerm.length === 0) {
      closeMenu();
    }
  };

  return (
    <FieldRow
      title={title}
      removable={removable}
      disabled={disabled}
      shouldFocus={shouldFocus}
      onRemove={onRemove}
      onAutoFocus={onAutoFocus}
    >
      <MultipleAutocomplete<string>
        value={selectedValues[0] ? selectedValues : []}
        options={options}
        loading={showLoading}
        async
        minLength={1}
        creatable={canCreateOption}
        createWithoutConfirmation={!canCreateOption}
        placeholder={customProps.placeholder ?? ''}
        disabled={disabled}
        useFixedPositioning
        dropdownMatchInputWidth
        customEmptyListMessage={getEmptyListMessage()}
        selectedItemSingleLine
        inputProps={{
          clearable: true,
          onClear: () => onChange({ condition, value: '' }),
        }}
        onStateChange={handleStateChange}
        onChange={(nextValue) => {
          onChange({
            condition,
            value: (Array.isArray(nextValue) ? nextValue : []).join(','),
          });
        }}
      />
    </FieldRow>
  );
};
