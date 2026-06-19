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

import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { BubblesLoader } from '@reportportal/ui-kit';
import { redirect } from 'redux-first-router';

import { EMAIL } from 'common/constants/pluginNames';
import {
  availableGroupedPluginsSelector,
  availablePluginsSelector,
  pluginsLoadingSelector,
} from 'controllers/plugins';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { ORGANIZATION_SETTINGS_INTEGRATION } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { createClassnames, docsReferences } from 'common/utils';
import { IntegrationsListItem } from 'pages/inside/common/integrations/integrationsListItem';
import { messages as integrationsMessages } from 'pages/inside/common/integrations/messages';
import {
  ORGANIZATION_SETTINGS_TAB_PAGE,
  querySelector,
  updatePagePropertiesAction,
  urlOrganizationSlugSelector,
} from 'controllers/pages';
import { INTEGRATIONS } from 'common/constants/settingsTabs';
import {
  activeOrganizationLoadingSelector,
  organizationIntegrationsLoadingSelector,
} from 'controllers/organization';

import { messages } from './messages';
import { IntegrationInfo } from './integrationInfo';
import styles from './integrationsTab.scss';

const cx = createClassnames(styles);

export const IntegrationsTab = () => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const plugins = useSelector(availablePluginsSelector);
  const availableGroupedPlugins = useSelector(availableGroupedPluginsSelector);
  const loading = useSelector(pluginsLoadingSelector);
  const organizationLoading = useSelector(activeOrganizationLoadingSelector);
  const integrationsLoading = useSelector(organizationIntegrationsLoadingSelector);
  const query = useSelector(querySelector);
  const [plugin, setPlugin] = useState({});

  const availableIntegrations = useMemo(() => {
    const orgIntegrationsPlugins = new Set([EMAIL]);

    return Object.entries(availableGroupedPlugins).reduce((acc, [groupId, plugins]) => {
      const filteredPlugins = plugins.filter((p) => orgIntegrationsPlugins.has(p.name));

      if (filteredPlugins.length > 0) {
        acc[groupId] = filteredPlugins;
      }

      return acc;
    }, {});
  }, [availableGroupedPlugins]);

  const initialPage = useMemo(
    () => ({
      type: ORGANIZATION_SETTINGS_TAB_PAGE,
      payload: {
        settingsTab: INTEGRATIONS,
        organizationSlug,
      },
    }),
    [organizationSlug],
  );

  useEffect(() => {
    if (loading || organizationLoading || integrationsLoading || !query.subPage) {
      return undefined;
    }

    const definePlugin = () => {
      const { subPage: pluginName } = query;
      const certainPlugin = plugins.find(({ name }) => name === pluginName);
      if (pluginName && certainPlugin) {
        setPlugin(certainPlugin);
      } else {
        dispatch(redirect(initialPage));
      }
    };

    definePlugin();
  }, [query, plugins, initialPage, dispatch, loading, organizationLoading, integrationsLoading]);

  const hasIntegrations = Object.keys(availableIntegrations).length > 0;

  const handleDocumentationClick = () => {
    trackEvent(ORGANIZATION_SETTINGS_INTEGRATION.CLICK_DOCUMENTATION_LINK_INTEGRATIONS);
  };

  const onItemClick = (pluginData) => {
    dispatch(
      updatePagePropertiesAction({
        subPage: pluginData.name,
      }),
    );
    setPlugin(pluginData);
  };

  if (loading || organizationLoading || integrationsLoading) {
    return (
      <div className={cx('loader')}>
        <BubblesLoader variant="large" />
      </div>
    );
  }

  if (query.subPage && !!Object.keys(plugin).length) {
    return <IntegrationInfo plugin={plugin} integrationId={query.id} />;
  }

  if (!hasIntegrations) {
    return (
      <EmptyStatePage
        title={formatMessage(messages.noPluginsTitle)}
        description={formatMessage(messages.noPluginsDescription)}
        documentationLink={docsReferences.emptyStateOrgIntegrationsDocs}
        handleDocumentationClick={handleDocumentationClick}
        descriptionClassName={cx('no-plugins-empty-description')}
        documentationLinkClassName={cx('no-plugins-empty-link')}
        imageType="plugins"
      />
    );
  }

  return (
    <div className={cx('integrations-tab')}>
      {Object.keys(availableIntegrations).map((key) => (
        <div key={key} className={cx('integrations-group')}>
          <div className={cx('integrations-group-header')}>
            {integrationsMessages[key] ? formatMessage(integrationsMessages[key]) : key}
          </div>
          <div className={cx('integrations-group-items')}>
            {availableIntegrations[key].map((item) => (
              <IntegrationsListItem
                key={item.name}
                integrationType={item}
                onItemClick={onItemClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
