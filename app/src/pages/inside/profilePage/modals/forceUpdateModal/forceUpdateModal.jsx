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
import { defineMessages, injectIntl } from 'react-intl';
import { userInfoSelector, userIdSelector } from 'controllers/user';
import { ModalLayout, withModal } from 'components/main/modal';

const messages = defineMessages({
  header: {
    id: 'ForceUpdateModal.header',
    defaultMessage: 'Warning!',
  },
  text: {
    id: 'ForceUpdateModal.text',
    defaultMessage:
      "Update data from {account}: Information for user ''{user}'' has been successfully synchronized.",
  },
  additionalText: {
    id: 'ForceUpdateModal.additionalText',
    defaultMessage: 'Please relogin to apply changes!',
  },
  relogin: {
    id: 'ForceUpdateModal.relogin',
    defaultMessage: 'Relogin',
  },
});

@withModal('forceUpdateModal')
@connect((state) => ({
  accountType: userInfoSelector(state).accountType,
  user: userIdSelector(state),
}))
@injectIntl
export class ForceUpdateModal extends Component {
  static propTypes = {
    accountType: PropTypes.string,
    user: PropTypes.string,
    data: PropTypes.shape({
      onForceUpdate: PropTypes.func,
    }).isRequired,
    intl: PropTypes.object.isRequired,
  };
  static defaultProps = {
    accountType: '',
    user: '',
  };
  render() {
    const { intl, data } = this.props;
    const reloginButton = {
      text: intl.formatMessage(messages.relogin),
      onClick: (closeModal) => {
        data.onForceUpdate();
        closeModal();
      },
    };
    return (
      <ModalLayout title={intl.formatMessage(messages.header)} okButton={reloginButton}>
        {intl.formatMessage(messages.text, {
          account: this.props.accountType,
          user: this.props.user,
        })}
      </ModalLayout>
    );
  }
}
