/*
 * Copyright 2026 EPAM Systems
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

import { useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { FieldArray, change, untouch } from 'redux-form';
import { createClassnames } from 'common/utils';
import { InstanceAssignment, ORGANIZATION, FORM_FIELDS } from 'pages/inside/common/assignments/instanceAssignment';
import { ORGANIZATIONS } from 'pages/instance/allUsersPage/allUsersHeader/createUserModal/constants';
import { messages as invitationMessages } from 'common/constants/localization/invitationsLocalization';
import { getFormName } from '../utils';
import { Level } from '../constants';
import { InviteUserEmailAutocompleteField } from '../InviteUserEmailAutocompleteField';

import styles from './inviteUserInstanceForm.scss';

const cx = createClassnames(styles);

export const InviteUserInstanceForm = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [invitedUserId, setInvitedUserId] = useState<number | null>(null);
  const formName = getFormName(Level.INSTANCE);

  const handleUserSelect = useCallback((userId: number | null) => {
    setInvitedUserId(userId);
    // When existing user is selected, clear organizations list and current form
    if (userId !== null) {
      dispatch(change(formName, ORGANIZATIONS, []));
      dispatch(change(formName, ORGANIZATION, {
        name: null,
        role: false,
        projects: [],
      }));
      dispatch(untouch(formName, FORM_FIELDS.ORGANIZATION.NAME));
    }
  }, [dispatch, formName]);

  return (
    <form className={cx('form')}>
      <InviteUserEmailAutocompleteField onUserSelect={handleUserSelect} />
      <div className={cx('invite-wrapper')}>
        <span className={cx('invite')}>{formatMessage(invitationMessages.organizationsAndProjectsToInvite)}</span>
        <span className={cx('invite-description')}>
          {formatMessage(invitationMessages.organizationsAndProjectsDescription)}
        </span>
      </div>
      <FieldArray
        name={ORGANIZATIONS}
        component={InstanceAssignment}
        props={{
          formName: formName,
          formNamespace: ORGANIZATION,
          isOrganizationRequired: true,
          invitedUserId,
        }}
      />
    </form>
  );
};
