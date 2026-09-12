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
import { useTracking } from 'react-tracking';
import { useDispatch, useSelector } from 'react-redux';
import DOMPurify from 'dompurify';
import { SystemMessage } from '@reportportal/ui-kit';
import { URLS } from 'common/urls';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { pluginsSelector } from 'controllers/plugins';
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
  versionExistsHeader: {
    id: 'UploadPluginModal.versionExistsHeader',
    defaultMessage: 'This version is already installed',
  },
  versionExistsMessage: {
    id: 'UploadPluginModal.versionExistsMessage',
    defaultMessage:
      'A version number identifies one specific build, so the instance will not accept a second file claiming the same one.',
  },
  replaceExistingHeader: {
    id: 'UploadPluginModal.replaceExistingHeader',
    defaultMessage: 'This plugin is already installed',
  },
  replaceExistingMessage: {
    id: 'UploadPluginModal.replaceExistingMessage',
    defaultMessage:
      'Uploading makes this file the active version. The version installed now is removed from the instance and cannot be restored from here.',
  },
});

const MAX_FILE_SIZE = 134217728;
const ACCEPT_FILE_MIME_TYPES = ['.jar', '.json'];
const CONFLICT_STATUS = 409;
const CONFLICT_ERROR_CODE = 'CONFLICT';
const FILE_EXTENSION = /\.[^.]+$/;
const PLUGIN_ID_SEPARATOR = /^[-_.]/;

// The registry refuses a jar whose plugin id and version it already holds. Its message is the
// registry's own wording, so the case is told apart by the status or the error code — whichever
// the rejection carries: fetch throws the response body when there is one, the error otherwise.
const isVersionConflict = (err) =>
  (err?.response?.status ?? err?.status) === CONFLICT_STATUS ||
  (err?.response?.data?.code ?? err?.code) === CONFLICT_ERROR_CODE;

const startsWithPluginId = (fileName, pluginId) =>
  fileName.startsWith(pluginId) && PLUGIN_ID_SEPARATOR.test(fileName.slice(pluginId.length));

// The jar is not opened in the browser, so the plugin it carries is read off the file name a
// plugin is published under, <plugin id>-<version>.jar. Guessing wrong only shows or withholds a
// warning: the upload itself is unchanged, and the instance stays the authority on what it
// replaces.
const installedPluginFor = (fileName, plugins) => {
  const name = fileName.replace(FILE_EXTENSION, '').toLowerCase();

  return plugins
    .filter((plugin) => {
      const pluginId = plugin.name?.toLowerCase();
      return pluginId && (name === pluginId || startsWithPluginId(name, pluginId));
    })
    .sort((a, b) => b.name.length - a.name.length)[0];
};

export const UploadPluginModal = ({ data: { onImport } }) => {
  const {
    files,
    actions: { addFiles, removeFile, updateFile },
  } = useFiles();
  const { uploadFiles, cancelRequests } = useFilesUpload(files, updateFile);
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const plugins = useSelector(pluginsSelector);
  const [versionExists, setVersionExists] = useState(false);

  const pendingFile = files.find(
    ({ valid, uploaded, isLoading }) => valid && !uploaded && !isLoading,
  );
  const replacedPlugin = pendingFile && installedPluginFor(pendingFile.file.name, plugins);

  const onUploadSuccess = () => {
    onImport();
  };

  const onUploadError = (id, err) => {
    if (isVersionConflict(err)) {
      setVersionExists(true);
      return;
    }

    dispatch(
      showNotification({
        message: err.message,
        type: NOTIFICATION_TYPES.ERROR,
      }),
    );
  };

  const onRemoveFile = (id) => {
    setVersionExists(false);
    removeFile(id);
  };

  const saveFiles = async () => {
    setVersionExists(false);
    trackEvent(PLUGINS_PAGE_EVENTS.clickUploadModalBtn(getFilesNames(files)));
    await uploadFiles(URLS.plugin(), onUploadSuccess, onUploadError);
  };

  return (
    <UploadModalLayout
      title={messages.modalTitle}
      importConfirmationWarning={messages.importConfirmationWarning}
      uploadButtonTitle={messages.uploadButton}
      files={files}
      onCancel={cancelRequests}
      onSave={saveFiles}
    >
      {versionExists && (
        <div data-automation-id="uploadVersionExistsMessage">
          <SystemMessage mode="error" header={formatMessage(messages.versionExistsHeader)}>
            {formatMessage(messages.versionExistsMessage)}
          </SystemMessage>
        </div>
      )}
      {!versionExists && replacedPlugin && (
        <div data-automation-id="uploadReplaceExistingMessage">
          <SystemMessage mode="warning" header={formatMessage(messages.replaceExistingHeader)}>
            {formatMessage(messages.replaceExistingMessage)}
          </SystemMessage>
        </div>
      )}
      <FilesDropzone
        files={files}
        addFiles={addFiles}
        removeFile={onRemoveFile}
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
};
UploadPluginModal.propTypes = {
  data: PropTypes.shape({
    onImport: PropTypes.func,
  }).isRequired,
};
export default withModal('uploadPluginModal')(UploadPluginModal);
