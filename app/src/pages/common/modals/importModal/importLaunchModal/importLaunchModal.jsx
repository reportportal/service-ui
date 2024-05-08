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
import { PluginDropDown } from 'pages/inside/launchesPage/pluginDropDown';
import { ImportModalLayout } from '../importModalLayout/importModalLayout';
import styles from './importLaunchModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  note: {
    id: 'ImportLaunchModal.note',
    defaultMessage: 'Note:',
  },
});

// todo get it from selectedPluginData.details
const MAX_FILE_SIZES = 33554432;
const ACCEPT_FILE_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/zip-compressed',
  'application/xml',
  'text/xml',
];

export const ImportLaunchModal = ({ data }) => {
  const { formatMessage } = useIntl();
  const [selectedPluginData, setSelectedPluginData] = useState();

  // todo use selectedPluginData for get supported format and max size
  console.log(selectedPluginData);

  return (
    <ImportModalLayout
      data={data}
      dropzoneCountNumber={1}
      maxFileSize={MAX_FILE_SIZES}
      acceptFileMimeTypes={ACCEPT_FILE_MIME_TYPES}
    >
      <PluginDropDown
        setSelectedPluginData={setSelectedPluginData}
        importPlugins={data.importPlugins}
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
