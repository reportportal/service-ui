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

import {useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLayout, withModal } from 'components/main/modal';
import { ATTACHMENT_VIDEO_MODAL_ID } from 'controllers/log/attachments';
import { messages } from './messages';
import styles from './attachmentVideoModal.scss';

const cx = classNames.bind(styles);

const AttachmentVideoModalComponent = ({ data: { video, fileName } = {}, intl }) => {
  const [isPlaybackError, setIsPlaybackError] = useState(false);
  const { formatMessage } = intl;
  const title = fileName || formatMessage(messages.title);

  useEffect(() => {
    setIsPlaybackError(false);
  }, [video]);

  const renderCancelButton = () => ({
    text: formatMessage(COMMON_LOCALE_KEYS.CLOSE),
    onClick: (closeModal) => closeModal(),
  });

  return (
    <ModalLayout
      title={title}
      cancelButton={renderCancelButton()}
      className={cx('attachment-video-modal')}
      scrollable
    >
      <div className={cx('attachment-modal-content-wrapper')}>
        <div className={cx('attachment-video-wrapper')}>
          {video && !isPlaybackError ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption -- no caption track is available for attachment videos
            <video
              className={cx('video-item')}
              controls
              preload="metadata"
              onError={() => setIsPlaybackError(true)}
            >
              <source src={video} />
              {formatMessage(messages.videoUnsupported)}
            </video>
          ) : (
            <div className={cx('error')}>{formatMessage(messages.videoUnableToLoad)}</div>
          )}
        </div>
      </div>
    </ModalLayout>
  );
};

AttachmentVideoModalComponent.propTypes = {
  data: PropTypes.shape({
    video: PropTypes.string,
    fileName: PropTypes.string,
  }),
  intl: PropTypes.object.isRequired,
};

export const AttachmentVideoModal = withModal(ATTACHMENT_VIDEO_MODAL_ID)(
  injectIntl(AttachmentVideoModalComponent),
);
