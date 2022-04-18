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

import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import {
  PROJECT_SETTINGS_TAB_PAGE,
  projectIdSelector,
  settingsTabSelector,
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
import { IntegrationsTab } from 'pages/common/settingsPage/integrationsTab';
import { NotificationsTab } from 'pages/common/settingsPage/notificationsTab';
import { DefectTypesTab } from 'pages/common/settingsPage/defectTypesTab';
import { AutoAnalysisTab } from 'pages/common/settingsPage/autoAnalysisTab';
import { PatternAnalysisTab } from 'pages/common/settingsPage/patternAnalysisTab';
import { DemoDataTab } from 'pages/common/settingsPage/demoDataTab';
import { canSeeDemoData } from 'common/utils/permissions';
import { ExtensionLoader } from 'components/extensionLoader';
import { uiExtensionSettingsTabsSelector } from 'controllers/plugins';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { Navigation } from 'pages/inside/projectSettingsPageContainer/navigation';
import { GeneralTab } from 'pages/common/settingsPage/generalTab/generalTab';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { Header } from 'pages/inside/projectSettingsPageContainer/header';
import { messages } from './messages';
import styles from './projectSettingsPageContainer.scss';

const cx = classNames.bind(styles);

export const ProjectSettingsPageContainer = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const extensions = useSelector(uiExtensionSettingsTabsSelector);
  const projectId = useSelector(projectIdSelector);
  const activeTab = useSelector(settingsTabSelector);
  const userRole = useSelector(activeProjectRoleSelector);
  const accountRole = useSelector(userAccountRoleSelector);

  const createTabLink = useCallback(
    (tabName) => ({
      type: PROJECT_SETTINGS_TAB_PAGE,
      payload: { projectId, settingsTab: tabName },
    }),
    [projectId],
  );

  const extensionsConfig = useMemo(() => {
    return extensions.reduce(
      (acc, extension) => ({
        ...acc,
        [extension.name]: {
          name: extension.title || extension.name,
          link: createTabLink(extension.name),
          component: <ExtensionLoader extension={extension} />,
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
        component: <IntegrationsTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.INTEGRATIONS_TAB,
      },
      [NOTIFICATIONS]: {
        name: formatMessage(messages.notifications),
        link: createTabLink(NOTIFICATIONS),
        component: <NotificationsTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.NOTIFICATIONS_TAB,
        mobileDisabled: true,
      },
      [DEFECT]: {
        name: formatMessage(messages.defect),
        link: createTabLink(DEFECT),
        component: <DefectTypesTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.DEFECT_TYPE_TAB,
        mobileDisabled: true,
      },
      [ANALYSIS]: {
        name: formatMessage(messages.analysis),
        link: createTabLink(ANALYSIS),
        component: <AutoAnalysisTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.AUTO_ANALYSIS_TAB,
        mobileDisabled: true,
      },
      [PATTERN_ANALYSIS]: {
        name: formatMessage(messages.patternAnalysis),
        link: createTabLink(PATTERN_ANALYSIS),
        component: <PatternAnalysisTab />,
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
    const title = <FormattedMessage id="SettingsPage.title" defaultMessage="Project Settings" />;
    return <Navigation items={config} title={title} />;
  }, [config]);

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
      <ScrollWrapper>
        <div className={cx('header')}>
          <Header title={config[activeTab] && config[activeTab].name} />
        </div>
        <div className={cx('content')}>{content}</div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
