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

import PropTypes from 'prop-types';
import { useIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { useSelector } from 'react-redux';
import { availableProjectsSelector } from 'controllers/user';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import Link from 'redux-first-router-link';
import { PROJECT_SETTINGS_PAGE } from 'controllers/pages/constants';
import { OrganizationsItem } from './organizationsItem';
import styles from './organizationsPopover.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  allOrganizations: {
    id: 'OrganizationsPopover.allOrganizations',
    defaultMessage: 'All organizations',
  },
});

export const OrganizationsPopover = () => {
  const { formatMessage } = useIntl();
  const availableProjects = useSelector(availableProjectsSelector);
  const { organizationSlug: currentOrganization, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  );

  return (
    <div className={cx('organizations-popover')}>
      {availableProjects.length > 0 && (
        <div className={cx('all-organizations')}>
          <Link
            to={{
              type: PROJECT_SETTINGS_PAGE,
              payload: { organizationSlug: currentOrganization, projectSlug },
            }}
            className={cx('all-organizations-link')}
          >
            {formatMessage(messages.allOrganizations)}
          </Link>
        </div>
      )}
      {availableProjects.map(({ organizationName, organizationSlug, projects }) => (
        <OrganizationsItem
          organizationName={organizationName}
          organizationSlug={organizationSlug}
          projects={projects}
          isOpen={currentOrganization === organizationSlug}
        />
      ))}
    </div>
  );
};

OrganizationsPopover.propTypes = {
  availableProjects: PropTypes.array.isRequired,
};
