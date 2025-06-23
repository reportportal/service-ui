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

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Modal, FieldText, Toggle } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction, withModal } from 'controllers/modal';
import { isEmpty } from 'common/utils/validation/validatorHelpers';
import styles from './createFolderModal.scss';
import { commonMessages } from '../../commonMessages';

const cx = classNames.bind(styles);

const CreateFolder = ({
  data: { areFoldersPresent },
}: {
  data: { areFoldersPresent: boolean };
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

  const onFolderNameChange = (e: { target: { value: string } }) => {
    const newValue = e.target.value;

    setFolderNameValue(newValue);
    setValidationErrors({
      ...validationErrors,
      folderName: '',
    });
  };

  const onParentFolderNameChange = (e: { target: { value: string } }) => {
    const newValue = e.target.value;

    setParentFolderNameValue(newValue);
    setValidationErrors({
      ...validationErrors,
      parentFolderName: '',
    });
  };

  const onParentFolderNameClear = () => {
    setParentFolderNameValue('');
  };

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CREATE),
    onClick: () => {
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
    },
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
        onChange={onFolderNameChange}
        placeholder={formatMessage(commonMessages.enterFolderName)}
        defaultWidth={false}
        maxLength={48}
        maxLengthDisplay={48}
        touched
        error={validationErrors.folderName}
      />
      {areFoldersPresent ? (
        <Toggle
          value={isSubfolderToggled}
          onChange={(e) => setIsSubfolderToggled(e.target.checked)}
          className={cx('toggle')}
        >
          {formatMessage(commonMessages.createAsSubfolder)}
        </Toggle>
      ) : null}
      {isSubfolderToggled ? (
        <div className={cx('parent-folder')}>
          <FieldText
            label={formatMessage(commonMessages.parentFolder)}
            value={parentFolderNameValue}
            onChange={onParentFolderNameChange}
            placeholder={formatMessage(commonMessages.searchFolderToSelect)}
            defaultWidth={false}
            maxLength={48}
            onClear={onParentFolderNameClear}
            clearable
            touched={isSubfolderToggled}
            error={validationErrors.parentFolderName}
          />
        </div>
      ) : null}
    </Modal>
  );
};

export const CreateFolderModal = withModal('CreateFolderModal')(CreateFolder);
