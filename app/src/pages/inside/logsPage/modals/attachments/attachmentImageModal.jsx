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

import { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import track from 'react-tracking';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import RotateImage from 'common/img/rotate-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLayout, withModal } from 'components/main/modal';
import { ATTACHMENT_IMAGE_MODAL_ID } from 'controllers/log/attachments';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { messages } from './messages';
import styles from './attachmentImageModal.scss';

const cx = classNames.bind(styles);

@withModal(ATTACHMENT_IMAGE_MODAL_ID)
@track()
@injectIntl
export class AttachmentImageModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      image: PropTypes.string,
    }).isRequired,
    intl: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  state = {
    rotationAmount: 0,
  };

  getImageSize = () =>
    this.imageRef && this.imageRef.current
      ? {
          height: this.imageRef.current.clientHeight,
          width: this.imageRef.current.clientWidth,
        }
      : null;

  getRotatedImageStyle = () => {
    const { rotationAmount } = this.state;
    this.initNativeImageSize();
    const imageStyle = {
      transform: this.generateRotationCommand(rotationAmount),
    };

    if (this.nativeImageSize) {
      imageStyle.height =
        (rotationAmount / 90) % 2 === 1
          ? `${this.nativeImageSize.width}px`
          : `${this.nativeImageSize.height}px`;
      if (this.nativeImageSize.width < this.nativeImageSize.height) {
        imageStyle.width =
          (rotationAmount / 90) % 2 === 1
            ? `${this.nativeImageSize.height}px`
            : `${this.nativeImageSize.width}px`;
      }
    }
    return imageStyle;
  };

  initNativeImageSize = () => {
    if (!this.nativeImageSize) {
      this.nativeImageSize = this.getImageSize();
    }
  };

  generateRotationCommand = (amount) => `rotate(${amount}deg)`;

  rotateImageHandler = () => {
    const rotationA = this.state.rotationAmount;
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.ROTATE_ICON_ATTACHMENT_MODAL);
    this.setState({
      rotationAmount: rotationA + 90,
    });
  };

  imageRef = React.createRef();

  renderCustomButton = () => (
    <div className={cx('rotate-button')} onClick={this.rotateImageHandler}>
      <span className={cx('icon')}>{Parser(RotateImage)}</span>
      <span className={cx('text')}>{this.props.intl.formatMessage(messages.rotate)}</span>
    </div>
  );

  renderCancelButton = () => ({
    text: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE),
    eventInfo: LOG_PAGE_EVENTS.CLOSE_BTN_ATTACHMENT_MODAL,
    onClick: (closeModal) => closeModal(),
  });

  render() {
    const {
      intl: { formatMessage },
      data: { image },
    } = this.props;
    const imageStyle = this.getRotatedImageStyle();

    return (
      <ModalLayout
        title={formatMessage(messages.title)}
        cancelButton={this.renderCancelButton()}
        customButton={this.renderCustomButton()}
        className={cx('attachment-image-modal')}
        closeIconEventInfo={LOG_PAGE_EVENTS.CLOSE_ICON_ATTACHMENT_MODAL}
      >
        <div className={cx('attachment-modal-content-wrapper')}>
          <div className={cx('attachment-image-wrapper')}>
            <a href={image} target="_blank" className={cx('attachment-image')}>
              <img
                ref={this.imageRef}
                className={cx('image-item')}
                style={imageStyle}
                alt="attachment"
                src={image}
              />
            </a>
          </div>
        </div>
      </ModalLayout>
    );
  }
}
