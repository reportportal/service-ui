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

import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { ADMIN_SERVER_SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  ssoUsersOnlySelector,
  updateServerSettingsAction,
  SSO_USERS_ONLY_KEY,
} from 'controllers/appInfo';
import { showSuccessNotification } from 'controllers/notification';
import { useTracking } from 'react-tracking';
import { SectionLayout, ServerSettingsField } from 'pages/admin/serverSettingsPage/common';

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
});

export const SsoUsersForm = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const enabledFromStore = useSelector(ssoUsersOnlySelector);
  const [enabled, setEnabled] = useState(enabledFromStore);
  const { trackEvent } = useTracking();

  const getDescription = () =>
    formatMessage(enabled ? messages.ssoOnlyDescription : messages.manualInvitesDescription);

  const handleToggle = async (value) => {
    setEnabled(value);
    trackEvent(ADMIN_SERVER_SETTINGS_PAGE_EVENTS.toggleSsoUsers(value));

    dispatch(
      updateServerSettingsAction({
        data: {
          key: SSO_USERS_ONLY_KEY,
          value: value.toString(),
        },
        onSuccess: () => {
          dispatch(
            showSuccessNotification({ message: formatMessage(messages.successNotification) }),
          );
        },
        onError: () => {
          setEnabled(!value);
        },
      }),
    );
  };

  return (
    <SectionLayout header={formatMessage(messages.formHeader)}>
      <ServerSettingsField
        label={formatMessage(messages.switcherLabel)}
        description={getDescription()}
      >
        <InputBigSwitcher value={enabled} onChange={handleToggle} mobileDisabled />
      </ServerSettingsField>
    </SectionLayout>
  );
};
