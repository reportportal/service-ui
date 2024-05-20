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

import React, { useState } from 'react';
import { withModal } from 'controllers/modal';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import DOMPurify from 'dompurify';
import { ImportModalLayout } from 'pages/common/uploadFileControls/importModalLayout/importModalLayout';
import { DropzoneComponent } from 'pages/common/uploadFileControls/dropzoneComponent/dropzoneComponent';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import { URLS } from 'common/urls';

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
      'Drop only <b>.jar</b> file under 128 MB to upload or <span>click</span> to add it',
  },
  incorrectFileSize: {
    id: 'UploadPluginModal.incorrectFileSize',
    defaultMessage: 'File size is more than 128 Mb',
  },
  incorrectFileVersion: {
    id: 'UploadPluginModal.incorrectFileVersion',
    defaultMessage: 'Plugin version should be specified',
  },
  incorrectFileManifest: {
    id: 'UploadPluginModal.incorrectFileManifest',
    defaultMessage: 'Cannot find the manifest path',
  },
});

const MAX_FILE_SIZES = 134217728;
const ACCEPT_FILE_MIME_TYPES = ['.jar'];

export const UploadPluginModal = ({ data }) => {
  const [files, setFiles] = useState([]);
  const { formatMessage } = useIntl();

  const url = URLS.plugin();

  return (
    <ImportModalLayout
      data={data}
      title={formatMessage(messages.modalTitle)}
      importButton={formatMessage(messages.uploadButton)}
      tip={formatMessage(messages.uploadTip, {
        b: (d) => DOMPurify.sanitize(`<b>${d}</b>`),
        span: (d) => DOMPurify.sanitize(`<span>${d}</span>`),
      })}
      url={url}
      singleImport
      eventsInfo={{
        uploadButton: PLUGINS_PAGE_EVENTS.clickUploadModalBtn,
        cancelBtn: PLUGINS_PAGE_EVENTS.CANCEL_BTN_UPLOAD_MODAL,
        closeIcon: PLUGINS_PAGE_EVENTS.CLOSE_ICON_UPLOAD_MODAL,
      }}
      incorrectFileSize={formatMessage(messages.incorrectFileSize)}
      maxFileSize={MAX_FILE_SIZES}
      acceptFileMimeTypes={ACCEPT_FILE_MIME_TYPES}
      files={files}
      setFiles={setFiles}
    >
      <DropzoneComponent
        data={data}
        files={files}
        setFiles={setFiles}
        maxFileSize={MAX_FILE_SIZES}
        acceptFileMimeTypes={ACCEPT_FILE_MIME_TYPES}
      />
    </ImportModalLayout>
  );
};
UploadPluginModal.propTypes = {
  data: PropTypes.object.isRequired,
};
export default withModal('uploadPluginModal')(UploadPluginModal);
