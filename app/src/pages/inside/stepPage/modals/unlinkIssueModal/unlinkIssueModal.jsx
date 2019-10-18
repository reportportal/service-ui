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
import track from 'react-tracking';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import { activeProjectSelector } from 'controllers/user';
import { ModalLayout, withModal } from 'components/main/modal';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';

const messages = defineMessages({
  unlinkButton: {
    id: 'UnlinkIssueModal.unlinkButton',
    defaultMessage: 'Unlink',
  },
  title: {
    id: 'UnlinkIssueModal.title',
    defaultMessage: 'Unlink issue',
  },
  unlinkModalConfirmationText: {
    id: 'UnlinkIssueModal.unlinkModalConfirmationText',
    defaultMessage: 'Are you sure to unlink issue/s for test items?',
  },
  unlinkSuccessMessage: {
    id: 'UnlinkIssueModal.unlinkSuccessMessage',
    defaultMessage: 'Completed successfully!',
  },
});

@withModal('unlinkIssueModal')
@injectIntl
@connect(
  (state) => ({
    url: URLS.testItemsUnlinkIssues(activeProjectSelector(state)),
  }),
  {
    showNotification,
  },
)
@track()
export class UnlinkIssueModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    url: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    data: PropTypes.shape({
      items: PropTypes.array,
      fetchFunc: PropTypes.func,
      eventsInfo: PropTypes.object,
    }).isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  onUnlink = (closeModal) => {
    const {
      intl,
      url,
      data: { items, fetchFunc },
      tracking: { trackEvent },
    } = this.props;
    trackEvent(STEP_PAGE_EVENTS.UNLINK_BTN_UNLINK_ISSUE_MODAL);
    const dataToSend = items.reduce(
      (acc, item) => {
        acc.testItemIds.push(item.id);
        acc.ticketIds = acc.ticketIds.concat(
          item.issue.externalSystemIssues.map((issue) => issue.ticketId),
        );
        return acc;
      },
      {
        ticketIds: [],
        testItemIds: [],
      },
    );

    fetch(url, {
      method: 'put',
      data: dataToSend,
    })
      .then(() => {
        fetchFunc();
        closeModal();
        this.props.showNotification({
          message: intl.formatMessage(messages.unlinkSuccessMessage),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(showDefaultErrorNotification);
  };

  render() {
    const { intl } = this.props;
    const okButton = {
      text: intl.formatMessage(messages.unlinkButton),
      onClick: this.onUnlink,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: STEP_PAGE_EVENTS.CANCEL_BTN_UNLINK_ISSUE_MODAL,
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.title)}
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={STEP_PAGE_EVENTS.CLOSE_ICON_UNLINK_ISSUE_MODAL}
      >
        {intl.formatMessage(messages.unlinkModalConfirmationText)}
      </ModalLayout>
    );
  }
}
