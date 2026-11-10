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

import {
  ComponentProps,
  FocusEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, PlusIcon, CloseIcon, UserIcon, FieldLabel } from '@reportportal/ui-kit';
import { AutocompleteOption, SingleAutocomplete } from '@reportportal/ui-kit/autocompletes';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import {
  LAUNCH_OWNER_LEVEL_KEY,
  launchOwnerLevelMessages,
} from 'common/constants/launchOwnerLevel';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames, debounce, fetch, ERROR_CANCELED } from 'common/utils';
import styles from './attributesFieldArrayControl.scss';

const cx = createClassnames(styles);

const menuPortalRoot =
  typeof document === 'undefined'
    ? undefined
    : document.getElementById('tooltip-root') || document.body;

const messages = defineMessages({
  levelsTitle: {
    id: 'AttributesFieldArrayControl.levelsTitle',
    defaultMessage: 'Levels',
  },
  attributeKeyFieldLabel: {
    id: 'AttributesFieldArrayControl.attributeKeyFieldLabel',
    defaultMessage: 'Level {number} {view}',
  },
  attributeKeyFieldPlaceholder: {
    id: 'AttributesFieldArrayControl.attributeKeyFieldPlaceholder',
    defaultMessage: 'Enter an attribute key',
  },
  addLevel: {
    id: 'AttributesFieldArrayControl.addLevel',
    defaultMessage: 'Add Level',
  },
  createNew: {
    id: 'AttributesFieldArrayControl.createNew',
    defaultMessage: 'Create new',
  },
  levelsCanBeAddedMessage: {
    id: 'AttributesFieldArrayControl.levelsCanBeAddedMessage',
    defaultMessage: '{amount} levels can be added',
  },
  levelCanBeAddedMessage: {
    id: 'AttributesFieldArrayControl.levelCanBeAddedMessage',
    defaultMessage: '1 level can be added',
  },
});

type LevelRenderOption = NonNullable<
  ComponentProps<typeof SingleAutocomplete<string>>['renderOption']
>;

interface AttributesFields {
  map: (callback: (name: string, index: number) => ReactNode) => ReactNode;
  length: number;
  getAll: () => Array<string | null | undefined> | undefined;
  push: (value: string) => void;
  remove: (index: number) => void;
}

interface AttributesFieldArrayControlProps {
  fields: AttributesFields;
  fieldValidator: (attributes: string[]) => (value: string) => string | undefined;
  maxAttributesAmount: number;
  getURI: (searchValue?: string) => string;
  attributeKeyFieldViewLabels?: string[];
  showRemainingLevels?: boolean;
  disabled?: boolean;
  withOwnerLevel?: boolean;
  title?: string;
  description?: string;
}

const SEARCH_MIN_LENGTH = 1;

interface LevelAttributeAutocompleteProps {
  getURI: (searchValue?: string) => string;
  showOwner: boolean;
  excludeValues: string[];
  placeholder: string;
  newItemButtonText: string;
  disabled?: boolean;
  startIcon?: ReactNode;
  value?: string | null;
  onChange?: (value: string | null) => void;
  onFocus?: () => void;
  onBlur?: (event?: FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  parseValueToString: (value: string | null) => string;
  renderOption?: LevelRenderOption;
}

const LevelAttributeAutocomplete = ({
  getURI,
  showOwner,
  excludeValues,
  placeholder,
  newItemButtonText,
  disabled = false,
  startIcon,
  value = null,
  onChange,
  onFocus,
  onBlur,
  error = '',
  touched = false,
  parseValueToString,
  renderOption,
}: LevelAttributeAutocompleteProps) => {
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const getURIRef = useRef(getURI);
  const cancelRequestRef = useRef<(() => void) | null>(null);
  const cancelDebounceRef = useRef<(() => void) | null>(null);

  getURIRef.current = getURI;

  const loadKeys = useMemo(
    () =>
      debounce((inputValue: string) => {
        cancelRequestRef.current?.();

        fetch(getURIRef.current(inputValue), {
          abort: (cancel: () => void) => {
            cancelRequestRef.current = cancel;
          },
        })
          .then((response: string[]) => {
            cancelRequestRef.current = null;
            setKeys(Array.isArray(response) ? response : []);
            setLoading(false);
          })
          .catch((requestError: { message?: string }) => {
            if (requestError.message !== ERROR_CANCELED) {
              setKeys([]);
              setLoading(false);
            }
            cancelRequestRef.current = null;
          });
      }, 200),
    [],
  );

  useEffect(
    () => () => {
      cancelDebounceRef.current?.();
      cancelRequestRef.current?.();
    },
    [],
  );

  const options = useMemo(() => {
    const availableKeys = keys.filter(
      (key) => key !== LAUNCH_OWNER_LEVEL_KEY && !excludeValues.includes(key),
    );

    return showOwner ? [LAUNCH_OWNER_LEVEL_KEY, ...availableKeys] : availableKeys;
  }, [excludeValues, keys, showOwner]);

  return (
    <SingleAutocomplete
      async
      options={options}
      loading={loading && !showOwner}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      touched={touched}
      isDropdownMode={showOwner}
      minLength={showOwner ? 0 : SEARCH_MIN_LENGTH}
      maxLength={512}
      createWithoutConfirmation={!canCreate}
      newItemButtonText={newItemButtonText}
      parseValueToString={parseValueToString}
      renderOption={renderOption}
      onChange={(selected) => onChange?.((selected) ?? null)}
      onFocus={() => onFocus?.()}
      onBlur={(event) => onBlur?.(event)}
      onStateChange={(changes, state) => {
        if (!state?.isOpen || !changes || !('inputValue' in changes)) {
          return;
        }

        const inputValue = (state.inputValue || '').trim();
        const hasQuery = inputValue.length >= SEARCH_MIN_LENGTH;

        setCanCreate(hasQuery);

        if (!hasQuery) {
          setKeys([]);
          setLoading(false);
          return;
        }

        if (!showOwner) {
          setLoading(true);
        }
        cancelDebounceRef.current = loadKeys(inputValue);
      }}
      menuPortalRoot={menuPortalRoot}
      dropdownMatchInputWidth
      useFixedPositioning={false}
      shouldShowEmptyListMessage={false}
      inputProps={{
        clearable: true,
        startIcon,
      }}
    />
  );
};

const OwnerOptionContent = ({ label }: { label: string }) => (
  <span className={cx('owner-option')}>
    <span className={cx('owner-icon')} aria-hidden>
      <UserIcon />
    </span>
    {label}
  </span>
);

export const AttributesFieldArrayControl = ({
  fields,
  fieldValidator,
  maxAttributesAmount,
  getURI,
  attributeKeyFieldViewLabels = [],
  showRemainingLevels = false,
  disabled = false,
  withOwnerLevel = false,
  title,
  description,
}: AttributesFieldArrayControlProps) => {
  const { formatMessage } = useIntl();
  const ownerLabel = formatMessage(launchOwnerLevelMessages.ownerLevelOption);
  const attributes = (fields.getAll() || []).map((item) => item || '');
  const canAddNewItems = fields.length < maxAttributesAmount;
  const numberRemainingLevels = maxAttributesAmount - fields.length;

  useEffect(() => {
    if (!fields.length) {
      fields.push('');
    }
  }, [fields]);

  const isOwnerLevelAvailable = useCallback(
    (index: number) =>
      !attributes.some((value, i) => i !== index && value === LAUNCH_OWNER_LEVEL_KEY),
    [attributes],
  );

  const parseValueToString = useCallback(
    (value: string | null) => (value === LAUNCH_OWNER_LEVEL_KEY ? ownerLabel : value || ''),
    [ownerLabel],
  );

  const renderLevelOption = useCallback<LevelRenderOption>(
    (item, index, isNew, getItemProps) => {
      if (item === LAUNCH_OWNER_LEVEL_KEY) {
        return (
          <AutocompleteOption key={item} {...getItemProps({ item, index })}>
            <OwnerOptionContent label={ownerLabel} />
          </AutocompleteOption>
        );
      }

      return (
        <AutocompleteOption key={item} {...getItemProps({ item, index })} isNew={isNew}>
          {item}
        </AutocompleteOption>
      );
    },
    [ownerLabel],
  );

  const parseLevelValue = (value: string | null, index: number) => {
    if (!value) return '';
    if (!withOwnerLevel) return value;

    if (value === ownerLabel || value === LAUNCH_OWNER_LEVEL_KEY) {
      return isOwnerLevelAvailable(index) || attributes[index] === LAUNCH_OWNER_LEVEL_KEY
        ? LAUNCH_OWNER_LEVEL_KEY
        : '';
    }

    return value;
  };

  return (
    <div className={cx('attributes-field-array')}>
      <div className={cx('heading')}>
        <h4 className={cx('title')}>{title || formatMessage(messages.levelsTitle)}</h4>
        {description && <p className={cx('description')}>{description}</p>}
      </div>

      {fields.map((item, index) => {
        const isFirstItem = index === 0;
        const isOwnerSelected = attributes[index] === LAUNCH_OWNER_LEVEL_KEY;
        const showOwnerInOptions = withOwnerLevel && isOwnerLevelAvailable(index);

        return (
          <div key={item} className={cx('level-row')}>
            <div className={cx('level-field-wrapper')}>
              <FieldLabel>
                {formatMessage(messages.attributeKeyFieldLabel, {
                  number: index + 1,
                  view: attributeKeyFieldViewLabels[index] || '',
                }).trim()}
              </FieldLabel>
              <div className={cx('level-field')}>
                <FieldProvider
                  name={item}
                  validate={fieldValidator(attributes)}
                  format={(value: string) => value || null}
                  parse={(value: string | null) => parseLevelValue(value, index)}
                >
                  <FieldErrorHint provideHint={false}>
                    <LevelAttributeAutocomplete
                      getURI={getURI}
                      showOwner={showOwnerInOptions}
                      excludeValues={attributes.filter((_, valueIndex) => valueIndex !== index)}
                      placeholder={formatMessage(messages.attributeKeyFieldPlaceholder)}
                      newItemButtonText={formatMessage(messages.createNew)}
                      disabled={disabled}
                      parseValueToString={parseValueToString}
                      renderOption={withOwnerLevel ? renderLevelOption : undefined}
                      startIcon={
                        isOwnerSelected ? (
                          <span className={cx('owner-icon')} aria-hidden>
                            <UserIcon />
                          </span>
                        ) : undefined
                      }
                    />
                  </FieldErrorHint>
                </FieldProvider>
                {!isFirstItem && (
                  <Button
                    className={cx('remove')}
                    adjustWidthOn="content"
                    variant="ghost"
                    onClick={() => fields.remove(index)}
                    disabled={disabled}
                    aria-label={formatMessage(COMMON_LOCALE_KEYS.REMOVE)}
                  >
                    <CloseIcon />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {canAddNewItems && (
        <div className={cx('add-level-row')}>
          <Button
            variant="text"
            adjustWidthOn="content"
            icon={<PlusIcon />}
            onClick={() => fields.push('')}
            disabled={disabled}
          >
            {formatMessage(messages.addLevel)}
          </Button>
          {showRemainingLevels && (
            <div className={cx('remaining-level')}>
              {numberRemainingLevels === 1
                ? formatMessage(messages.levelCanBeAddedMessage)
                : formatMessage(messages.levelsCanBeAddedMessage, {
                    amount: numberRemainingLevels,
                  })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
