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
import { reduxForm } from 'redux-form';
import className from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { validate, bindMessageToValidator } from 'common/utils/validation';
import { NotificationCaseFormFields } from './notificationCaseFormFields';
import styles from './addEditNotificationCaseModal.scss';
import { ENABLED_FIELD_KEY } from '../../constants';

const cx = className.bind(styles);

const messages = defineMessages({
  title: {
    id: 'AddEditNotificationCaseModal.title',
    defaultMessage: '{actionType} Notification Rule',
  },
  addRuleMessage: {
    id: 'AddEditNotificationCaseModal.newRuleMessage',
    defaultMessage: 'Add',
  },
  editRuleMessage: {
    id: 'AddEditNotificationCaseModal.editRuleMessage',
    defaultMessage: 'Edit',
  },
  active: {
    id: 'PatternAnalysis.active',
    defaultMessage: 'Active',
  },
});

@withModal('addEditNotificationCaseModal')
@reduxForm({
  form: 'notificationCaseForm',
  validate: ({ recipients, informOwner, launchNames, attributes }) => ({
    recipients: bindMessageToValidator(
      validate.createNotificationRecipientsValidator(informOwner),
      'recipientsHint',
    )(recipients),
    attributes: !validate.attributesArray(attributes),
    launchNames: bindMessageToValidator(
      validate.notificationLaunchNames,
      'launchesHint',
    )(launchNames),
  }),
})
@injectIntl
export class AddEditNotificationCaseModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      notificationCase: PropTypes.object,
      onConfirm: PropTypes.func,
      isNewCase: PropTypes.bool,
      eventsInfo: PropTypes.object,
    }),
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    data: {},
  };

  componentDidMount() {
    this.props.initialize(this.props.data.notificationCase);
  }

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  renderHeaderElements = () => (
    <div className={cx('header-active-switcher-container')}>
      <div className={cx('header-active-switcher')}>
        <FieldProvider name={ENABLED_FIELD_KEY} format={(value) => !!value}>
          <InputSwitcher />
        </FieldProvider>
      </div>
      <div className={cx('header-active-switcher-label')}>
        {this.props.intl.formatMessage(messages.active)}
      </div>
    </div>
  );

  render() {
    const {
      intl: { formatMessage },
      data: { isNewCase, onConfirm, eventsInfo },
      handleSubmit,
    } = this.props;

    return (
      <ModalLayout
        title={formatMessage(messages.title, {
          actionType: formatMessage(isNewCase ? messages.addRuleMessage : messages.editRuleMessage),
        })}
        okButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
          onClick: () => {
            handleSubmit(onConfirm)();
          },
          eventInfo: eventsInfo.saveBtn,
        }}
        cancelButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
          eventInfo: eventsInfo.cancelBtn,
        }}
        closeConfirmation={this.getCloseConfirmationConfig()}
        className={cx('add-edit-notification-case-modal')}
        closeIconEventInfo={eventsInfo.closeIcon}
        renderHeaderElements={this.renderHeaderElements}
      >
        <NotificationCaseFormFields />
      </ModalLayout>
    );
  }
}
