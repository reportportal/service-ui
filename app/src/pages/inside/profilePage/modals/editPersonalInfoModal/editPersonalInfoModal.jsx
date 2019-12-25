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
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { commonValidators } from 'common/utils/validation';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { reduxForm } from 'redux-form';
import { Input } from 'components/inputs/input';
import { PROFILE_PAGE_EVENTS } from 'components/main/analytics/events';
import classNames from 'classnames/bind';
import styles from './editPersonalInfoModal.scss';

const LABEL_WIDTH = 90;
const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'EditPersonalInformationModal.header',
    defaultMessage: 'Edit personal information',
  },
  namePlaceholder: {
    id: 'EditPersonalInformationModal.namePlaceholder',
    defaultMessage: 'Enter user name',
  },
  emailPlaceholder: {
    id: 'EditPersonalInformationModal.emailPlaceholder',
    defaultMessage: 'Enter email',
  },
  nameLabel: {
    id: 'EditPersonalInformationModal.nameLabel',
    defaultMessage: 'User name',
  },
  emailLabel: {
    id: 'EditPersonalInformationModal.emailLabel',
    defaultMessage: 'Email',
  },
});

@withModal('editPersonalInformationModal')
@injectIntl
@reduxForm({
  form: 'editModal',
  validate: ({ name, email }) => ({
    name: commonValidators.userName(name),
    email: commonValidators.email(email),
  }),
})
@track()
export class EditPersonalInformationModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      onEdit: PropTypes.func,
      info: PropTypes.object,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  componentDidMount() {
    this.props.initialize(this.props.data.info);
  }

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  editAndCloseModal = (closeModal) => (formData) => {
    this.props.data.info.email !== formData.email &&
      this.props.tracking.trackEvent(PROFILE_PAGE_EVENTS.EDIT_EMAIL_EDIT_PERSONAL_INFO_MODAL);
    this.props.data.info.name !== formData.name &&
      this.props.tracking.trackEvent(PROFILE_PAGE_EVENTS.EDIT_USER_NAME_EDIT_PERSONAL_INFO_MODAL);
    this.props.data.onEdit(formData);
    closeModal();
  };

  render() {
    const { intl, handleSubmit, tracking } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.SUBMIT),
      onClick: (closeModal) => {
        tracking.trackEvent(PROFILE_PAGE_EVENTS.SUBMIT_BTN_EDIT_PERSONAL_INFO_MODAL);
        handleSubmit(this.editAndCloseModal(closeModal))();
      },
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: PROFILE_PAGE_EVENTS.CANCEL_BTN_EDIT_PERSONAL_INFO_MODAL,
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.header)}
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={PROFILE_PAGE_EVENTS.CLOSE_ICON_EDIT_PERSONAL_INFO_MODAL}
        closeConfirmation={this.getCloseConfirmationConfig()}
      >
        <form className={cx('form')}>
          <ModalField label={intl.formatMessage(messages.nameLabel)} labelWidth={LABEL_WIDTH}>
            <FieldProvider name="name">
              <FieldErrorHint>
                <Input placeholder={intl.formatMessage(messages.namePlaceholder)} type="text" />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField label={intl.formatMessage(messages.emailLabel)} labelWidth={LABEL_WIDTH}>
            <FieldProvider name="email">
              <FieldErrorHint>
                <Input
                  maxLength="128"
                  placeholder={intl.formatMessage(messages.emailPlaceholder)}
                  type="text"
                />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
