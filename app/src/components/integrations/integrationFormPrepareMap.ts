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

import { EMAIL, GITHUB } from 'common/constants/pluginNames';
import { combineNameAndEmailToFrom } from 'common/utils';
import { prepareGithubIntegrationFormData } from './prepareIntegrationFormData';

export type IntegrationFormPrepareFn = (
  formData: Record<string, unknown>,
) => Record<string, unknown>;

export const INTEGRATION_FORM_PREPARE_MAP: Partial<Record<string, IntegrationFormPrepareFn>> = {
  [EMAIL]: combineNameAndEmailToFrom,
  [GITHUB]: prepareGithubIntegrationFormData,
};

export const applyIntegrationFormPrepare = (
  pluginName: string,
  formData: Record<string, unknown>,
): Record<string, unknown> => {
  const prepare = INTEGRATION_FORM_PREPARE_MAP[pluginName];
  return prepare ? prepare(formData) : formData;
};
