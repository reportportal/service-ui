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

export interface DynamicField {
  id: string;
  fieldName: string;
  fieldType: string;
  required?: boolean;
  disabled?: boolean;
  definedValues?: Array<{ valueId: string; valueName: string }>;
  value?: string[];
}

export interface BTSIntegration {
  id: number;
  name: string;
  integrationType: {
    details: {
      name: string;
    };
  };
  integrationParameters: {
    defectFormFields: DynamicField[];
    project: string;
    url: string;
  };
}
