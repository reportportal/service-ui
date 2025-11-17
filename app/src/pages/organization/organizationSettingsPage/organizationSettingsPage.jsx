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

import { GENERAL } from 'common/constants/settingsTabs';
import {
  ORGANIZATION_SETTINGS_TAB_PAGE,
  settingsTabSelector,
  urlOrganizationSlugSelector,
} from 'controllers/pages';
import { SettingsLayout } from 'layouts/settingsLayout';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Navigation } from 'pages/inside/common/navigation';
import { Header } from 'pages/inside/common/header';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { uiExtensionOrganizationSettingsTabsSelector } from 'controllers/plugins';
import { ExtensionLoader } from 'components/extensionLoader';
import { useExtensionsConfig } from 'common/hooks';
import classNames from 'classnames/bind';
import { messages } from './messages';
import { GeneralTab } from './content/generalTab';
import { OrganizationSettingsAnalyticsWrapper } from './organizationSettingsAnalyticsWrapper';
import styles from './organizationSettingsPage.scss';

const cx = classNames.bind(styles);

export const OrganizationSettingsPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const activeTab = useSelector(settingsTabSelector);
  const extensions = useSelector(uiExtensionOrganizationSettingsTabsSelector);
  const [headerNodes, setHeaderNodes] = useState({});

  const createTabLink = useCallback(
    (tabName, extendedParams = {}, page = ORGANIZATION_SETTINGS_TAB_PAGE) => ({
      type: page,
      payload: { settingsTab: tabName, organizationSlug, ...extendedParams },
    }),
    [organizationSlug],
  );

  const { mergeConfig } = useExtensionsConfig({
    extensions,
    createTabLink,
    setHeaderNodes,
    ExtensionLoaderComponent: ExtensionLoader,
  });

  const config = useMemo(() => {
    const navConfig = {
      [GENERAL]: {
        name: formatMessage(messages.general),
        link: createTabLink(GENERAL),
        component: <GeneralTab />,
        mobileDisabled: true,
      },
    };

    return mergeConfig(navConfig);
  }, [createTabLink, formatMessage, mergeConfig]);

  const navigation = useMemo(() => {
    const title = (
      <FormattedMessage
        id="OrganizationSettingsPage.title"
        defaultMessage="Organization Settings"
      />
    );
    return <Navigation items={config} title={title} />;
  }, [config]);

  const content = useMemo(() => {
    if (!activeTab || !config[activeTab]) {
      const firstItemName = Object.keys(config)[0];
      dispatch(config[firstItemName].link);
      return null;
    }
    return config[activeTab].component;
  }, [activeTab, config, dispatch]);

  return (
    <OrganizationSettingsAnalyticsWrapper>
      <SettingsLayout navigation={navigation}>
        <ScrollWrapper resetRequired>
          <div className={cx('settings-page-content-wrapper')}>
            <div className={cx('header')}>
              <Header title={config[activeTab]?.name} titleNode={headerNodes.titleNode}>
                {headerNodes.children}
              </Header>
            </div>
            <div className={cx('content', 'main-page')}>{content}</div>
          </div>
        </ScrollWrapper>
      </SettingsLayout>
    </OrganizationSettingsAnalyticsWrapper>
  );
};
