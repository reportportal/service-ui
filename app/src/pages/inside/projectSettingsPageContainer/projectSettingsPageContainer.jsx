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

import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import {
  PROJECT_SETTINGS_TAB_PAGE,
  querySelector,
  settingsTabSelector,
  urlProjectKeySelector,
} from 'controllers/pages';
import { SettingsLayout } from 'layouts/settingsLayout';
import {
  ANALYSIS,
  DEFECT,
  DEMO_DATA,
  GENERAL,
  INTEGRATIONS,
  NOTIFICATIONS,
  PATTERN_ANALYSIS,
} from 'common/constants/settingsTabs';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { Integrations } from 'pages/inside/projectSettingsPageContainer/content/integrations';
import { DefectTypes } from 'pages/inside/projectSettingsPageContainer/content/defectTypes';
import { DemoDataTab } from 'pages/inside/projectSettingsPageContainer/content/demoDataContent';
import { canSeeDemoData } from 'common/utils/permissions';
import { ExtensionLoader } from 'components/extensionLoader';
import { uiExtensionSettingsTabsSelector } from 'controllers/plugins';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { Navigation } from 'pages/inside/projectSettingsPageContainer/navigation';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { Header } from 'pages/inside/projectSettingsPageContainer/header';
import { PatternAnalysis } from 'pages/inside/projectSettingsPageContainer/content/patternAnalysis';
import { Notifications } from 'pages/inside/projectSettingsPageContainer/content/notifications';
import { GeneralTab } from './generalTab';
import { projectOrganizationSlugSelector } from 'controllers/project';
import { AnalyzerContainer } from './content/analyzerContainer';
import { messages } from './messages';
import styles from './projectSettingsPageContainer.scss';

const cx = classNames.bind(styles);

export const ProjectSettingsPageContainer = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const extensions = useSelector(uiExtensionSettingsTabsSelector);
  const organizationSlug = useSelector(projectOrganizationSlugSelector);
  const projectKey = useSelector(urlProjectKeySelector);
  const activeTab = useSelector(settingsTabSelector);
  const userRole = useSelector(activeProjectRoleSelector);
  const accountRole = useSelector(userAccountRoleSelector);
  const { subPage } = useSelector(querySelector);
  const [headerNodes, setHeaderNodes] = useState({});

  const createTabLink = useCallback(
    (tabName, extendedParams = {}) => ({
      type: PROJECT_SETTINGS_TAB_PAGE,
      payload: {
        projectKey,
        settingsTab: tabName,
        organizationSlug,
        ...extendedParams,
      },
    }),
    [projectKey, organizationSlug],
  );

  const extensionsConfig = useMemo(() => {
    return extensions.reduce(
      (acc, extension) => ({
        ...acc,
        [extension.name]: {
          name: extension.title || extension.name,
          link: createTabLink(extension.name),
          component: (
            <ExtensionLoader
              extension={extension}
              withPreloader
              silentOnError={false}
              setHeaderNodes={setHeaderNodes}
            />
          ),
          mobileDisabled: true,
          eventInfo: SETTINGS_PAGE_EVENTS.extensionTabClick(extension.title || extension.name),
        },
      }),
      {},
    );
  }, [createTabLink, extensions]);

  const config = useMemo(() => {
    const navConfig = {
      [GENERAL]: {
        name: formatMessage(messages.general),
        link: createTabLink(GENERAL),
        component: <GeneralTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.GENERAL_TAB,
        mobileDisabled: true,
      },
      [INTEGRATIONS]: {
        name: formatMessage(messages.integrations),
        link: createTabLink(INTEGRATIONS),
        component: <Integrations />,
        eventInfo: SETTINGS_PAGE_EVENTS.INTEGRATIONS_TAB,
      },
      [NOTIFICATIONS]: {
        name: formatMessage(messages.notifications),
        link: createTabLink(NOTIFICATIONS),
        component: (
          <Notifications setHeaderTitleNode={(node) => setHeaderNodes({ titleNode: node })} />
        ),
        eventInfo: SETTINGS_PAGE_EVENTS.NOTIFICATIONS_TAB,
        mobileDisabled: true,
      },
      [DEFECT]: {
        name: formatMessage(messages.defect),
        link: createTabLink(DEFECT),
        component: (
          <DefectTypes setHeaderTitleNode={(node) => setHeaderNodes({ titleNode: node })} />
        ),
        eventInfo: SETTINGS_PAGE_EVENTS.DEFECT_TYPE_TAB,
        mobileDisabled: true,
      },
      [ANALYSIS]: {
        name: formatMessage(messages.analysis),
        link: createTabLink(ANALYSIS),
        component: (
          <AnalyzerContainer setHeaderNodes={(node) => setHeaderNodes({ children: node })} />
        ),
        eventInfo: SETTINGS_PAGE_EVENTS.AUTO_ANALYSIS_TAB,
        mobileDisabled: true,
      },
      [PATTERN_ANALYSIS]: {
        name: formatMessage(messages.patternAnalysis),
        link: createTabLink(PATTERN_ANALYSIS),
        component: (
          <PatternAnalysis setHeaderTitleNode={(node) => setHeaderNodes({ titleNode: node })} />
        ),
        eventInfo: SETTINGS_PAGE_EVENTS.PATTERN_ANALYSIS_TAB,
        mobileDisabled: true,
      },
      [DEMO_DATA]: {
        name: formatMessage(messages.demoData),
        link: createTabLink(DEMO_DATA),
        component: <DemoDataTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.DEMO_DATA_TAB,
        mobileDisabled: true,
      },
    };
    if (!canSeeDemoData(accountRole, userRole)) {
      delete navConfig[DEMO_DATA];
    }
    Object.keys(extensionsConfig).forEach((key) => {
      if (navConfig[key]) {
        navConfig[key].component = extensionsConfig[key].component;

        delete extensionsConfig[key];
      }
    });
    return { ...navConfig, ...extensionsConfig };
  }, [accountRole, extensionsConfig, createTabLink, userRole]);

  const navigation = useMemo(() => {
    if (subPage) {
      return null;
    } else {
      const title = <FormattedMessage id="SettingsPage.title" defaultMessage="Project Settings" />;
      return <Navigation items={config} title={title} />;
    }
  }, [config, subPage]);

  const content = useMemo(() => {
    if (!activeTab || !config[activeTab]) {
      const firstItemName = Object.keys(config)[0];
      dispatch(config[firstItemName].link);
      return null;
    }
    return config[activeTab].component;
  }, [activeTab, config]);

  return (
    <SettingsLayout navigation={navigation}>
      <ScrollWrapper resetRequired>
        <div className={cx('settings-page-content-wrapper')}>
          {!subPage && (
            <div className={cx('header')}>
              <Header
                title={config[activeTab] && config[activeTab].name}
                titleNode={headerNodes.titleNode}
              >
                {headerNodes.children}
              </Header>
            </div>
          )}
          <div className={cx('content', { 'main-page': !subPage })}>{content}</div>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
