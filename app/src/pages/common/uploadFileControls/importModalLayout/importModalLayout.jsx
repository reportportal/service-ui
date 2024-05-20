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
import track, { useTracking } from 'react-tracking';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import { ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  getValidFiles,
  isUploadFinished,
  isUploadInProgress,
  uploadFiles,
} from 'pages/common/uploadFileControls/importModalLayout/utils';

const messages = defineMessages({
  importConfirmation: {
    id: 'ImportModal.importConfirmation',
    defaultMessage: 'Confirm cancel',
  },
});

const ImportModalLayoutComponent = ({ data, files, setFiles, children }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const cancelRequests = [];
  const addCancelRequest = (cancelRequest) => cancelRequests.push(cancelRequest);

  const getOkButtonConfig = (isLoading, uploadFinished) => {
    const text =
      isLoading || uploadFinished ? formatMessage(COMMON_LOCALE_KEYS.OK) : data.importButton;

    return {
      text,
      disabled: isLoading,
      onClick: (closeModal) => {
        if (uploadFinished) {
          closeModal();
        } else {
          trackEvent(data.eventsInfo?.okBtn);
          uploadFiles(data, files, setFiles, addCancelRequest, dispatch, trackEvent);
        }
      },
    };
  };

  const closeConfirmedCallback = () => {
    if (cancelRequests.length) {
      cancelRequests.forEach((cancelRequest) => cancelRequest());
    }
  };

  const getCloseConfirmationConfig = (isValidFilesExists, loading, uploadFinished) => {
    const confirmationWarning = loading
      ? data.importConfirmationWarning
      : formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING);

    if (!isValidFilesExists || uploadFinished) {
      return null;
    }
    return {
      withCheckbox: loading,
      closeConfirmedCallback,
      confirmationMessage: formatMessage(messages.importConfirmation),
      confirmationWarning,
    };
  };

  const validFiles = getValidFiles(files);
  const loading = isUploadInProgress(files);
  const uploadFinished = isUploadFinished(files);

  return (
    <ModalLayout
      title={data.title}
      okButton={getOkButtonConfig(loading, uploadFinished)}
      cancelButton={{
        text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        eventInfo: data.eventsInfo?.cancelBtn,
        disabled: uploadFinished,
      }}
      closeConfirmation={getCloseConfirmationConfig(validFiles.length, loading, uploadFinished)}
      closeIconEventInfo={data.eventsInfo?.closeIcon}
    >
      {children}
    </ModalLayout>
  );
};
ImportModalLayoutComponent.propTypes = {
  data: PropTypes.object,
  tracking: PropTypes.shape({
    trackEvent: PropTypes.func,
    getTrackingData: PropTypes.func,
  }).isRequired,
  children: PropTypes.node,
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  setFiles: PropTypes.func.isRequired,
};
ImportModalLayoutComponent.defaultProps = {
  data: { eventsInfo: { uploadButton: () => {}, cancelBtn: {}, closeIcon: {} } },
  dropzoneCountNumber: 0,
  children: [null],
};
export const ImportModalLayout = track()(ImportModalLayoutComponent);
