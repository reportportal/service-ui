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

import { IntegrationSettings } from 'components/integrations/elements';
import { GithubFormFields } from '../githubFormFields';

export interface GithubSettingsProps {
  data: object;
  goToPreviousPage: () => void;
  onUpdate: (
    formData: Record<string, unknown>,
    onSuccess: () => void,
    metaData: Record<string, unknown>,
  ) => void;
  isGlobal: boolean;
}

export const GithubSettings = ({
  data,
  goToPreviousPage,
  onUpdate,
  isGlobal,
}: GithubSettingsProps) => {
  return (
    <IntegrationSettings
      data={data}
      onUpdate={onUpdate}
      goToPreviousPage={goToPreviousPage}
      isGlobal={isGlobal}
      formFieldsComponent={GithubFormFields}
      preventTestConnection
    />
  );
};
