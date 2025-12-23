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

import React, { useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { FieldNumber } from '@reportportal/ui-kit';
import { BigButton } from 'components/buttons/bigButton';
import { SectionLayout, ServerSettingsField } from 'pages/admin/serverSettingsPage/common';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showSuccessNotification } from 'controllers/notification';
import { ADMIN_SERVER_SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  passwordMinLengthSelector,
  updateServerSettingsAction,
  PASSWORD_MIN_LENGTH_KEY,
} from 'controllers/appInfo';
import {
  PASSWORD_MIN_ALLOWED_LENGTH,
  PASSWORD_MAX_ALLOWED_LENGTH,
} from 'common/constants/validation';
import styles from './passwordForm.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  formHeader: {
    id: 'PasswordForm.formHeader',
    defaultMessage: 'Password',
  },
  label: {
    id: 'PasswordForm.label',
    defaultMessage: 'Password length',
  },
  description: {
    id: 'PasswordForm.description',
    defaultMessage:
      'Minimum number of characters required for the password. Allowed range: 8 to 256 characters.',
  },
  successNotification: {
    id: 'PasswordForm.successNotification',
    defaultMessage: 'The minimum password length has been updated successfully',
  },
});

export const PasswordForm = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const valueFromStore = useSelector(passwordMinLengthSelector);
  const [passwordLength, setPasswordLength] = useState(valueFromStore);

  useEffect(() => {
    setPasswordLength(valueFromStore);
  }, [valueFromStore]);

  const isChanged = passwordLength !== valueFromStore;

  const handleSubmit = () => {
    trackEvent(ADMIN_SERVER_SETTINGS_PAGE_EVENTS.SUBMIT_PASSWORD_LENGTH);

    dispatch(
      updateServerSettingsAction({
        data: {
          key: PASSWORD_MIN_LENGTH_KEY,
          value: passwordLength,
        },
        onSuccess: () => {
          dispatch(
            showSuccessNotification({ message: formatMessage(messages.successNotification) }),
          );
        },
        onError: () => {
          setPasswordLength(valueFromStore);
        },
      }),
    );
  };

  return (
    <SectionLayout header={formatMessage(messages.formHeader)}>
      <ServerSettingsField
        label={formatMessage(messages.label)}
        description={formatMessage(messages.description)}
      >
        <FieldNumber
          min={PASSWORD_MIN_ALLOWED_LENGTH}
          max={PASSWORD_MAX_ALLOWED_LENGTH}
          value={passwordLength}
          onChange={setPasswordLength}
        />
      </ServerSettingsField>
      {isChanged && (
        <BigButton className={cx('submit-button')} type="submit" onClick={handleSubmit}>
          <span className={cx('submit-button-title')}>
            {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
          </span>
        </BigButton>
      )}
    </SectionLayout>
  );
};
