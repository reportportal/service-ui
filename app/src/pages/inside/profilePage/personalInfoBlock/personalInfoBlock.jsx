import PropTypes from 'prop-types';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { showModalAction } from 'controllers/modal';
import { userInfoSelector } from 'controllers/user';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { INTERNAL, LDAP } from 'common/constants/accountType';
import { GhostButton } from 'components/buttons/ghostButton';
import { PROFILE_PAGE_EVENTS } from 'components/main/analytics/events';
import { Image } from 'components/main/image';
import styles from './personalInfoBlock.scss';
import { BlockContainerBody, BlockContainerHeader } from '../blockContainer';
import { PhotoControls } from './photoControls';
import { UserInfo } from './userInfo/userInfo';

const cx = classNames.bind(styles);
const getPhoto = (userId) => URLS.dataUserPhoto(userId);

const messages = defineMessages({
  header: {
    id: 'PersonalInfoBlock.header',
    defaultMessage: 'Personal information',
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
});

@connect(
  (state) => ({
    userId: userInfoSelector(state).userId,
    accountType: userInfoSelector(state).accountType,
  }),
  { showNotification, showModalAction },
)
@injectIntl
@track()
export class PersonalInfoBlock extends Component {
  static propTypes = {
    userId: PropTypes.string,
    accountType: PropTypes.string,
    intl: intlShape.isRequired,
    showModalAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    userId: '',
    accountType: '',
  };

  state = {
    avatarSource: getPhoto(this.props.userId),
  };
  onChangePassword = () => {
    this.props.tracking.trackEvent(PROFILE_PAGE_EVENTS.CHANGE_PASSWORD_CLICK);
    this.props.showModalAction({
      id: 'changePasswordModal',
      data: { onChangePassword: this.changePasswordHandler },
    });
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
  forceUpdateHandler = () => {
    fetch(URLS.sessionToken(), { method: 'delete' });
  };
  uploadNewImage = (image) => {
    this.setState({ avatarSource: image });
  };
  removeImage = () => {
    this.setState({ avatarSource: getPhoto(this.props.userId) });
  };

  render() {
    const { intl, accountType, userId } = this.props;
    return (
      <div className={cx('personal-info-block')}>
        <BlockContainerHeader>{intl.formatMessage(messages.header)}</BlockContainerHeader>
        <BlockContainerBody>
          <div className={cx('block-content')}>
            <div className={cx('avatar-wrapper')}>
              <Image className={cx('avatar')} src={this.state.avatarSource} alt="Profile avatar" />
            </div>
            <div className={cx('info')}>
              <UserInfo accountType={accountType} userId={userId} />
              {accountType === INTERNAL && (
                <PhotoControls
                  accountType={accountType}
                  uploadNewImage={this.uploadNewImage}
                  removeImage={this.removeImage}
                />
              )}
              {accountType === INTERNAL && (
                <div className={cx('top-btn')}>
                  <GhostButton onClick={this.onChangePassword}>
                    {intl.formatMessage(messages.changePassword)}
                  </GhostButton>
                </div>
              )}
              {accountType !== INTERNAL &&
                accountType !== LDAP && (
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
