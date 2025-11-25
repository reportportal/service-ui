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

import { ComponentProps, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { FieldLabel, SingleAutocomplete } from '@reportportal/ui-kit';
import { AutocompleteOption } from '@reportportal/ui-kit/autocompletes';

import { isString, noop } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';
import { FolderWithFullPath, transformedFoldersWithFullPathSelector } from 'controllers/testCase';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';
import { findFolderById } from 'pages/inside/testCaseLibraryPage/utils';

import { messages } from './messages';
import styles from './createFolderAutocomplete.scss';

const cx = createClassnames(styles);

type SingleAutocompleteOnStateChange = ComponentProps<
  typeof SingleAutocomplete<FolderWithFullPath>
>['onStateChange'];

type SingleAutocompleteRenderOption = ComponentProps<
  typeof SingleAutocomplete<FolderWithFullPath>
>['renderOption'];

interface CreateFolderAutocompleteProps {
  name?: string;
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  className?: string;
  customEmptyListMessage?: string;
  onStateChange?: SingleAutocompleteOnStateChange;
  onChange?: (value: FolderWithFullPath) => void;
  value?: FolderWithFullPath | null;
  error?: string;
  touched?: boolean;
  createWithoutConfirmation?: boolean;
}

export const CreateFolderAutocomplete = ({
  label,
  placeholder,
  isRequired = false,
  className,
  customEmptyListMessage,
  onStateChange,
  onChange,
  value,
  error,
  touched,
  createWithoutConfirmation = true,
}: CreateFolderAutocompleteProps) => {
  const { formatMessage } = useIntl();
  const folders = useSelector(transformedFoldersWithFullPathSelector);

  const targetFolder = findFolderById(folders, value?.id);

  const autocompleteInputRef = useRef<HTMLInputElement>(null);

  const autocompleteInputRefFunction = (node: HTMLInputElement) => {
    autocompleteInputRef.current = node;
  };

  const renderOption: SingleAutocompleteRenderOption = (
    option: FolderWithFullPath,
    index: number,
    _isNew: boolean,
    getItemProps,
  ) => {
    const { description, name, fullPath } = option;

    return (
      <AutocompleteOption
        {...getItemProps?.({ item: option, index })}
        key={option.id}
        isNew={false}
      >
        <>
          <p className={cx('create-folder-autocomplete__folder-name')}>{description || name}</p>
          <p className={cx('create-folder-autocomplete__folder-path')}>{fullPath}</p>
        </>
      </AutocompleteOption>
    );
  };

  const handleChange = (selectedItem: FolderWithFullPath | null) => {
    onChange?.(selectedItem);
    autocompleteInputRef.current?.blur();
  };

  return (
    <div className={cx('create-folder-autocomplete', className)}>
      {label && <FieldLabel isRequired={isRequired}>{label}</FieldLabel>}
      <SingleAutocomplete<FolderWithFullPath>
        createWithoutConfirmation={createWithoutConfirmation}
        optionVariant=""
        onBlur={noop}
        onFocus={noop}
        useFixedPositioning
        onStateChange={onStateChange}
        onChange={handleChange}
        value={targetFolder}
        error={error}
        touched={touched}
        refFunction={autocompleteInputRefFunction}
        skipOptionCreation
        isDropdownMode
        placeholder={placeholder || formatMessage(commonMessages.searchFolderToSelect)}
        options={folders}
        customEmptyListMessage={customEmptyListMessage || formatMessage(messages.noFoldersFound)}
        renderOption={renderOption}
        parseValueToString={(option: FolderWithFullPath | string) =>
          isString(option) ? option : option?.description || option?.name || ''
        }
        newItemButtonText={formatMessage(commonMessages.createNew)}
      />
    </div>
  );
};
