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
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { DEFAULT_HIGHLIGHT_STYLE } from 'common/constants/hightLightStyle';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { ModalLayout, withModal } from 'components/main/modal';
import { ATTACHMENT_CODE_MODAL_ID } from 'controllers/log/attachments';
import { messages } from './messages';

@withModal(ATTACHMENT_CODE_MODAL_ID)
@injectIntl
@track()
export class AttachmentCodeModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      extension: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
    }).isRequired,
    intl: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
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
