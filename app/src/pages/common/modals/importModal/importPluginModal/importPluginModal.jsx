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
import { ImportModalLayout } from '../importModalLayout/importModalLayout';

const MAX_FILE_SIZES = 134217728;
const ACCEPT_FILE_MIME_TYPES = ['.jar'];

export const ImportPluginModal = ({ data }) => (
  <ImportModalLayout
    data={data}
    maxFileSize={MAX_FILE_SIZES}
    acceptFileMimeTypes={ACCEPT_FILE_MIME_TYPES}
  />
);
ImportPluginModal.propTypes = {
  data: PropTypes.object.isRequired,
};
export default withModal('importPluginModal')(ImportPluginModal);
