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

import { ComponentProps } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { FieldLabel } from '@reportportal/ui-kit';

import { FolderWithFullPath, transformedFoldersWithFullPathSelector } from 'controllers/testCase';
import { AutocompleteOption } from 'componentLibrary/autocompletes/common/autocompleteOption';
import { SingleAutocomplete } from 'componentLibrary/autocompletes/singleAutocomplete';

import { messages } from './messages';
import styles from './createFolderAutocomplete.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface CreateFolderAutocompleteProps {
  name: string;
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  className?: string;
  customEmptyListMessage?: string;
  onStateChange?: ({ selectedItem }: { selectedItem: FolderWithFullPath }) => void;
  onChange?: (value: FolderWithFullPath) => void;
  value?: FolderWithFullPath | null;
  error?: string;
  touched?: boolean;
}

export const CreateFolderAutocomplete = ({
  name,
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
}: CreateFolderAutocompleteProps) => {
  const { formatMessage } = useIntl();
  const folders = useSelector(transformedFoldersWithFullPathSelector);

  const renderOption = (
    option: FolderWithFullPath,
    index: number,
    _isNew: boolean,
    getItemProps: ({
      item,
      index,
    }: {
      item: FolderWithFullPath;
      index: number;
    }) => ComponentProps<typeof AutocompleteOption>,
  ) => (
    <AutocompleteOption
      {...getItemProps({ item: option, index })}
      key={option.id}
      parseValueToString={(item: FolderWithFullPath) => item.description || ''}
      skipOptionCreation
    >
      <>
        <p className={cx('create-folder-autocomplete__folder-name')}>
          {option.description || option.name}
        </p>
        <p className={cx('create-folder-autocomplete__folder-path')}>{option.fullPath}</p>
      </>
    </AutocompleteOption>
  );

  return (
    <div className={cx('create-folder-autocomplete', className)}>
      {label && <FieldLabel isRequired={isRequired}>{label}</FieldLabel>}
      <SingleAutocomplete
        name={name}
        createWithoutConfirmation={true}
        optionVariant="key-value"
        onStateChange={onStateChange}
        onChange={onChange}
        value={value}
        error={error}
        touched={touched}
        placeholder={placeholder || formatMessage(messages.searchFolderToSelect)}
        options={folders}
        customEmptyListMessage={customEmptyListMessage || formatMessage(messages.noFoldersFound)}
        renderOption={renderOption}
        parseValueToString={(option: FolderWithFullPath) =>
          option?.description || option?.name || ''
        }
        skipOptionCreation
      />
    </div>
  );
};
