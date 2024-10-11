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

import { useSelector, useDispatch } from 'react-redux';
import { userRolesSelector } from 'controllers/pages';
import { canInviteInternalUser } from 'common/utils/permissions';
import classNames from 'classnames/bind';
import { loadingSelector, membersSelector, fetchMembersAction } from 'controllers/members';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { showModalAction } from 'controllers/modal';
import { EmptyMembersPageState } from '../common/membersPage/emptyMembersPageState';
import { ProjectTeamPageHeader } from './projectTeamPageHeader';
import { ProjectTeamListTable } from './projectTeamListTable';
import styles from './projectTeamPage.scss';

const cx = classNames.bind(styles);

export const ProjectTeamPage = () => {
  const dispatch = useDispatch();
  const userRoles = useSelector(userRolesSelector);
  const hasPermission = canInviteInternalUser(userRoles);
  const members = useSelector(membersSelector);
  const isMembersLoading = useSelector(loadingSelector);
  const isEmptyMembers = members.length === 0;

  const onInvite = () => {
    dispatch(fetchMembersAction());
  };

  const showInviteUserModal = () => {
    dispatch(
      showModalAction({
        id: 'inviteUserModal',
        data: { onInvite },
      }),
    );
  };

  return (
    <ScrollWrapper autoHeightMax={100}>
      <div className={cx('project-team-page')}>
        <ProjectTeamPageHeader
          hasPermission={hasPermission}
          isNotEmpty={!isEmptyMembers}
          onInvite={showInviteUserModal}
        />
        {isEmptyMembers ? (
          <EmptyMembersPageState
            isLoading={isMembersLoading}
            hasPermission={hasPermission}
            showInviteUserModal={showInviteUserModal}
          />
        ) : (
          <ProjectTeamListTable members={members} />
        )}
      </div>
    </ScrollWrapper>
  );
};
