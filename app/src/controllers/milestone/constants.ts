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

import { Page } from 'types/common';

export const GET_MILESTONES = 'getMilestones' as const;
export const MILESTONES_NAMESPACE = 'milestones' as const;

export const defaultMilestoneQueryParams = {
  sortBy: 'createdDate,desc',
  limit: 20,
  offset: 0,
};

export enum MilestoneType {
  RELEASE = 'RELEASE',
  SPRINT = 'SPRINT',
  PLAN = 'PLAN',
  FEATURE = 'FEATURE',
  OTHER = 'OTHER',
}

export enum MilestoneStatus {
  SCHEDULED = 'SCHEDULED',
  TESTING = 'TESTING',
  COMPLETED = 'COMPLETED',
}

export type TmsMilestoneType = `${MilestoneType}`;
export type TmsMilestoneStatus = `${MilestoneStatus}`;

export type TmsTestPlanInMilestoneRS = {
  id: number;
  name: string;
  description?: string;
  milestoneId?: number;
  executionStatistic: {
    covered: number;
    total: number;
  };
};

export type TmsMilestoneRS = {
  id: number;
  name: string;
  type: TmsMilestoneType;
  status: TmsMilestoneStatus;
  startDate: string;
  endDate: string;
  testPlans: TmsTestPlanInMilestoneRS[];
};

export type TmsMilestonePageRS = {
  content: TmsMilestoneRS[];
  page: Page;
};

export type CreateMilestonePayload = Omit<TmsMilestoneRS, 'id' | 'testPlans'>;
