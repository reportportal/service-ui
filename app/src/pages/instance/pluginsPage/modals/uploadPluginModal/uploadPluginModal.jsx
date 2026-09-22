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
const FILE_EXTENSION = /\.[^.]+$/;
const PLUGIN_ID_SEPARATOR = /^[-_.]/;
// A plugin jar is published as <plugin id>-<version>.jar, so the version sits in the name beside
// the id the warning above already reads out of it. The qualifier after the digits has to begin
// with something that is not a digit — not a claim about what a version may look like, but what
// stops the digit runs and the qualifier from competing for the same characters and making the
// match backtrack.
const VERSION_IN_FILE_NAME = /[-_.](\d+(?:\.\d+)*(?:[^\d\-_.][^-_.]*)?)$/;

const versionInFileName = (fileName) =>
  VERSION_IN_FILE_NAME.exec(fileName.replace(FILE_EXTENSION, ''))?.[1] ?? null;

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

export const UploadPluginModal = ({ data: { onImport, onUploaded = () => {} } }) => {
  const {
    files,
    actions: { addFiles, removeFile, updateFile },
  } = useFiles();
  const { uploadFiles, cancelRequests } = useFilesUpload(files, updateFile);
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const plugins = useSelector(pluginsSelector);

  const pendingFile = files.find(
    ({ valid, uploaded, isLoading }) => valid && !uploaded && !isLoading,
  );
  const replacedPlugin = pendingFile && installedPluginFor(pendingFile.file.name, plugins);
  // The instance refuses a second file claiming a version it already holds, and it says so in
  // prose the client must not match on: service-api answers PLUGIN_UPLOAD_ERROR (40039) with
  // HTTP 400 — the same code it uses for every other upload failure — so the rejection itself
  // cannot be told apart. The name carries what is needed instead: same plugin, same version.
  // Guessing wrong only shows or withholds a warning; the upload is unchanged either way.
  const versionExists = Boolean(
    replacedPlugin &&
      replacedPlugin.details?.version &&
      versionInFileName(pendingFile.file.name) === replacedPlugin.details.version,
  );

  // A freshly uploaded plugin does nothing until an integration exists (D-13), and its own page is
  // where one is created — so the admin is taken there rather than back to a list where the only
  // visible change is a row appearing. The refetch has to land first, so the id is handed to the
  // page and the page opens it when the plugin arrives.
  const onUploadSuccess = (_, response) => {
    dispatch(
      showNotification({
        messageId: 'pluginUploaded',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    onImport();
    onUploaded(response?.id ?? null);
  };

  /**
   * Upload. Failed. Generic (27663:18173) names one treatment for a failed transfer: the error
   * state on the attachment row, which is what the product already does and what `useFilesUpload`
   * has already set by the time this runs. A toast on top of it reported the same failure twice,
   * in two places, with the same server prose — and the toast was the half that disappears.
   *
   * <p>So nothing is dispatched here. The row keeps the failure, the file stays attached, the
   * Upload button stays live, and retrying happens from this same dialog, which is the point of
   * the state. Unlike the install failures, this one deliberately does not send the admin to the
   * logs either.
   */
  const onUploadError = () => {};

  const onRemoveFile = (id) => {
    removeFile(id);
  };

  const saveFiles = async () => {
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
      // The backend refuses the same (id, version) outright, so this one is not a warning the
      // admin may override — unlike replacing a different version, which is permitted and only
      // warned about. Detected at attachment, before anything is sent.
      submitDisabled={versionExists}
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
    /** Handed the new integration type's id, so the page can open the plugin once the refetch
     * lands. Null when the server answered without one, and then the page stays where it is. */
    onUploaded: PropTypes.func,
  }).isRequired,
};
export default withModal('uploadPluginModal')(UploadPluginModal);
