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
  PROJECT_TEST_PLANS_PAGE,
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
import TestPlansIcon from 'common/img/sidebar/test-plans-icon-inline.svg';
import { projectNameSelector } from 'controllers/project';
import { activeOrganizationNameSelector } from 'controllers/organization';
import { OrganizationsControlWithPopover } from '../../organizationsControl';
import { messages } from '../../messages';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useTmsEnabled } from 'hooks/useTmsEnabled';

const ORGANIZATION_CONTROL = 'Organization control';

export const ProjectSidebar = ({ onClickNavBtn }) => {
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();
  const { canSeeMembers, canWorkWithFilters } = useUserPermissions();
  const isTmsEnabled = useTmsEnabled();
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
      ...(isTmsEnabled
        ? [
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
          ]
        : []),
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({ itemName: messages.manualLaunches.defaultMessage, isSidebarCollapsed }),
        link: {
          type: MANUAL_LAUNCHES_PAGE,
          payload: { organizationSlug, projectSlug },
        },
        icon: ManualLaunchesIcon,
        message: formatMessage(messages.manualLaunches),
      },
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({ itemName: messages.debugMode.defaultMessage, isSidebarCollapsed }),
        link: {
          type: PROJECT_USERDEBUG_PAGE,
          payload: { projectSlug, filterId: ALL, organizationSlug },
        },
        icon: DebugIcon,
        message: formatMessage(messages.debugMode),
        menuOrder: (menuCounter += menuStep),
      },
    ];

    if (canWorkWithFilters) {
      sidebarItems.push({
        onClick: (isSidebarCollapsed) =>
          onClickButton({ itemName: messages.filters.defaultMessage, isSidebarCollapsed }),
        link: { type: PROJECT_FILTERS_PAGE, payload: { organizationSlug, projectSlug } },
        icon: FiltersIcon,
        message: formatMessage(messages.filters),
        menuOrder: (menuCounter += menuStep),
      });
    }

    if (canSeeMembers) {
      sidebarItems.push({
        onClick: (isSidebarCollapsed) =>
          onClickButton({ itemName: messages.projectTeam.defaultMessage, isSidebarCollapsed }),
        link: {
          type: PROJECT_MEMBERS_PAGE,
          payload: { organizationSlug, projectSlug },
        },
        icon: MembersIcon,
        message: formatMessage(messages.projectTeam),
        menuOrder: (menuCounter += menuStep),
      });
    }

    if (isTmsEnabled) {
      sidebarItems.push(
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
        {
          onClick: (isSidebarCollapsed) =>
            onClickButton({ itemName: messages.milestones.defaultMessage, isSidebarCollapsed }),
          link: {
            type: PROJECT_TEST_PLANS_PAGE,
            payload: { organizationSlug, projectSlug },
          },
          icon: TestPlansIcon,
          message: formatMessage(messages.milestones),
          menuOrder: (menuCounter += menuStep),
        },
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
      );
    }

    sidebarItems.push({
      onClick: (isSidebarCollapsed) =>
        onClickButton({ itemName: messages.projectsSettings.defaultMessage, isSidebarCollapsed }),
      link: {
        type: PROJECT_SETTINGS_PAGE,
        payload: { organizationSlug, projectSlug },
      },
      icon: SettingsIcon,
      message: formatMessage(messages.projectsSettings),
      menuOrder: (menuCounter += menuStep),
    });
    projectPageExtensions.forEach(({ icon, internalRoute, name, title, iconName, menuOrder }) => {
      if (icon) {
        const itemName = iconName || title;
        sidebarItems.push({
          onClick: (isSidebarCollapsed) => onClickButton({ itemName, isSidebarCollapsed }),
          link: {
            type: PROJECT_PLUGIN_PAGE,
            payload: { organizationSlug, projectSlug, pluginPage: internalRoute || name },
          },
          icon: icon.svg,
          message: icon.title || title,
          menuOrder: menuOrder || (menuCounter += menuStep),
        });
      }
    });
    sidebarExtensions.forEach((extension) =>
      sidebarItems.push({
        name: extension.name,
        component: <ExtensionLoader extension={extension} />,
        onClick: onClickNavBtn,
        menuOrder: (menuCounter += menuStep),
      }),
    );

    return sidebarItems.sort((a, b) => a.menuOrder - b.menuOrder);
  };

  const link = { type: ORGANIZATION_PROJECTS_PAGE, payload: { organizationSlug } };
  const linkToUserProfilePage = {
    type: USER_PROFILE_PAGE_PROJECT_LEVEL,
    payload: { organizationSlug, projectSlug },
  };
  const titles = {
    shortTitle: `${projectName[0]}${projectName[projectName.length - 1]}`,
    topTitle: `${formatMessage(messages.organization)}: ${organizationName}`,
    bottomTitle: projectName,
    level: 'project',
  };

  const createMainBlock = (openSidebar, closeSidebar, getIsSidebarCollapsed) => (
    <OrganizationsControlWithPopover
      closeSidebar={closeSidebar}
      isOpenPopover={isOpenOrganizationPopover}
      togglePopover={setIsOpenOrganizationPopover}
      onClick={() => {
        openSidebar();
        setIsOpenOrganizationPopover(!isOpenOrganizationPopover);
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
