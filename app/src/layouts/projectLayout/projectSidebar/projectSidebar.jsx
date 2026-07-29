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

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTracking } from 'react-tracking';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { SIDEBAR_EVENTS } from 'components/main/analytics/events';
import { useIntl } from 'react-intl';
import { ALL } from 'common/constants/reservedFilterIds';
import {
  PROJECT_DASHBOARD_PAGE,
  PROJECT_USERDEBUG_PAGE,
  LAUNCHES_PAGE,
  PROJECT_FILTERS_PAGE,
  PROJECT_MEMBERS_PAGE,
  PROJECT_SETTINGS_PAGE,
  PROJECT_PLUGIN_PAGE,
  ORGANIZATION_PROJECTS_PAGE,
  USER_PROFILE_PAGE_PROJECT_LEVEL,
  PRODUCT_VERSIONS_PAGE,
  TEST_CASE_LIBRARY_PAGE,
  PROJECT_MILESTONES_PAGE,
  MANUAL_LAUNCHES_PAGE,
} from 'controllers/pages/constants';
import {
  uiExtensionSidebarComponentsSelector,
  uiExtensionProjectPagesSelector,
} from 'controllers/plugins/uiExtensions';
import { AppSidebar } from 'layouts/common/appSidebar';
import { ExtensionLoader } from 'components/extensionLoader';
import FiltersIcon from 'common/img/filters-icon-inline.svg';
import DashboardIcon from 'common/img/sidebar/dashboard-icon-inline.svg';
import LaunchesIcon from 'common/img/sidebar/launches-icon-inline.svg';
import ManualLaunchesIcon from 'common/img/sidebar/manual-launches-icon-inline.svg';
import DebugIcon from 'common/img/sidebar/debug-icon-inline.svg';
import MembersIcon from 'common/img/sidebar/members-icon-inline.svg';
import SettingsIcon from 'common/img/sidebar/settings-icon-inline.svg';
import ProductVersionsIcon from 'common/img/sidebar/product-versions-inline.svg';
import TestCaseIcon from 'common/img/sidebar/test-case-icon-inline.svg';
import MilestonesIcon from 'common/img/sidebar/milestones-icon-inline.svg';
import TestExecutionsIcon from 'common/img/sidebar/test-executions-icon-inline.svg';
import { projectNameSelector } from 'controllers/project';
import { activeOrganizationNameSelector } from 'controllers/organization';
import { OrganizationsControlWithPopover } from '../../organizationsControl';
import { getTmsOverride } from 'controllers/appInfo/utils';
import { PreservedText } from 'components/preservedText';
import { messages } from '../../messages';

const ORGANIZATION_CONTROL = 'Organization control';
const TEST_EXECUTIONS_SLUG = 'testExecution';
const TEST_EXECUTIONS_MENU_ORDER = 25;
const DEBUG_MENU_ORDER = 90;

export const ProjectSidebar = ({ onClickNavBtn }) => {
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();
  const sidebarExtensions = useSelector(uiExtensionSidebarComponentsSelector);
  const projectPageExtensions = useSelector(uiExtensionProjectPagesSelector);
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const organizationName = useSelector(activeOrganizationNameSelector);
  const projectName = useSelector(projectNameSelector);
  const [isOpenOrganizationPopover, setIsOpenOrganizationPopover] = useState(false);

  const onClickButton = (eventInfo) => {
    onClickNavBtn();
    if (eventInfo) {
      trackEvent(SIDEBAR_EVENTS.onClickItem(eventInfo));
    }
  };

  const getSidebarItems = () => {
    let menuCounter = 0;
    const menuStep = 10;
    const isShowInProgressTmsFeatures = Boolean(getTmsOverride());

    const sidebarItems = [
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({ itemName: messages.dashboards.defaultMessage, isSidebarCollapsed }),
        link: { type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } },
        icon: DashboardIcon,
        message: formatMessage(messages.dashboards),
        menuOrder: (menuCounter += menuStep),
      },
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({ itemName: messages.launches.defaultMessage, isSidebarCollapsed }),
        link: {
          type: LAUNCHES_PAGE,
          payload: { organizationSlug, projectSlug },
        },
        icon: LaunchesIcon,
        message: formatMessage(messages.launches),
        menuOrder: (menuCounter += menuStep),
      },
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({ itemName: messages.testExecutions.defaultMessage, isSidebarCollapsed }),
        link: {
          type: PROJECT_PLUGIN_PAGE,
          payload: { organizationSlug, projectSlug, pluginPage: TEST_EXECUTIONS_SLUG },
        },
        icon: TestExecutionsIcon,
        message: formatMessage(messages.testExecutions),
        menuOrder: (menuCounter = TEST_EXECUTIONS_MENU_ORDER),
      },
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({
            itemName: messages.manualLaunches.defaultMessage,
            isSidebarCollapsed,
          }),
        link: {
          type: MANUAL_LAUNCHES_PAGE,
          payload: { organizationSlug, projectSlug },
        },
        icon: ManualLaunchesIcon,
        message: formatMessage(messages.manualLaunches),
        menuOrder: (menuCounter += menuStep),
      },
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({
            itemName: messages.milestones.defaultMessage,
            isSidebarCollapsed,
          }),
        link: {
          type: PROJECT_MILESTONES_PAGE,
          payload: { organizationSlug, projectSlug },
        },
        icon: MilestonesIcon,
        message: formatMessage(messages.milestones),
        menuOrder: (menuCounter += menuStep),
      },
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({
            itemName: messages.testCaseLibrary.defaultMessage,
            isSidebarCollapsed,
          }),
        link: {
          type: TEST_CASE_LIBRARY_PAGE,
          payload: { organizationSlug, projectSlug },
        },
        icon: TestCaseIcon,
        message: formatMessage(messages.testCaseLibrary),
        menuOrder: (menuCounter += menuStep),
      },
      ...(isShowInProgressTmsFeatures
        ? [
            {
              onClick: (isSidebarCollapsed) =>
                onClickButton({
                  itemName: messages.productVersions.defaultMessage,
                  isSidebarCollapsed,
                }),
              link: {
                type: PRODUCT_VERSIONS_PAGE,
                payload: { organizationSlug, projectSlug },
              },
              icon: ProductVersionsIcon,
              message: formatMessage(messages.productVersions),
              menuOrder: (menuCounter += menuStep),
            },
          ]
        : []),
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({ itemName: messages.debugMode.defaultMessage, isSidebarCollapsed }),
        link: {
          type: PROJECT_USERDEBUG_PAGE,
          payload: { projectSlug, filterId: ALL, organizationSlug },
        },
        icon: DebugIcon,
        message: formatMessage(messages.debugMode),
        menuOrder: (menuCounter = DEBUG_MENU_ORDER),
      },
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({ itemName: messages.filters.defaultMessage, isSidebarCollapsed }),
        link: { type: PROJECT_FILTERS_PAGE, payload: { organizationSlug, projectSlug } },
        icon: FiltersIcon,
        message: formatMessage(messages.filters),
        menuOrder: (menuCounter += menuStep),
      },
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({ itemName: messages.projectTeam.defaultMessage, isSidebarCollapsed }),
        link: {
          type: PROJECT_MEMBERS_PAGE,
          payload: { organizationSlug, projectSlug },
        },
        icon: MembersIcon,
        message: formatMessage(messages.projectTeam),
        menuOrder: (menuCounter += menuStep),
      },
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({ itemName: messages.projectsSettings.defaultMessage, isSidebarCollapsed }),
        link: {
          type: PROJECT_SETTINGS_PAGE,
          payload: { organizationSlug, projectSlug },
        },
        icon: SettingsIcon,
        message: formatMessage(messages.projectsSettings),
        menuOrder: (menuCounter += menuStep),
      },
    ];

    const pluginPageItems = projectPageExtensions.flatMap(
      ({ payload, pluginName, name: extensionName, url }) => {
        const { icon, slug, name, title, iconName, menuOrder } = payload;
        if ((slug || name) === TEST_EXECUTIONS_SLUG) {
          return [];
        }
        const iconSvg = icon?.content || icon?.svg;
        const itemTitle = title || icon?.title || name;
        if (!iconSvg) {
          return [];
        }
        const itemName = iconName || itemTitle;
        return [
          {
            name: [pluginName, extensionName, slug || name, url].filter(Boolean).join(':'),
            onClick: (isSidebarCollapsed) => onClickButton({ itemName, isSidebarCollapsed }),
            link: {
              type: PROJECT_PLUGIN_PAGE,
              payload: { organizationSlug, projectSlug, pluginPage: slug || name },
            },
            icon: iconSvg,
            message: itemTitle,
            menuOrder: menuOrder || (menuCounter += menuStep),
          },
        ];
      },
    );

    const uiExtensionItems = sidebarExtensions.map((extension) => ({
      name: extension.name,
      component: <ExtensionLoader extension={extension} />,
      onClick: onClickNavBtn,
      menuOrder: (menuCounter += menuStep),
    }));

    return [...sidebarItems, ...pluginPageItems, ...uiExtensionItems].sort(
      (a, b) => a.menuOrder - b.menuOrder,
    );
  };

  const link = { type: ORGANIZATION_PROJECTS_PAGE, payload: { organizationSlug } };
  const linkToUserProfilePage = {
    type: USER_PROFILE_PAGE_PROJECT_LEVEL,
    payload: { organizationSlug, projectSlug },
  };
  const titles = {
    entityName: projectName,
    topTitle: (
      <PreservedText>
        {formatMessage(messages.organization)}: {organizationName}
      </PreservedText>
    ),
    bottomTitle: <PreservedText>{projectName}</PreservedText>,
    level: 'project',
  };

  const createMainBlock = (
    openSidebar,
    closeSidebar,
    getIsSidebarCollapsed,
    afterOpenSidebar,
    isSidebarExpanded,
  ) => (
    <OrganizationsControlWithPopover
      closeSidebar={closeSidebar}
      isOpenPopover={isOpenOrganizationPopover}
      togglePopover={(open) => {
        if (open) {
          openSidebar();
          afterOpenSidebar(() => setIsOpenOrganizationPopover(true));
        } else {
          setIsOpenOrganizationPopover(false);
        }
      }}
      onClick={() => {
        const isSidebarCollapsed = getIsSidebarCollapsed();
        trackEvent(
          SIDEBAR_EVENTS.onClickItem({
            itemName: ORGANIZATION_CONTROL,
            isSidebarCollapsed,
          }),
        );
      }}
      link={link}
      titles={titles}
      isExtendedNav
      isSidebarExpanded={isSidebarExpanded}
    />
  );

  return (
    <AppSidebar
      createMainBlock={createMainBlock}
      items={getSidebarItems()}
      isOpenOrganizationPopover={isOpenOrganizationPopover}
      linkToUserProfilePage={linkToUserProfilePage}
    />
  );
};

ProjectSidebar.propTypes = {
  onClickNavBtn: PropTypes.func.isRequired,
};
