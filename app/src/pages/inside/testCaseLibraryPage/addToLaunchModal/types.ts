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

import { TestPlanDto } from 'controllers/testPlan';
import { Attribute } from '../types';
import { Launch } from 'pages/inside/manualLaunchesPage/types';

export interface AddToLaunchModalData {
  testCaseId: number;
  testCaseName: string;
}

export interface AddToLaunchModalProps {
  data: AddToLaunchModalData;
}

export interface AddToLaunchFormData {
  selectedLaunch?: Launch;
  selectedTestPlan?: TestPlanDto;
  launchDescription?: string;
  launchName?: string;
  launchAttributes?: Attribute[];
}

export interface CreateLaunchDto {
  name: string;
  startTime: string;
  description: string;
  testPlanId: number;
  testCaseIds: number[];
  attributes: Attribute[];
}

export interface AddTestCaseToLaunchDto {
  testCaseId: number[];
}
