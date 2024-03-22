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
import classNames from 'classnames/bind';
import { NavLink } from 'components/main/navLink';
import { useIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import { PROJECT_PAGE } from 'controllers/pages/constants';
import { useState } from 'react';
import ArrowDownIcon from './img/arrow-down-inline.svg';
import ArrowRightIcon from './img/arrow-right-inline.svg';
import OpenIcon from './img/open-inline.svg';
import styles from './organizationsItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  open: {
    id: 'OrganizationsItem.open',
    defaultMessage: 'open',
  },
});

export const OrganizationsItem = ({
  organizationName,
  organizationSlug,
  projects,
  isOpen,
  onClick,
}) => {
  const { formatMessage } = useIntl();
  const [isCollapsed, setIsCollapsed] = useState(isOpen);
  const ArrowIcon = isCollapsed ? ArrowDownIcon : ArrowRightIcon;

  return (
    <div className={cx('organizations-item')}>
      <div className={cx('header-item')}>
        <div className={cx('header-item-wrapper')}>
          <button className={cx('collapse-projects')} onClick={() => setIsCollapsed(!isCollapsed)}>
            {Parser(ArrowIcon)}
            <div className={cx('organizations-name')}>{organizationName}</div>
          </button>
          <button className={cx('organization-open')}>
            <div className={cx('organizations-open-text')}>{formatMessage(messages.open)}</div>
            {Parser(OpenIcon)}
          </button>
        </div>
      </div>
      {isCollapsed && (
        <div className={cx('project-item')}>
          {projects.map(({ projectName, projectSlug }) => (
            <NavLink
              to={{
                type: PROJECT_PAGE,
                payload: {
                  projectSlug,
                  organizationSlug,
                },
              }}
              key={`${organizationSlug}-${projectSlug}`}
              className={cx('project-item-link')}
              activeClassName={cx('active')}
              onClick={onClick}
            >
              <span title={projectName}>{projectName}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

OrganizationsItem.propTypes = {
  organizationName: PropTypes.string.isRequired,
  organizationSlug: PropTypes.string.isRequired,
  projects: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};
