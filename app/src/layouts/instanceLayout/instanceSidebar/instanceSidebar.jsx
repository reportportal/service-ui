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
import { userRolesSelector } from 'controllers/pages';
import { useIntl } from 'react-intl';
import { canSeeSidebarOptions } from 'common/utils/permissions';
import {
  SERVER_SETTINGS_PAGE,
  PLUGINS_PAGE,
  ALL_USERS_PAGE,
  PLUGIN_UI_EXTENSION_ADMIN_PAGE,
  USER_PROFILE_PAGE,
  ORGANIZATIONS_PAGE,
} from 'controllers/pages/constants';
import { SIDEBAR_EVENTS } from 'components/main/analytics/events';
import {
  uiExtensionAdminPagesSelector,
  uiExtensionSidebarComponentsSelector,
} from 'controllers/plugins/uiExtensions';
import { AppSidebar } from 'layouts/common/appSidebar';
import { ExtensionLoader } from 'components/extensionLoader';
import OrganizationsIcon from 'common/img/sidebar/organizations-icon-inline.svg';
import UsersIcon from 'common/img/sidebar/members-icon-inline.svg';
import SettingsIcon from 'common/img/sidebar/settings-icon-inline.svg';
import PluginsIcon from 'common/img/sidebar/plugins-icon-inline.svg';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { assignedOrganizationsSelector } from 'controllers/user';
import { OrganizationsControlWithPopover } from '../../organizationsControl';
import { messages } from '../../messages';

const ORGANIZATION_CONTROL = 'Organization control';

export function InstanceSidebar({ onClickNavBtn }) {
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();
  const userRoles = useSelector(userRolesSelector);
  const sidebarExtensions = useSelector(uiExtensionSidebarComponentsSelector);
  const adminPageExtensions = useSelector(uiExtensionAdminPagesSelector);
  const assignedOrganizations = useSelector(assignedOrganizationsSelector);
  const noAssignedOrganizations =
    Object.keys(assignedOrganizations).length === 0 && userRoles.userRole !== ADMINISTRATOR;

  const [isOpenOrganizationPopover, setIsOpenOrganizationPopover] = useState(false);

  const onClickButton = (eventInfo) => {
    onClickNavBtn();
    trackEvent(SIDEBAR_EVENTS.onClickItem(eventInfo));
  };

  const getSidebarItems = () => {
    const sidebarItems = [
      {
        onClick: (isSidebarCollapsed) =>
          onClickButton({ itemName: messages.organizations.defaultMessage, isSidebarCollapsed }),
        link: { type: ORGANIZATIONS_PAGE },
        icon: OrganizationsIcon,
        message: formatMessage(messages.organizations),
      },
    ];

    if (canSeeSidebarOptions(userRoles)) {
      sidebarItems.push(
        {
          onClick: (isSidebarCollapsed) =>
            onClickButton({ itemName: messages.allUsers.defaultMessage, isSidebarCollapsed }),
          link: { type: ALL_USERS_PAGE },
          icon: UsersIcon,
          message: formatMessage(messages.allUsers),
        },
        {
          onClick: (isSidebarCollapsed) =>
            onClickButton({ itemName: messages.settings.defaultMessage, isSidebarCollapsed }),
          link: { type: SERVER_SETTINGS_PAGE },
          icon: SettingsIcon,
          message: formatMessage(messages.settings),
        },
        {
          onClick: (isSidebarCollapsed) =>
            onClickButton({ itemName: messages.plugins.defaultMessage, isSidebarCollapsed }),
          link: { type: PLUGINS_PAGE },
          icon: PluginsIcon,
          message: formatMessage(messages.plugins),
        },
      );

      adminPageExtensions
        .filter((ext) => !!ext.buttonIcon)
        .forEach((extension) =>
          sidebarItems.push({
            onClick: onClickNavBtn,
            link: { type: PLUGIN_UI_EXTENSION_ADMIN_PAGE, payload: { pluginPage: extension.name } },
            icon: extension.buttonIcon,
            message: extension.buttonLabel || extension.name,
          }),
        );
    }

    sidebarExtensions.forEach((extension) =>
      sidebarItems.push({
        name: extension.name,
        component: <ExtensionLoader extension={extension} />,
        onClick: onClickNavBtn,
      }),
    );

    return noAssignedOrganizations ? [] : sidebarItems;
  };

  const link = { type: ORGANIZATIONS_PAGE };
  const linkToUserProfilePage = { type: USER_PROFILE_PAGE };
  const titles = {
    shortTitle: formatMessage(messages.all),
    topTitle: formatMessage(messages.allOrganizations),
    bottomTitle: null,
    level: 'instance',
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
    />
  );

  return (
    <AppSidebar
      createMainBlock={noAssignedOrganizations ? () => {} : createMainBlock}
      items={getSidebarItems()}
      isOpenOrganizationPopover={isOpenOrganizationPopover}
      linkToUserProfilePage={linkToUserProfilePage}
    />
  );
}

InstanceSidebar.propTypes = {
  onClickNavBtn: PropTypes.func.isRequired,
};
