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

import { ReactNode, useCallback, ComponentProps, ChangeEvent } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';
import { SingleAutocomplete } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { FieldProvider, FieldErrorHint } from 'components/fields';
import { ButtonSwitcher, ButtonSwitcherOption } from 'pages/inside/common/buttonSwitcher';
import { FolderWithFullPath, transformedFoldersWithFullPathSelector } from 'controllers/testCase';

import { CreateFolderForm } from '../CreateFolderForm';
import { CreateFolderAutocomplete } from '../CreateFolderAutocomplete';
import { ParentFolderToggle } from '../../modals/folderFormFields';
import { commonFolderMessages } from '../../modals/commonFolderMessages';
import { commonMessages as testCaseCommonMessages } from '../../../commonMessages';
import { useBooleanFormFieldValue } from '../../../hooks/useFormFieldValue';
import { useReduxFormFieldBatchUpdate } from '../../../hooks/useReduxFormFieldBatchUpdate';
import { FolderModalFormValues } from '../../../utils/folderModalFormConfig';

import styles from './destinationFolderSwitch.scss';

const cx = createClassnames(styles);

interface DestinationFolderSwitchProps {
  formName: string;
  description: ReactNode;
  existingFolderButtonLabel: string;
  newFolderButtonLabel: string;
  rootFolderToggleLabel: string;
  hasMoveToRootToggle?: boolean;
  isMoveToRootDisabled?: boolean;
  moveToRootTooltip?: string;
  currentMode: ButtonSwitcherOption;
  className?: string;
  excludeFolderIds?: number[];
  onModeChange: (mode: ButtonSwitcherOption) => void;
  change: (field: string, value: unknown) => void;
}

export const DestinationFolderSwitch = ({
  formName,
  description,
  existingFolderButtonLabel,
  newFolderButtonLabel,
  rootFolderToggleLabel,
  currentMode,
  hasMoveToRootToggle = false,
  isMoveToRootDisabled = false,
  moveToRootTooltip,
  className,
  excludeFolderIds = [],
  onModeChange,
  change,
}: DestinationFolderSwitchProps) => {
  const { formatMessage } = useIntl();
  const folders = useSelector(transformedFoldersWithFullPathSelector);
  const batchUpdate = useReduxFormFieldBatchUpdate({ change });

  const isRootFolder = useBooleanFormFieldValue<FolderModalFormValues>({
    formName,
    fieldName: 'isRootFolder',
  });
  const shouldMoveToRoot = useBooleanFormFieldValue<FolderModalFormValues>({
    formName,
    fieldName: 'moveToRoot',
  });

  const handleFolderSelect: ComponentProps<
    typeof SingleAutocomplete<FolderWithFullPath>
  >['onStateChange'] = useCallback(
    ({ selectedItem }) => {
      change('destinationFolder', selectedItem);
    },
    [change],
  );

  const handleMoveToRootToggle = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      batchUpdate({
        moveToRoot: target.checked,
        ...(target.checked && { destinationFolder: undefined }),
      });
    },
    [batchUpdate],
  );

  const shouldRenderMoveToRootToggle = hasMoveToRootToggle && !isEmpty(folders);

  const renderFolderAutocomplete = () => (
    <FieldProvider name="destinationFolder">
      <FieldErrorHint provideHint={false}>
        <CreateFolderAutocomplete
          name="destinationFolder"
          label={formatMessage(commonFolderMessages.folderDestination)}
          placeholder={formatMessage(testCaseCommonMessages.searchFolderToSelect)}
          excludeFolderIds={excludeFolderIds}
          className={cx('destination-folder-switch__autocomplete')}
          onStateChange={handleFolderSelect}
        />
      </FieldErrorHint>
    </FieldProvider>
  );

  const renderExistingFolderContent = () => {
    if (!shouldRenderMoveToRootToggle) {
      return renderFolderAutocomplete();
    }

    return (
      <div className={cx('destination-folder-switch__existing')}>
        <ParentFolderToggle
          isToggled={shouldMoveToRoot}
          isDisabled={isMoveToRootDisabled}
          label={formatMessage(commonFolderMessages.moveToRootDirectory)}
          className={cx('destination-folder-switch__toggle')}
          title={moveToRootTooltip}
          onToggle={handleMoveToRootToggle}
        />
        {!shouldMoveToRoot && renderFolderAutocomplete()}
      </div>
    );
  };

  return (
    <div className={cx('destination-folder-switch', className)}>
      <ButtonSwitcher
        description={
          <div className={cx('destination-folder-switch__description')}>{description}</div>
        }
        existingButtonTitle={existingFolderButtonLabel}
        createNewButtonTitle={newFolderButtonLabel}
        handleActiveButton={onModeChange}
      />
      {currentMode === ButtonSwitcherOption.EXISTING && renderExistingFolderContent()}
      {currentMode === ButtonSwitcherOption.NEW && (
        <CreateFolderForm
          isToggled={isRootFolder}
          toggleLabel={rootFolderToggleLabel}
          toggleFieldName="isRootFolder"
          parentFolderFieldName="parentFolder"
          parentFolderFieldLabel={formatMessage(commonFolderMessages.parentFolder)}
          folderNameFieldName="folderName"
          toggleDisabled={false}
          isInvertedToggle
          excludeFolderIds={excludeFolderIds}
          change={change}
        />
      )}
    </div>
  );
};
