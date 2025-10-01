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

import { HtmlHTMLAttributes } from 'react';
import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import classNames from 'classnames/bind';
import { FieldLabel, Modal } from '@reportportal/ui-kit';

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

import { SingleAutocomplete } from 'componentLibrary/autocompletes/singleAutocomplete';

import { AutocompleteOption } from 'componentLibrary/autocompletes/common/autocompleteOption';

import styles from '../shared/folderFormFields.scss';

const cx = classNames.bind(styles) as typeof classNames;

export const CREATE_FOLDER_MODAL_KEY = 'createFolderModalKey';

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
}: CreateFolderModalProps & InjectedFormProps<FolderFormValues, CreateFolderModalProps>) => {
  const { formatMessage } = useIntl();

  const {
    isCreatingFolder,
    parentFolder,
    folders,
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
    }) => HtmlHTMLAttributes<HTMLDivElement>,
  ) => (
    <AutocompleteOption
      isActive
      isSelected
      disabled={false}
      optionVariant=""
      variant="light"
      {...getItemProps({ item: option, index })}
      key={option.id}
      isNew={false}
      parseValueToString={(item: FolderWithFullPath) => item.description || ''}
      skipOptionCreation
    >
      <>
        <p className={cx('folder-modal__parent-folder__name')}>
          {option.description || option.name}
        </p>
        <p className={cx('folder-modal__parent-folder__path')}>{option.fullPath}</p>
      </>
    </AutocompleteOption>
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
          <div className={cx('folder-modal__parent-folder')}>
            <FieldLabel isRequired={false}>
              {formatMessage(sharedFolderMessages.parentFolder)}
            </FieldLabel>
            <SingleAutocomplete
              name={PARENT_FOLDER_FIELD}
              value={parentFolder || ''}
              createWithoutConfirmation={true}
              onStateChange={handleSelectedFolder}
              placeholder={formatMessage(sharedFolderMessages.searchFolderToSelect)}
              options={folders}
              customEmptyListMessage={formatMessage(commonMessages.noTestPlanCreated)}
              renderOption={renderOption}
              parseValueToString={(option: FolderWithFullPath) =>
                (option?.description || option?.name)?.toString() || ''
              }
              skipOptionCreation
            />
          </div>
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
