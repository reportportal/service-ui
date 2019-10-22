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
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { fileSizeConverter } from 'common/utils';
import SheetIcon from 'common/img/file-icon-inline.svg';
import DeleteIcon from 'common/img/icon-delete-inline.svg';
import { ProgressLoader } from './progressLoader';
import { InvalidIcon, UploadIndicator } from './iconStateIndicators';
import styles from './importFileIcon.scss';

const cx = classNames.bind(styles);

export const ImportFileIcon = ({
  file,
  valid,
  uploaded,
  isLoading,
  id,
  onDelete,
  fileType,
  uploadingProgress,
  rejectMessage,
  uploadFailed,
  uploadFailReason,
}) => {
  const deleteHandler = (e) => {
    e.stopPropagation();

    onDelete(id);
  };
  const uploadedProps = {
    uploaded,
    uploadFailed,
    uploadFailReason,
  };

  return (
    <div className={cx('file-wrapper')}>
      <div className={cx('file')}>
        {Parser(SheetIcon)}
        <div className={cx('file-info')}>
          <p className={cx('file-size')}>{fileSizeConverter(file.size)}</p>
          <div className={cx('file-state-holder')}>
            {valid ? (
              <UploadIndicator {...uploadedProps} fileType={fileType} />
            ) : (
              <InvalidIcon rejectMessage={rejectMessage} />
            )}
          </div>
          {isLoading ? (
            <ProgressLoader progress={uploadingProgress} />
          ) : (
            <p className={cx('file-name')}>{file.name}</p>
          )}
        </div>
        {!(uploaded || isLoading) && (
          <div className={cx('file-delete')} onClick={deleteHandler}>
            {Parser(DeleteIcon)}
          </div>
        )}
      </div>
    </div>
  );
};

ImportFileIcon.propTypes = {
  file: PropTypes.object,
  valid: PropTypes.bool,
  uploaded: PropTypes.bool,
  isLoading: PropTypes.bool,
  id: PropTypes.string,
  onDelete: PropTypes.func,
  fileType: PropTypes.string,
  uploadingProgress: PropTypes.number,
  rejectMessage: PropTypes.string,
  uploadFailed: PropTypes.bool,
  uploadFailReason: PropTypes.object,
};

ImportFileIcon.defaultProps = {
  file: {},
  valid: false,
  uploaded: false,
  isLoading: false,
  id: '',
  rejectMessage: '',
  onDelete: () => {},
  fileType: '',
  uploadingProgress: 0,
  uploadFailed: false,
  uploadFailReason: {},
};
