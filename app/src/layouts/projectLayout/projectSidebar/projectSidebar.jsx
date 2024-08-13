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
import { userRolesSelector, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { SIDEBAR_EVENTS } from 'components/main/analytics/events';
import { FormattedMessage, useIntl } from 'react-intl';
import { canSeeMembers } from 'common/utils/permissions';
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
  ALL_ORGANIZATIONS_PAGE,
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
import DebugIcon from 'common/img/sidebar/debug-icon-inline.svg';
import MembersIcon from 'common/img/sidebar/members-icon-inline.svg';
import SettingsIcon from 'common/img/sidebar/settings-icon-inline.svg';
import { projectNameSelector } from 'controllers/project';
import { activeOrganizationNameSelector } from 'controllers/organizations/organization';
import { OrganizationsControlWithPopover } from '../../organizationsControl';
import { messages } from '../../messages';

export const ProjectSidebar = ({ onClickNavBtn }) => {
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();
  const userRoles = useSelector(userRolesSelector);
  const sidebarExtensions = useSelector(uiExtensionSidebarComponentsSelector);
  const projectPageExtensions = useSelector(uiExtensionProjectPagesSelector);
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const organizationName = useSelector(activeOrganizationNameSelector);
  const projectName = useSelector(projectNameSelector);
  const [isOpenOrganizationPopover, setIsOpenOrganizationPopover] = useState(false);

  const onClickButton = (eventInfo) => {
    onClickNavBtn();
    trackEvent(eventInfo);
  };

  const getSidebarItems = () => {
    const sidebarItems = [
      {
        onClick: () => onClickButton(SIDEBAR_EVENTS.CLICK_DASHBOARD_BTN),
        link: { type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } },
        icon: DashboardIcon,
        message: (
          <FormattedMessage id={'Sidebar.dashboardsBtn'} defaultMessage={'Project Dashboards'} />
        ),
      },
      {
        onClick: () => onClickButton(SIDEBAR_EVENTS.CLICK_LAUNCH_ICON),
        link: {
          type: LAUNCHES_PAGE,
          payload: { organizationSlug, projectSlug },
        },
        icon: LaunchesIcon,
        message: <FormattedMessage id={'Sidebar.launchesBtn'} defaultMessage={'Launches'} />,
      },
      {
        onClick: () => onClickButton(SIDEBAR_EVENTS.CLICK_DEBUG_BTN),
        link: {
          type: PROJECT_USERDEBUG_PAGE,
          payload: { projectSlug, filterId: ALL, organizationSlug },
        },
        icon: DebugIcon,
        message: <FormattedMessage id={'Sidebar.debugBtn'} defaultMessage={'Debug Mode'} />,
      },
      {
        onClick: () => onClickButton(SIDEBAR_EVENTS.CLICK_FILTERS_BTN),
        link: { type: PROJECT_FILTERS_PAGE, payload: { organizationSlug, projectSlug } },
        icon: FiltersIcon,
        message: <FormattedMessage id={'Sidebar.filtersBtn'} defaultMessage={'Filters'} />,
      },
    ];

    if (canSeeMembers(userRoles)) {
      sidebarItems.push({
        onClick: () => onClickButton(SIDEBAR_EVENTS.CLICK_MEMBERS_BTN),
        link: {
          type: PROJECT_MEMBERS_PAGE,
          payload: { organizationSlug, projectSlug },
        },
        icon: MembersIcon,
        message: <FormattedMessage id={'Sidebar.membersBtn'} defaultMessage={'Project Team'} />,
      });
    }

    sidebarItems.push({
      onClick: () => onClickButton(SIDEBAR_EVENTS.CLICK_SETTINGS_BTN),
      link: {
        type: PROJECT_SETTINGS_PAGE,
        payload: { organizationSlug, projectSlug },
      },
      icon: SettingsIcon,
      message: <FormattedMessage id={'Sidebar.settingsBtn'} defaultMessage={'Project Settings'} />,
    });
    projectPageExtensions.forEach(({ icon, internalRoute }) => {
      if (icon) {
        sidebarItems.push({
          onClick: onClickNavBtn,
          link: {
            type: PROJECT_PLUGIN_PAGE,
            payload: { organizationSlug, projectSlug, pluginPage: internalRoute },
          },
          icon: icon.svg,
          message: icon.title,
        });
      }
    });
    sidebarExtensions.forEach((extension) =>
      sidebarItems.push({
        name: extension.name,
        component: <ExtensionLoader extension={extension} />,
        onClick: onClickNavBtn,
      }),
    );

    return sidebarItems;
  };

  const linkToAllOrganization = { type: ALL_ORGANIZATIONS_PAGE };
  const link = { type: ORGANIZATION_PROJECTS_PAGE, payload: { organizationSlug } };
  const linkToUserProfilePage = {
    type: USER_PROFILE_PAGE_PROJECT_LEVEL,
    payload: { organizationSlug, projectSlug },
  };
  const titles = {
    shortTitle: `${projectName[0]}${projectName[projectName.length - 1]}`,
    topTitle: `${formatMessage(messages.organization)}: ${organizationName}`,
    bottomTitle: projectName,
  };

  const createMainBlock = (openSidebar, closeSidebar) => (
    <OrganizationsControlWithPopover
      closeSidebar={closeSidebar}
      isOpenPopover={isOpenOrganizationPopover}
      togglePopover={setIsOpenOrganizationPopover}
      onClick={() => {
        openSidebar();
        setIsOpenOrganizationPopover(!isOpenOrganizationPopover);
      }}
      linkToAllOrganization={linkToAllOrganization}
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
