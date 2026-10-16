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
import { useIntl } from 'react-intl';
import {
  ORGANIZATION_PROJECTS_PAGE,
  ORGANIZATION_USERS_PAGE,
  ORGANIZATION_SETTINGS_PAGE,
  ORGANIZATION_PLUGIN_PAGE,
  USER_PROFILE_PAGE_ORGANIZATION_LEVEL,
  ORGANIZATIONS_PAGE,
} from 'controllers/pages/constants';
import {
  uiExtensionOrganizationPagesSelector,
  uiExtensionOrganizationSidebarComponentsSelector,
} from 'controllers/plugins/uiExtensions';
import { AppSidebar } from 'layouts/common/appSidebar';
import { ExtensionLoader } from 'components/extensionLoader';
import MembersIcon from 'common/img/sidebar/members-icon-inline.svg';
import SettingsIcon from 'common/img/sidebar/settings-icon-inline.svg';
import ProjectsIcon from 'common/img/sidebar/projects-icon-inline.svg';
import DashboardIcon from 'common/img/sidebar/dashboard-icon-inline.svg';
import {
  activeOrganizationNameSelector,
  activeOrganizationSelector,
} from 'controllers/organization';
import { SIDEBAR_EVENTS } from 'components/main/analytics/events';
import { PreservedText } from 'components/preservedText';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { ORGANIZATION_DASHBOARDS_PAGE_SLUG } from 'controllers/plugins';
import { OrganizationsControlWithPopover } from '../../organizationsControl';
import { messages } from '../../messages';

const ORGANIZATION_CONTROL = 'Organization control';

export const OrganizationSidebar = ({ onClickNavBtn }) => {
  const { trackEvent } = useTracking();
  const { canSeeOrganizationMembers } = useUserPermissions();
  const { formatMessage } = useIntl();
  const sidebarExtensions = useSelector(uiExtensionOrganizationSidebarComponentsSelector);
  const organizationPageExtensions = useSelector(uiExtensionOrganizationPagesSelector);
  const organizationSlug = useSelector(activeOrganizationSelector)?.slug;
  const organizationName = useSelector(activeOrganizationNameSelector);
  const [isOpenOrganizationPopover, setIsOpenOrganizationPopover] = useState(false);

  const onClickButton = (eventInfo) => {
    onClickNavBtn();
    trackEvent(SIDEBAR_EVENTS.onClickItem(eventInfo));
  };

  const getSidebarItems = () => {
    let menuCounter = 0;
    const menuStep = 10;
    const nextMenuOrder = () => {
      menuCounter += menuStep;
      return menuCounter;
    };

    const sidebarItems = [
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({
            itemName: messages.organizationDashboards.defaultMessage,
            isSidebarCollapsed,
          }),
        link: {
          type: ORGANIZATION_PLUGIN_PAGE,
          payload: { organizationSlug, pluginPage: ORGANIZATION_DASHBOARDS_PAGE_SLUG },
        },
        icon: DashboardIcon,
        message: formatMessage(messages.organizationDashboards),
        menuOrder: nextMenuOrder(),
      },
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({ itemName: messages.projects.defaultMessage, isSidebarCollapsed }),
        link: { type: ORGANIZATION_PROJECTS_PAGE, payload: { organizationSlug } },
        icon: ProjectsIcon,
        message: formatMessage(messages.projects),
        menuOrder: nextMenuOrder(),
      },
      ...(canSeeOrganizationMembers
        ? [
            {
              onClick: (isSidebarCollapsed) =>
                onClickButton({ itemName: messages.users.defaultMessage, isSidebarCollapsed }),
              link: {
                type: ORGANIZATION_USERS_PAGE,
                payload: { organizationSlug },
              },
              icon: MembersIcon,
              message: formatMessage(messages.users),
              menuOrder: nextMenuOrder(),
            },
          ]
        : []),
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({
            itemName: messages.organizationSettings.defaultMessage,
            isSidebarCollapsed,
          }),
        link: {
          type: ORGANIZATION_SETTINGS_PAGE,
          payload: { organizationSlug },
        },
        icon: SettingsIcon,
        message: formatMessage(messages.organizationSettings),
        menuOrder: nextMenuOrder(),
      },
    ];

    sidebarItems.push(
      ...organizationPageExtensions.flatMap(({ payload, pluginName, name: extensionName }) => {
        const { icon, slug, name, title, iconName, menuOrder } = payload;
        if ((slug || name) === ORGANIZATION_DASHBOARDS_PAGE_SLUG) {
          return [];
        }
        const iconSvg = icon?.content || icon?.svg;
        const itemTitle = title || icon?.title || name;
        if (!iconSvg || !itemTitle) {
          return [];
        }
        const itemName = iconName || itemTitle;

        return [
          {
            name: [pluginName, extensionName, slug || name].filter(Boolean).join(':'),
            onClick: (isSidebarCollapsed) => onClickButton({ itemName, isSidebarCollapsed }),
            link: {
              type: ORGANIZATION_PLUGIN_PAGE,
              payload: { organizationSlug, pluginPage: slug || name },
            },
            icon: iconSvg,
            message: itemTitle,
            menuOrder: menuOrder ?? nextMenuOrder(),
          },
        ];
      }),
    );

    sidebarExtensions.forEach((extension) => {
      const itemName = extension.payload?.iconName;

      sidebarItems.push({
        name: extension.name,
        component: <ExtensionLoader extension={extension} />,
        onClick: (isSidebarCollapsed) =>
          itemName ? onClickButton({ itemName, isSidebarCollapsed }) : onClickNavBtn(),
        menuOrder: extension.payload?.menuOrder ?? nextMenuOrder(),
      });
    });

    return sidebarItems.sort((a, b) => a.menuOrder - b.menuOrder);
  };

  const link = { type: ORGANIZATIONS_PAGE };
  const linkToUserProfilePage = {
    type: USER_PROFILE_PAGE_ORGANIZATION_LEVEL,
    payload: { organizationSlug },
  };
  const titles = {
    entityName: organizationName,
    topTitle: formatMessage(messages.allOrganizations),
    bottomTitle: <PreservedText>{organizationName}</PreservedText>,
    level: 'organization',
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

OrganizationSidebar.propTypes = {
  onClickNavBtn: PropTypes.func.isRequired,
};
