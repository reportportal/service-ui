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

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTracking } from 'react-tracking';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { SIDEBAR_EVENTS } from 'components/main/analytics/events';
import { FormattedMessage } from 'react-intl';
import { CUSTOMER } from 'common/constants/projectRoles';
import { canSeeMembers } from 'common/utils/permissions';
import { ALL } from 'common/constants/reservedFilterIds';
import {
  PROJECT_DASHBOARD_PAGE,
  PROJECT_USERDEBUG_PAGE,
  LAUNCHES_PAGE,
  PROJECT_FILTERS_PAGE,
  PROJECT_MEMBERS_PAGE,
  PROJECT_SETTINGS_PAGE,
} from 'controllers/pages/constants';
import { uiExtensionSidebarComponentsSelector } from 'controllers/plugins';
import { AppSidebar } from 'layouts/common/appSidebar';
import { ExtensionLoader } from 'components/extensionLoader';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import FiltersIcon from 'common/img/filters-icon-inline.svg';
import { SidebarButton } from 'components/buttons/sidebarButton/sidebarButton';
import DashboardIcon from './img/dashboard-icon-inline.svg';
import LaunchesIcon from './img/launches-icon-inline.svg';
import DebugIcon from './img/debug-icon-inline.svg';
import MembersIcon from './img/members-icon-inline.svg';
import SettingsIcon from './img/settings-icon-inline.svg';
import { OrganizationsBlock } from './organizationsBlock';
import { OrganizationsControlWithPopover } from './organizationsControl';

export const ProjectSidebar = ({ onClickNavBtn }) => {
  const { trackEvent } = useTracking();
  const projectRole = useSelector(activeProjectRoleSelector);
  const accountRole = useSelector(userAccountRoleSelector);
  const extensions = useSelector(uiExtensionSidebarComponentsSelector);
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const [isOpenOrganizationPopover, setIsOpenOrganizationPopover] = useState(false);
  const [isHoveredOrganization, setIsHoveredOrganization] = useState(false);

  const onClickButton = (eventInfo) => {
    onClickNavBtn();
    trackEvent(eventInfo);
  };

  const onHoverOrganization = () => {
    setIsHoveredOrganization(true);
  };

  const onClearOrganization = () => {
    setIsHoveredOrganization(false);
  };

  const getSidebarItems = () => {
    const topItems = [
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
    ];

    if (projectRole !== CUSTOMER) {
      topItems.push({
        onClick: () => onClickButton(SIDEBAR_EVENTS.CLICK_DEBUG_BTN),
        link: {
          type: PROJECT_USERDEBUG_PAGE,
          payload: { projectSlug, filterId: ALL, organizationSlug },
        },
        icon: DebugIcon,
        message: <FormattedMessage id={'Sidebar.debugBtn'} defaultMessage={'Debug Mode'} />,
      });
    }

    topItems.push({
      onClick: () => onClickButton(SIDEBAR_EVENTS.CLICK_FILTERS_BTN),
      link: { type: PROJECT_FILTERS_PAGE, payload: { organizationSlug, projectSlug } },
      icon: FiltersIcon,
      message: <FormattedMessage id={'Sidebar.filtersBtn'} defaultMessage={'Filters'} />,
    });

    if (canSeeMembers(accountRole, projectRole)) {
      topItems.push({
        onClick: () => onClickButton(SIDEBAR_EVENTS.CLICK_MEMBERS_BTN),
        link: {
          type: PROJECT_MEMBERS_PAGE,
          payload: { organizationSlug, projectSlug },
        },
        icon: MembersIcon,
        message: <FormattedMessage id={'Sidebar.membersBnt'} defaultMessage={'Project Team'} />,
      });
    }

    topItems.push({
      onClick: () => onClickButton(SIDEBAR_EVENTS.CLICK_SETTINGS_BTN),
      link: {
        type: PROJECT_SETTINGS_PAGE,
        payload: { organizationSlug, projectSlug },
      },
      icon: SettingsIcon,
      message: <FormattedMessage id={'Sidebar.settingsBnt'} defaultMessage={'Project Settings'} />,
    });
    extensions.forEach((extension) =>
      topItems.push({
        name: extension.name,
        component: <ExtensionLoader extension={extension} />,
        onClick: onClickNavBtn,
      }),
    );

    const topSidebarItems = topItems.map(({ link, icon, message, name, component, onClick }) => ({
      key: component ? name : link.type,
      onClick,
      topSidebarItem: (
        <>
          {component || (
            <SidebarButton link={link} icon={icon}>
              {message}
            </SidebarButton>
          )}
        </>
      ),
    }));

    const topSidebarControlItems = topItems.map(({ component, name, link, onClick, message }) => ({
      key: component ? name : link.type,
      onClick,
      sidebarBlockItem: component || (
        <SidebarButton link={link} isNavbar>
          {message}
        </SidebarButton>
      ),
    }));

    return { topSidebarItems, topSidebarControlItems };
  };

  const { topSidebarItems, topSidebarControlItems } = getSidebarItems();

  const createMainBlock = (openNavbar) => (
    <OrganizationsBlock
      onHoverOrganization={onHoverOrganization}
      onClearOrganization={onClearOrganization}
      isHoveredOrganization={isHoveredOrganization}
      onClick={() => {
        openNavbar();
        setIsOpenOrganizationPopover(true);
      }}
    />
  );

  const createMainControlBlock = (closeNavbar, setIsOpenPopover) => (
    <OrganizationsControlWithPopover
      closeNavbar={closeNavbar}
      isOpenPopover={isOpenOrganizationPopover}
      closePopover={() => setIsOpenOrganizationPopover(false)}
      setIsOpenPopover={setIsOpenPopover}
      onHoverOrganization={onHoverOrganization}
      onClearOrganization={onClearOrganization}
      isHoveredOrganization={isHoveredOrganization}
    />
  );

  return (
    <AppSidebar
      createMainBlock={createMainBlock}
      createMainControlBlock={createMainControlBlock}
      topSidebarItems={topSidebarItems}
      topSidebarControlItems={topSidebarControlItems}
    />
  );
};

ProjectSidebar.propTypes = {
  onClickNavBtn: PropTypes.func.isRequired,
};
