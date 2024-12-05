import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { payloadSelector } from 'controllers/pages';
import { ANALYSIS } from 'common/constants/settingsTabs';

export const ProjectSettingsAnalyticsWrapper = ({ children }) => {
  const { trackEvent } = useTracking();
  const payload = useSelector(payloadSelector);
  const { settingsTab, subTab } = payload;

  useEffect(() => {
    if (settingsTab) {
      if (settingsTab === ANALYSIS && !subTab) {
        return;
      }

      const place = subTab
        ? `project_settings_${settingsTab.toLowerCase()}_${subTab.toLowerCase()}`
        : `project_settings_${settingsTab.toLowerCase()}`;

      trackEvent({
        action: 'pageview',
        page: 'project_settings',
        place,
      });
    }
  }, [settingsTab, subTab, trackEvent]);

  return children;
};
