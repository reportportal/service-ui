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

import PropTypes from 'prop-types';
import track from 'react-tracking';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { INTERNAL } from 'common/constants/accountType';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { showModalAction } from 'controllers/modal';
import { setPhotoTimeStampAction } from 'controllers/user';
import { GhostButton } from 'components/buttons/ghostButton';
import { PROFILE_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './photoControls.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  savePhoto: {
    id: 'PhotoControls.savePhoto',
    defaultMessage: 'Save Photo',
  },
  uploadPhoto: {
    id: 'PhotoControls.uploadPhoto',
    defaultMessage: 'Upload Photo',
  },
  removePhoto: {
    id: 'PhotoControls.removePhoto',
    defaultMessage: 'Remove Photo',
  },
  invalidImage: {
    id: 'PhotoControls.invalidImage',
    defaultMessage: 'You can upload jpeg, png, gif file, no more than 1 MB and 300x500px',
  },
  submitUpload: {
    id: 'PhotoControls.submitUpload',
    defaultMessage: 'Photo has been uploaded successfully',
  },
  uploadError: {
    id: 'PhotoControls.uploadError',
    defaultMessage: "Photo hasn't been uploaded successfully",
  },
  wasDeleted: {
    id: 'PhotoControls.wasDeleted',
    defaultMessage: 'Photo has been deleted successfully',
  },
  deleteError: {
    id: 'PhotoControls.deleteError',
    defaultMessage: "Photo hasn't been deleted successfully",
  },
});

@connect(null, { showNotification, showModalAction, setPhotoTimeStampAction })
@injectIntl
@track()
export class PhotoControls extends Component {
  static propTypes = {
    accountType: PropTypes.string,
    uploadNewImage: PropTypes.func,
    removeImage: PropTypes.func,
    intl: PropTypes.object.isRequired,
    showModalAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    setPhotoTimeStampAction: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    accountType: '',
    uploadNewImage: () => {},
    removeImage: () => {},
  };

  state = {
    newPhotoLoaded: false,
    isValidImage: true,
    image: null,
  };

  onRemove = () => {
    this.props.tracking.trackEvent(PROFILE_PAGE_EVENTS.REMOVE_PHOTO_BTN);
    this.props.showModalAction({
      id: 'deleteImageModal',
      data: { onRemove: this.removeImageHandler },
    });
  };

  onSave = () => {
    const formData = new FormData();
    formData.append('file', this.state.image);
    fetch(URLS.dataPhoto(), { method: 'post', data: formData })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.submitUpload),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.setPhotoTimeStampAction(Date.now());
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.uploadError),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
    this.setState({ newPhotoLoaded: false });
  };
  onClickUploadPhoto = () => {
    this.props.tracking.trackEvent(PROFILE_PAGE_EVENTS.UPLOAD_PHOTO_BTN);
    this.fileSelector.click();
  };
  onLoadFile = (file) => {
    const reader = new FileReader();
    const image = new Image();
    reader.readAsDataURL(file);
    reader.onload = (_file) => {
      image.src = _file.target.result;
      image.onload = () => {
        if (this.validateImageSize(image, file)) {
          this.props.uploadNewImage(_file.target.result);
          this.setState({
            newPhotoLoaded: true,
            isValidImage: true,
            image: file,
          });
        } else {
          this.setState({ isValidImage: false });
        }
      };
    };
  };
  selectPhotoHandler = (e) => {
    const file = e.currentTarget.files[0];
    if (file) {
      if (this.validateFileExtension(file)) {
        this.onLoadFile(file);
      } else {
        this.setState({ isValidImage: false });
      }
    }
  };
  removeImageHandler = () => {
    fetch(URLS.dataPhoto(), { method: 'delete' })
      .then(() => {
        this.props.removeImage();
        this.props.setPhotoTimeStampAction(Date.now());
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.wasDeleted),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.deleteError),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };
  validateFileExtension = (file) => /\.(gif|jpg|jpeg|png)$/i.test(file.name);
  validateImageSize = (image, file) => {
    const width = image.width;
    const height = image.height;
    const size = Math.floor(file.size / 1024);
    return size <= 1000 && width <= 300 && height <= 500;
  };

  render() {
    const { intl, accountType } = this.props;
    return (
      <Fragment>
        {accountType === INTERNAL && (
          <div className={cx('photo-controls')}>
            <div className={cx('input-file')}>
              <input
                ref={(inputFile) => {
                  this.fileSelector = inputFile;
                }}
                onChange={this.selectPhotoHandler}
                type="file"
                accept="image/gif, image/jpeg, image/png"
              />
            </div>
            {this.state.newPhotoLoaded ? (
              <div className={cx('photo-btn')}>
                <GhostButton onClick={this.onSave}>
                  {intl.formatMessage(messages.savePhoto)}
                </GhostButton>
              </div>
            ) : (
              <Fragment>
                <div className={cx('photo-btn')}>
                  <GhostButton onClick={this.onClickUploadPhoto}>
                    {intl.formatMessage(messages.uploadPhoto)}
                  </GhostButton>
                </div>
                <div className={cx('photo-btn')}>
                  <button className={cx('remove')} onClick={this.onRemove}>
                    {intl.formatMessage(messages.removePhoto)}
                  </button>
                </div>
              </Fragment>
            )}
          </div>
        )}
        {!this.state.isValidImage && (
          <p className={cx('invalid-image')}>{intl.formatMessage(messages.invalidImage)}</p>
        )}
      </Fragment>
    );
  }
}
