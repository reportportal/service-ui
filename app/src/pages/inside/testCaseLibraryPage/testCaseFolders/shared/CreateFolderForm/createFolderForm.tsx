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

import { ChangeEvent, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';
import { SingleAutocompleteProps } from '@reportportal/ui-kit/components/autocompletes/singleAutocomplete/singleAutocomplete';

import { createClassnames } from 'common/utils';
import { FolderWithFullPath, transformedFoldersWithFullPathSelector } from 'controllers/testCase';
import { FieldProvider, FieldErrorHint } from 'components/fields';

import { commonMessages } from '../../../commonMessages';
import { FolderNameField, ParentFolderToggle } from '../../modals/folderFormFields';
import { CreateFolderAutocomplete } from '../CreateFolderAutocomplete';

import styles from './createFolderForm.scss';

const cx = createClassnames(styles);

interface CreateFolderFormProps {
  isToggled: boolean;
  toggleLabel: string;
  toggleFieldName: string;
  parentFolderFieldName: string;
  parentFolderFieldLabel: string;
  folderNameFieldName?: string;
  toggleDisabled?: boolean;
  isInvertedToggle?: boolean;
  className?: string;
  change: (field: string, value: unknown) => void;
}

export const CreateFolderForm = ({
  isToggled,
  toggleLabel,
  toggleFieldName,
  parentFolderFieldName,
  parentFolderFieldLabel,
  folderNameFieldName = 'folderName',
  toggleDisabled = false,
  isInvertedToggle = false,
  className,
  change,
}: CreateFolderFormProps) => {
  const { formatMessage } = useIntl();
  const folders = useSelector(transformedFoldersWithFullPathSelector);

  const shouldRenderToggle = !isEmpty(folders);

  const handleToggleChange = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      change(toggleFieldName, target.checked);
    },
    [toggleFieldName, change],
  );

  const handleFolderSelection: SingleAutocompleteProps<FolderWithFullPath>['onStateChange'] =
    useCallback(
      ({ selectedItem }) => {
        change(parentFolderFieldName, selectedItem);
      },
      [change, parentFolderFieldName],
    );

  return (
    <div className={cx('create-folder-form', className)}>
      <FolderNameField name={folderNameFieldName} />
      {shouldRenderToggle && (
        <ParentFolderToggle
          isToggled={isToggled}
          disabled={toggleDisabled}
          label={toggleLabel}
          className={cx('create-folder-form__toggle')}
          onToggle={handleToggleChange}
        />
      )}
      {isToggled !== isInvertedToggle && (
        <FieldProvider name={parentFolderFieldName}>
          <FieldErrorHint provideHint={false}>
            <CreateFolderAutocomplete
              name={parentFolderFieldName}
              label={parentFolderFieldLabel}
              placeholder={formatMessage(commonMessages.searchFolderToSelect)}
              className={cx('create-folder-form__autocomplete')}
              onStateChange={handleFolderSelection}
            />
          </FieldErrorHint>
        </FieldProvider>
      )}
    </div>
  );
};
