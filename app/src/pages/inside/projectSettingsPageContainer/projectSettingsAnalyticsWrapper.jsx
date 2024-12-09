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

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { payloadSelector } from 'controllers/pages';
import { PROJECT_SETTINGS_VIEWS } from 'components/main/analytics/events/ga4Events/projectSettingsPageEvents';

export const ProjectSettingsAnalyticsWrapper = ({ children }) => {
  const { trackEvent } = useTracking();
  const payload = useSelector(payloadSelector);

  useEffect(() => {
    if (payload.settingsTab) {
      trackEvent(
        PROJECT_SETTINGS_VIEWS.getProjectSettingsPageView(payload.settingsTab, payload.subTab),
      );
    }
  }, [payload, trackEvent]);

  return children;
};
