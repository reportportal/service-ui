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

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { userRolesSelector } from 'controllers/pages';
import { canInviteInternalUser } from 'common/utils/permissions';
import classNames from 'classnames/bind';
import { loadingSelector, membersSelector, fetchMembersAction } from 'controllers/members';
import { showModalAction } from 'controllers/modal';
import { EmptyPageState } from 'pages/common';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useTracking } from 'react-tracking';
import { PROJECT_TEAM_PAGE_VIEWS } from 'components/main/analytics/events/ga4Events/projectTeamPageEvents';
import { InviteUserModal } from 'pages/inside/common/invitations/inviteUserModal';
import { messages } from '../common/membersPage/membersPageHeader/messages';
import { EmptyMembersPageState } from '../common/membersPage/emptyMembersPageState';
import { ProjectTeamPageHeader } from './projectTeamPageHeader';
import { ProjectTeamListTable } from './projectTeamListTable';
import styles from './projectTeamPage.scss';

const cx = classNames.bind(styles);

export const ProjectTeamPage = () => {
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const userRoles = useSelector(userRolesSelector);
  const hasPermission = canInviteInternalUser(userRoles);
  const members = useSelector(membersSelector);
  const isMembersLoading = useSelector(loadingSelector);
  const [searchValue, setSearchValue] = useState(null);
  const isEmptyMembers = members.length === 0;

  useEffect(() => {
    trackEvent(PROJECT_TEAM_PAGE_VIEWS.PROJECT_TEAM);
  }, []);

  const onInvite = () => {
    dispatch(fetchMembersAction());
  };

  const showInviteUserModal = () => {
    dispatch(
      showModalAction({
        component: <InviteUserModal level="project" onInvite={onInvite} />,
      }),
    );
  };

  const getEmptyPageState = () => {
    return searchValue === null ? (
      <EmptyMembersPageState
        isLoading={isMembersLoading}
        hasPermission={hasPermission}
        showInviteUserModal={showInviteUserModal}
      />
    ) : (
      <EmptyPageState
        label={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)}
        description={formatMessage(messages.noResultsDescription)}
        emptyIcon={NoResultsIcon}
        hasPermission={false}
      />
    );
  };

  return (
    <div className={cx('project-team-page')}>
      <ProjectTeamPageHeader
        hasPermission={hasPermission}
        onInvite={showInviteUserModal}
        isMembersLoading={isMembersLoading}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
      {isEmptyMembers ? getEmptyPageState() : <ProjectTeamListTable members={members} />}
    </div>
  );
};
