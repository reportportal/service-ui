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
  formDataForServerUploading,
  getValidFiles,
  isUploadFinished,
  isUploadInProgress,
  uploadFiles,
} from 'pages/common/uploadFileControls/importModalLayout/utils';
import { fetch } from 'common/utils';

const messages = defineMessages({
  importConfirmation: {
    id: 'ImportModal.importConfirmation',
    defaultMessage: 'Confirm cancel',
  },
});

const ImportModalLayoutComponent = ({
  data,
  url,
  files,
  setFiles,
  title,
  importConfirmationWarning,
  importButton,
  eventsInfo,
  children,
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const cancelRequests = [];

  const uploadFile = (file) => {
    const { id } = file;

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data;' },
      data: file.data,
      abort: (cancelRequest) => {
        cancelRequests.push(cancelRequest);
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        const updatedFiles = files.map((f) =>
          f.id === id ? { ...f, uploadingProgress: percentCompleted } : f,
        );

        setFiles(updatedFiles);
      },
    });
  };

  const prepareDataForServerUploading = () => {
    const preparedData = formDataForServerUploading(files);

    return preparedData.map((item) => ({
      promise: uploadFile(item),
      id: item.id,
    }));
  };

  const getOkButtonConfig = (isLoading, uploadFinished) => {
    const text = isLoading || uploadFinished ? formatMessage(COMMON_LOCALE_KEYS.OK) : importButton;

    return {
      text,
      disabled: isLoading,
      onClick: (closeModal) => {
        if (uploadFinished) {
          closeModal();
        } else {
          trackEvent(eventsInfo.okBtn);
          uploadFiles(
            data,
            url,
            files,
            setFiles,
            eventsInfo,
            dispatch,
            trackEvent,
            prepareDataForServerUploading(),
          );
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
      ? importConfirmationWarning
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
      title={title}
      okButton={getOkButtonConfig(loading, uploadFinished)}
      cancelButton={{
        text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        eventInfo: eventsInfo.cancelBtn,
        disabled: uploadFinished,
      }}
      closeConfirmation={getCloseConfirmationConfig(validFiles.length, loading, uploadFinished)}
      closeIconEventInfo={eventsInfo.closeIcon}
    >
      {children}
    </ModalLayout>
  );
};
ImportModalLayoutComponent.propTypes = {
  data: PropTypes.object,
  url: PropTypes.string.isRequired,
  tracking: PropTypes.shape({
    trackEvent: PropTypes.func,
    getTrackingData: PropTypes.func,
  }).isRequired,
  children: PropTypes.node,
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  setFiles: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  importConfirmationWarning: PropTypes.string,
  importButton: PropTypes.string.isRequired,
  eventsInfo: PropTypes.object,
};
ImportModalLayoutComponent.defaultProps = {
  data: {},
  children: [null],
  importConfirmationWarning: '',
  eventsInfo: { uploadButton: () => {}, cancelBtn: {}, closeIcon: {} },
};
export const ImportModalLayout = track()(ImportModalLayoutComponent);
