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

import { VoidFn } from '@reportportal/ui-kit/common';

import { Attribute, TestPlanOption } from 'pages/inside/common/launchFormFields/types';

export interface ManualLaunchData {
  id: number;
  name: string;
  description?: string;
  testPlan?: TestPlanOption | null;
  attributes: Attribute[];
}

export interface EditManualLaunchDto {
  name: string;
  description?: string;
  testPlanId?: number;
  attributes: Attribute[];
}

export interface EditManualLaunchModalProps {
  data: ManualLaunchData;
  onSuccess?: VoidFn;
}

export interface UseEditManualLaunchModalOptions {
  onSuccess?: VoidFn;
}

export interface UseEditManualLaunchParams {
  launchId: number;
  onSuccess?: VoidFn;
}
