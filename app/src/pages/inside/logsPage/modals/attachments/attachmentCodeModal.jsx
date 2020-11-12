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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import track from 'react-tracking';
import { injectIntl } from 'react-intl';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import OpenInIcon from 'common/img/open-in-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { DEFAULT_HIGHLIGHT_STYLE } from 'common/constants/hightLightStyle';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { ModalLayout, withModal } from 'components/main/modal';
import {
  ATTACHMENT_CODE_MODAL_ID,
  openAttachmentInBrowserAction,
} from 'controllers/log/attachments';
import { ActionsItem } from '../../attachmentActions/actionsItem';
import { messages } from './messages';

@withModal(ATTACHMENT_CODE_MODAL_ID)
@connect(null, { openAttachmentInBrowserAction })
@injectIntl
@track()
export class AttachmentCodeModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      extension: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
    }).isRequired,
    intl: PropTypes.object.isRequired,
    openAttachmentInBrowserAction: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  renderCustomButton = () => (
    <ActionsItem
      icon={OpenInIcon}
      action={this.openInNewTab}
      caption={this.props.intl.formatMessage(COMMON_LOCALE_KEYS.OPEN_IN_NEW_TAB)}
      showCaption
    />
  );

  openInNewTab = () => {
    this.props.openAttachmentInBrowserAction(this.props.data.id);
  };

  render() {
    const {
      intl,
      data: { extension, content },
    } = this.props;
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE),
      eventInfo: LOG_PAGE_EVENTS.CLOSE_BTN_ATTACHMENT_MODAL,
    };

    return (
      <ModalLayout
        closeIconEventInfo={LOG_PAGE_EVENTS.CLOSE_ICON_ATTACHMENT_MODAL}
        title={intl.formatMessage(messages.title)}
        cancelButton={cancelButton}
        renderFooterElements={this.renderCustomButton}
      >
        <form>
          <SyntaxHighlighter
            language={extension}
            style={atomOneLight}
            customStyle={DEFAULT_HIGHLIGHT_STYLE}
          >
            {content}
          </SyntaxHighlighter>
        </form>
      </ModalLayout>
    );
  }
}
