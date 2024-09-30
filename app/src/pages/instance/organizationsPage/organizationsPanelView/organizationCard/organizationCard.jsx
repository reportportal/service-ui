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
import UserIcon from './img/user-inline.svg';
import ProjectsIcon from './img/projects-inline.svg';
import LastUpdateIcon from './img/last-update-inline.svg';
import SynchedIcon from './img/synched-organization-inline.svg';
import OutdatedIcon from './img/outdated-inline.svg';
import PersonalIcon from './img/personal-organization-inline.svg';
import { messages } from '../../messages';
import styles from './organizationCard.scss';

const cx = classNames.bind(styles);
const EXTERNAL_TYPE = 'EXTERNAL';
const THREE_MONTH = 3600 * 24 * 30 * 1000;

export const OrganizationCard = ({ organization }) => {
  const { formatMessage } = useIntl();
  const { userRole, organizationRole } = useSelector(userRolesSelector);
  const hasPermission = userRole === ADMINISTRATOR || organizationRole === MANAGER;
  const usersCount = organization.relationships.users.meta.count;
  const projectsCount = organization.relationships.projects.meta.count;
  const lastLaunch = organization.relationships.launches.meta.last_occurred_at;
  const { value: relativeTime, unit } = getRelativeUnits(new Date(lastLaunch));
  const isOutdated = Date.now() - new Date(lastLaunch).getTime() > THREE_MONTH;

  return (
    <div className={cx('organization-card')}>
      <div className={cx('organization-name')}>
        <NavLink
          to={{
            type: ORGANIZATION_PROJECTS_PAGE,
            payload: { organizationSlug: organization.slug },
          }}
          className={cx('organization-link')}
        >
          {organization.name}
        </NavLink>
        {hasPermission &&
          (organization.type === EXTERNAL_TYPE ? (
            <Tooltip
              content={formatMessage(messages.synchedOrganization)}
              placement={'top'}
              wrapperClassName={cx('tooltip-wrapper')}
            >
              <i className={cx('icon')}>{Parser(SynchedIcon)}</i>
            </Tooltip>
          ) : (
            <i className={cx('icon')}>{Parser(PersonalIcon)}</i>
          ))}
        {hasPermission && isOutdated && (
          <Tooltip
            content={formatMessage(messages.lastLaunch)}
            placement={'top'}
            wrapperClassName={cx('tooltip-wrapper')}
          >
            <i className={cx('icon')}>{Parser(OutdatedIcon)}</i>
          </Tooltip>
        )}
      </div>
      {hasPermission && (
        <div className={cx('cart-info')}>
          <div className={cx('icon-wrapper')}>
            <Tooltip
              content={formatMessage(messages.organizationUsers)}
              placement={'top'}
              wrapperClassName={cx('tooltip-wrapper')}
            >
              <i className={cx('icon')}>{Parser(UserIcon)}</i>
            </Tooltip>
            <span>{usersCount}</span>
          </div>
          <div className={cx('icon-wrapper')}>
            <Tooltip
              content={formatMessage(messages.organizationProjects)}
              placement={'top'}
              wrapperClassName={cx('tooltip-wrapper')}
            >
              <i className={cx('icon')}>{Parser(ProjectsIcon)}</i>
            </Tooltip>
            <span>{projectsCount}</span>
          </div>
          <div className={cx('last-update')}>
            <Tooltip
              content={formatMessage(messages.latestLaunch)}
              placement={'top'}
              wrapperClassName={cx('tooltip-wrapper')}
            >
              <i className={cx('icon')}>{Parser(LastUpdateIcon)}</i>
            </Tooltip>
            <FormattedRelativeTime value={relativeTime} unit={unit} numeric="auto" />
          </div>
        </div>
      )}
    </div>
  );
};

OrganizationCard.propTypes = {
  organization: PropTypes.object.isRequired,
};
