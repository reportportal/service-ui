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
import { formValueSelector, change } from 'redux-form';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import classNames from 'classnames/bind';
import { withModal, ModalLayout } from 'components/main/modal';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import {
  GITHUB_AUTH_FORM,
  ORGANIZATIONS_KEY,
  CLIENT_SECRET_KEY,
  CLIENT_ID_KEY,
} from '../../forms/githubAuthForm/constants';
import { joinOrganizations } from '../../forms/githubAuthForm/utils';
import styles from './removeOrganizationModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  removeOrganizationHeader: {
    id: 'RemoveOrganizationModal.removeOrganizationHeader',
    defaultMessage: 'Delete github organization',
  },
  contentHeaderMessage: {
    id: 'RemoveOrganizationModal.contentHeaderMessage',
    defaultMessage:
      'Are you sure you want to delete selected organization? All assigned users could not be able to login Report Portal.',
  },
  removeSuccessNotification: {
    id: 'RemoveOrganizationModal.removeSuccessNotification',
    defaultMessage: 'GitHub organization has been deleted',
  },
});

@withModal('removeOrganizationModal')
@connect(
  (state) => ({
    formData: formValueSelector(GITHUB_AUTH_FORM)(
      state,
      ORGANIZATIONS_KEY,
      CLIENT_ID_KEY,
      CLIENT_SECRET_KEY,
    ),
  }),
  { showNotification, change },
)
@injectIntl
export class RemoveOrganizationModal extends Component {
  static propTypes = {
    intl: PropTypes.object,
    formData: PropTypes.object.isRequired,
    data: PropTypes.object,
    change: PropTypes.func,
    showNotification: PropTypes.func,
  };
  static defaultProps = {
    intl: {},
    data: {},
    change: () => {},
    showNotification: () => {},
  };

  onClickRemove = (closeModal) => {
    const { data, formData } = this.props;
    const filteredOrganizations = formData.restrictions.organizations.filter(
      (item) => item.organization !== data.organizationForRemove,
    );
    const organizations = joinOrganizations(filteredOrganizations);
    const dataToSend = {
      ...formData,
      restrictions: {
        organizations,
      },
    };
    fetch(URLS.githubAuthSettings(), { method: 'PUT', data: dataToSend })
      .then(() => {
        this.props.data.onConfirm();
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.removeSuccessNotification),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch((err) => {
        this.props.showNotification({ message: err.msg, type: NOTIFICATION_TYPES.ERROR });
      });
    closeModal();
  };

  render() {
    const okButton = {
      text: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
      danger: true,
      onClick: this.onClickRemove,
    };
    const cancelButton = {
      text: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };

    return (
      <ModalLayout
        title={this.props.intl.formatMessage(messages.removeOrganizationHeader)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <p className={cx('modal-content-header')}>
          {this.props.intl.formatMessage(messages.contentHeaderMessage)}
        </p>
      </ModalLayout>
    );
  }
}
