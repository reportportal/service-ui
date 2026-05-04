/*
 * Copyright 2026 EPAM Systems
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

import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { EMAIL } from 'common/constants/pluginNames';
import { availablePluginsSelector, pluginsLoadingSelector } from 'controllers/plugins';
import { PLUGIN_DESCRIPTIONS_MAP } from 'components/integrations/messages';
import { PluginIcon } from 'components/integrations/elements/pluginIcon';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { BubblesLoader } from '@reportportal/ui-kit';
import { ORGANIZATION_SETTINGS_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { docsReferences } from 'common/utils';
import { messages } from './messages';
import styles from './integrationsTab.scss';

const cx = classNames.bind(styles);

export const IntegrationsTab = () => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const availablePlugins = useSelector(availablePluginsSelector);
  const loading = useSelector(pluginsLoadingSelector);

  const emailPlugin = useMemo(
    () => availablePlugins.find((plugin) => plugin.name === EMAIL),
    [availablePlugins],
  );

  const handleDocumentationClick = () => {
    trackEvent(ORGANIZATION_SETTINGS_EVENTS.CLICK_DOCUMENTATION_LINK_INTEGRATIONS);
  };

  if (loading) {
    return (
      <div className={cx('loader')}>
        <BubblesLoader variant="large" />
      </div>
    );
  }

  if (!emailPlugin) {
    return (
      <EmptyStatePage
        title={formatMessage(messages.noPluginsTitle)}
        description={formatMessage(messages.noPluginsDescription)}
        documentationLink={docsReferences.emptyStateOrgIntegrationsDocs}
        handleDocumentationClick={handleDocumentationClick}
        imageType="plugins"
      />
    );
  }

  const displayName = emailPlugin.details?.name || emailPlugin.name;

  return (
    <div className={cx('integrations-tab')}>
      <div className={cx('integrations-group-header')}>
        {formatMessage(messages.notificationsHeader)}
      </div>
      <div className={cx('plugin-card')}>
        <PluginIcon className={cx('plugin-icon')} pluginData={emailPlugin} alt={displayName} />
        <div className={cx('plugin-info-block')}>
          <span className={cx('plugin-name')}>{displayName}</span>
          <p className={cx('plugin-description')}>{PLUGIN_DESCRIPTIONS_MAP[emailPlugin.name]}</p>
        </div>
      </div>
    </div>
  );
};
