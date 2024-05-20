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
import { defineMessages, useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import Dropzone from 'react-dropzone';
import PropTypes from 'prop-types';
import { ImportFileIcon } from 'pages/common/uploadFileControls/importFileIcon';
import { uniqueId } from 'common/utils';
import DropZoneIcon from 'common/img/shape-inline.svg';
import styles from './dropzoneField.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  incorrectFileFormat: {
    id: 'ImportModal.incorrectFileFormat',
    defaultMessage: 'Incorrect file format',
  },
});

export const DropzoneField = ({
  disabled,
  incorrectFileSize,
  tip,
  singleImport,
  files,
  setFiles,
  maxFileSize,
  acceptFileMimeTypes,
}) => {
  const { formatMessage } = useIntl();

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
      incorrectFileSize,
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

    setFiles([...files, ...accepted, ...rejected]);
  };

  const onDelete = (id) => {
    setFiles(files.filter((item) => item.id !== id));
  };

  return (
    <Dropzone
      className={cx('dropzone-wrapper')}
      activeClassName={cx('dropzone-wrapper-active')}
      accept={acceptFile}
      onDrop={onDrop}
      multiple={!singleImport}
      maxSize={maxFileSize}
      disabled={disabled}
    >
      {files.length === 0 && (
        <div className={cx('dropzone')}>
          <div className={cx('icon')}>{Parser(DropZoneIcon)}</div>
          <p className={cx('message')}>{Parser(tip)}</p>
        </div>
      )}
      {files.length > 0 && (
        <div className={cx('files-list')}>
          {files.map((item) => (
            <ImportFileIcon {...item} onDelete={onDelete} key={item.id} />
          ))}
        </div>
      )}
    </Dropzone>
  );
};
DropzoneField.propTypes = {
  disabled: PropTypes.bool,
  incorrectFileSize: PropTypes.string,
  tip: PropTypes.string,
  singleImport: PropTypes.bool,
  files: PropTypes.array,
  setFiles: PropTypes.func,
  maxFileSize: PropTypes.number.isRequired,
  acceptFileMimeTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
};
DropzoneField.defaultProps = {
  disabled: false,
  incorrectFileSize: '',
  tip: '',
  singleImport: true,
  files: [],
  setFiles: () => {},
};
