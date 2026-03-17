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

import { commonValidators } from 'common/utils/validation';
import { BoundValidator } from 'common/utils/validation/types';
import type { InviteUserInstanceFormData } from './types';

export type InviteUserFormErrors = {
  email?: string;
  organizations?: string;
  organization?: { name?: string };
};

export function validateInstance(formData: InviteUserInstanceFormData): InviteUserFormErrors {
  const rawEmail = formData.email;
  const emailStr =
    typeof rawEmail === 'string' ? rawEmail : (rawEmail as { email?: string } | undefined)?.email ?? '';
  const emailValidator: BoundValidator = commonValidators.emailInviteUserValidator();
  const errors: InviteUserFormErrors = {
    email: emailValidator(emailStr.trim()),
  };

  if (formData.isAddingOrganization || formData.isAddingProject) {
    errors.organizations = 'Form is being edited';
    return errors;
  }

  const organizations = formData.organizations ?? [];
  if (organizations.length === 0) {
    errors.organizations = commonValidators.requiredField(organizations);
    const orgName = formData.organization?.name;
    if (!orgName) {
      errors.organization = {
        name: commonValidators.requiredField(orgName),
      };
    }
  }
  return errors;
}
