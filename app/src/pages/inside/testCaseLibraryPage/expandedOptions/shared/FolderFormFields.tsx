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

import React from 'react';
import { useIntl } from 'react-intl';
import { FieldText, Toggle } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { commonMessages } from '../../commonMessages';
import { sharedFolderMessages } from './sharedMessages';

const MAX_FIELD_LENGTH = 48;

interface FolderNameFieldProps {
  name?: string;
  placeholder?: string;
}

export const FolderNameField = ({ name = 'folderName', placeholder }: FolderNameFieldProps) => {
  const { formatMessage } = useIntl();

  return (
    <FieldProvider
      name={name}
      placeholder={placeholder || formatMessage(commonMessages.enterFolderName)}
    >
      <FieldErrorHint provideHint={false}>
        <FieldText
          label={formatMessage(COMMON_LOCALE_KEYS.NAME)}
          defaultWidth={false}
          maxLength={MAX_FIELD_LENGTH}
          maxLengthDisplay={MAX_FIELD_LENGTH}
        />
      </FieldErrorHint>
    </FieldProvider>
  );
};

interface ParentFolderToggleProps {
  isToggled: boolean;
  onToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  label: string;
  className?: string;
}

export const ParentFolderToggle = ({
  isToggled,
  onToggle,
  disabled = false,
  label,
  className,
}: ParentFolderToggleProps) => (
  <Toggle value={isToggled} onChange={onToggle} disabled={disabled} className={className}>
    {label}
  </Toggle>
);

interface ParentFolderFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  onClear?: () => void;
  clearable?: boolean;
  className?: string;
}

export const ParentFolderField = ({
  name,
  label,
  placeholder,
  onClear,
  clearable = true,
  className,
}: ParentFolderFieldProps) => {
  const { formatMessage } = useIntl();

  return (
    <FieldProvider
      name={name}
      className={className}
      placeholder={placeholder || formatMessage(sharedFolderMessages.searchFolderToSelect)}
    >
      <FieldErrorHint provideHint={false}>
        <FieldText
          label={label}
          defaultWidth={false}
          maxLength={MAX_FIELD_LENGTH}
          onClear={onClear}
          clearable={clearable}
        />
      </FieldErrorHint>
    </FieldProvider>
  );
};
