import React, { Component } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import Dropzone from 'react-dropzone';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import { activeProjectSelector } from 'controllers/user';
import { addTokenToImagePath, uniqueId, fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LAUNCHES_MODAL_EVENTS } from 'components/main/analytics/events';
import { LaunchIcon } from './launchIcon';
import styles from './launchImportModal.scss';
import DropZoneIcon from './img/shape-inline.svg';
import { ACCEPT_FILE_MIME_TYPES, MAX_FILE_SIZE } from './constants';

const cx = classNames.bind(styles);

const messages = defineMessages({
  modalTitle: {
    id: 'LaunchImportModal.modalTitle',
    defaultMessage: 'Import Launch',
  },
  importButton: {
    id: 'LaunchImportModal.importButton',
    defaultMessage: 'Import',
  },
  okButton: {
    id: 'LaunchImportModal.okButton',
    defaultMessage: 'Ok',
  },
  cancelButton: {
    id: 'LaunchImportModal.cancelButton',
    defaultMessage: 'Cancel',
  },
  importTip: {
    id: 'LaunchImportModal.tip',
    defaultMessage:
      'Drop only <b>.zip</b> file under 32 MB to upload or <span>click</span> to add it',
  },
  note: {
    id: 'LaunchImportModal.note',
    defaultMessage: 'Note:',
  },
  noteMessage: {
    id: 'LaunchImportModal.noteMessage',
    defaultMessage:
      'If your runner does not write the test start time in .xml file, then the current server time will be used.',
  },
  importConfirmationWarning: {
    id: 'LaunchImportModal.importConfirmationWarning',
    defaultMessage: 'Are you sure you want to interrupt import launches?',
  },
  importConfirmation: {
    id: 'LaunchImportModal.importConfirmation',
    defaultMessage: 'Confirm cancel',
  },
  incorrectFileFormat: {
    id: 'LaunchImportModal.incorrectFileFormat',
    defaultMessage: 'Incorrect file format',
  },
  incorrectFileSize: {
    id: 'LaunchImportModal.incorrectFileSize',
    defaultMessage: 'File size is more than 32 Mb',
  },
});

@withModal('launchImportModal')
@injectIntl
@connect((state) => ({ activeProject: activeProjectSelector(state) }))
@track()
export class LaunchImportModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activeProject: PropTypes.string,
    data: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    activeProject: '',
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
    const { intl, tracking } = this.props;
    const text =
      isLoading || uploadFinished
        ? intl.formatMessage(messages.okButton)
        : intl.formatMessage(messages.importButton);

    return {
      text,
      disabled: isLoading,
      onClick: (closeModal) => {
        if (uploadFinished) {
          tracking.trackEvent(LAUNCHES_MODAL_EVENTS.OK_BTN_IMPORT_MODAL);
          closeModal();
        } else {
          this.uploadFilesOnOkClick();
        }
      },
    };
  };

  getCloseConfirmationConfig = (isValidFilesExists, loading, uploadFinished) => {
    const { intl } = this.props;

    if (!isValidFilesExists || uploadFinished) {
      return null;
    }
    return {
      withCheckbox: loading,
      closeConfirmedCallback: this.closeConfirmedCallback,
      confirmationMessage: intl.formatMessage(messages.importConfirmation),
      confirmationWarning: intl.formatMessage(
        loading ? messages.importConfirmationWarning : COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING,
      ),
    };
  };
  validFiles = () => this.state.files.filter(({ valid }) => valid);
  uploadInProgress = () => this.validFiles().some(({ isLoading }) => isLoading);
  uploadFinished = () =>
    this.validFiles().length ? this.validFiles().every(({ uploaded }) => uploaded) : false;
  cancelRequests = [];

  validateFile = (file) => ({
    incorrectFileFormat: !ACCEPT_FILE_MIME_TYPES.includes(file.type),
    incorrectFileSize: file.size > MAX_FILE_SIZE,
  });

  formValidationMessage = (validationProperties) => {
    const { intl } = this.props;
    const validationMessages = {
      incorrectFileFormat: intl.formatMessage(messages.incorrectFileFormat),
      incorrectFileSize: intl.formatMessage(messages.incorrectFileSize),
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

    return files.filter((item) => item.valid).map((item) => {
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
    const { activeProject } = this.props;
    const { id } = file;
    return fetch(addTokenToImagePath(URLS.launchImport(activeProject)), {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data;' },
      data: file.data,
      abort: (cancelRequest) => {
        this.cancelRequests.push(cancelRequest);
      },
      onUploadProgress: (progressEvent) => {
        const { files } = this.state;
        const percentCompleted = Math.round(progressEvent.loaded * 100 / progressEvent.total);

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
    const { intl } = this.props;
    const { files } = this.state;
    const validFiles = this.validFiles();
    const loading = this.uploadInProgress();
    const uploadFinished = this.uploadFinished();
    return (
      <ModalLayout
        title={intl.formatMessage(messages.modalTitle)}
        okButton={this.getOkButtonConfig(loading, uploadFinished)}
        cancelButton={{
          text: intl.formatMessage(messages.cancelButton),
          eventInfo: LAUNCHES_MODAL_EVENTS.CANCEL_BTN_IMPORT_MODAL,
        }}
        closeConfirmation={this.getCloseConfirmationConfig(
          validFiles.length,
          loading,
          uploadFinished,
        )}
        closeIconEventInfo={LAUNCHES_MODAL_EVENTS.CLOSE_ICON_IMPORT_MODAL}
      >
        <Dropzone
          className={cx('dropzone-wrapper')}
          activeClassName={cx('dropzone-wrapper-active')}
          accept={ACCEPT_FILE_MIME_TYPES.join(',')}
          onDrop={this.onDrop}
          maxSize={MAX_FILE_SIZE}
          disabled={loading}
        >
          {files.length === 0 && (
            <div className={cx('dropzone')}>
              <div className={cx('icon')}>{Parser(DropZoneIcon)}</div>
              <p className={cx('message')}>{Parser(intl.formatMessage(messages.importTip))}</p>
            </div>
          )}
          {files.length > 0 && (
            <div className={cx('files-list')}>
              {files.map((item) => <LaunchIcon {...item} onDelete={this.onDelete} key={item.id} />)}
            </div>
          )}
        </Dropzone>
        <p className={cx('note-label')}>{intl.formatMessage(messages.note)}</p>
        <p className={cx('note-message')}>{intl.formatMessage(messages.noteMessage)}</p>
      </ModalLayout>
    );
  }
}
