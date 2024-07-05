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
import { useSelector } from 'react-redux';
import Parser from 'html-react-parser';
import { useIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { withPopover } from 'componentLibrary/popover';
import { projectNameSelector } from 'controllers/project';
import { activeOrganizationNameSelector } from 'controllers/organizations/organization';
import { ORGANIZATION_LEVEL, INSTANCE_LEVEL } from 'routes/constants';
import { ADMINISTRATE_PAGE, ORGANIZATION_PROJECTS_PAGE } from 'controllers/pages/constants';
import { urlOrganizationSlugSelector } from 'controllers/pages';
import ArrowLeftIcon from './img/arrow-left-inline.svg';
import OpenPopoverIcon from './img/open-popover-inline.svg';
import { OrganizationsPopover } from './organizationsPopover/organizationsPopover';
import styles from './organizationsControl.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  organization: {
    id: 'OrganizationsControl.organization',
    defaultMessage: 'Organization',
  },
  all: {
    id: 'OrganizationsControl.all',
    defaultMessage: 'All',
  },
  allOrganizations: {
    id: 'OrganizationsControl.allOrganizations',
    defaultMessage: 'All organizations',
  },
});

export const OrganizationsControl = ({ isPopoverOpen, onClick, sidebarType, closeSidebar }) => {
  const { formatMessage } = useIntl();
  const organizationName = useSelector(activeOrganizationNameSelector);
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const projectName = useSelector(projectNameSelector);

  const titles = {
    shortTitle: formatMessage(messages.all),
    topTitle: formatMessage(messages.allOrganizations),
    bottomTitle: null,
  };

  const link = { type: ADMINISTRATE_PAGE };

  const getShortTitle = (title) => `${title[0]}${title[title.length - 1]}`;

  switch (sidebarType) {
    case INSTANCE_LEVEL: {
      break;
    }
    case ORGANIZATION_LEVEL: {
      titles.shortTitle = getShortTitle(organizationName);
      titles.bottomTitle = organizationName;
      break;
    }
    default: {
      titles.shortTitle = getShortTitle(projectName);
      titles.topTitle = `${formatMessage(messages.organization)}: ${organizationName}`;
      titles.bottomTitle = projectName;
      link.type = ORGANIZATION_PROJECTS_PAGE;
      link.payload = { organizationSlug };
      break;
    }
  }

  return (
    <div className={cx('organizations-control-wrapper')}>
      <button className={cx('organization-block')} onClick={onClick}>
        {titles.shortTitle}
      </button>
      <button className={cx('organizations-control')} tabIndex={-1}>
        <div>
          <div className={cx('organization-btn-wrapper')}>
            <i className={cx('arrow-icon')}>{Parser(ArrowLeftIcon)}</i>
            <Link to={link} className={cx('organization-btn')} onClick={closeSidebar}>
              <div className={cx('organization-name')}>{titles.topTitle}</div>
            </Link>
          </div>
          <div className={cx('project-name')}>{titles.bottomTitle}</div>
        </div>
        <i
          className={cx('open-popover', {
            action: isPopoverOpen,
          })}
        >
          {Parser(OpenPopoverIcon)}
        </i>
      </button>
    </div>
  );
};

OrganizationsControl.propTypes = {
  isPopoverOpen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  sidebarType: PropTypes.string,
};

OrganizationsControl.defaultProps = {
  sidebarType: null,
};

export const OrganizationsControlWithPopover = withPopover({
  ContentComponent: OrganizationsPopover,
  side: 'right',
  popoverClassName: cx('popover'),
  popoverWrapperClassName: cx('popover-control'),
  variant: 'dark',
  arrowVerticalPosition: 'vertical-top',
  topPosition: 96,
  tabIndex: 0,
})(OrganizationsControl);
