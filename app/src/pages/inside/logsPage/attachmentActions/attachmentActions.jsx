/*
 * Copyright 2020 EPAM Systems
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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import track from 'react-tracking';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  DOWNLOAD_ATTACHMENT_ACTION,
  downloadAttachmentAction,
  isFileActionAllowed,
  OPEN_ATTACHMENT_IN_BROWSER_ACTION,
  openAttachmentInBrowserAction,
} from 'controllers/log/attachments';
import OpenInIcon from 'common/img/open-in-inline.svg';
import DownloadIcon from 'common/img/download-inline.svg';
import { ActionsItem } from './actionsItem';
import styles from './attachmentActions.scss';

const cx = classNames.bind(styles);

@connect(null, {
  downloadAttachmentAction,
  openAttachmentInBrowserAction,
})
@track()
@injectIntl
export class AttachmentActions extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    value: PropTypes.object,
    className: PropTypes.string,
    downloadAttachmentAction: PropTypes.func,
    openAttachmentInBrowserAction: PropTypes.func,
    showCaptions: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    events: PropTypes.object,
  };

  static defaultProps = {
    value: {},
    className: '',
    showCaptions: false,
    events: {},
  };

  constructor(props) {
    super(props);
    const {
      intl: { formatMessage },
      value,
    } = props;

    this.actionsConfig = [
      {
        id: OPEN_ATTACHMENT_IN_BROWSER_ACTION,
        icon: OpenInIcon,
        caption: formatMessage(COMMON_LOCALE_KEYS.OPEN_IN_NEW_TAB),
        action: this.openAttachmentInNewTab,
        hidden: !isFileActionAllowed(value.contentType, OPEN_ATTACHMENT_IN_BROWSER_ACTION),
      },
      {
        id: DOWNLOAD_ATTACHMENT_ACTION,
        icon: DownloadIcon,
        caption: formatMessage(COMMON_LOCALE_KEYS.DOWNLOAD),
        action: this.downloadAttachment,
        hidden: !isFileActionAllowed(value.contentType, DOWNLOAD_ATTACHMENT_ACTION),
      },
    ];
  }

  downloadAttachment = () => {
    const { events, tracking, value } = this.props;

    tracking.trackEvent(events.DOWNLOAD);
    this.props.downloadAttachmentAction(value);
  };

  openAttachmentInNewTab = () => {
    const { events, tracking, value } = this.props;

    tracking.trackEvent(events.OPEN_IN_NEW_TAB);
    this.props.openAttachmentInBrowserAction(value.id);
  };

  render() {
    const { className, showCaptions } = this.props;

    return (
      <div className={cx('attachment-actions', className)}>
        {this.actionsConfig.map(({ id, ...actionConfig }) => (
          <ActionsItem key={id} showCaption={showCaptions} {...actionConfig} />
        ))}
      </div>
    );
  }
}
