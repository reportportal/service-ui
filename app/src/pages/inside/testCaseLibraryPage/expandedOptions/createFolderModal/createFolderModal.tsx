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

import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import classNames from 'classnames/bind';
import { Modal } from '@reportportal/ui-kit';

import { withModal } from 'controllers/modal';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { commonValidators } from 'common/utils/validation';

import { commonMessages } from '../../commonMessages';
import { useFolderModalLogic } from '../shared/useFolderModalLogic';
import { FolderNameField, ParentFolderToggle, ParentFolderField } from '../shared/FolderFormFields';
import { sharedFolderMessages } from '../shared/sharedMessages';

import styles from '../shared/folderFormFields.scss';
import { CREATE_FORM_NAME, PARENT_FIELD_NAME } from '../shared/commonConstants';

const cx = classNames.bind(styles) as typeof classNames;

export const CREATE_FOLDER_MODAL_KEY = 'createFolderModalKey';

export interface CreateFolderFormValues {
  folderName: string;
  parentFolderName?: string;
  [key: string]: string | boolean | number | null | undefined;
}

interface CreateFolderModalProps {
  data: {
    shouldRenderToggle: boolean;
  };
}

const CreateFolderModalComponent = ({
  data: { shouldRenderToggle },
  dirty,
  handleSubmit,
  change,
  untouch,
  initialValues,
}: CreateFolderModalProps & InjectedFormProps<CreateFolderFormValues, CreateFolderModalProps>) => {
  const { formatMessage } = useIntl();

  const {
    isCreatingFolder,
    isToggled: isSubfolderToggled,
    hideModal,
    onSubmit,
    handleToggle,
    handleParentFieldClear,
    createOkButton,
    createCancelButton,
  } = useFolderModalLogic({
    formName: CREATE_FORM_NAME,
    parentFieldName: PARENT_FIELD_NAME,
  });

  const handleToggleChange = handleToggle(change, untouch);
  const handleParentFolderNameClear = handleParentFieldClear(
    change,
    initialValues.parentFolderName,
  );

  const okButton = {
    ...createOkButton(handleSubmit),
    children: (
      <LoadingSubmitButton isLoading={isCreatingFolder}>
        {createOkButton(handleSubmit).children}
      </LoadingSubmitButton>
    ),
  };

  const cancelButton = createCancelButton();

  return (
    <Modal
      title={formatMessage(commonMessages.createFolder)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <form onSubmit={handleSubmit(onSubmit)} className={cx('folder-modal__form')}>
        <FolderNameField />
        {shouldRenderToggle && (
          <ParentFolderToggle
            isToggled={isSubfolderToggled}
            onToggle={handleToggleChange}
            label={formatMessage(sharedFolderMessages.createAsSubfolder)}
            className={cx('folder-modal__toggle')}
          />
        )}
        {isSubfolderToggled && (
          <ParentFolderField
            name={PARENT_FIELD_NAME}
            label={formatMessage(sharedFolderMessages.parentFolder)}
            onClear={handleParentFolderNameClear}
            className={cx('folder-modal__parent-folder')}
          />
        )}
        <ModalLoadingOverlay isVisible={isCreatingFolder} />
      </form>
    </Modal>
  );
};

export default withModal(CREATE_FOLDER_MODAL_KEY)(
  reduxForm<CreateFolderFormValues, CreateFolderModalProps>({
    form: CREATE_FORM_NAME,
    initialValues: {
      folderName: '',
      parentFolderName: '',
    },
    shouldValidate: () => true, // need this to force validation on parentFolderName after re-registering it
    validate: ({ folderName, parentFolderName }) => {
      return {
        folderName: commonValidators.requiredField(folderName),
        parentFolderName: commonValidators.requiredField(parentFolderName),
      };
    },
  })(CreateFolderModalComponent),
);
