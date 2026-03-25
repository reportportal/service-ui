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

import type { MilestoneSelectorsRootState, MilestoneState } from './types';

export const milestoneSelector = (state: MilestoneSelectorsRootState): MilestoneState =>
  state.milestone || { data: null };

export const milestonesLoadingSelector = (state: MilestoneSelectorsRootState): boolean =>
  Boolean(milestoneSelector(state).isLoading);

export const milestonesSelector = (state: MilestoneSelectorsRootState) =>
  milestoneSelector(state).data?.content;

export const milestonesPageSelector = (state: MilestoneSelectorsRootState) =>
  milestoneSelector(state).data?.page;
