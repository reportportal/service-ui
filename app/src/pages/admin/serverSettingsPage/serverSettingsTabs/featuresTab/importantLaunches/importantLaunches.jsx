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

import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { ADMIN_SERVER_SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  importantLaunchesEnabledSelector,
  updateServerSettingsAction,
  IMPORTANT_LAUNCHES_FEATURE_KEY,
} from 'controllers/appInfo';
import { showSuccessNotification } from 'controllers/notification';
import { useTracking } from 'react-tracking';
import { SectionLayout, ServerSettingsField } from 'pages/admin/serverSettingsPage/common';

const messages = defineMessages({
  switcherLabel: {
    id: 'ImportantLaunches.switcherLabel',
    defaultMessage: 'Important Launches',
  },
  formHeader: {
    id: 'ImportantLaunches.formHeader',
    defaultMessage: 'Important launches',
  },
  description: {
    id: 'ImportantLaunches.description',
    defaultMessage:
      'Important Launches extend the retention period beyond the standard retention policy settings. You can mark a launch as important using the launch menu.',
  },
  successNotification: {
    id: 'ImportantLaunches.successNotification',
    defaultMessage: 'Important launches settings have been updated successfully',
  },
});

export const ImportantLaunches = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const enabledConfig = useSelector(importantLaunchesEnabledSelector);
  const [enabled, setEnabled] = useState(enabledConfig);
  const { trackEvent } = useTracking();

  const handleToggle = async (value) => {
    setEnabled(value);
    trackEvent(ADMIN_SERVER_SETTINGS_PAGE_EVENTS.toggleImportantLaunches(value));

    dispatch(
      updateServerSettingsAction({
        data: {
          key: IMPORTANT_LAUNCHES_FEATURE_KEY,
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
        description={formatMessage(messages.description)}
      >
        <InputBigSwitcher value={enabled} onChange={handleToggle} mobileDisabled />
      </ServerSettingsField>
    </SectionLayout>
  );
};
