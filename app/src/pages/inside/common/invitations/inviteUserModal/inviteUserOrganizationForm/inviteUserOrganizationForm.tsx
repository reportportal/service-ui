import { useState, useCallback } from 'react';

import { createClassnames } from 'common/utils';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import {
  Organization,
  OrganizationAssignment,
} from 'pages/inside/common/assignments/organizationAssignment';

import { InviteUserEmailField } from '../inviteUserEmailField';
import { getFormName } from '../utils';
import { Level } from '../constants';

import styles from './inviteUserOrganizationForm.scss';

const cx = createClassnames(styles);

export interface InviteUserOrganizationFormData {
  email: string;
  organization: Organization;
  isAddingProject?: boolean
}

export const InviteUserOrganizationForm = () => {
  const [invitedUserId, setInvitedUserId] = useState<number | null>(null);

  const handleUserSelect = useCallback((userId: number | null) => {
    setInvitedUserId(userId);
  }, []);

  return (
    <form className={cx('form')}>
      <InviteUserEmailField
        formName={getFormName(Level.ORGANIZATION)}
        onUserSelect={handleUserSelect}
      />
      <FieldElement name="organization">
        <OrganizationAssignment
          invitedUserId={invitedUserId}
          formName={getFormName(Level.ORGANIZATION)}
          excludeUserAssignments
        />
      </FieldElement>
    </form>
  );
};
