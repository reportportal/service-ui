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
import classNames from 'classnames/bind';
import { connect, useDispatch } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import DOMPurify from 'dompurify';
import { useTracking } from 'react-tracking';
import PropTypes from 'prop-types';
import { withModal } from 'controllers/modal';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { enabledImportPluginsSelector } from 'controllers/plugins';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { LAUNCHES_MODAL_EVENTS } from 'components/main/analytics/events';
import {
  FilesDropzone,
  UploadModalLayout,
  useFiles,
  useFilesUpload,
} from 'pages/common/uploadFileControls';
import { ImportPluginSelector } from './pluginDropDownSelector';
import styles from './importLaunchModal.scss';

const cx = classNames.bind(styles);

const DEFAULT_PLUGIN_NAME = 'JUnit';

const messages = defineMessages({
  note: {
    id: 'ImportLaunchModal.note',
    defaultMessage: 'Note:',
  },
  modalTitle: {
    id: 'ImportLaunchModal.modalTitle',
    defaultMessage: 'Import Launch',
  },
  importButton: {
    id: 'ImportLaunchModal.importButton',
    defaultMessage: 'Import',
  },
  importTip: {
    id: 'ImportLaunchModal.tip',
    defaultMessage:
      'Drop <b>.xml</b> or <b>.zip</b> file under 32 MB to upload or <span>click</span> to add it',
  },
  incorrectFileSize: {
    id: 'ImportLaunchModal.incorrectFileSize',
    defaultMessage: 'File size is more than 32 Mb',
  },
  noteMessage: {
    id: 'ImportLaunchModal.noteMessage',
    defaultMessage:
      'If your runner does not write the test start time in the file, then the current server time will be used.',
  },
  importConfirmationWarning: {
    id: 'ImportLaunchModal.importConfirmationWarning',
    defaultMessage: 'Are you sure you want to interrupt import launches?',
  },
});

const ImportLaunchModal = ({ data: { onImport }, activeProject, importPlugins }) => {
  const {
    files,
    actions: { addFiles, removeFile, updateFile },
  } = useFiles();
  const { uploadFiles, cancelRequests } = useFilesUpload(files, updateFile);
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const [selectedPlugin, setSelectedPlugin] = useState(
    () => importPlugins.find((plugin) => plugin.name === DEFAULT_PLUGIN_NAME) || importPlugins[0],
  );

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

  const selectPlugin = (name) =>
    setSelectedPlugin(importPlugins.find((plugin) => plugin.name === name));

  const saveFiles = async () => {
    const url = URLS.pluginFileImport(activeProject, selectedPlugin.name);

    trackEvent(LAUNCHES_MODAL_EVENTS.OK_BTN_IMPORT_MODAL);
    await uploadFiles(url, onUploadSuccess, onUploadError);
  };

  return (
    <UploadModalLayout
      title={messages.modalTitle}
      eventsInfo={{
        closeIcon: LAUNCHES_MODAL_EVENTS.CLOSE_ICON_IMPORT_MODAL,
        cancelButton: LAUNCHES_MODAL_EVENTS.CANCEL_BTN_IMPORT_MODAL,
      }}
      importConfirmationWarning={messages.importConfirmationWarning}
      uploadButtonTitle={messages.importButton}
      files={files}
      onCancel={cancelRequests}
      onSave={saveFiles}
    >
      <ImportPluginSelector
        selectedPlugin={selectedPlugin}
        plugins={importPlugins}
        selectPlugin={selectPlugin}
      />
      <FilesDropzone
        files={files}
        addFiles={addFiles}
        removeFile={removeFile}
        maxFileSize={selectedPlugin.details?.maxFileSize}
        acceptFileMimeTypes={selectedPlugin.details?.acceptFileMimeTypes || []}
        incorrectFileSizeMessage={formatMessage(messages.incorrectFileSize)}
        tip={formatMessage(messages.importTip, {
          b: (d) => DOMPurify.sanitize(`<b>${d}</b>`),
          span: (d) => DOMPurify.sanitize(`<span>${d}</span>`),
        })}
      />
      <p className={cx('note-label')}>{formatMessage(messages.note)}</p>
      <p className={cx('note-message')}>{formatMessage(messages.noteMessage)}</p>
    </UploadModalLayout>
  );
};
ImportLaunchModal.propTypes = {
  data: PropTypes.shape({
    onImport: PropTypes.func,
  }).isRequired,
  importPlugins: PropTypes.arrayOf(PropTypes.object).isRequired,
  activeProject: PropTypes.string.isRequired,
};
export default withModal('importLaunchModal')(
  connect((state) => ({
    activeProject: activeProjectSelector(state),
    importPlugins: enabledImportPluginsSelector(state),
  }))(ImportLaunchModal),
);
