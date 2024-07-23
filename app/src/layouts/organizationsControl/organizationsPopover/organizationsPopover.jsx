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
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { useSelector } from 'react-redux';
import { availableProjectsSelector } from 'controllers/user';
import { urlProjectSlugSelector, urlOrganizationSlugSelector } from 'controllers/pages';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { ALL_ORGANIZATIONS_PAGE } from 'controllers/pages/constants';
import { NavLink } from 'components/main/navLink';
import { OrganizationsItem } from './organizationsItem';
import { messages } from '../../messages';
import styles from './organizationsPopover.scss';

const cx = classNames.bind(styles);
const MARGIN_TOP_AND_MARGIN_BOTTOM = 172;

export const OrganizationsPopover = ({ closePopover, closeSidebar }) => {
  const { formatMessage } = useIntl();
  const availableProjects = useSelector(availableProjectsSelector);
  const currentOrganization = useSelector(urlOrganizationSlugSelector);
  const projectSlug = useSelector(urlProjectSlugSelector);
  const maxHeightPopover = window.innerHeight - MARGIN_TOP_AND_MARGIN_BOTTOM;

  const onClose = () => {
    closeSidebar();
    closePopover();
  };

  return (
    <div className={cx('organizations-popover')}>
      {availableProjects.length > 0 && (
        <>
          <div className={cx('all-organizations')}>
            <NavLink
              to={{ type: ALL_ORGANIZATIONS_PAGE }}
              className={cx('all-organizations-link')}
              onClick={onClose}
              activeClassName={cx('active')}
            >
              {formatMessage(messages.allOrganizations)}
            </NavLink>
          </div>
          <div className={cx('divider')} />
        </>
      )}
      <ScrollWrapper
        autoHide
        autoHeight
        autoHeightMax={maxHeightPopover}
        hideTracksWhenNotNeeded
        className={cx('scroll-wrapper')}
      >
        {availableProjects.map(({ organizationName, organizationSlug, projects }) => (
          <OrganizationsItem
            organizationName={organizationName}
            organizationSlug={organizationSlug}
            projects={projects}
            onClick={onClose}
            isOpen={currentOrganization === organizationSlug}
            isActive={currentOrganization === organizationSlug && !projectSlug}
            currentProject={projectSlug}
            key={`${organizationSlug}-${projectSlug}`}
          />
        ))}
      </ScrollWrapper>
    </div>
  );
};

OrganizationsPopover.propTypes = {
  closeSidebar: PropTypes.func.isRequired,
  closePopover: PropTypes.func.isRequired,
};
