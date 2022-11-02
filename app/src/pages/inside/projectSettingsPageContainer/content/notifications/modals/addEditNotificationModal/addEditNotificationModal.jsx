/*
 * Copyright 2022 EPAM Systems
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

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { useTracking } from 'react-tracking';
import { useDispatch } from 'react-redux';
import className from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { withModal } from 'components/main/modal';
import { ModalLayout } from 'componentLibrary/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { bindMessageToValidator, commonValidators, validate } from 'common/utils/validation';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Toggle } from 'componentLibrary/toggle';
import { URLS } from 'common/urls';
import { Dropdown } from 'componentLibrary/dropdown';
import { hideModalAction } from 'controllers/modal';
import { FieldText } from 'componentLibrary/fieldText';
import { Checkbox } from 'componentLibrary/checkbox';
import { PROJECT_SETTINGS_NOTIFICATIONS_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { AttributeListFormField } from 'components/containers/AttributeListFormField';
import { RecipientsContainer } from './recipientsContainer';
import { LaunchNamesContainer } from './launchNamesContainer';
import { FieldElement } from '../../../elements';
import {
  ATTRIBUTES_FIELD_KEY,
  ENABLED_FIELD_KEY,
  INFORM_OWNER_FIELD_KEY,
  LAUNCH_CASES,
  LAUNCH_NAMES_FIELD_KEY,
  RECIPIENTS_FIELD_KEY,
  RULE_NAME_FIELD_KEY,
  SEND_CASE_FIELD_KEY,
} from '../../constants';
import styles from './addEditNotificationModal.scss';

const cx = className.bind(styles);

const messages = defineMessages({
  title: {
    id: 'AddEditNotificationCaseModal.title',
    defaultMessage: '{actionType} Notification Rule',
  },
  description: {
    id: 'AddEditNotificationCaseModal.description',
    defaultMessage: 'Select conditions to create a notification rule',
  },
  add: {
    id: 'AddEditNotificationCaseModal.newRuleMessage',
    defaultMessage: 'Create',
  },
  edit: {
    id: 'AddEditNotificationCaseModal.editRuleMessage',
    defaultMessage: 'Edit',
  },
  copy: {
    id: 'AddEditNotificationCaseModal.copyRuleMessage',
    defaultMessage: 'Duplicate',
  },
  active: {
    id: 'AddEditNotificationCaseModal.active',
    defaultMessage: 'Active Rule',
  },
  recipientsLabel: {
    id: 'AddEditNotificationCaseModal.recipientsLabel',
    defaultMessage: 'Recipients',
  },
  nameLabel: {
    id: 'AddEditNotificationModal.nameLabel',
    defaultMessage: 'Rule Name',
  },
  namePlaceholder: {
    id: 'AddEditNotificationModal.namePlaceholder',
    defaultMessage: 'Rule name',
  },
  launchOwnerLabel: {
    id: 'AddEditNotificationCaseModal.launchOwnerLabel',
    defaultMessage: 'Launch owner (who launched - that receives)',
  },
  inCaseLabel: {
    id: 'AddEditNotificationCaseModal.inCaseLabel',
    defaultMessage: 'In case',
  },
  launchNamesLabel: {
    id: 'AddEditNotificationCaseModal.launchNamesLabel',
    defaultMessage: 'Launch names',
  },
  launchNamesHint: {
    id: 'AddEditNotificationCaseModal.launchNamesHint',
    defaultMessage: 'Launch name should have size from 1 to 256',
  },
  attributesLabel: {
    id: 'AddEditNotificationCaseModal.attributesLabel',
    defaultMessage: 'Attributes',
  },
  attributesNote: {
    id: 'AddEditNotificationCaseModal.attributesNote',
    defaultMessage: 'Send notifications about launches containing specified attributes',
  },
  attributesNotActive: {
    id: 'AddEditNotificationCaseModal.attributesNotActive',
    defaultMessage: 'Attributes are non active. To activate please select checkbox ‘Attributes’',
  },
  addAttribute: {
    id: 'AddEditNotificationCaseModal.addAttribute',
    defaultMessage: 'Add Attribute',
  },
  [LAUNCH_CASES.ALWAYS]: {
    id: 'AddEditNotificationCaseModal.dropdownValueAlways',
    defaultMessage: 'Always',
  },
  [LAUNCH_CASES.MORE_10]: {
    id: 'AddEditNotificationCaseModal.dropdownValueMore10',
    defaultMessage: '> 10% of items have issues',
  },
  [LAUNCH_CASES.MORE_20]: {
    id: 'AddEditNotificationCaseModal.dropdownValueMore20',
    defaultMessage: '> 20% of items have issues',
  },
  [LAUNCH_CASES.MORE_50]: {
    id: 'AddEditNotificationCaseModal.dropdownValueMore50',
    defaultMessage: '> 50% of items have issues',
  },
  [LAUNCH_CASES.FAILED]: {
    id: 'AddEditNotificationCaseModal.dropdownValueFailed',
    defaultMessage: 'Launch has issues',
  },
  [LAUNCH_CASES.TO_INVESTIGATE]: {
    id: 'AddEditNotificationCaseModal.dropdownValueToInvestigate',
    defaultMessage: 'Launch has "To Investigate" items',
  },
  controlPanelName: {
    id: 'AddEditNotificationCaseModal.controlPanelName',
    defaultMessage: 'Rule',
  },
  noItemsMessage: {
    id: 'NoCasesBlock.noItemsMessage',
    defaultMessage: 'No Email Notification Rules',
  },
  notificationsInfo: {
    id: 'NoCasesBlock.notificationsInfo',
    defaultMessage: 'Once a launch is finished system will notify selected people by email',
  },
  create: {
    id: 'AddNewCaseButton.addNewRuleButton',
    defaultMessage: 'Create Rule',
  },
  toggleLabel: {
    id: 'NotificationsEnableForm.toggleNotificationsLabel',
    defaultMessage: 'E-mail notification',
  },
  toggleNote: {
    id: 'NotificationsEnableForm.toggleNotificationsNote',
    defaultMessage: 'Send email notifications on launch finish',
  },
  attributes: {
    id: 'NotificationsEnableForm.attributes',
    defaultMessage: 'Attributes',
  },
});

const FIELD = 'Field';

const AddEditNotificationModal = ({
  data,
  data: { onSave },
  handleSubmit,
  initialize,
  change,
  dirty,
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();

  const [isEditorShown, setShowEditor] = React.useState(data.notification.attributes.length > 0);
  useEffect(() => {
    initialize(data.notification);
  }, []);

  const caseOptions = [
    {
      value: LAUNCH_CASES.ALWAYS,
      label: formatMessage(messages[LAUNCH_CASES.ALWAYS]),
    },
    {
      value: LAUNCH_CASES.MORE_10,
      label: formatMessage(messages[LAUNCH_CASES.MORE_10]),
    },
    {
      value: LAUNCH_CASES.MORE_20,
      label: formatMessage(messages[LAUNCH_CASES.MORE_20]),
    },
    {
      value: LAUNCH_CASES.MORE_50,
      label: formatMessage(messages[LAUNCH_CASES.MORE_50]),
    },
    {
      value: LAUNCH_CASES.FAILED,
      label: formatMessage(messages[LAUNCH_CASES.FAILED]),
    },
    {
      value: LAUNCH_CASES.TO_INVESTIGATE,
      label: formatMessage(messages[LAUNCH_CASES.TO_INVESTIGATE]),
    },
  ];

  const { actionType } = data;

  const submitActions = (formFieldValues) => {
    const modalName = `${messages.title.defaultMessage.replace(
      /\{.*\}/i,
      messages[actionType].defaultMessage,
    )}`;

    const newFormValues = {
      ...formFieldValues,
      attributes: !isEditorShown ? [] : formFieldValues.attributes,
    };

    const {
      informOwner,
      sendCase,
      enabled: switcher,
      attributes: { length },
    } = newFormValues;

    const eventParameters = {
      modalName,
      status: informOwner,
      type: messages[sendCase].defaultMessage,
      switcher,
      number: isEditorShown ? length : undefined,
    };

    trackEvent(PROJECT_SETTINGS_NOTIFICATIONS_EVENTS.CLICK_SAVE_BUTTON_IN_MODAL(eventParameters));
    onSave(newFormValues);
  };

  const okButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
    onClick: () => {
      handleSubmit(submitActions)();
    },
  };

  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <ModalLayout
      title={formatMessage(messages.title, {
        actionType: formatMessage(messages[data.actionType]),
      })}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
      allowCloseOutside={!dirty}
      footerNode={
        <FieldProvider name={ENABLED_FIELD_KEY} format={(value) => !!value}>
          <Toggle className={cx('toggle')} dataAutomationId="enabledToggle">
            {formatMessage(messages.active)}
          </Toggle>
        </FieldProvider>
      }
    >
      {formatMessage(messages.description)}
      <div className={cx('content')}>
        <FieldProvider name={RULE_NAME_FIELD_KEY} type="text">
          <FieldErrorHint provideHint={false} dataAutomationId={RULE_NAME_FIELD_KEY + FIELD}>
            <FieldText label={formatMessage(messages.nameLabel)} defaultWidth={false} isRequired />
          </FieldErrorHint>
        </FieldProvider>
        <FieldElement
          name={RECIPIENTS_FIELD_KEY}
          className={cx('autocomplete')}
          type="text"
          label={formatMessage(messages.recipientsLabel)}
          dataAutomationId={RECIPIENTS_FIELD_KEY + FIELD}
        >
          <FieldErrorHint provideHint={false}>
            <RecipientsContainer />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name={INFORM_OWNER_FIELD_KEY}
          type="text"
          className={cx('checkbox')}
          dataAutomationId={INFORM_OWNER_FIELD_KEY + FIELD}
        >
          <Checkbox>{formatMessage(messages.launchOwnerLabel)}</Checkbox>
        </FieldElement>
        <FieldElement
          label={formatMessage(messages.inCaseLabel)}
          name={SEND_CASE_FIELD_KEY}
          type="text"
          className={cx('input')}
          dataAutomationId={SEND_CASE_FIELD_KEY + FIELD}
        >
          <Dropdown options={caseOptions} defaultWidth={false} />
        </FieldElement>
        <FieldElement
          label={formatMessage(messages.launchNamesLabel)}
          name={LAUNCH_NAMES_FIELD_KEY}
          className={cx('launches')}
          dataAutomationId={LAUNCH_NAMES_FIELD_KEY + FIELD}
        >
          <FieldErrorHint hintType="top">
            <LaunchNamesContainer highlightUnStoredItem={actionType === 'add'} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name={ATTRIBUTES_FIELD_KEY}
          disabled={!isEditorShown}
          dataAutomationId={ATTRIBUTES_FIELD_KEY + FIELD}
        >
          <AttributeListFormField
            keyURLCreator={URLS.launchAttributeKeysSearch}
            valueURLCreator={URLS.launchAttributeValuesSearch}
            newAttrMessage={formatMessage(messages.addAttribute)}
            attributesListClassname={cx('attributes-list')}
            defaultOpen={isEditorShown}
            setShowEditor={setShowEditor}
            shown={isEditorShown}
            changeValue={change}
          />
        </FieldElement>
      </div>
    </ModalLayout>
  );
};
AddEditNotificationModal.propTypes = {
  data: PropTypes.shape({
    notification: PropTypes.object,
    notifications: PropTypes.array,
    onSave: PropTypes.func,
    eventsInfo: PropTypes.object,
    actionType: PropTypes.string,
  }),
  initialize: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  change: PropTypes.func.isRequired,
};
AddEditNotificationModal.defaultProps = {
  data: {},
  dirty: false,
};

export default withModal('addEditNotificationModal')(
  reduxForm({
    form: 'notificationForm',
    validate: (
      { ruleName, recipients, informOwner, launchNames, attributes },
      { data: { notification, notifications } },
    ) => ({
      ruleName: commonValidators.createRuleNameValidator(
        notifications.map((item) => ({ name: item.ruleName, ...item })),
        notification && notification.id,
      )(ruleName),
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
  })(AddEditNotificationModal),
);
