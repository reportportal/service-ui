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
import { FormattedMessage } from 'react-intl';
import { canSeeSidebarOptions } from 'common/utils/permissions';
import {
  SERVER_SETTINGS_PAGE,
  PLUGINS_PAGE,
  ALL_USERS_PAGE,
  PROJECTS_PAGE,
  PLUGIN_UI_EXTENSION_ADMIN_PAGE,
} from 'controllers/pages/constants';
import { ADMIN_SIDEBAR_EVENTS } from 'components/main/analytics/events';
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
import { OrganizationsControlWithPopover } from '../../organizationsControl';

export const InstanceSidebar = ({ onClickNavBtn }) => {
  const { trackEvent } = useTracking();
  const userRoles = useSelector(userRolesSelector);
  const sidebarExtensions = useSelector(uiExtensionSidebarComponentsSelector);
  const adminPageExtensions = useSelector(uiExtensionAdminPagesSelector);
  const [isOpenOrganizationPopover, setIsOpenOrganizationPopover] = useState(false);

  const onClickButton = (eventInfo) => {
    onClickNavBtn();
    trackEvent(eventInfo);
  };

  const getSidebarItems = () => {
    const sidebarItems = [
      {
        onClick: () => onClickButton(ADMIN_SIDEBAR_EVENTS.CLICK_PROJECTS_BTN),
        link: { type: PROJECTS_PAGE },
        icon: OrganizationsIcon,
        message: (
          <FormattedMessage id={'InstanceSidebar.organizations'} defaultMessage={'Organizations'} />
        ),
      },
    ];

    if (canSeeSidebarOptions(userRoles)) {
      sidebarItems.push(
        {
          onClick: () => onClickButton(ADMIN_SIDEBAR_EVENTS.CLICK_ALL_USERS_BTN),
          link: { type: ALL_USERS_PAGE },
          icon: UsersIcon,
          message: (
            <FormattedMessage id={'InstanceSidebar.allUsers'} defaultMessage={'All Users'} />
          ),
        },
        {
          onClick: () => onClickButton(ADMIN_SIDEBAR_EVENTS.CLICK_SERVER_SETTINGS_BTN),
          link: { type: SERVER_SETTINGS_PAGE },
          icon: SettingsIcon,
          message: <FormattedMessage id={'InstanceSidebar.settings'} defaultMessage={'Settings'} />,
        },
        {
          onClick: () => onClickButton(ADMIN_SIDEBAR_EVENTS.CLICK_PLUGINS_BTN),
          link: { type: PLUGINS_PAGE },
          icon: PluginsIcon,
          message: <FormattedMessage id={'InstanceSidebar.plugins'} defaultMessage={'Plugins'} />,
        },
      );

      adminPageExtensions
        .filter((ext) => !!ext.buttonIcon)
        .forEach((extension) =>
          sidebarItems.push({
            onClick: () => onClickButton(),
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

    return sidebarItems;
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
      isInstanceLevel
    />
  );

  return (
    <AppSidebar
      createMainBlock={createMainBlock}
      items={getSidebarItems()}
      isOpenOrganizationPopover={isOpenOrganizationPopover}
    />
  );
};

InstanceSidebar.propTypes = {
  onClickNavBtn: PropTypes.func.isRequired,
};
