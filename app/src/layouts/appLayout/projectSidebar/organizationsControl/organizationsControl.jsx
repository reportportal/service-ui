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
import { withPopover } from 'componentLibrary/popover';
import { organizationNameSelector, projectNameSelector } from 'controllers/project';
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
});

export const OrganizationsControl = ({ isPopoverOpen }) => {
  const { formatMessage } = useIntl();
  const organizationName = useSelector(organizationNameSelector);
  const projectName = useSelector(projectNameSelector);

  return (
    <div className={cx('organizations-control')} role="button" tabIndex={0}>
      <div>
        <button className={cx('organization-btn')}>
          <i className={cx('arrow-icon')}>{Parser(ArrowLeftIcon)}</i>
          <div className={cx('organization-name')}>
            {formatMessage(messages.organization)}: {organizationName}
          </div>
        </button>
        <div className={cx('project-name')}>{projectName}</div>
      </div>
      <i
        className={cx('open-popover', {
          action: isPopoverOpen,
        })}
      >
        {Parser(OpenPopoverIcon)}
      </i>
    </div>
  );
};

OrganizationsControl.propTypes = {
  isPopoverOpen: PropTypes.bool.isRequired,
};

export const OrganizationsControlWithPopover = withPopover({
  ContentComponent: OrganizationsPopover,
  side: 'right',
  popoverClassName: cx('popover'),
  variant: 'dark',
  arrowVerticalPosition: 'vertical-top',
  topPosition: 96,
})(OrganizationsControl);
