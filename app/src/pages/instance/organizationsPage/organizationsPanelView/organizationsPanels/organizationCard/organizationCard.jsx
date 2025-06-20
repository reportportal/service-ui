/*!
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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { useIntl, FormattedRelativeTime } from 'react-intl';
import Parser from 'html-react-parser';
import { useSelector } from 'react-redux';
import { Tooltip } from '@reportportal/ui-kit';
import { NavLink } from 'components/main/navLink';
import { ORGANIZATION_PROJECTS_PAGE } from 'controllers/pages/constants';
import { userRolesSelector } from 'controllers/pages';
import { MANAGER } from 'common/constants/projectRoles';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { getRelativeUnits } from 'common/utils/timeDateUtils';
import { assignedOrganizationsSelector } from 'controllers/user';
import UserIcon from './img/user-inline.svg';
import ProjectsIcon from './img/projects-inline.svg';
import LastUpdateIcon from './img/last-update-inline.svg';
import { messages } from '../../../messages';
import styles from './organizationCard.scss';
import { IconsBlock } from '../../iconsBlock';

const cx = classNames.bind(styles);

export const OrganizationCard = ({ organization }) => {
  const { formatMessage } = useIntl();
  const { userRole } = useSelector(userRolesSelector);
  const assignedOrganizations = useSelector(assignedOrganizationsSelector);
  const hasPermission =
    userRole === ADMINISTRATOR ||
    assignedOrganizations[organization.slug]?.organizationRole === MANAGER;

  const usersCount = organization.relationships.users.meta.count;
  const projectsCount = organization.relationships.projects.meta.count;
  const lastLaunchDate = organization.relationships.launches.meta.last_occurred_at;
  const { value: relativeTime, unit } = getRelativeUnits(new Date(lastLaunchDate));

  const cartInfo = [
    {
      icon: UserIcon,
      className: cx('icon-wrapper'),
      content: formatMessage(messages.organizationUsers),
      bottomElement: <span>{usersCount}</span>,
    },
    {
      icon: ProjectsIcon,
      className: cx('icon-wrapper'),
      content: formatMessage(messages.organizationProjects),
      bottomElement: <span>{projectsCount}</span>,
    },
    {
      icon: LastUpdateIcon,
      className: cx('last-update'),
      content: formatMessage(messages.latestLaunch),
      bottomElement: lastLaunchDate ? (
        <FormattedRelativeTime value={relativeTime} unit={unit} numeric="auto" />
      ) : (
        formatMessage(messages.noLaunches)
      ),
    },
  ];

  return (
    <div className={cx('organization-card')}>
      <div className={cx('organization-name')}>
        <NavLink
          to={{
            type: ORGANIZATION_PROJECTS_PAGE,
            payload: { organizationSlug: organization.slug },
          }}
          className={cx('organization-link')}
          title={organization.name}
        >
          {organization.name}
        </NavLink>
        <IconsBlock
          lastLaunchDate={lastLaunchDate}
          hasPermission={hasPermission}
          organizationType={organization.type}
        />
      </div>
      {hasPermission && (
        <div className={cx('cart-info')}>
          {cartInfo.map(({ icon, className, content, bottomElement }) => (
            <div key={content} className={className}>
              <Tooltip content={content} placement={'top'} wrapperClassName={cx('tooltip-wrapper')}>
                <i className={cx('icon')}>{Parser(icon)}</i>
              </Tooltip>
              {bottomElement}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

OrganizationCard.propTypes = {
  organization: PropTypes.object.isRequired,
};
