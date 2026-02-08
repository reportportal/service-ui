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

import { ReactNode } from 'react';

export enum LaunchMode {
  NEW = 'new',
  EXISTING = 'existing',
}

export interface LaunchOption {
  id: number;
  name: string;
}

export interface TestPlanOption {
  id: number;
  name: string;
}

export type OnLaunchChangeHandler = (launch: LaunchOption | null) => void;
export type OnTestPlanChangeHandler = (testPlan: TestPlanOption | null) => void;

export interface Attribute {
  value: string;
  key?: string;
  system?: boolean;
  edited?: boolean;
  new?: boolean;
}

export interface LaunchFormData {
  name: string | LaunchOption;
  selectedLaunch?: LaunchOption;
  description?: string;
  attributes: Attribute[];
  uncoveredTestsOnly?: boolean;
}

export const isLaunchObject = (value: unknown): value is LaunchOption => {
  return typeof value === 'object' && value !== null && 'id' in value;
};

export interface CreateManualLaunchDto {
  name: string;
  startTime: string;
  description?: string;
  testPlanId?: number;
  testCaseIds?: number[];
  attributes: Attribute[];
}

export interface LaunchFormFieldsProps {
  testPlanName?: string;
  activeMode?: LaunchMode;
  onModeChange?: (mode: LaunchMode) => void;
  onLaunchSelect?: OnLaunchChangeHandler;
  onTestPlanChange?: OnTestPlanChangeHandler;
  description?: ReactNode;
  isTestPlanFieldDisabled?: boolean;
}

export interface CheckboxFieldProps {
  input: {
    value: boolean;
    onChange: (value: boolean) => void;
  };
  label?: string;
}

export interface AttributeListFieldProps {
  input: {
    value: unknown[];
    onChange: (value: unknown[]) => void;
  };
  newAttrMessage?: string;
  maxLength?: number;
  showButton?: boolean;
  editable?: boolean;
  defaultOpen?: boolean;
  [key: string]: unknown;
}

export interface ExistingLaunchFieldsProps {
  onLaunchSelect?: OnLaunchChangeHandler;
}

export interface NewLaunchFieldsProps {
  testPlanName?: string;
  isTestPlanFieldDisabled?: boolean;
  onTestPlanChange?: OnTestPlanChangeHandler;
}
