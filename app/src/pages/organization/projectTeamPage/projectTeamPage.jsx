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
import { canInviteInternalUser } from 'common/utils/permissions';
import classNames from 'classnames/bind';
import { BubblesLoader } from '@reportportal/ui-kit';
import { loadingSelector, membersSelector } from 'controllers/members';
import { useIntl } from 'react-intl';
import { MembersPageHeader } from './membersPageHeader';
import { EmptyStatePage } from '../emptyStatePage';
import { MembersListTable } from './membersListTable';
import EmptyIcon from './img/empty-members-icon-inline.svg';
import { messages } from './messages';
import styles from './projectTeamPage.scss';

const cx = classNames.bind(styles);

export const ProjectTeamPage = () => {
  const { formatMessage } = useIntl();
  const userRoles = useSelector(userRolesSelector);
  const hasPermission = canInviteInternalUser(userRoles);
  const members = useSelector(membersSelector);
  const isMembersLoading = useSelector(loadingSelector);
  const isEmptyMembers = members.length === 0;

  const getMembersContent = () =>
    isEmptyMembers ? (
      <EmptyStatePage
        hasPermission={hasPermission}
        emptyIcon={EmptyIcon}
        label={formatMessage(messages.noUsers)}
        description={formatMessage(messages.description)}
        buttonTitle={formatMessage(messages.inviteUser)}
      />
    ) : (
      <MembersListTable members={members} />
    );

  return (
    <div className={cx('project-team-page-container')}>
      <MembersPageHeader
        hasPermission={hasPermission}
        title={formatMessage(messages.title)}
        isNotEmpty={!isEmptyMembers}
      />
      {isMembersLoading ? (
        <div className={cx('loader')}>
          <BubblesLoader />
        </div>
      ) : (
        getMembersContent()
      )}
    </div>
  );
};
