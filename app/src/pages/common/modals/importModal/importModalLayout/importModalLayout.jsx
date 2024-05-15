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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { ModalLayout } from 'components/main/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { fetch } from 'common/utils';
import { DropzoneField } from 'pages/common/modals/importModal/dropzoneField/dropzoneField';

const messages = defineMessages({
  importConfirmation: {
    id: 'ImportModal.importConfirmation',
    defaultMessage: 'Confirm cancel',
  },
});

@injectIntl
@connect(null, {
  showNotification,
})
@track()
export class ImportModalLayout extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showNotification: PropTypes.func.isRequired,
    data: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    dropzoneCountNumber: PropTypes.number,
    children: PropTypes.node,
    maxFileSize: PropTypes.number.isRequired,
    acceptFileMimeTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  static defaultProps = {
    data: { eventsInfo: { uploadButton: () => {}, cancelBtn: {}, closeIcon: {} } },
    dropzoneCountNumber: 0,
    children: [null],
  };

  state = {
    files: [],
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

  getFilesNames = (files) => files.map(({ file: { name } }) => name).join('#');

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
    const {
      tracking: { trackEvent },
      data: { eventsInfo: { uploadButton } = {} },
    } = this.props;

    if (uploadButton) {
      trackEvent(uploadButton(this.getFilesNames(files)));
    }

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
      data: { title, eventsInfo, tip, incorrectFileSize, singleImport },
      children,
      dropzoneCountNumber,
      maxFileSize,
      acceptFileMimeTypes,
    } = this.props;

    const validFiles = this.getValidFiles();
    const loading = this.isUploadInProgress();
    const uploadFinished = this.isUploadFinished();

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
        {children.map((child, index) => {
          return index === dropzoneCountNumber ? (
            // eslint-disable-next-line react/no-array-index-key
            <Fragment key={index}>
              <DropzoneField
                disabled={this.isDropZoneDisabled()}
                incorrectFileSize={incorrectFileSize}
                tip={tip}
                singleImport={singleImport}
                files={this.state.files}
                setFiles={(f) => this.setState({ files: f })}
                maxFileSize={maxFileSize}
                acceptFileMimeTypes={acceptFileMimeTypes}
              />
              {child}
            </Fragment>
          ) : (
            child
          );
        })}
      </ModalLayout>
    );
  }
}
