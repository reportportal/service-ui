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
import { ImportModalLayout } from 'pages/common/uploadFileControls/importModalLayout/importModalLayout';
import { DropzoneComponent } from 'pages/common/uploadFileControls/dropzoneComponent/dropzoneComponent';

const MAX_FILE_SIZES = 134217728;
const ACCEPT_FILE_MIME_TYPES = ['.jar'];

export const UploadPluginModal = ({ data }) => {
  const [files, setFiles] = useState([]);

  return (
    <ImportModalLayout
      data={data}
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
