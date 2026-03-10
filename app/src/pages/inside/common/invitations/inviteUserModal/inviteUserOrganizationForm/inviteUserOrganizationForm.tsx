import { createClassnames } from 'common/utils';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import {
  Organization,
  OrganizationAssignment,
} from 'pages/inside/common/assignments/organizationAssignment';

import { InviteUserEmailAutocompleteField } from '../InviteUserEmailAutocompleteField';

import styles from './inviteUserOrganizationForm.scss';

const cx = createClassnames(styles);

export interface InviteUserOrganizationFormData {
  email: string;
  organization: Organization;
}

export const InviteUserOrganizationForm = () => {
  return (
    <form className={cx('form')}>
      <InviteUserEmailAutocompleteField />
      <FieldElement name="organization">
        <OrganizationAssignment />
      </FieldElement>
    </form>
  );
};
