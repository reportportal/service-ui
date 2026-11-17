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

import type { IntlShape } from 'react-intl';

import { MilestoneType } from 'controllers/milestone';

import { createMilestoneModalMessages } from './messages';
import type { MilestoneTypeDropdownOption } from './types';

export const buildMilestoneTypeOptions = (
  formatMessage: IntlShape['formatMessage'],
): MilestoneTypeDropdownOption[] => [
  {
    value: MilestoneType.RELEASE,
    label: formatMessage(createMilestoneModalMessages.milestoneTypeRelease),
    description: formatMessage(createMilestoneModalMessages.milestoneTypeReleaseDesc),
  },
  {
    value: MilestoneType.SPRINT,
    label: formatMessage(createMilestoneModalMessages.milestoneTypeSprint),
    description: formatMessage(createMilestoneModalMessages.milestoneTypeSprintDesc),
  },
  {
    value: MilestoneType.PLAN,
    label: formatMessage(createMilestoneModalMessages.milestoneTypePlan),
    description: formatMessage(createMilestoneModalMessages.milestoneTypePlanDesc),
  },
  {
    value: MilestoneType.FEATURE,
    label: formatMessage(createMilestoneModalMessages.milestoneTypeFeature),
    description: formatMessage(createMilestoneModalMessages.milestoneTypeFeatureDesc),
  },
  {
    value: MilestoneType.OTHER,
    label: formatMessage(createMilestoneModalMessages.milestoneTypeOther),
    description: formatMessage(createMilestoneModalMessages.milestoneTypeOtherDesc),
  },
];
