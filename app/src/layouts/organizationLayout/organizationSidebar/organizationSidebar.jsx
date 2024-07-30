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
import { FormattedMessage, useIntl } from 'react-intl';
import { canSeeMembers } from 'common/utils/permissions';
import {
  ORGANIZATION_PROJECTS_PAGE,
  ORGANIZATION_MEMBERS_PAGE,
  ORGANIZATION_SETTINGS_PAGE,
  ORGANIZATIONS_PAGE,
  USER_PROFILE_PAGE_ORGANIZATION_LEVEL,
} from 'controllers/pages/constants';
import { uiExtensionSidebarComponentsSelector } from 'controllers/plugins/uiExtensions';
import { AppSidebar } from 'layouts/common/appSidebar';
import { ExtensionLoader } from 'components/extensionLoader';
import MembersIcon from 'common/img/sidebar/members-icon-inline.svg';
import SettingsIcon from 'common/img/sidebar/settings-icon-inline.svg';
import ProjectsIcon from 'common/img/sidebar/projects-icon-inline.svg';
import { activeOrganizationNameSelector } from 'controllers/organizations/organization';
import { OrganizationsControlWithPopover } from '../../organizationsControl';
import { messages } from '../../messages';

export const OrganizationSidebar = ({ onClickNavBtn }) => {
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();
  const userRoles = useSelector(userRolesSelector);
  const sidebarExtensions = useSelector(uiExtensionSidebarComponentsSelector);
  const { organizationSlug } = useSelector(urlOrganizationAndProjectSelector);
  const organizationName = useSelector(activeOrganizationNameSelector);
  const [isOpenOrganizationPopover, setIsOpenOrganizationPopover] = useState(false);

  const onClickButton = (eventInfo) => {
    onClickNavBtn();
    trackEvent(eventInfo);
  };

  const getSidebarItems = () => {
    const sidebarItems = [
      {
        onClick: () => onClickButton(),
        link: { type: ORGANIZATION_PROJECTS_PAGE, payload: { organizationSlug } },
        icon: ProjectsIcon,
        message: (
          <FormattedMessage id={'OrganizationSidebar.projectsBtn'} defaultMessage={'Projects'} />
        ),
      },
    ];

    if (canSeeMembers(userRoles)) {
      sidebarItems.push({
        onClick: () => onClickButton(),
        link: {
          type: ORGANIZATION_MEMBERS_PAGE,
          payload: { organizationSlug },
        },
        icon: MembersIcon,
        message: (
          <FormattedMessage
            id={'OrganizationSidebar.membersBtn'}
            defaultMessage={'Organization Users'}
          />
        ),
      });
    }

    sidebarItems.push({
      onClick: () => onClickButton(),
      link: {
        type: ORGANIZATION_SETTINGS_PAGE,
        payload: { organizationSlug },
      },
      icon: SettingsIcon,
      message: (
        <FormattedMessage
          id={'OrganizationSidebar.settingsBtn'}
          defaultMessage={'Organization Settings'}
        />
      ),
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

  const link = { type: ORGANIZATIONS_PAGE };
  const linkToUserProfilePage = {
    type: USER_PROFILE_PAGE_ORGANIZATION_LEVEL,
    payload: { organizationSlug },
  };
  const titles = {
    shortTitle: `${organizationName[0]}${organizationName[organizationName.length - 1]}`,
    topTitle: formatMessage(messages.allOrganizations),
    bottomTitle: organizationName,
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
      link={link}
      titles={titles}
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
