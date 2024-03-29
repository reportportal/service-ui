/*
 * Copyright 2019 EPAM Systems
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
import PropTypes from 'prop-types';
import { UploadStatusIndicator } from './uploadStatusIndicator';
import { DefaultIcon } from './defaultIcon';

export const UploadIndicator = ({ uploaded, uploadFailed, uploadFailReason, fileExtension }) =>
  uploaded ? (
    <UploadStatusIndicator uploadFailed={uploadFailed} uploadFailReason={uploadFailReason} />
  ) : (
    <DefaultIcon fileExtension={fileExtension} />
  );

UploadIndicator.propTypes = {
  uploaded: PropTypes.bool,
  uploadFailed: PropTypes.bool,
  uploadFailReason: PropTypes.object,
  fileExtension: PropTypes.string,
};
UploadIndicator.defaultProps = {
  uploaded: false,
  uploadFailed: false,
  uploadFailReason: {},
  fileExtension: '',
};
