/*
 * Copyright 2025 EPAM Systems
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

import classNames from 'classnames/bind';
import { SectionHeader } from 'components/main/sectionHeader';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { useDispatch, useSelector } from 'react-redux';
import { sessionExpirationTimeSelector, updateExpirationSessionAction } from 'controllers/appInfo';
import { useTracking } from 'react-tracking';
import { ADMIN_SERVER_SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { Messages } from 'pages/inside/projectSettingsPageContainer/generalTab/generalTabMessages';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import styles from './inactivityTimeoutForm.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  formHeader: {
    id: 'SessionExpirationForm.formHeader',
    defaultMessage: 'Inactivity timeout',
  },
  label: {
    id: 'SessionExpirationForm.label',
    defaultMessage: 'Session inactivity timeout',
  },
  description: {
    id: 'SessionExpirationForm.description',
    defaultMessage: 'Duration of user inactivity before automatic logout.',
  },
});

export const InactivityTimeoutForm = () => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const expirationTimeoutConfig = useSelector(sessionExpirationTimeSelector);
  const dispatch = useDispatch();

  const [inactivityTimeout, setInactivityTimeout] = useState(expirationTimeoutConfig);
  const getMilliseconds = (hour) => hour * 60 * 60 * 1000;

  const timeoutOptions = [
    { value: getMilliseconds(15 / 60), label: formatMessage(Messages.minutes15) },
    { value: getMilliseconds(1), label: formatMessage(Messages.hour1) },
    { value: getMilliseconds(12), label: formatMessage(Messages.hour12) },
    { value: getMilliseconds(24), label: formatMessage(Messages.hour24) },
  ];

  const handleTimeoutChange = (value) => {
    const label = timeoutOptions.find((option) => option.value === value).label;
    trackEvent(ADMIN_SERVER_SETTINGS_PAGE_EVENTS.changeSessionInactivity(label));
    dispatch(
      updateExpirationSessionAction({
        expiration: value,
        onSuccess: () => {
          dispatch(
            showNotification({
              messageId: 'updateSessionExpirationSuccess',
              type: NOTIFICATION_TYPES.SUCCESS,
            }),
          );
          setInactivityTimeout(value);
        },
      }),
    );
  };

  return (
    <div className={cx('inactivity-timeout-form')}>
      <div className={cx('heading-wrapper')}>
        <SectionHeader text={formatMessage(messages.formHeader)} />
      </div>
      <div className={cx('content')}>
        <p className={cx('label')}>{formatMessage(messages.label)}</p>
        <InputDropdown
          customClasses={{
            container: cx('timeout-dropdown'),
            selectList: cx('timeout-select-list'),
          }}
          options={timeoutOptions}
          value={inactivityTimeout}
          onChange={handleTimeoutChange}
        />
        <p className={cx('description')}>{formatMessage(messages.description)}</p>
      </div>
    </div>
  );
};
