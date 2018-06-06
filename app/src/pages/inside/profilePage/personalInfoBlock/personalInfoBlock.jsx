import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { showModalAction } from 'controllers/modal';
import { userInfoSelector } from 'controllers/user';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { GhostButton } from 'components/buttons/ghostButton';
import styles from './personalInfoBlock.scss';
import { BlockContainerBody, BlockContainerHeader } from '../blockContainer';
import PencilIcon from './img/pencil-icon-inline.svg';

const cx = classNames.bind(styles);
const getPhoto = (userId) => URLS.dataUserPhoto(new Date().getTime(), userId);

const messages = defineMessages({
  header: {
    id: 'PersonalInfoBlock.header',
    defaultMessage: 'Personal information',
  },
  savePhoto: {
    id: 'PersonalInfoBlock.savePhoto',
    defaultMessage: 'Save photo',
  },
  uploadPhoto: {
    id: 'PersonalInfoBlock.uploadPhoto',
    defaultMessage: 'Upload photo',
  },
  removePhoto: {
    id: 'PersonalInfoBlock.removePhoto',
    defaultMessage: 'Remove photo',
  },
  invalidImage: {
    id: 'PersonalInfoBlock.invalidImage',
    defaultMessage: 'You can upload jpeg, png, gif file, no more than 1 MB and 300x500px',
  },
  submitUpload: {
    id: 'PersonalInfoBlock.submitUpload',
    defaultMessage: 'Photo has been uploaded successfully',
  },
  uploadError: {
    id: 'PersonalInfoBlock.uploadError',
    defaultMessage: "Photo hasn't been uploaded successfully",
  },
  wasDeleted: {
    id: 'PersonalInfoBlock.wasDeleted',
    defaultMessage: 'Photo has been deleted successfully',
  },
  deleteError: {
    id: 'PersonalInfoBlock.deleteError',
    defaultMessage: "Photo hasn't been deleted successfully",
  },
  changePassword: {
    id: 'PersonalInfoBlock.changePassword',
    defaultMessage: 'Change password',
  },
  passwordChanged: {
    id: 'PersonalInfoBlock.passwordChanged',
    defaultMessage: 'Your password has been changed successfully',
  },
  errorChangePassword: {
    id: 'PersonalInfoBlock.errorChangePassword',
    defaultMessage: "Error! Can't change password.",
  },
  forceUpdate: {
    id: 'PersonalInfoBlock.forceUpdate',
    defaultMessage: 'ForceUpdate',
  },
  synchronize: {
    id: 'PersonalInfoBlock.synchronize',
    defaultMessage: 'User info successfully synchronized',
  },
  synchronizeError: {
    id: 'PersonalInfoBlock.synchronizeError',
    defaultMessage: "Can't synchronize profile!",
  },
  submitSuccess: {
    id: 'PersonalInfoBlock.submitSucccess',
    defaultMessage: 'Changes have been saved successfully',
  },
  submitError: {
    id: 'PersonalInfoBlock.submitError',
    defaultMessage: "Error! Can't save changes",
  },
});

@connect(
  (state) => ({
    userId: userInfoSelector(state).userId,
    name: userInfoSelector(state).full_name,
    email: userInfoSelector(state).email,
    accountType: userInfoSelector(state).account_type,
  }),
  { showNotification, showModalAction },
)
@injectIntl
export class PersonalInfoBlock extends PureComponent {
  static propTypes = {
    userId: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    accountType: PropTypes.string,
    intl: intlShape.isRequired,
    showModalAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
  };
  static defaultProps = {
    userId: '',
    name: '',
    email: '',
    accountType: '',
  };

  state = {
    avatarSource: getPhoto(this.props.userId),
    newPhotoLoaded: false,
    isValidImage: true,
    image: null,
  };

  onRemove = () =>
    this.props.showModalAction({
      id: 'deleteImageModal',
      data: { onRemove: this.removeImageHandler },
    });
  onChangePassword = () =>
    this.props.showModalAction({
      id: 'changePasswordModal',
      data: { onChangePassword: this.changePasswordHandler },
    });
  onSave = () => {
    const formData = new FormData();
    formData.append('file', this.state.image);
    fetch(URLS.dataPhoto(), { method: 'post', data: formData })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.submitUpload),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
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
    this.fileSelector.click();
  };
  onForceUpdate = () => {
    const { accountType, intl } = this.props;
    fetch(URLS.userSynchronize(accountType), { method: 'post' })
      .then(() => {
        this.props.showNotification({
          message: intl.formatMessage(messages.synchronize),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.showModalAction({
          id: 'forceUpdateModal',
          data: { onForceUpdate: this.forceUpdateHandler },
        });
      })
      .catch(() => {
        showNotification({
          message: intl.formatMessage(messages.synchronizeError),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };
  onEdit = () => {
    this.props.showModalAction({
      id: 'editPersonalInformationModal',
      data: {
        onEdit: this.editInfoHandler,
        info: {
          name: this.props.name,
          email: this.props.email,
        },
      },
    });
  };

  changePasswordHandler = (data) => {
    fetch(URLS.userChangePassword(), {
      method: 'post',
      data: { oldPassword: data.oldPassword, newPassword: data.newPassword },
    })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.passwordChanged),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.passwordChanged),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };
  removeImageHandler = () => {
    fetch(URLS.dataPhoto(), { method: 'delete' })
      .then(() => {
        this.setState({ avatarSource: getPhoto(this.props.userId) });
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

  forceUpdateHandler = () => {
    fetch(URLS.deleteUUID(), { method: 'delete' });
  };

  selectPhotoHandler = (e) => {
    const file = e.currentTarget.files[0];
    if (file) {
      if (this.validateFileExtension(file)) {
        const reader = new FileReader();
        const image = new Image();
        reader.readAsDataURL(file);
        reader.onload = (_file) => {
          image.src = _file.target.result;
          image.onload = () => {
            if (this.validateImageSize(image, file)) {
              this.setState({
                avatarSource: _file.target.result,
                newPhotoLoaded: true,
                isValidImage: true,
                image: file,
              });
            } else {
              this.setState({ isValidImage: false });
            }
          };
        };
      } else {
        this.setState({ isValidImage: false });
      }
    }
  };

  editInfoHandler = (data) => {
    this.setState({ email: data.email, name: data.name });
    fetch(URLS.userEditInfo(this.props.userId), {
      method: 'put',
      data: { full_name: data.name, email: data.email },
    })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.submitSucccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.submitError),
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
    const { intl, userId, accountType, name, email } = this.props;
    return (
      <div className={cx('personal-info-block')}>
        <BlockContainerHeader>{intl.formatMessage(messages.header)}</BlockContainerHeader>
        <BlockContainerBody>
          <div className={cx('block-content')}>
            <div className={cx('avatar-wrapper')}>
              <img className={cx('avatar')} src={this.state.avatarSource} alt="Profile avatar" />
            </div>
            <div className={cx('info')}>
              <div className={cx('login')}>{userId}</div>
              <div className={cx('name')}>
                {name}
                {accountType === 'INTERNAL' && (
                  <span className={cx('pencil-icon')} onClick={this.onEdit}>
                    {Parser(PencilIcon)}
                  </span>
                )}
              </div>
              <div className={cx('email')}>
                {email}
                {accountType === 'INTERNAL' && (
                  <div className={cx('pencil-icon')} onClick={this.onEdit}>
                    {Parser(PencilIcon)}
                  </div>
                )}
              </div>
              {accountType === 'INTERNAL' && (
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
                  {!this.state.newPhotoLoaded && (
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
                  {this.state.newPhotoLoaded && (
                    <div className={cx('photo-btn')}>
                      <GhostButton onClick={this.onSave}>
                        {intl.formatMessage(messages.savePhoto)}
                      </GhostButton>
                    </div>
                  )}
                </div>
              )}
              {!this.state.isValidImage && (
                <p className={cx('invalid-image')}>{intl.formatMessage(messages.invalidImage)}</p>
              )}
              {accountType === 'INTERNAL' && (
                <div className={cx('top-btn')}>
                  <GhostButton onClick={this.onChangePassword}>
                    {intl.formatMessage(messages.changePassword)}
                  </GhostButton>
                </div>
              )}
              {accountType !== 'INTERNAL' &&
                accountType !== 'LDAP' && (
                  <div className={cx('top-btn')} onClick={this.onForceUpdate}>
                    <GhostButton>{intl.formatMessage(messages.forceUpdate)}</GhostButton>
                  </div>
                )}
            </div>
          </div>
        </BlockContainerBody>
      </div>
    );
  }
}
