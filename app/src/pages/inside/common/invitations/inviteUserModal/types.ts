/*
 * Copyright 2025 EPAM Systems
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

import { InjectedFormProps } from 'redux-form';
import { InvitationStatus, Level } from './constants';
import { InviteUserProjectFormData } from './inviteUserProjectForm';
import { InviteUserOrganizationFormData } from './inviteUserOrganizationForm';

export type FormDataMap = {
  [Level.PROJECT]: InviteUserProjectFormData;
  [Level.ORGANIZATION]: InviteUserOrganizationFormData;
};

export type ModalProps<L extends keyof FormDataMap> = {
  level: L;
  onInvite: (withProject: boolean) => void;
};

export type InviteUserProps<L extends keyof FormDataMap> = InjectedFormProps<FormDataMap[L]> &
  ModalProps<L> & {
    content?: React.ReactNode;
  };

interface RequestDataProject {
  id: number;
  project_role: string;
}

interface RequestDataOrganization {
  id: number;
  projects: RequestDataProject[];
  org_role?: string;
}

export interface InvitationRequestData {
  email: string;
  organizations: RequestDataOrganization[];
}

export interface InvitationResponseData {
  full_name: string;
  email: string;
  status: `${InvitationStatus}`;
  link: string;
}
