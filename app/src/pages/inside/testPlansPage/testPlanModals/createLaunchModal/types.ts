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

export interface Attribute {
  value: string;
  system?: boolean;
  key?: string;
  edited?: boolean;
  new?: boolean;
}

export interface CreateLaunchFormValues {
  name: string;
  description: string;
  attributes: Attribute[];
  scopeOfTesting?: string;
}

export interface CreateLaunchModalProps {
  isLoading: boolean;
  onSubmit: (values: CreateLaunchFormValues) => Promise<void>;
  selectedTestsCount?: number;
}

export interface AttributeListFieldProps {
  input: {
    value: Attribute[];
    onChange: (value: Attribute[]) => void;
  };
  attributes: Record<string, unknown>[];
  onChange: VoidFunction;
  disabled: boolean;
  newAttrMessage: string;
  maxLength: number;
  customClass: string;
  showButton: boolean;
  editable: boolean;
  defaultOpen: boolean;
}
