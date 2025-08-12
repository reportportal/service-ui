import classNames from 'classnames/bind';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import {
  Organization,
  OrganizationAssignment,
} from 'pages/inside/common/assignments/organizationAssignment';
import { InviteUserEmailField } from '../inviteUserEmailField';
import { getFormName } from '../utils';
import { Level } from '../constants';
import styles from './inviteUserOrganizationForm.scss';

const cx = classNames.bind(styles) as typeof classNames;

export interface InviteUserOrganizationFormData {
  email: string;
  organization: Organization;
}

export const InviteUserOrganizationForm = () => {
  return (
    <form className={cx('form')}>
      <InviteUserEmailField formName={getFormName(Level.ORGANIZATION)} />
      <FieldElement name="organization">
        <OrganizationAssignment />
      </FieldElement>
    </form>
  );
};
