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
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { connect } from 'react-redux';
import AttachIcon from 'common/img/attachment-inline.svg';
import { Image } from 'components/main/image';
import { activeProjectSelector } from 'controllers/user';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  openAttachmentInModalAction,
  downloadAttachmentAction,
  getFileIconSource,
  OPEN_ATTACHMENT_IN_MODAL_ACTION,
  isFileActionAllowed,
} from 'controllers/log/attachments';
import { AttachmentActions } from 'pages/inside/logsPage/attachmentActions';
import styles from './attachmentBlock.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
  }),
  {
    openAttachmentInModalAction,
    downloadAttachmentAction,
  },
)
@track()
export class AttachmentBlock extends Component {
  static propTypes = {
    value: PropTypes.object,
    customProps: PropTypes.object,
    openAttachmentInModalAction: PropTypes.func,
    downloadAttachmentAction: PropTypes.func,
    activeProject: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    value: {},
    customProps: {},
    openAttachmentInModalAction: () => {},
    activeProject: '',
  };

  openAttachmentInModal = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.ATTACHMENT_IN_LOG_MSG.OPEN_IN_MODAL);
    this.props.openAttachmentInModalAction(this.props.value);
  };

  downloadAttachment = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.ATTACHMENT_IN_LOG_MSG.DOWNLOAD);
    this.props.downloadAttachmentAction(this.props.value);
  };

  render() {
    const {
      value,
      customProps: { consoleView },
      activeProject,
    } = this.props;
    const isValidToOpenInModal = isFileActionAllowed(
      value.contentType,
      OPEN_ATTACHMENT_IN_MODAL_ACTION,
    );

    return (
      <div className={cx('attachment-block')}>
        {consoleView ? (
          <div onClick={this.downloadAttachment} className={cx('attachment', 'console-view')}>
            {Parser(AttachIcon)}
          </div>
        ) : (
          <Fragment>
            <Image
              className={cx('attachment')}
              src={getFileIconSource(value, activeProject, true)}
              alt={value.contentType}
              onClick={isValidToOpenInModal ? this.openAttachmentInModal : null}
            />
            <AttachmentActions
              value={value}
              className={cx('actions')}
              events={LOG_PAGE_EVENTS.ATTACHMENT_IN_LOG_MSG}
            />
          </Fragment>
        )}
      </div>
    );
  }
}
