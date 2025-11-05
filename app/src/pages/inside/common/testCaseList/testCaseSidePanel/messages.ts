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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  openDetails: {
    id: 'TestCaseSidePanel.openDetails',
    defaultMessage: 'Open Details',
  },
  moreActionsTooltip: {
    id: 'TestCaseSidePanel.moreActionsTooltip',
    defaultMessage: 'Add scenario details to be able to add this test case to launch',
  },
  scenarioTitle: {
    id: 'TestCaseSidePanel.scenarioTitle',
    defaultMessage: 'Scenario',
  },
  stepTitle: {
    id: 'TestCaseSidePanel.stepTitle',
    defaultMessage: 'Steps',
  },
  tagsTitle: {
    id: 'TestCaseSidePanel.tagsTitle',
    defaultMessage: 'Tags',
  },
  descriptionTitle: {
    id: 'TestCaseSidePanel.descriptionTitle',
    defaultMessage: 'Description',
  },
  attachmentsTitle: {
    id: 'TestCaseSidePanel.attachmentsTitle',
    defaultMessage: 'Attachments',
  },
  noTagsAdded: {
    id: 'TestCaseSidePanel.noTagsAdded',
    defaultMessage: 'No tags added',
  },
  noDetailsForScenario: {
    id: 'TestCaseSidePanel.noDetailsForScenario',
    defaultMessage: 'No details for this scenario yet',
  },
  noAttachmentsAdded: {
    id: 'TestCaseSidePanel.noAttachmentsAdded',
    defaultMessage: 'No attachments added',
  },
  noStepsAdded: {
    id: 'TestCaseSidePanel.noStepsAdded',
    defaultMessage: 'No steps for this scenario yet',
  },
});
