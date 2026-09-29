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

import { MessageDescriptor, defineMessages } from 'react-intl';
import { AiStageKey, StageKey } from 'types/aiFactory';

/** Shared between the iteration card (T1.2) and the iteration details stage cards/panels (T1.3). */
export const stageLabelMessages = defineMessages({
  create: {
    id: 'StageLabel.create',
    defaultMessage: 'Create',
  },
  grade: {
    id: 'StageLabel.grade',
    defaultMessage: 'Grade',
  },
  upload: {
    id: 'StageLabel.upload',
    defaultMessage: 'Upload',
  },
  review: {
    id: 'StageLabel.review',
    defaultMessage: 'Review',
  },
  prepare: {
    id: 'StageLabel.prepare',
    defaultMessage: 'Prepare',
  },
  develop: {
    id: 'StageLabel.develop',
    defaultMessage: 'Develop',
  },
  fix: {
    id: 'StageLabel.fix',
    defaultMessage: 'Fix',
  },
});

/** Automation's Review stage reuses the "Review" label — same wording, different data shape. */
export const STAGE_LABEL_MESSAGE: Record<AiStageKey, MessageDescriptor> = {
  [StageKey.CREATE]: stageLabelMessages.create,
  [StageKey.GRADE]: stageLabelMessages.grade,
  [StageKey.UPLOAD]: stageLabelMessages.upload,
  [StageKey.REVIEW]: stageLabelMessages.review,
  [StageKey.PREPARE]: stageLabelMessages.prepare,
  [StageKey.DEVELOP]: stageLabelMessages.develop,
  [StageKey.AUTOMATION_REVIEW]: stageLabelMessages.review,
  [StageKey.FIX]: stageLabelMessages.fix,
};
