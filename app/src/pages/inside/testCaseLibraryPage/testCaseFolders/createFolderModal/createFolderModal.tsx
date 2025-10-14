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
import { reduxForm, InjectedFormProps, SubmitHandler } from 'redux-form';
import { Modal } from '@reportportal/ui-kit';

import { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { withModal } from 'controllers/modal';
import { FolderWithFullPath } from 'controllers/testCase';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { commonValidators } from 'common/utils/validation';

import { commonMessages } from '../../commonMessages';
import { useFolderModal } from '../shared/useFolderModal';
import { FolderNameField, ParentFolderToggle } from '../shared/FolderFormFields';
import { sharedFolderMessages } from '../shared/sharedMessages';
import { CREATE_FORM_NAME, PARENT_FOLDER_FIELD } from '../shared/commonConstants';
import { FolderFormValues } from '../shared/types';
import { CreateFolderAutocomplete } from '../shared/CreateFolderAutocomplete';

import styles from '../shared/folderFormFields.scss';

const cx = createClassnames(styles);

export const CREATE_FOLDER_MODAL_KEY = 'createFolderModalKey';

type CreateFolderSubmitHandler = SubmitHandler<FolderFormValues, CreateFolderModalProps>;

type CreateFolderModalProps = UseModalData<{ shouldRenderToggle: boolean }>;

const CreateFolderModalComponent = ({
  data: { shouldRenderToggle },
  dirty,
  handleSubmit,
  change,
  untouch,
}: CreateFolderModalProps & InjectedFormProps<FolderFormValues, CreateFolderModalProps>) => {
  const { formatMessage } = useIntl();

  const {
    isCreatingFolder,
    isToggled: isSubfolderToggled,
    hideModal,
    onSubmit,
    handleToggle,
    createOkButton,
    createCancelButton,
  } = useFolderModal({
    formName: CREATE_FORM_NAME,
    parentFieldName: PARENT_FOLDER_FIELD,
  });

  const handleToggleChange = handleToggle(change, untouch);

  const handleSelectedFolder = ({ selectedItem }: { selectedItem: FolderWithFullPath }) => {
    change(PARENT_FOLDER_FIELD, selectedItem);
  };

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
      <form
        onSubmit={handleSubmit(onSubmit) as CreateFolderSubmitHandler}
        className={cx('folder-modal__form')}
      >
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
          <CreateFolderAutocomplete
            name={PARENT_FOLDER_FIELD}
            label={formatMessage(sharedFolderMessages.parentFolder)}
            placeholder={formatMessage(commonMessages.searchFolderToSelect)}
            customEmptyListMessage={formatMessage(commonMessages.noTestPlanCreated)}
            onStateChange={handleSelectedFolder}
            className={cx('folder-modal__parent-folder')}
          />
        )}
        <ModalLoadingOverlay isVisible={isCreatingFolder} />
      </form>
    </Modal>
  );
};

export default withModal(CREATE_FOLDER_MODAL_KEY)(
  reduxForm<FolderFormValues, CreateFolderModalProps>({
    form: CREATE_FORM_NAME,
    initialValues: {
      folderName: '',
      parentFolder: null,
    },
    shouldValidate: () => true, // need this to force validation on parentFolderName after re-registering it
    validate: ({ folderName, parentFolder }) => {
      return {
        folderName: commonValidators.requiredField(folderName),
        parentFolderName: commonValidators.requiredField(parentFolder),
      };
    },
  })(CreateFolderModalComponent),
);
