/*
 * Copyright 2019 EPAM Systems
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
  colorCol: {
    id: 'DefectTypesTab.colorCol',
    defaultMessage: 'Color',
  },
  diagramCol: {
    id: 'DefectTypesTab.diagramCol',
    defaultMessage: 'Diagram',
  },
  [PRODUCT_BUG]: {
    id: 'DefectTypesTab.productBugsGroup',
    defaultMessage: 'Product Bugs Group',
  },
  [SYSTEM_ISSUE]: {
    id: 'DefectTypesTab.systemIssuesGroup',
    defaultMessage: 'System Issues Group',
  },
  [AUTOMATION_BUG]: {
    id: 'DefectTypesTab.automationBugsGroup',
    defaultMessage: 'Automation Bugs Group',
  },
  [NO_DEFECT]: {
    id: 'DefectTypesTab.noDefectBugsGroup',
    defaultMessage: 'No Defect Group',
  },
  [TO_INVESTIGATE]: {
    id: 'DefectTypesTab.toInvestigateBugsGroup',
    defaultMessage: 'To Investigate Group',
  },
  addDefectType: {
    id: 'DefectTypesTab.addDefectType',
    defaultMessage: 'Add Defect Type',
  },
  subtypesCanBeAdded: {
    id: 'DefectTypesTab.subtypesCanBeAdded',
    defaultMessage: 'subtypes can be added',
  },
  allSubtypesAreAdded: {
    id: 'DefectTypesTab.allSubtypesAreAdded',
    defaultMessage: 'All {count} subtypes are already added',
  },
  deleteModalHeader: {
    id: 'DefectTypesTab.deleteModalHeader',
    defaultMessage: 'Delete Defect Type',
  },
  deleteModalContent: {
    id: 'DefectTypesTab.deleteModalContent',
    defaultMessage:
      "Are you sure you want to delete the defect type? All Investigated as '<b>{name}</b>' defects will be marked as '<b>{parentName}</b>'.",
  },
  resetColorsModalHeader: {
    id: 'DefectTypesTab.resetColorsModalHeader',
    defaultMessage: 'Reset Defect Colors',
  },
  resetColorsModalContent: {
    id: 'DefectTypesTab.resetColorsModalContent',
    defaultMessage: "Are you sure you want to reset custom defect's colors to default?",
  },
  noColorsToUpdate: {
    id: 'DefectTypesTab.noColorsToUpdate',
    defaultMessage: 'No colors to update',
  },
  resetColors: {
    id: 'DefectTypesTab.resetColors',
    defaultMessage: 'Reset to default colors',
  },
});
