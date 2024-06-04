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
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import Dropzone from 'react-dropzone';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { uniqueId } from 'common/utils';
import DropZoneIcon from 'common/img/shape-inline.svg';
import { isUploadFinished, isUploadInProgress } from '../utils';
import { fileType } from '../propTypes';
import { ImportFileIcon } from './importFileIcon';
import styles from './filesDropzone.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  incorrectFileFormat: {
    id: 'ImportModal.incorrectFileFormat',
    defaultMessage: 'Incorrect file format',
  },
});

export const FilesDropzone = ({
  files,
  addFiles,
  removeFile,
  maxFileSize,
  acceptFileMimeTypes,
  multiple,
  incorrectFileSizeMessage,
  tip,
}) => {
  const { formatMessage } = useIntl();

  const isDropZoneDisabled = () =>
    isUploadFinished(files) || isUploadInProgress(files) || (!multiple && files.length > 0);

  const acceptFile = acceptFileMimeTypes.join(',');

  const onDropAcceptedFileHandler = (file) => ({
    file,
    valid: true,
    id: uniqueId(),
    isLoading: false,
    uploaded: false,
    uploadingProgress: 0,
  });

  const formValidationMessage = (validationProperties) => {
    const validationMessages = {
      incorrectFileFormat: formatMessage(messages.incorrectFileFormat),
      incorrectFileSize: incorrectFileSizeMessage,
    };
    const validationMessage = [];

    Object.keys(validationProperties).forEach((message) => {
      if (validationProperties[message]) {
        validationMessage.push(validationMessages[message]);
      }
    });

    return validationMessage.join('. ').trim();
  };

  const validateFile = (file) => ({
    incorrectFileFormat: !acceptFileMimeTypes.includes(file.type),
    incorrectFileSize: file.size > maxFileSize,
  });

  const addFileRejectMessage = (file) => {
    const validationProperties = validateFile(file);

    return formValidationMessage(validationProperties);
  };

  const onDropRejectedFileHandler = (file) => ({
    file,
    valid: false,
    id: uniqueId(),
    rejectMessage: addFileRejectMessage(file),
  });

  const onDrop = (acceptedFiles, rejectedFiles) => {
    const accepted = acceptedFiles.map(onDropAcceptedFileHandler);
    const rejected = rejectedFiles.map(onDropRejectedFileHandler);

    addFiles([...accepted, ...rejected]);
  };

  return (
    <Dropzone
      className={cx('files-dropzone')}
      activeClassName={cx('files-dropzone-active')}
      accept={acceptFile}
      onDrop={onDrop}
      multiple={multiple}
      maxSize={maxFileSize}
      disabled={isDropZoneDisabled()}
    >
      {files.length === 0 ? (
        <div className={cx('dropzone')}>
          <div className={cx('icon')}>{Parser(DropZoneIcon)}</div>
          <p className={cx('message')}>{Parser(tip)}</p>
        </div>
      ) : (
        <div className={cx('files-list')}>
          {files.map((item) => (
            <ImportFileIcon {...item} onDelete={removeFile} key={item.id} />
          ))}
        </div>
      )}
    </Dropzone>
  );
};
FilesDropzone.propTypes = {
  files: PropTypes.arrayOf(fileType).isRequired,
  addFiles: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
  incorrectFileSizeMessage: PropTypes.string.isRequired,
  tip: PropTypes.string.isRequired,
  multiple: PropTypes.bool,
  maxFileSize: PropTypes.number,
  acceptFileMimeTypes: PropTypes.arrayOf(PropTypes.string),
};
FilesDropzone.defaultProps = {
  multiple: true,
  maxFileSize: 0,
  acceptFileMimeTypes: [],
};
