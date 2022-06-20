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
import { LAUNCH_CASES } from 'pages/inside/projectSettingsPageContainer/content/notifications/constants';
import { AttributeListField } from 'components/main/attributeList';
import styles from './notificationRuleContent.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  recipientsLabel: {
    id: 'AddEditNotificationCaseModal.recipientsLabel',
    defaultMessage: 'Recipients',
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

export const NotificationRuleContent = ({ item }) => {
  const { formatMessage } = useIntl();

  const inCaseOptions = {
    [LAUNCH_CASES.ALWAYS]: formatMessage(messages[LAUNCH_CASES.ALWAYS]),
    [LAUNCH_CASES.MORE_10]: formatMessage(messages[LAUNCH_CASES.MORE_10]),
    [LAUNCH_CASES.MORE_20]: formatMessage(messages[LAUNCH_CASES.MORE_20]),
    [LAUNCH_CASES.MORE_50]: formatMessage(messages[LAUNCH_CASES.MORE_50]),
    [LAUNCH_CASES.FAILED]: formatMessage(messages[LAUNCH_CASES.FAILED]),
    [LAUNCH_CASES.TO_INVESTIGATE]: formatMessage(messages[LAUNCH_CASES.TO_INVESTIGATE]),
  };

  return (
    <div className={cx('info')}>
      {item.launchNames.length > 0 && (
        <>
          <span className={cx('field')}>{formatMessage(messages.launchNameLabel)}</span>
          <span className={cx('value')}>{item.launchNames.join('; ')}</span>
        </>
      )}
      <span className={cx('field')}>{formatMessage(messages.inCaseLabel)}</span>
      <span className={cx('value')}>{inCaseOptions[item.sendCase]}</span>
      {item.recipients.length > 0 && (
        <>
          <span className={cx('field')}>{formatMessage(messages.recipientsLabel)}</span>
          <span className={cx('value')}>{item.recipients.join('; ')}</span>
        </>
      )}
      {item.attributes.length > 0 && (
        <>
          <span className={cx('field')}>{formatMessage(messages.attributesLabel)}</span>
          <div className={cx('value')}>
            <AttributeListField
              disabled
              attributes={item.attributes}
              customClass={cx('attribute')}
            />
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
  }).isRequired,
};
