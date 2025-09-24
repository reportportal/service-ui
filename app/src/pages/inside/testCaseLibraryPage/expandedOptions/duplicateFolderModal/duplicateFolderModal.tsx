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

import { ChangeEvent, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { reduxForm, registerField, unregisterField, InjectedFormProps } from 'redux-form';
import classNames from 'classnames/bind';
import { Modal } from '@reportportal/ui-kit';

import { hideModalAction, withModal } from 'controllers/modal';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { commonValidators } from 'common/utils/validation';
import { createFoldersAction } from 'controllers/testCase/actionCreators';
import { coerceToNumericId } from 'pages/inside/testCaseLibraryPage/utils';

import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';
import { useFolderModal } from '../shared/useFolderModal';
import { FolderNameField, ParentFolderToggle, ParentFolderField } from '../shared/FolderFormFields';
import { sharedFolderMessages } from '../shared/sharedMessages';
import { PARENT_FIELD_NAME, DUPLICATE_FORM_NAME } from '../shared/commonConstants';
import { messages } from './messages';
import { DuplicateFolderFormValues } from '../shared/types';

import styles from '../shared/folderFormFields.scss';

const cx = classNames.bind(styles) as typeof classNames;

export const DUPLICATE_FOLDER_MODAL_KEY = 'duplicateFolderModalKey';
interface DuplicateFolderModalProps {
  data: {
    folderId: number;
    folderName: string;
    parentFolderId?: number | null;
  };
}

const CreateFolderModalComponent = ({
  dirty,
  handleSubmit,
  change,
  untouch,
  initialize,
  data: { folderId, folderName, parentFolderId },
}: DuplicateFolderModalProps &
  InjectedFormProps<DuplicateFolderFormValues, DuplicateFolderModalProps>) => {
  const { formatMessage } = useIntl();

  const [isParentFolderToggled, setIsParentFolderToggled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { isCreatingFolder, createOkButton, createCancelButton } = useFolderModal({
    formName: DUPLICATE_FORM_NAME,
    parentFieldName: PARENT_FIELD_NAME,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (folderId && !isInitialized) {
      const hasParentFolder = !parentFolderId;

      initialize({
        folderName,
        destinationFolderName: hasParentFolder ? String(parentFolderId) : '',
        isParentFolderToggled,
        initialParentFolderId: parentFolderId,
      });
      setIsParentFolderToggled(hasParentFolder);
      setIsInitialized(true);
    }
  }, [folderId, folderName, parentFolderId, initialize, isInitialized, isParentFolderToggled]);

  const hideModal = () => dispatch(hideModalAction());

  const onSubmit = (values: DuplicateFolderFormValues) => {
    const idFromNameInput = coerceToNumericId(values.destinationFolderName);
    dispatch(
      createFoldersAction({
        folderName: values.folderName,
        ...(idFromNameInput !== undefined ? { parentFolderId: idFromNameInput } : {}),
      }),
    );
  };

  const handleToggle = ({ target }: ChangeEvent<HTMLInputElement>) => {
    if (target.checked) {
      dispatch(registerField(DUPLICATE_FORM_NAME, PARENT_FIELD_NAME, 'Field'));
      untouch(PARENT_FIELD_NAME);
    } else {
      dispatch(unregisterField(DUPLICATE_FORM_NAME, PARENT_FIELD_NAME));
    }
    setIsParentFolderToggled(target.checked);
    change('isParentFolderToggled', target.checked);
  };

  const handleFolderDestinationNameClear = () => {
    change(PARENT_FIELD_NAME, '');
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
      title={formatMessage(commonMessages.duplicateFolder)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <form onSubmit={handleSubmit(onSubmit)} className={cx('folder-modal__form')}>
        <div className={cx('folder-modal__text')}>
          {formatMessage(messages.duplicateFolderText, {
            b: (data) => <span className={cx('folder-modal__text--bold')}>{data}</span>,
            name: folderName,
          })}
        </div>
        <FolderNameField />
        <ParentFolderToggle
          isToggled={isParentFolderToggled}
          onToggle={handleToggle}
          disabled={!parentFolderId}
          label={formatMessage(messages.moveToRootDirectory)}
          className={cx('folder-modal__toggle')}
        />
        {!isParentFolderToggled && (
          <ParentFolderField
            name={PARENT_FIELD_NAME}
            label={formatMessage(sharedFolderMessages.folderDestination)}
            onClear={handleFolderDestinationNameClear}
            className={cx('folder-modal__parent-folder')}
          />
        )}
        <ModalLoadingOverlay isVisible={isCreatingFolder} />
      </form>
    </Modal>
  );
};

export default withModal(DUPLICATE_FOLDER_MODAL_KEY)(
  reduxForm<DuplicateFolderFormValues, DuplicateFolderModalProps>({
    form: DUPLICATE_FORM_NAME,
    destroyOnUnmount: true,
    shouldValidate: () => true, // need this to force validation on destinationFolderName after re-registering it
    validate: ({
      folderName,
      destinationFolderName,
      isParentFolderToggled,
      initialParentFolderId,
    }) => {
      const errors: { [key: string]: string } = {};

      errors.folderName = commonValidators.requiredField(folderName);

      errors.destinationFolderName = commonValidators.requiredField(
        isParentFolderToggled ? initialParentFolderId : destinationFolderName,
      );

      return errors;
    },
  })(CreateFolderModalComponent),
);
