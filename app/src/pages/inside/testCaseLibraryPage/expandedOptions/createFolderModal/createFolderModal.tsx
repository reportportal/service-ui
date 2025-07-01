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

import { ChangeEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Modal, FieldText, Toggle } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction, withModal } from 'controllers/modal';
import { isEmpty } from 'common/utils/validation/validatorHelpers';
import { commonMessages } from '../../commonMessages';
import styles from './createFolderModal.scss';

const cx = classNames.bind(styles);

export const CREATE_FOLDER_MODAL_KEY = 'createFolderModalKey';
const MAX_FIELD_LENGTH = 48;

const messages = defineMessages({
  enterFolderName: {
    id: 'TestCaseLibraryPage.enterFolderName',
    defaultMessage: 'Enter folder name',
  },
  createAsSubfolder: {
    id: 'TestCaseLibraryPage.createAsSubfolder',
    defaultMessage: 'Create as subfolder',
  },
  parentFolder: {
    id: 'TestCaseLibraryPage.parentFolder',
    defaultMessage: 'Parent folder',
  },
  searchFolderToSelect: {
    id: 'TestCaseLibraryPage.searchFolderToSelect',
    defaultMessage: 'Search folder to select',
  },
});

const CreateFolderModalComponent = ({
  data: { shouldRenderToggle },
}: {
  data: { shouldRenderToggle: boolean };
}) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const hideModal = () => dispatch(hideModalAction());

  const [folderNameValue, setFolderNameValue] = useState('');
  const [parentFolderNameValue, setParentFolderNameValue] = useState('');
  const [isSubfolderToggled, setIsSubfolderToggled] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    folderName: '',
    parentFolderName: '',
  });

  const hanldeFolderNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setFolderNameValue(value);
    setValidationErrors({
      ...validationErrors,
      folderName: '',
    });
  };

  const handleParentFolderNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setParentFolderNameValue(value);
    setValidationErrors({
      ...validationErrors,
      parentFolderName: '',
    });
  };

  const handleParentFolderNameClear = () => {
    setParentFolderNameValue('');
  };

  const handleSubmit = () => {
    if (isEmpty(folderNameValue) || (isSubfolderToggled && isEmpty(parentFolderNameValue))) {
      setValidationErrors({
        folderName: isEmpty(folderNameValue) ? formatMessage(commonMessages.fieldIsRequired) : '',
        parentFolderName:
          isSubfolderToggled && isEmpty(parentFolderNameValue)
            ? formatMessage(commonMessages.fieldIsRequired)
            : '',
      });
    } else {
      hideModal();
    }
  };

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CREATE),
    onClick: handleSubmit,
    'data-automation-id': 'submitButton',
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(commonMessages.createFolder)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      <FieldText
        label={formatMessage(commonMessages.name)}
        value={folderNameValue}
        onChange={hanldeFolderNameChange}
        placeholder={formatMessage(messages.enterFolderName)}
        defaultWidth={false}
        maxLength={MAX_FIELD_LENGTH}
        maxLengthDisplay={MAX_FIELD_LENGTH}
        touched
        error={validationErrors.folderName}
      />
      {shouldRenderToggle && (
        <Toggle
          value={isSubfolderToggled}
          onChange={({ target }) => setIsSubfolderToggled(target.checked)}
          className={cx('toggle')}
        >
          {formatMessage(messages.createAsSubfolder)}
        </Toggle>
      )}
      {isSubfolderToggled && (
        <div className={cx('parent-folder')}>
          <FieldText
            label={formatMessage(messages.parentFolder)}
            value={parentFolderNameValue}
            onChange={handleParentFolderNameChange}
            placeholder={formatMessage(messages.searchFolderToSelect)}
            defaultWidth={false}
            maxLength={MAX_FIELD_LENGTH}
            onClear={handleParentFolderNameClear}
            clearable
            touched={isSubfolderToggled}
            error={validationErrors.parentFolderName}
          />
        </div>
      )}
    </Modal>
  );
};

export const CreateFolderModal = withModal(CREATE_FOLDER_MODAL_KEY)(CreateFolderModalComponent);
