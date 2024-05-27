/*
 * Copyright 2024 EPAM Systems
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

import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { COMMON_LOCALE_KEYS, intlMessageType } from 'common/constants/localization';
import { ModalLayout } from 'components/main/modal';
import { getValidFiles, isUploadFinished, isUploadInProgress } from '../utils';
import { fileType } from '../propTypes';

const messages = defineMessages({
  importConfirmation: {
    id: 'UploadModalLayout.importConfirmation',
    defaultMessage: 'Confirm cancel',
  },
});

export const UploadModalLayout = ({
  children,
  title,
  files,
  onSave,
  onCancel,
  eventsInfo,
  importConfirmationWarning,
  uploadButtonTitle,
}) => {
  const { formatMessage } = useIntl();

  const validFiles = getValidFiles(files);
  const isLoading = isUploadInProgress(files);
  const uploadFinished = isUploadFinished(files);

  const submitHandler = (closeModal) => {
    if (uploadFinished) {
      closeModal();
    } else {
      onSave();
    }
  };

  const getOkButtonConfig = () => {
    const text = formatMessage(
      isLoading || uploadFinished ? COMMON_LOCALE_KEYS.OK : uploadButtonTitle,
    );

    return {
      text,
      disabled: isLoading,
      onClick: submitHandler,
    };
  };

  const getCloseConfirmationConfig = () => {
    const confirmationWarning = formatMessage(
      isLoading ? importConfirmationWarning : COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING,
    );

    if (!validFiles.length || uploadFinished) {
      return null;
    }
    return {
      withCheckbox: isLoading,
      closeConfirmedCallback: onCancel,
      confirmationMessage: formatMessage(messages.importConfirmation),
      confirmationWarning,
    };
  };

  return (
    <ModalLayout
      title={formatMessage(title)}
      okButton={getOkButtonConfig()}
      cancelButton={{
        text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        eventInfo: eventsInfo.cancelBtn,
        disabled: uploadFinished,
      }}
      closeConfirmation={getCloseConfirmationConfig()}
      closeIconEventInfo={eventsInfo.closeIcon}
    >
      {children}
    </ModalLayout>
  );
};
UploadModalLayout.propTypes = {
  title: intlMessageType.isRequired,
  uploadButtonTitle: intlMessageType.isRequired,
  importConfirmationWarning: intlMessageType.isRequired,
  files: PropTypes.arrayOf(fileType).isRequired,
  children: PropTypes.node,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
  eventsInfo: PropTypes.shape({
    cancelBtn: PropTypes.object,
    closeIcon: PropTypes.object,
  }),
};
UploadModalLayout.defaultProps = {
  children: null,
  onSave: () => {},
  onCancel: () => {},
  eventsInfo: { cancelBtn: {}, closeIcon: {} },
};
