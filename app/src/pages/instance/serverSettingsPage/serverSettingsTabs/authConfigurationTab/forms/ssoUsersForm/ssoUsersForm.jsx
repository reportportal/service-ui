/*
 * Copyright 2024 EPAM Systems
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

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { useTracking } from 'react-tracking';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { SectionHeader } from 'components/main/sectionHeader';
import { ADMIN_SERVER_SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { ssoUsersOnlySelector, fetchAppInfoAction } from 'controllers/appInfo';
import formStyles from 'pages/instance/serverSettingsPage/common/formController/formController.scss';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import styles from './ssoUsersForm.scss';

const formCx = classNames.bind(formStyles);
const cx = classNames.bind(styles);

const messages = defineMessages({
  switcherLabel: {
    id: 'SsoUsersForm.switcherLabel',
    defaultMessage: 'SSO users only',
  },
  formHeader: {
    id: 'SsoUsersForm.formHeader',
    defaultMessage: 'Instance Invitations',
  },
  ssoOnlyDescription: {
    id: 'SsoUsersForm.ssoOnlyDescription',
    defaultMessage: 'New users can be created via SSO only.',
  },
  manualInvitesDescription: {
    id: 'SsoUsersForm.manualInvitesDescription',
    defaultMessage:
      'Users can manually send invitations for other users. If enabled new users can be created via SSO only.',
  },
  successNotification: {
    id: 'SsoUsersForm.successNotification',
    defaultMessage: 'SSO settings have been updated successfully',
  },
  errorNotification: {
    id: 'SsoUsersForm.errorNotification',
    defaultMessage: 'Failed to update SSO settings',
  },
});

export const SsoUsersForm = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const enabledFromStore = useSelector(ssoUsersOnlySelector);
  const [enabled, setEnabled] = useState(enabledFromStore);
  const inputId = 'ssoUsersToggle';
  const { trackEvent } = useTracking();

  useEffect(() => {
    dispatch(fetchAppInfoAction());
  }, [dispatch]);

  useEffect(() => {
    setEnabled(enabledFromStore);
  }, [enabledFromStore]);

  const getDescription = () =>
    formatMessage(enabled ? messages.ssoOnlyDescription : messages.manualInvitesDescription);

  const handleToggle = async (value) => {
    setEnabled(value);
    trackEvent(ADMIN_SERVER_SETTINGS_PAGE_EVENTS.toggleSsoUsers(value));

    try {
      await fetch(URLS.instanceSettings(), {
        method: 'PUT',
        data: {
          key: 'server.users.sso',
          value: value.toString(),
        },
      });

      await dispatch(fetchAppInfoAction());
      dispatch(showSuccessNotification({ message: formatMessage(messages.successNotification) }));
    } catch (error) {
      setEnabled(!value);
      dispatch(showErrorNotification({ message: formatMessage(messages.errorNotification) }));
    }
  };

  return (
    <div className={formCx('form-controller')}>
      <div className={formCx('heading-wrapper')}>
        <SectionHeader text={formatMessage(messages.formHeader)} />
      </div>
      <div className={formCx('form')}>
        <div className={cx('form-group')}>
          <label htmlFor={inputId} className={cx('form-group-label')}>
            {formatMessage(messages.switcherLabel)}
          </label>
          <div className={cx('form-group-content')}>
            <div className={cx('input-container')}>
              <InputBigSwitcher
                id={inputId}
                value={enabled}
                onChange={handleToggle}
                mobileDisabled
              />
              <div className={cx('description')} aria-live="polite">
                {getDescription()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
