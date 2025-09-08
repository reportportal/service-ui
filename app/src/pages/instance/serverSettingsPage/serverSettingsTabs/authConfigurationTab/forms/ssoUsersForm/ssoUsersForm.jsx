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

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { Tooltip } from '@reportportal/ui-kit';
import { ADMIN_SERVER_SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  ssoUsersOnlySelector,
  personalOrganizationsSelector,
  updateServerSettingsAction,
  SSO_USERS_ONLY_KEY,
  PERSONAL_ORGANIZATIONS_KEY,
} from 'controllers/appInfo';
import { showSuccessNotification } from 'controllers/notification';
import { SectionLayout, ServerSettingsField } from 'pages/instance/serverSettingsPage/common';
import { pluginByNameSelector } from 'controllers/plugins';
import { ORGANIZATION } from 'common/constants/pluginNames';
import styles from './ssoUsersForm.scss';

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
  personalOrganizationsLabel: {
    id: 'SsoUsersForm.personalOrganizationsLabel',
    defaultMessage: 'Create Personal Organizations',
  },
  personalOrganizationsDescription: {
    id: 'SsoUsersForm.personalOrganizationsDescription',
    defaultMessage:
      'Personal organizations are created to give each user their own workspace. If enabled, a personal organization will be automatically created for every new user.',
  },
  personalOrganizationsSuccessNotification: {
    id: 'SsoUsersForm.personalOrganizationsSuccessNotification',
    defaultMessage: 'Personal organizations settings have been updated successfully',
  },
  personalOrganizationsPluginDisabledTooltip: {
    id: 'SsoUsersForm.personalOrganizationsPluginDisabledTooltip',
    defaultMessage:
      "'Organizations' plugin is unavailable. Ensure you have a paid subscription to use this Enterprise feature, or verify that the plugin is installed on the instance.",
  },
});

export const SsoUsersForm = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const enabledFromStore = useSelector(ssoUsersOnlySelector);
  const [enabled, setEnabled] = useState(enabledFromStore);
  const { trackEvent } = useTracking();
  const personalOrganizationsFromStore = useSelector(personalOrganizationsSelector);
  const organizationPlugin = useSelector((state) => pluginByNameSelector(state, ORGANIZATION));
  const [personalOrganizationsEnabled, setPersonalOrganizationsEnabled] = useState(
    personalOrganizationsFromStore,
  );

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

  const handlePersonalOrganizationsToggle = async (value) => {
    setPersonalOrganizationsEnabled(value);
    trackEvent(ADMIN_SERVER_SETTINGS_PAGE_EVENTS.togglePersonalOrganizations(value));

    dispatch(
      updateServerSettingsAction({
        data: {
          key: PERSONAL_ORGANIZATIONS_KEY,
          value: value.toString(),
        },
        onSuccess: () => {
          dispatch(
            showSuccessNotification({
              message: formatMessage(messages.personalOrganizationsSuccessNotification),
            }),
          );
        },
        onError: () => {
          setPersonalOrganizationsEnabled(!value);
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
      <ServerSettingsField
        label={formatMessage(messages.personalOrganizationsLabel)}
        description={formatMessage(messages.personalOrganizationsDescription)}
      >
        {!organizationPlugin?.enabled ? (
          <Tooltip
            content={formatMessage(messages.personalOrganizationsPluginDisabledTooltip)}
            tooltipClassName={cx('tooltip')}
          >
            <InputBigSwitcher disabled />
          </Tooltip>
        ) : (
          <InputBigSwitcher
            value={personalOrganizationsEnabled}
            onChange={handlePersonalOrganizationsToggle}
            mobileDisabled
          />
        )}
      </ServerSettingsField>
    </SectionLayout>
  );
};
