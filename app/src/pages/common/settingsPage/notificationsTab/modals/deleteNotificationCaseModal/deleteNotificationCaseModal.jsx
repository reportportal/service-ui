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
import className from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLayout, withModal } from 'components/main/modal';
import styles from './deleteNotificationCaseModal.scss';

const cx = className.bind(styles);

const messages = defineMessages({
  title: {
    id: 'DeleteNotificationCaseModal.title',
    defaultMessage: 'Delete Notification Rule',
  },
  message: {
    id: 'DeleteNotificationCaseModal.message',
    defaultMessage: 'Are you sure you want to delete notification rule <b>{number}</b>?',
  },
});

@withModal('deleteNotificationCaseModal')
@injectIntl
export class DeleteNotificationCaseModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.object,
  };

  static defaultProps = {
    data: {},
  };

  render() {
    const {
      intl,
      data: { id, onConfirm, eventsInfo },
    } = this.props;
    return (
      <ModalLayout
        title={intl.formatMessage(messages.title)}
        okButton={{
          text: intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
          danger: true,
          onClick: () => {
            onConfirm();
          },
          eventInfo: eventsInfo.deleteBtn,
        }}
        cancelButton={{
          text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
          eventInfo: eventsInfo.cancelBtn,
        }}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <div className={cx('message')}>
          {Parser(intl.formatMessage(messages.message, { number: id + 1 }))}
        </div>
      </ModalLayout>
    );
  }
}
