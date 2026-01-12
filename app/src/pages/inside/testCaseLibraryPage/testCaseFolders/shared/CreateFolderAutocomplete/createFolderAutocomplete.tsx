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

import { ComponentProps, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { FieldLabel, SingleAutocomplete } from '@reportportal/ui-kit';
import { AutocompleteOption } from '@reportportal/ui-kit/autocompletes';

import { isEmpty, isString, noop } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';
import { FolderWithFullPath, transformedFoldersWithFullPathSelector } from 'controllers/testCase';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';
import { findFolderById } from 'pages/inside/testCaseLibraryPage/utils';
import { NewFolderData } from 'pages/inside/testCaseLibraryPage/utils/getFolderFromFormValues';

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
  value?: FolderWithFullPath | NewFolderData | null;
  error?: string;
  touched?: boolean;
  shouldDisplayNewFolderButton?: boolean;
  excludeFolderIds?: number[];
  onStateChange?: SingleAutocompleteOnStateChange;
  onChange?: (value: FolderWithFullPath | NewFolderData) => void;
}

export const CreateFolderAutocomplete = ({
  label,
  placeholder,
  isRequired = false,
  className,
  customEmptyListMessage,
  value,
  error,
  touched,
  shouldDisplayNewFolderButton = false,
  excludeFolderIds = [],
  onStateChange = noop,
  onChange = noop,
}: CreateFolderAutocompleteProps) => {
  const { formatMessage } = useIntl();
  const [inputValue, setInputValue] = useState('');
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const folders = useSelector(transformedFoldersWithFullPathSelector);

  const filteredFolders = !isEmpty(excludeFolderIds)
    ? folders.filter((folder) => !excludeFolderIds.includes(folder.id))
    : folders;

  const hideNewFolderButton = useMemo(() => {
    if (!shouldDisplayNewFolderButton) {
      return true;
    }

    const trimmedInput = inputValue.trim();

    if (!trimmedInput) {
      return true;
    }

    return filteredFolders.some((folder) => {
      const folderName = folder.description || folder.name || '';

      return folderName.toLowerCase() === trimmedInput.toLowerCase();
    });
  }, [inputValue, filteredFolders, shouldDisplayNewFolderButton]);

  const getTargetFolder = () => {
    if (!value) {
      return null;
    }

    if ('id' in value) {
      return findFolderById(filteredFolders, value.id);
    }

    if ('name' in value) {
      return value.name;
    }

    return null;
  };

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

  const handleChange = (selectedItem: FolderWithFullPath | string | null) => {
    if (selectedItem) {
      onChange(isString(selectedItem) ? { name: selectedItem } : selectedItem);
    }

    autocompleteInputRef.current?.blur();
  };

  const parseValueToString = (option: FolderWithFullPath | NewFolderData | string) => {
    if (!option) {
      return '';
    }

    if (isString(option)) {
      return option;
    }

    if ('fullPath' in option) {
      return option.description || option.name || '';
    }

    return option.name || '';
  };

  const handleStateChange: SingleAutocompleteOnStateChange = (changes, stateAndHelpers) => {
    if (changes.inputValue !== undefined) {
      setInputValue(changes.inputValue || '');
    }

    onStateChange(changes, stateAndHelpers);
  };

  return (
    <div className={cx('create-folder-autocomplete', className)}>
      {label && <FieldLabel isRequired={isRequired}>{label}</FieldLabel>}
      <SingleAutocomplete<FolderWithFullPath | string>
        createWithoutConfirmation={hideNewFolderButton}
        optionVariant=""
        useFixedPositioning={false}
        value={getTargetFolder()}
        error={error}
        touched={touched}
        refFunction={autocompleteInputRefFunction}
        newItemButtonText={formatMessage(messages.newRootFolder)}
        isDropdownMode
        placeholder={placeholder || formatMessage(commonMessages.searchFolderToSelect)}
        options={filteredFolders}
        customEmptyListMessage={customEmptyListMessage || formatMessage(messages.noFoldersFound)}
        renderOption={renderOption}
        parseValueToString={parseValueToString}
        onStateChange={handleStateChange}
        onChange={handleChange}
        onBlur={noop}
        onFocus={noop}
      />
    </div>
  );
};
