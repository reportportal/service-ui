/*
 * Copyright 2022 EPAM Systems
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

import React, { useMemo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import {
  availableGroupedPluginsSelector,
  pluginsLoadingSelector,
  availablePluginsSelector,
} from 'controllers/plugins';
import { BubblesPreloader } from 'components/preloaders/bubblesPreloader';
import {
  updatePagePropertiesAction,
  PROJECT_SETTINGS_TAB_PAGE,
  querySelector,
} from 'controllers/pages';
import { INTEGRATIONS } from 'common/constants/settingsTabs';
import { activeProjectSelector } from 'controllers/user';
import { redirect } from 'redux-first-router';
import { IntegrationInfo } from './integrationsList/integrationInfo';
import { IntegrationsList } from './integrationsList';
import styles from './integrations.scss';

const cx = classNames.bind(styles);

export const Integrations = () => {
  const loading = useSelector(pluginsLoadingSelector);
  const availableGroupedPlugins = useSelector(availableGroupedPluginsSelector);
  const plugins = useSelector(availablePluginsSelector);
  const activeProject = useSelector(activeProjectSelector);
  const dispatch = useDispatch();
  const query = useSelector(querySelector);
  const [plugin, setPlugin] = useState({});
  const initialPage = useMemo(
    () => ({
      type: PROJECT_SETTINGS_TAB_PAGE,
      payload: { projectId: activeProject, settingsTab: INTEGRATIONS },
    }),
    [activeProject],
  );

  useEffect(() => {
    const { subPage: pluginName } = query;
    const certainPlugin = plugins.find(({ name }) => name === pluginName);
    if (pluginName && certainPlugin) {
      setPlugin(certainPlugin);
    } else {
      dispatch(redirect(initialPage));
    }
  }, [query, plugins]);

  if (loading) {
    return <BubblesPreloader customClassName={cx('preloader')} />;
  }
  const onItemClick = (pluginData) => {
    dispatch(
      updatePagePropertiesAction({
        subPage: pluginData.name,
      }),
    );
    setPlugin(pluginData);
  };

  return (
    <>
      {query.subPage && !!Object.keys(plugin).length ? (
        <IntegrationInfo plugin={plugin} integrationId={query.id} />
      ) : (
        <IntegrationsList
          availableIntegrations={availableGroupedPlugins}
          onItemClick={onItemClick}
        />
      )}
    </>
  );
};
