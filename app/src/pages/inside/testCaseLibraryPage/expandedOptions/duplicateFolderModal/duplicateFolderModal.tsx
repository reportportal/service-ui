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

import { ChangeEvent, useState, MouseEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { reduxForm, registerField, unregisterField, InjectedFormProps } from 'redux-form';
import classNames from 'classnames/bind';
import { Modal, FieldText, Toggle } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction, withModal } from 'controllers/modal';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { commonValidators } from 'common/utils/validation';
import { isCreatingFolderSelector } from 'controllers/testCase';

import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';

import styles from './duplicateFolderModal.scss';
import { DESTINATION_FOLDER_NAME, DUPLICATE_FORM_NAME, messages } from './constants';
import { createFoldersAction } from 'controllers/testCase/actionCreators';
import { coerceToNumericId } from 'pages/inside/testCaseLibraryPage/utils';

const cx = classNames.bind(styles) as typeof classNames;

export const DUPLICATE_FOLDER_MODAL_KEY = 'duplicateFolderModalKey';
const MAX_FIELD_LENGTH = 48;

export interface DuplicateFolderFormValues {
  folderName: string;
  destinationFolderName?: string;
  initialParentFolderId?: number | null;
  isParentFolderToggled?: boolean;
}

interface DuplicateFolderModalProps {
  data: {
    folderId: number;
    folderName: string;
    activeFolderId: number | null;
    parentFolderId?: number | null;
    setAllTestCases: () => void;
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
  const dispatch = useDispatch();
  const isCreatingFolder = useSelector(isCreatingFolderSelector);
  const { formatMessage } = useIntl();

  const [isParentFolderToggled, setIsParentFolderToggled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (folderId && !isInitialized) {
      const hasParentFolder = parentFolderId != null;

      initialize({
        folderName,
        destinationFolderName: hasParentFolder ? String(parentFolderId) : '',
        isParentFolderToggled,
        initialParentFolderId: parentFolderId,
      });
      setIsParentFolderToggled(!hasParentFolder);
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
      dispatch(registerField(DUPLICATE_FORM_NAME, DESTINATION_FOLDER_NAME, 'Field'));
      untouch(DESTINATION_FOLDER_NAME);
    } else {
      dispatch(unregisterField(DUPLICATE_FORM_NAME, DESTINATION_FOLDER_NAME));
    }
    setIsParentFolderToggled(target.checked);
    change('isParentFolderToggled', target.checked);
  };

  const handleFolderDestinationNameClear = () => {
    change(DESTINATION_FOLDER_NAME, '');
  };

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isCreatingFolder}>
        {formatMessage(COMMON_LOCALE_KEYS.CREATE)}
      </LoadingSubmitButton>
    ),
    onClick: handleSubmit(onSubmit) as (event: MouseEvent<HTMLButtonElement>) => void,
    disabled: isCreatingFolder,
    'data-automation-id': 'submitButton',
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isCreatingFolder,
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(commonMessages.duplicateFolder)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <form onSubmit={handleSubmit(onSubmit)} className={cx('duplicate-folder-modal__form')}>
        <div className={cx('duplicate-folder-modal__text')}>
          {formatMessage(messages.duplicateFolderText, {
            b: (data) => <span className={cx('duplicate-folder-modal__text--bold')}>{data}</span>,
          })}
        </div>
        <FieldProvider name="folderName" placeholder={formatMessage(messages.enterFolderName)}>
          <FieldErrorHint provideHint={false}>
            <FieldText
              label={formatMessage(COMMON_LOCALE_KEYS.NAME)}
              defaultWidth={false}
              maxLength={MAX_FIELD_LENGTH}
              maxLengthDisplay={MAX_FIELD_LENGTH}
            />
          </FieldErrorHint>
        </FieldProvider>
        <Toggle
          value={isParentFolderToggled}
          onChange={handleToggle}
          disabled={!parentFolderId}
          className={cx('duplicate-folder-modal__toggle')}
        >
          {formatMessage(messages.moveToRootDirectory)}
        </Toggle>
        {!isParentFolderToggled && (
          <FieldProvider
            name={DESTINATION_FOLDER_NAME}
            className={cx('duplicate-folder-modal__destination-folder')}
            placeholder={formatMessage(messages.searchFolderToSelect)}
          >
            <FieldErrorHint provideHint={false}>
              <FieldText
                label={formatMessage(messages.folderDestination)}
                defaultWidth={false}
                maxLength={MAX_FIELD_LENGTH}
                onClear={handleFolderDestinationNameClear}
                clearable
              />
            </FieldErrorHint>
          </FieldProvider>
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
