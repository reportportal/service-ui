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

import { ChangeEvent, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { registerField, unregisterField, InjectedFormProps } from 'redux-form';
import { Modal } from '@reportportal/ui-kit';
import { isEmpty } from 'es-toolkit/compat';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';
import { FolderWithFullPath, transformedFoldersWithFullPathSelector } from 'controllers/testCase';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { hideModalAction } from 'controllers/modal';
import { FieldProvider, FieldErrorHint } from 'components/fields';

import { commonMessages } from '../../../commonMessages';
import { FolderNameField, ParentFolderToggle } from '../folderFormFields';
import { CreateFolderAutocomplete } from '../../shared/CreateFolderAutocomplete/createFolderAutocomplete';

import styles from './folderModal.scss';
import { SingleAutocompleteProps } from '@reportportal/ui-kit/dist/components/autocompletes/singleAutocomplete/singleAutocomplete';

const cx = createClassnames(styles);

interface FolderModalConfig {
  title: string;
  isLoading: boolean;
  isToggled: boolean;
  toggleLabel: string;
  toggleFieldName: string;
  parentFolderFieldName: string;
  parentFolderFieldLabel: string;
  formName: string;
  toggleDisabled?: boolean;
  isInvertedToggle?: boolean;
  customContent?: ReactNode;
  onSubmit: (values: unknown) => void;
}

type FolderModalProps = FolderModalConfig &
  Pick<InjectedFormProps<unknown>, 'dirty' | 'handleSubmit' | 'change' | 'untouch'>;

export const FolderModal = ({
  title,
  dirty,
  isLoading,
  isToggled,
  toggleLabel,
  toggleFieldName,
  toggleDisabled = false,
  parentFolderFieldName,
  parentFolderFieldLabel,
  formName,
  isInvertedToggle = false,
  customContent,
  handleSubmit,
  change,
  untouch,
  onSubmit,
}: FolderModalProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const hideModal = () => dispatch(hideModalAction());
  const folders = useSelector(transformedFoldersWithFullPathSelector);
  const computedShouldRenderToggle = !isEmpty(folders);

  const handleToggleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const shouldShowParentField = isInvertedToggle ? !target.checked : target.checked;

    if (shouldShowParentField) {
      dispatch(registerField(formName, parentFolderFieldName, 'Field'));
      untouch(parentFolderFieldName);
    } else {
      dispatch(unregisterField(formName, parentFolderFieldName));
    }

    change(toggleFieldName, target.checked);
  };

  const handleFolderSelect: SingleAutocompleteProps<FolderWithFullPath>['onStateChange'] = ({
    selectedItem,
  }) => {
    change(parentFolderFieldName, selectedItem);
  };

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CREATE),
    onClick: handleSubmit(onSubmit) as () => void,
    disabled: isLoading,
    'data-automation-id': 'submitButton',
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isLoading,
    onClick: hideModal,
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={title}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      <form className={cx('folder-modal__form')}>
        {customContent}
        <FolderNameField />
        {computedShouldRenderToggle && (
          <ParentFolderToggle
            isToggled={isToggled}
            onToggle={handleToggleChange}
            disabled={toggleDisabled}
            label={toggleLabel}
            className={cx('folder-modal__toggle')}
          />
        )}
        {(isInvertedToggle ? !isToggled : isToggled) && (
          <FieldProvider name={parentFolderFieldName}>
            <FieldErrorHint provideHint={false}>
              <CreateFolderAutocomplete
                name={parentFolderFieldName}
                label={parentFolderFieldLabel}
                placeholder={formatMessage(commonMessages.searchFolderToSelect)}
                onStateChange={handleFolderSelect}
                className={cx('folder-modal__parent-folder')}
              />
            </FieldErrorHint>
          </FieldProvider>
        )}
        <ModalLoadingOverlay isVisible={isLoading} />
      </form>
    </Modal>
  );
};
