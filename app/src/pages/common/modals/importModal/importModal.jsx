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

import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import Dropzone from 'react-dropzone';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { uniqueId, fetch } from 'common/utils';
import DropZoneIcon from 'common/img/shape-inline.svg';
import { ImportFileIcon } from './importFileIcon';
import styles from './importModal.scss';
import { ACCEPT_FILE_MIME_TYPES, MAX_FILE_SIZES } from './constants';

const cx = classNames.bind(styles);

const messages = defineMessages({
  note: {
    id: 'ImportModal.note',
    defaultMessage: 'Note:',
  },
  importConfirmation: {
    id: 'ImportModal.importConfirmation',
    defaultMessage: 'Confirm cancel',
  },
  incorrectFileFormat: {
    id: 'ImportModal.incorrectFileFormat',
    defaultMessage: 'Incorrect file format',
  },
});

@withModal('importModal')
@injectIntl
@connect(null, {
  showNotification,
})
@track()
export class ImportModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showNotification: PropTypes.func.isRequired,
    data: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    data: {},
  };

  state = {
    files: [],
  };

  onDrop = (acceptedFiles, rejectedFiles) => {
    const { files: stateFiles } = this.state;
    const accepted = acceptedFiles.map(this.onDropAcceptedFileHandler);
    const rejected = rejectedFiles.map(this.onDropRejectedFileHandler);

    this.setState({
      files: [...stateFiles, ...accepted, ...rejected],
    });
  };

  onDropAcceptedFileHandler = (file) => ({
    file,
    valid: true,
    id: uniqueId(),
    isLoading: false,
    uploaded: false,
    uploadingProgress: 0,
  });

  onDropRejectedFileHandler = (file) => ({
    file,
    valid: false,
    id: uniqueId(),
    rejectMessage: this.addFileRejectMessage(file),
  });

  onDelete = (id) => {
    const { files } = this.state;

    this.setState({
      files: files.filter((item) => item.id !== id),
    });
  };

  getOkButtonConfig = (isLoading, uploadFinished) => {
    const {
      intl,
      tracking,
      data: { importButton, eventsInfo },
    } = this.props;
    const text =
      isLoading || uploadFinished ? intl.formatMessage(COMMON_LOCALE_KEYS.OK) : importButton;

    return {
      text,
      disabled: isLoading,
      onClick: (closeModal) => {
        if (uploadFinished) {
          closeModal();
        } else {
          tracking.trackEvent(eventsInfo.okBtn);
          this.uploadFilesOnOkClick();
        }
      },
    };
  };

  getCloseConfirmationConfig = (isValidFilesExists, loading, uploadFinished) => {
    const {
      intl,
      data: { importConfirmationWarning },
    } = this.props;
    const confirmationWarning = loading
      ? importConfirmationWarning
      : intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING);

    if (!isValidFilesExists || uploadFinished) {
      return null;
    }
    return {
      withCheckbox: loading,
      closeConfirmedCallback: this.closeConfirmedCallback,
      confirmationMessage: intl.formatMessage(messages.importConfirmation),
      confirmationWarning,
    };
  };
  getValidFiles = () => this.state.files.filter(({ valid }) => valid);
  isUploadInProgress = () => this.getValidFiles().some(({ isLoading }) => isLoading);
  isUploadFinished = () =>
    this.getValidFiles().length ? this.getValidFiles().every(({ uploaded }) => uploaded) : false;
  cancelRequests = [];
  isDropZoneDisabled = () =>
    this.isUploadFinished() ||
    this.isUploadInProgress() ||
    (this.props.data.singleImport && this.state.files.length > 0);

  validateFile = (file) => {
    const { type } = this.props.data;

    return {
      incorrectFileFormat: !ACCEPT_FILE_MIME_TYPES[type].includes(file.type),
      incorrectFileSize: file.size > MAX_FILE_SIZES[type],
    };
  };

  formValidationMessage = (validationProperties) => {
    const {
      intl,
      data: { incorrectFileSize },
    } = this.props;
    const validationMessages = {
      incorrectFileFormat: intl.formatMessage(messages.incorrectFileFormat),
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

  addFileRejectMessage = (file) => {
    const validationProperties = this.validateFile(file);

    return this.formValidationMessage(validationProperties);
  };

  uploadFilesOnOkClick = () => {
    const data = this.prepareDataForServerUploading();

    const { files } = this.state;

    this.setState({
      files: files.map((item) => {
        if (item.valid) {
          return { ...item, isLoading: true };
        }
        return item;
      }),
    });

    data.forEach(({ promise, id }) => {
      this.uploadFilesHandler(promise, id);
    });
  };

  uploadFilesHandler = (promise, id) => {
    promise
      .then(this.successUploadHandler.bind(null, id))
      .catch(this.failedUploadHandler.bind(null, id));
  };

  successUploadHandler = (id) => {
    this.props.data.onImport();
    const { files } = this.state;

    this.setState({
      files: files.map((item) => {
        if (item.id === id) {
          return { ...item, uploaded: true, isLoading: false, uploadFailed: false };
        }

        return item;
      }),
    });
  };

  failedUploadHandler = (id, err) => {
    const { files } = this.state;

    this.props.showNotification({
      message: err.message,
      type: NOTIFICATION_TYPES.ERROR,
    });
    this.setState({
      files: files.map((item) => {
        if (item.id !== id) {
          return item;
        }
        return {
          ...item,
          uploaded: true,
          isLoading: false,
          uploadFailed: true,
          uploadFailReason: err,
        };
      }),
    });
  };

  formDataForServerUploading() {
    const { files } = this.state;

    return files
      .filter((item) => item.valid)
      .map((item) => {
        const formData = new FormData();

        formData.append('file', item.file, item.file.name);

        return {
          data: formData,
          id: item.id,
        };
      });
  }

  prepareDataForServerUploading() {
    const data = this.formDataForServerUploading();

    return data.map((item) => ({ promise: this.uploadFile(item), id: item.id }));
  }

  closeConfirmedCallback = () => {
    if (this.cancelRequests.length) {
      this.cancelRequests.forEach((cancelRequest) => cancelRequest());
    }
  };

  uploadFile = (file) => {
    const {
      data: { url },
    } = this.props;
    const { id } = file;

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data;' },
      data: file.data,
      abort: (cancelRequest) => {
        this.cancelRequests.push(cancelRequest);
      },
      onUploadProgress: (progressEvent) => {
        const { files } = this.state;
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

        this.setState({
          files: files.map((item) => {
            if (item.id === id) {
              return { ...item, uploadingProgress: percentCompleted };
            }

            return item;
          }),
        });
      },
    });
  };

  render() {
    const {
      intl,
      data: { type, title, tip, noteMessage, eventsInfo, singleImport },
    } = this.props;
    const { files } = this.state;
    const validFiles = this.getValidFiles();
    const loading = this.isUploadInProgress();
    const uploadFinished = this.isUploadFinished();
    const acceptFile = ACCEPT_FILE_MIME_TYPES[type].join(',');

    return (
      <ModalLayout
        title={title}
        okButton={this.getOkButtonConfig(loading, uploadFinished)}
        cancelButton={{
          text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
          eventInfo: eventsInfo.cancelBtn,
          disabled: uploadFinished,
        }}
        closeConfirmation={this.getCloseConfirmationConfig(
          validFiles.length,
          loading,
          uploadFinished,
        )}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <Dropzone
          className={cx('dropzone-wrapper')}
          activeClassName={cx('dropzone-wrapper-active')}
          accept={acceptFile}
          onDrop={this.onDrop}
          multiple={!singleImport}
          maxSize={MAX_FILE_SIZES[type]}
          disabled={this.isDropZoneDisabled()}
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
                <ImportFileIcon {...item} onDelete={this.onDelete} key={item.id} fileType={type} />
              ))}
            </div>
          )}
        </Dropzone>
        {noteMessage && (
          <Fragment>
            <p className={cx('note-label')}>{intl.formatMessage(messages.note)}</p>
            <p className={cx('note-message')}>{Parser(noteMessage)}</p>
          </Fragment>
        )}
      </ModalLayout>
    );
  }
}
