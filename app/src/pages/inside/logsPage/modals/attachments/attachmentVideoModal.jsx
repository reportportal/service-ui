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
import track from 'react-tracking';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLayout, withModal } from 'components/main/modal';
import { ATTACHMENT_VIDEO_MODAL_ID } from 'controllers/log/attachments';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { messages } from './messages';
import styles from './attachmentVideoModal.scss';

const cx = classNames.bind(styles);

@withModal(ATTACHMENT_VIDEO_MODAL_ID)
@track()
@injectIntl
export class AttachmentVideoModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      video: PropTypes.string,
    }).isRequired,
    intl: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  renderCancelButton = () => ({
    text: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE),
    eventInfo: LOG_PAGE_EVENTS.CLOSE_BTN_ATTACHMENT_MODAL,
    onClick: (closeModal) => closeModal(),
  });

  render() {
    const {
      intl: { formatMessage },
      data: { video },
    } = this.props;

    return (
      <ModalLayout
        title={formatMessage(messages.title)}
        cancelButton={this.renderCancelButton()}
        className={cx('attachment-video-modal')}
        closeIconEventInfo={LOG_PAGE_EVENTS.CLOSE_ICON_ATTACHMENT_MODAL}
      >
        <div className={cx('attachment-modal-content-wrapper')}>
          <div className={cx('attachment-video-wrapper')}>
            <a className={cx('attachment-video')}>
              <video controls className={cx('video-item')}>
                <source src={video} type="video/mp4" />
                  Your browser does not support the video tag.
              </video>
            </a>
          </div>
        </div>
      </ModalLayout>
    );
  }
}
