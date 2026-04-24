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

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import { useDropzone } from 'react-dropzone';
import { extension as mimeExtension, lookup as mimeLookup } from 'mime-types';
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

const pushUniqueExtension = (acc, mimeKey, extension) => {
  if (!acc[mimeKey]) {
    acc[mimeKey] = [];
  }
  if (!acc[mimeKey].includes(extension)) {
    acc[mimeKey].push(extension);
  }
};

const addAcceptRuleForDottedExtension = (acc, dottedExtLower) => {
  const mimeType = mimeLookup(`file${dottedExtLower}`) || 'application/octet-stream';
  pushUniqueExtension(acc, mimeType, dottedExtLower);
};

const addAcceptRuleForMimeType = (acc, mime) => {
  if (!acc[mime]) {
    acc[mime] = [];
  }
  const ext = mimeExtension(mime);
  if (!ext) {
    return;
  }
  pushUniqueExtension(acc, mime, `.${ext}`);
};

const appendAcceptRule = (acc, raw) => {
  if (!raw) {
    return;
  }
  const item = String(raw);
  if (item.startsWith('.')) {
    addAcceptRuleForDottedExtension(acc, item.toLowerCase());
    return;
  }
  if (item.includes('/')) {
    addAcceptRuleForMimeType(acc, item);
    return;
  }
  addAcceptRuleForDottedExtension(acc, `.${item.toLowerCase()}`);
};

const buildAcceptObject = (acceptFileMimeTypes) => {
  if (!acceptFileMimeTypes?.length) {
    return undefined;
  }

  const acc = {};
  acceptFileMimeTypes.forEach((raw) => appendAcceptRule(acc, raw));

  return Object.keys(acc).length ? acc : undefined;
};

const isFileFormatAllowed = (file, acceptFileMimeTypes) => {
  if (!acceptFileMimeTypes.length) {
    return true;
  }
  return acceptFileMimeTypes.some((rule) => {
    if (!rule) {
      return false;
    }
    const r = String(rule);
    if (r.startsWith('.')) {
      return file.name.toLowerCase().endsWith(r.toLowerCase());
    }
    if (r.includes('/')) {
      if (file.type && file.type === r) {
        return true;
      }
      const extFromMime = mimeExtension(r);
      return !!(extFromMime && file.name.toLowerCase().endsWith(`.${extFromMime}`));
    }
    return file.name.toLowerCase().endsWith(`.${r.toLowerCase()}`);
  });
};

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

  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      const accepted = acceptedFiles.map((file) => ({
        file,
        valid: true,
        id: uniqueId(),
        isLoading: false,
        uploaded: false,
        uploadingProgress: 0,
      }));

      const rejectMessageFor = (file) => {
        const validationProperties = {
          incorrectFileFormat: !isFileFormatAllowed(file, acceptFileMimeTypes),
          incorrectFileSize: maxFileSize > 0 && file.size > maxFileSize,
        };
        const validationMessages = {
          incorrectFileFormat: formatMessage(messages.incorrectFileFormat),
          incorrectFileSize: incorrectFileSizeMessage,
        };
        const parts = [];
        Object.keys(validationProperties).forEach((key) => {
          if (validationProperties[key]) {
            parts.push(validationMessages[key]);
          }
        });
        return parts.join('. ').trim();
      };

      const rejected = fileRejections.map((rejection) => ({
        file: rejection.file,
        valid: false,
        id: uniqueId(),
        rejectMessage: rejectMessageFor(rejection.file),
      }));

      addFiles([...accepted, ...rejected]);
    },
    [addFiles, acceptFileMimeTypes, maxFileSize, formatMessage, incorrectFileSizeMessage],
  );

  const accept = useMemo(() => buildAcceptObject(acceptFileMimeTypes), [acceptFileMimeTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    disabled: isDropZoneDisabled(),
    ...(accept ? { accept } : {}),
    ...(maxFileSize > 0 ? { maxSize: maxFileSize } : {}),
  });

  return (
    <div
      {...getRootProps({
        className: cx('files-dropzone', {
          'files-dropzone-active': isDragActive,
        }),
      })}
    >
      <input {...getInputProps()} />
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
    </div>
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
