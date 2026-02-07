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

import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { noop } from 'es-toolkit';
import { Modal } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { withModal } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { TransformedFolder } from 'controllers/testCase';

import { DestinationFolderSwitch } from '../../shared/DestinationFolderSwitch';
import { commonFolderMessages } from '../commonFolderMessages';
import { useFolderModalMode } from '../../../hooks/useFolderModalMode';
import { useModalButtons } from '../../../hooks/useModalButtons';
import { validateFolderModalForm } from '../../../utils/validateFolderModalForm';
import { getFolderDestinationFromFormValues } from '../../../utils/getFolderDestinationFromFormValues';
import {
  FolderModalFormValues,
  FOLDER_MODAL_INITIAL_VALUES,
} from '../../../utils/folderModalFormConfig';
import { useMoveFolder } from './useMoveFolder';
import { messages } from './messages';

import styles from './moveFolderModal.scss';

const cx = createClassnames(styles);

export const MOVE_FOLDER_MODAL_KEY = 'moveFolderModalKey';
const MOVE_FOLDER_FORM = 'moveFolderForm';

export interface MoveFolderModalData {
  folder: TransformedFolder;
}

type MoveFolderModalProps = UseModalData<MoveFolderModalData>;

const MoveFolderModal = reduxForm<FolderModalFormValues, MoveFolderModalProps>({
  form: MOVE_FOLDER_FORM,
  destroyOnUnmount: true,
  shouldValidate: () => true,
  validate: (values) => validateFolderModalForm(values, { validateMoveToRoot: true }),
  initialValues: FOLDER_MODAL_INITIAL_VALUES,
})(({
  data: { folder },
  dirty,
  pristine,
  invalid,
  handleSubmit,
  change,
}: MoveFolderModalProps & InjectedFormProps<FolderModalFormValues, MoveFolderModalProps>) => {
  const { formatMessage } = useIntl();
  const { isLoading, moveFolder } = useMoveFolder();
  const { currentMode, handleModeChange } = useFolderModalMode({ change });

  const isRootFolder = !folder?.parentFolderId;

  const onSubmit = useCallback(
    (values: FolderModalFormValues) => {
      if (!folder) {
        return;
      }

      moveFolder({
        folderId: folder.id,
        ...getFolderDestinationFromFormValues(values),
      }).catch(noop);
    },
    [folder, moveFolder],
  );

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: formatMessage(COMMON_LOCALE_KEYS.MOVE),
    isLoading,
    isSubmitButtonDisabled: pristine || invalid,
    onSubmit: handleSubmit(onSubmit) as () => void,
  });

  return (
    <Modal
      title={formatMessage(messages.moveFolderTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      <form className={cx('move-folder-modal__form')} onSubmit={handleSubmit(onSubmit) as VoidFn}>
        <DestinationFolderSwitch
          formName={MOVE_FOLDER_FORM}
          description={formatMessage(messages.moveFolderDescription, {
            folderName: folder?.name,
            b: (text) => <b>{text}</b>,
          })}
          existingFolderButtonLabel={formatMessage(commonFolderMessages.moveToExistingFolder)}
          newFolderButtonLabel={formatMessage(commonFolderMessages.createNewFolder)}
          rootFolderToggleLabel={formatMessage(commonFolderMessages.createAsRootFolder)}
          currentMode={currentMode}
          excludeFolderIds={folder ? [folder.id] : []}
          hasMoveToRootToggle
          isMoveToRootDisabled={isRootFolder}
          moveToRootTooltip={isRootFolder ? formatMessage(messages.folderAlreadyAtRoot) : undefined}
          onModeChange={handleModeChange}
          change={change}
        />
        <ModalLoadingOverlay isVisible={isLoading} />
      </form>
    </Modal>
  );
});

export default withModal(MOVE_FOLDER_MODAL_KEY)(MoveFolderModal);
