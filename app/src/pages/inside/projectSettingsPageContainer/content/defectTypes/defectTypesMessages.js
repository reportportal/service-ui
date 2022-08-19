/*
 * Copyright 2022 EPAM Systems
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

import {
  AUTOMATION_BUG,
  NO_DEFECT,
  PRODUCT_BUG,
  SYSTEM_ISSUE,
  TO_INVESTIGATE,
} from 'common/constants/defectTypes';

export const messages = defineMessages({
  defectNameCol: {
    id: 'DefectTypesTab.defectNameCol',
    defaultMessage: 'Defect name',
  },
  abbreviationCol: {
    id: 'DefectTypesTab.abbreviationCol',
    defaultMessage: 'Abbreviation',
  },
  [PRODUCT_BUG]: {
    id: 'DefectTypesTab.productBugsGroup',
    defaultMessage: 'Product Bug Group',
  },
  [SYSTEM_ISSUE]: {
    id: 'DefectTypesTab.systemIssuesGroup',
    defaultMessage: 'System Issue Group',
  },
  [AUTOMATION_BUG]: {
    id: 'DefectTypesTab.automationBugsGroup',
    defaultMessage: 'Automation Bug Group',
  },
  [NO_DEFECT]: {
    id: 'DefectTypesTab.noDefectBugsGroup',
    defaultMessage: 'No Defect Group',
  },
  [TO_INVESTIGATE]: {
    id: 'DefectTypesTab.toInvestigateBugsGroup',
    defaultMessage: 'To Investigate Group',
  },
  deleteModalHeader: {
    id: 'DefectTypesTab.deleteModalHeader',
    defaultMessage: 'Delete Defect Type',
  },
  createDefectHeader: {
    id: 'DefectTypesTab.createDefectHeader',
    defaultMessage: 'Create Defect',
  },
  createDefectIcon: {
    id: 'DefectTypesTab.createDefectIcon',
    defaultMessage: 'Create a new Defect',
  },
  description: {
    id: 'DefectTypesTab.description',
    defaultMessage:
      'Defect Types are a set of defects that are most likely to appear during tests execution. You can use default Defects to mark your test items or create your own Defects to make it easier to analyze tests execution.',
  },
});
