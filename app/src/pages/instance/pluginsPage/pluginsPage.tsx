/*
 * Copyright 2019 EPAM Systems
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

import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { pluginsSelector, type Plugin } from 'controllers/plugins';
import { PLUGIN_FILTER_GROUP_VALUES } from 'common/constants/pluginsFilter';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { PLUGINS_PAGE } from 'components/main/analytics/events';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { createClassnames } from 'common/utils';
import { InstalledTab } from './pluginsTabs/installedTab';
import styles from './pluginsPage.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  pageTitle: {
    id: 'PluginsPage.title',
    defaultMessage: 'Instance plugins',
  },
});

export const PluginsPage = () => {
  const { formatMessage } = useIntl();
  const plugins = useSelector(pluginsSelector) as Plugin[];

  useTracking({ page: PLUGINS_PAGE });

  const filterItems = [...PLUGIN_FILTER_GROUP_VALUES];

  const breadcrumbs = [
    {
      title: formatMessage(messages.pageTitle),
    },
  ];

  return (
    <ScrollWrapper>
      <PageLayout>
        <PageHeader breadcrumbs={breadcrumbs} />
        <PageSection>
          <div className={cx('page-content')}>
            <InstalledTab plugins={plugins} filterItems={filterItems} />
          </div>
        </PageSection>
      </PageLayout>
    </ScrollWrapper>
  );
};
