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

import { useSelector } from 'react-redux';
import { userRolesSelector } from 'controllers/user';
import { canCreateProject } from 'common/utils/permissions';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import plusIcon from 'common/img/plus-button-inline.svg';
import { organizationsListLoadingSelector } from 'controllers/organizations';
import { activeOrganizationSelector } from 'controllers/organizations/organization';
import { BubblesLoader } from '@reportportal/ui-kit';
import { useIntl } from 'react-intl';
import { ProjectsPageHeader } from './projectsPageHeader';
import { EmptyStatePage } from '../emptyStatePage';
import EmptyIcon from './img/empty-projects-icon-inline.svg';
import { messages } from './messages';
import styles from './organizationProjectsPage.scss';

const cx = classNames.bind(styles);

export const OrganizationProjectsPage = () => {
  const { formatMessage } = useIntl();
  const userRoles = useSelector(userRolesSelector);
  const hasPermission = canCreateProject(userRoles);
  const organizationLoading = useSelector(organizationsListLoadingSelector);

  const permissionSuffix = hasPermission ? 'WithPermission' : 'WithoutPermission';
  const label = formatMessage(messages[`noProjects${permissionSuffix}`]);
  const description = Parser(formatMessage(messages[`noProjectsList${permissionSuffix}`]));
  const buttonTitle = formatMessage(messages.createProject);

  const organization = useSelector(activeOrganizationSelector);
  const isNotEmpty = organization?.relationships?.projects?.meta.count > 0;

  return (
    <div className={cx('organization-projects-container')}>
      {organizationLoading ? (
        <div className={cx('loader')}>
          <BubblesLoader />
        </div>
      ) : (
        <>
          <ProjectsPageHeader hasPermission={hasPermission} />
          {!isNotEmpty && (
            <EmptyStatePage
              hasPermission={hasPermission}
              label={label}
              description={description}
              startIcon={plusIcon}
              buttonTitle={buttonTitle}
              emptyIcon={EmptyIcon}
            />
          )}
        </>
      )}
    </div>
  );
};
