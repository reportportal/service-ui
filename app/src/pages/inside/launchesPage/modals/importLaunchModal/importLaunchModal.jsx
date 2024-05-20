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
import Parser from 'html-react-parser';
import { defineMessages, useIntl } from 'react-intl';
import { withModal } from 'controllers/modal';
import PropTypes from 'prop-types';
import { ImportPluginSelector } from 'pages/inside/launchesPage/pluginDropDown';
import { ImportModalLayout } from 'pages/common/uploadFileControls/importModalLayout/importModalLayout';
import { DropzoneComponent } from 'pages/common/uploadFileControls/dropzoneComponent/dropzoneComponent';
import styles from './importLaunchModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  note: {
    id: 'ImportLaunchModal.note',
    defaultMessage: 'Note:',
  },
});

export const ImportLaunchModal = ({ data }) => {
  const { formatMessage } = useIntl();
  const [selectedPluginData, setSelectedPluginData] = useState();
  const [files, setFiles] = useState([]);

  return (
    <ImportModalLayout data={data} files={files} setFiles={setFiles}>
      <ImportPluginSelector
        setSelectedPluginData={setSelectedPluginData}
        importPlugins={data.importPlugins}
      />
      <DropzoneComponent
        data={data}
        files={files}
        setFiles={setFiles}
        maxFileSize={selectedPluginData?.details?.MAX_FILE_SIZES}
        acceptFileMimeTypes={selectedPluginData?.details?.ACCEPT_FILE_MIME_TYPES || []}
      />
      <p className={cx('note-label')}>{formatMessage(messages.note)}</p>
      <p className={cx('note-message')}>{Parser(data.noteMessage)}</p>
    </ImportModalLayout>
  );
};
ImportLaunchModal.propTypes = {
  data: PropTypes.object.isRequired,
};
export default withModal('importLaunchModal')(ImportLaunchModal);
