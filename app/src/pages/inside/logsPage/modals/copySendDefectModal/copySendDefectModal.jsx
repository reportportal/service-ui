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
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import { activeProjectSelector } from 'controllers/user';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';

const MESSAGE_TYPES = {
  button: 'button',
  header: 'header',
  content: 'content',
};

const messages = defineMessages({
  headerCopyTitle: {
    id: 'CopySendDefectModal.headerCopyTitle',
    defaultMessage: 'Receive previous result',
  },
  headerSendTitle: {
    id: 'CopySendDefectModal.headerSendTitle',
    defaultMessage: 'Send defect to the last item',
  },
  buttonCopyTitle: {
    id: 'CopySendDefectModal.buttonCopyTitle',
    defaultMessage: 'Receive',
  },
  buttonSendTitle: {
    id: 'CopySendDefectModal.buttonSendTitle',
    defaultMessage: 'Send',
  },
  contentCopyTitle: {
    id: 'CopySendDefectModal.contentCopyTitle',
    defaultMessage: 'Are you sure to receive defect data from previous failed item?',
  },
  contentSendTitle: {
    id: 'CopySendDefectModal.contentSendTitle',
    defaultMessage: 'Are you sure to send defect data to the last item?',
  },
  successMessage: {
    id: 'CopySendDefectModal.successMessage',
    defaultMessage: 'Defects have been updated',
  },
});

@withModal('copySendDefectModal')
@injectIntl
@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
  }),
  {
    showNotification,
  },
)
export class CopySendDefectModal extends Component {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      lastHistoryItem: PropTypes.object,
      itemForCopy: PropTypes.object,
      isCopy: PropTypes.bool,
      fetchFunc: PropTypes.func,
      eventsInfo: PropTypes.object,
    }).isRequired,
  };

  onInclude = (closeModal) => {
    const {
      intl,
      activeProject,
      data: { lastHistoryItem, itemForCopy, fetchFunc },
    } = this.props;

    const issues = [
      {
        issue: {
          ...itemForCopy.issue,
          autoAnalyzed: false,
          externalSystemIssues: itemForCopy.issue.externalSystemIssues || [],
        },
        testItemId: lastHistoryItem.id,
      },
    ];

    fetch(URLS.testItem(activeProject), {
      method: 'put',
      data: {
        issues,
      },
    }).then(() => {
      fetchFunc();
      this.props.showNotification({
        message: intl.formatMessage(messages.successMessage),
        type: NOTIFICATION_TYPES.SUCCESS,
      });
      closeModal();
    });
  };

  getTitle = (messageType) => {
    const {
      intl,
      data: { isCopy },
    } = this.props;
    return isCopy
      ? intl.formatMessage(messages[`${messageType}CopyTitle`])
      : intl.formatMessage(messages[`${messageType}SendTitle`]);
  };

  render() {
    const {
      intl,
      data: { eventsInfo },
    } = this.props;
    const okButton = {
      text: this.getTitle(MESSAGE_TYPES.button),
      danger: true,
      onClick: this.onInclude,
      eventInfo: eventsInfo.okBtn,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: eventsInfo.cancelBtn,
    };

    return (
      <ModalLayout
        title={this.getTitle(MESSAGE_TYPES.header)}
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={eventsInfo.cancelBtn}
      >
        {this.getTitle(MESSAGE_TYPES.content)}
      </ModalLayout>
    );
  }
}
