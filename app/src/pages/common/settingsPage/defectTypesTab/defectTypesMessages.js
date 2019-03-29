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
    defaultMessage: 'Defect Name',
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
    defaultMessage: 'No Defect Bugs Group',
  },
  [TO_INVESTIGATE]: {
    id: 'DefectTypesTab.toInvestigateBugsGroup',
    defaultMessage: 'To Investigate Bugs Group',
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
});
