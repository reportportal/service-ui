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

import React from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { Button, SearchIcon } from '@reportportal/ui-kit';
import filterIcon from 'common/img/newIcons/filters-outline-inline.svg';
import { useIntl } from 'react-intl';
import { messages } from '../../common/membersPage/membersPageHeader/messages';
import styles from './projectTeamPageHeader.scss';
import { MembersPageHeader } from '../../common/membersPage/membersPageHeader';

const cx = classNames.bind(styles);

export const ProjectTeamPageHeader = ({ hasPermission, isNotEmpty, showInviteUserModal }) => {
  const { formatMessage } = useIntl();

  return (
    <MembersPageHeader title={formatMessage(messages.projectTeamTitle)}>
      <div className={cx('actions')}>
        {isNotEmpty && (
          <>
            <div className={cx('icons')}>
              <i className={cx('search-icon')}>
                <SearchIcon />
              </i>
              <i className={cx('filters-icon')}>{Parser(filterIcon)}</i>
            </div>
            {hasPermission && (
              <Button variant={'ghost'} onClick={showInviteUserModal}>
                {formatMessage(messages.inviteUser)}
              </Button>
            )}
          </>
        )}
      </div>
    </MembersPageHeader>
  );
};

ProjectTeamPageHeader.propTypes = {
  hasPermission: PropTypes.bool,
  isNotEmpty: PropTypes.bool,
  showInviteUserModal: PropTypes.func,
};

ProjectTeamPageHeader.defaultProps = {
  hasPermission: false,
  isNotEmpty: false,
  showInviteUserModal: () => {},
};
