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
import { ModalLayout, withModal } from 'components/main/modal';
import { injectIntl, defineMessages } from 'react-intl';

const messages = defineMessages({
  changeAccountRoleText: {
    id: 'ChangeProjectRoleModal.changeAccountRoleText',
    defaultMessage: "Are you sure you want to change the account role for the ''{name}''?",
  },
  changeAccountRoleTitle: {
    id: 'ChangeProjectRoleModal.changeAccountRoleTitle',
    defaultMessage: 'Change role',
  },
  submitText: { id: 'ChangeProjectRoleModal.submitText', defaultMessage: 'Change' },
  cancelText: { id: 'ChangeProjectRoleModal.cancelText', defaultMessage: 'Cancel' },
});

@withModal('allUsersChangeProjectRoleModal')
@injectIntl
export class ChangeProjectRoleModal extends Component {
  static propTypes = {
    data: PropTypes.object,
    intl: PropTypes.object.isRequired,
  };

  static defaultProps = {
    data: {},
  };

  render() {
    const { onSubmit, name, eventsInfo } = this.props.data;
    const { intl } = this.props;

    return (
      <ModalLayout
        title={intl.formatMessage(messages.changeAccountRoleTitle)}
        okButton={{
          text: intl.formatMessage(messages.submitText),
          danger: false,
          onClick: (closeModal) => {
            closeModal();
            onSubmit();
          },
          eventInfo: eventsInfo.changeBtn,
        }}
        cancelButton={{
          text: intl.formatMessage(messages.cancelText),
          eventInfo: eventsInfo.cancelBtn,
        }}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <div>{intl.formatMessage(messages.changeAccountRoleText, { name })}</div>
      </ModalLayout>
    );
  }
}
