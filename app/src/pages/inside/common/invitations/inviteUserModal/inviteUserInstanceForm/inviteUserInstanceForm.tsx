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

import { useIntl } from 'react-intl';
import { FieldArray } from 'redux-form';
import { createClassnames } from 'common/utils';
import { InstanceAssignment } from 'pages/inside/common/assignments/instanceAssignment';
import { ORGANIZATIONS } from 'pages/instance/allUsersPage/allUsersHeader/createUserModal/constants';
import { messages as invitationMessages } from 'common/constants/localization/invitationsLocalization';
import { getFormName } from '../utils';
import { Level } from '../constants';
import { InviteUserEmailAutocompleteField } from '../InviteUserEmailAutocompleteField';

import styles from './inviteUserInstanceForm.scss';

const cx = createClassnames(styles);

export const InviteUserInstanceForm = () => {
  const { formatMessage } = useIntl();

  return (
    <form className={cx('form')}>
      <InviteUserEmailAutocompleteField />
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
          formName: getFormName(Level.INSTANCE),
          formNamespace: 'organization',
          isOrganizationRequired: true,
        }}
      />
    </form>
  );
};
