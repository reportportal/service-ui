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
import { withModal } from 'controllers/modal';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { useDispatch } from 'react-redux';
import DOMPurify from 'dompurify';
import { URLS } from 'common/urls';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { getFilesNames } from 'pages/common/uploadFileControls/utils';
import {
  FilesDropzone,
  UploadModalLayout,
  useFiles,
  useFilesUpload,
} from 'pages/common/uploadFileControls';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';

const messages = defineMessages({
  modalTitle: {
    id: 'UploadPluginModal.modalTitle',
    defaultMessage: 'Upload plugin',
  },
  uploadButton: {
    id: 'UploadPluginModal.uploadButton',
    defaultMessage: 'Upload',
  },
  uploadTip: {
    id: 'UploadPluginModal.tip',
    defaultMessage:
      'Drop only <b>.jar</b> or <b>.json</b> file under 128 MB to upload or <span>click</span> to add it',
  },
  incorrectFileSize: {
    id: 'UploadPluginModal.incorrectFileSize',
    defaultMessage: 'File size is more than 128 Mb',
  },
  importConfirmationWarning: {
    id: 'UploadPluginModal.importConfirmationWarning',
    defaultMessage: 'Are you sure you want to interrupt the plugin uploading?',
  },
});

const MAX_FILE_SIZE = 134217728;
const ACCEPT_FILE_MIME_TYPES = ['.jar', '.json'];

export function UploadPluginModal({ data: { onImport } }) {
  const {
    files,
    actions: { addFiles, removeFile, updateFile },
  } = useFiles();
  const { uploadFiles, cancelRequests } = useFilesUpload(files, updateFile);
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const onUploadSuccess = () => {
    onImport();
  };

  const onUploadError = (id, err) => {
    dispatch(
      showNotification({
        message: err.message,
        type: NOTIFICATION_TYPES.ERROR,
      }),
    );
  };

  const saveFiles = async () => {
    trackEvent(PLUGINS_PAGE_EVENTS.clickUploadModalBtn(getFilesNames(files)));
    await uploadFiles(URLS.plugin(), onUploadSuccess, onUploadError);
  };

  return (
    <UploadModalLayout
      title={messages.modalTitle}
      eventsInfo={{
        closeIcon: PLUGINS_PAGE_EVENTS.CLOSE_ICON_UPLOAD_MODAL,
        cancelButton: PLUGINS_PAGE_EVENTS.CANCEL_BTN_UPLOAD_MODAL,
      }}
      importConfirmationWarning={messages.importConfirmationWarning}
      uploadButtonTitle={messages.uploadButton}
      files={files}
      onCancel={cancelRequests}
      onSave={saveFiles}
    >
      <FilesDropzone
        files={files}
        addFiles={addFiles}
        removeFile={removeFile}
        multiple={false}
        maxFileSize={MAX_FILE_SIZE}
        acceptFileMimeTypes={ACCEPT_FILE_MIME_TYPES}
        incorrectFileSizeMessage={formatMessage(messages.incorrectFileSize)}
        tip={formatMessage(messages.uploadTip, {
          b: (d) => DOMPurify.sanitize(`<b>${d}</b>`),
          span: (d) => DOMPurify.sanitize(`<span>${d}</span>`),
        })}
      />
    </UploadModalLayout>
  );
}
UploadPluginModal.propTypes = {
  data: PropTypes.shape({
    onImport: PropTypes.func,
  }).isRequired,
};
export default withModal('uploadPluginModal')(UploadPluginModal);
