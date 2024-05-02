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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { AttributeListContainer } from 'components/containers/attributeListContainer';
import { EMAIL } from 'common/constants/pluginNames';
import { ATTRIBUTES_OPERATORS, LAUNCH_CASES } from '../../notifications/constants';
import styles from './notificationRuleContent.scss';

const cx = classNames.bind(styles);
const SEPARATOR = '; ';

const messages = defineMessages({
  recipientsLabel: {
    id: 'AddEditNotificationCaseModal.recipientsLabel',
    defaultMessage: 'Recipients',
  },
  webhookURLLabel: {
    id: 'AddEditNotificationCaseModal.webhookURLLabel',
    defaultMessage: 'Webhook URL',
  },
  launchOwner: {
    id: 'NotificationRule.launchOwner',
    defaultMessage: 'Launch Owner',
  },
  inCaseLabel: {
    id: 'AddEditNotificationCaseModal.inCaseLabel',
    defaultMessage: 'In case',
  },
  launchNameLabel: {
    id: 'NotificationRule.launchNameLabel',
    defaultMessage: 'Launch name',
  },
  attributesLabel: {
    id: 'AddEditNotificationCaseModal.attributesLabel',
    defaultMessage: 'Attributes',
  },
  attributesLabelAll: {
    id: 'AddEditNotificationCaseModal.attributesLabelAll',
    defaultMessage: '(All attributes should match)',
  },
  attributesLabelAny: {
    id: 'AddEditNotificationCaseModal.attributesLabelAny',
    defaultMessage: '(Any attribute should match)',
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
});

export const NotificationRuleContent = ({
  item: {
    type,
    informOwner,
    recipients,
    attributes,
    attributesOperator,
    launchNames,
    sendCase,
    webhookURL,
  },
}) => {
  const { formatMessage } = useIntl();

  const recipientsValue = informOwner
    ? [formatMessage(messages.launchOwner), ...recipients]
    : recipients;

  const inCaseOptions = {
    [LAUNCH_CASES.ALWAYS]: formatMessage(messages[LAUNCH_CASES.ALWAYS]),
    [LAUNCH_CASES.MORE_10]: formatMessage(messages[LAUNCH_CASES.MORE_10]),
    [LAUNCH_CASES.MORE_20]: formatMessage(messages[LAUNCH_CASES.MORE_20]),
    [LAUNCH_CASES.MORE_50]: formatMessage(messages[LAUNCH_CASES.MORE_50]),
    [LAUNCH_CASES.FAILED]: formatMessage(messages[LAUNCH_CASES.FAILED]),
    [LAUNCH_CASES.TO_INVESTIGATE]: formatMessage(messages[LAUNCH_CASES.TO_INVESTIGATE]),
  };

  const getAttributesFieldText = () => {
    if (attributes.length > 1) {
      return `${formatMessage(messages.attributesLabel)} ${formatMessage(
        attributesOperator === ATTRIBUTES_OPERATORS.AND
          ? messages.attributesLabelAll
          : messages.attributesLabelAny,
      )}`;
    } else {
      return formatMessage(messages.attributesLabel);
    }
  };

  const DynamicFieldSection = () =>
    type === EMAIL ? (
      <>
        <span className={cx('field')}>{formatMessage(messages.recipientsLabel)}</span>
        <span className={cx('value')}>{recipientsValue.join(SEPARATOR)}</span>
      </>
    ) : (
      webhookURL && (
        <>
          <span className={cx('field')}>{formatMessage(messages.webhookURLLabel)}</span>
          <span className={cx('value')}>{webhookURL}</span>
        </>
      )
    );

  return (
    <div className={cx('info')}>
      {launchNames.length > 0 && (
        <>
          <span className={cx('field')}>{formatMessage(messages.launchNameLabel)}</span>
          <span className={cx('value')}>{launchNames.join(SEPARATOR)}</span>
        </>
      )}
      <span className={cx('field')}>{formatMessage(messages.inCaseLabel)}</span>
      <span className={cx('value')}>{inCaseOptions[sendCase]}</span>
      <DynamicFieldSection />
      {attributes.length > 0 && (
        <>
          <span className={cx('field', 'attributes-text')}>{getAttributesFieldText()}</span>
          <div className={cx('value')}>
            <AttributeListContainer disabled attributes={attributes} />
          </div>
        </>
      )}
    </div>
  );
};
NotificationRuleContent.propTypes = {
  item: PropTypes.shape({
    launchNames: PropTypes.array,
    sendCase: PropTypes.string,
    recipients: PropTypes.array,
    attributes: PropTypes.array,
    informOwner: PropTypes.bool,
    type: PropTypes.string,
    webhookURL: PropTypes.string,
    attributesOperator: PropTypes.oneOf([ATTRIBUTES_OPERATORS.AND, ATTRIBUTES_OPERATORS.OR]),
  }).isRequired,
};
