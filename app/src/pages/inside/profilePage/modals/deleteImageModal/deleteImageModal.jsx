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
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { PROFILE_PAGE_EVENTS } from 'components/main/analytics/events';

const messages = defineMessages({
  header: {
    id: 'DeleteImageModal.header',
    defaultMessage: 'Delete image',
  },
  text: {
    id: 'DeleteImageModal.text',
    defaultMessage: 'Are you sure you want to delete profile photo?',
  },
});

@withModal('deleteImageModal')
@injectIntl
@track()
export class DeleteImageModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      onRemove: PropTypes.func,
    }).isRequired,
    intl: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  render() {
    const { intl, data, tracking } = this.props;
    const deleteButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
      danger: true,
      onClick: (closeModal) => {
        tracking.trackEvent(PROFILE_PAGE_EVENTS.DELETE_BTN_DELETE_IMAGE_MODAL);
        data.onRemove();
        closeModal();
      },
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: PROFILE_PAGE_EVENTS.CANCEL_BTN_DELETE_IMAGE_MODAL,
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.header)}
        okButton={deleteButton}
        cancelButton={cancelButton}
        closeIconEventInfo={PROFILE_PAGE_EVENTS.CLOSE_ICON_DELETE_IMAGE_MODAL}
      >
        {intl.formatMessage(messages.text)}
      </ModalLayout>
    );
  }
}
