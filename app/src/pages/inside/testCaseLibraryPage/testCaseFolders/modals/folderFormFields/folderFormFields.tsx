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
import { FieldText, Toggle, Tooltip } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';
import { FieldErrorHint, FieldProvider } from 'components/fields';

import { commonMessages } from '../../../commonMessages';

import styles from './folderFormFields.scss';

const cx = createClassnames(styles);

const MAX_FIELD_LENGTH = 48;

interface FolderNameFieldProps {
  name?: string;
  placeholder?: string;
  helpText?: string;
  label?: string;
}

export const FolderNameField = ({
  name = 'folderName',
  placeholder,
  helpText,
  label,
}: FolderNameFieldProps) => {
  const { formatMessage } = useIntl();

  return (
    <FieldProvider
      name={name}
      placeholder={placeholder || formatMessage(commonMessages.enterFolderName)}
    >
      <FieldErrorHint provideHint={false}>
        <FieldText
          label={label || formatMessage(COMMON_LOCALE_KEYS.NAME)}
          defaultWidth={false}
          maxLength={MAX_FIELD_LENGTH}
          maxLengthDisplay={MAX_FIELD_LENGTH}
          helpText={helpText}
        />
      </FieldErrorHint>
    </FieldProvider>
  );
};

interface ParentFolderToggleProps {
  isToggled: boolean;
  isDisabled?: boolean;
  label: string;
  className?: string;
  title?: string;
  onToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ParentFolderToggle = ({
  isToggled,
  isDisabled = false,
  label,
  className,
  title,
  onToggle,
}: ParentFolderToggleProps) => {
  const toggleComponent = (
    <Toggle value={isToggled} onChange={onToggle} disabled={isDisabled} className={className}>
      {label}
    </Toggle>
  );

  return isDisabled && title ? (
    <Tooltip content={title} placement="top" wrapperClassName={cx('folder-modal__toggle-tooltip')}>
      {toggleComponent}
    </Tooltip>
  ) : (
    toggleComponent
  );
};
