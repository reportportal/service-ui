import { defineMessages } from 'react-intl';

export const Messages = defineMessages({
  // Table header
  defectName: {
    id: 'SettingDefectHeader.defectName',
    defaultMessage: 'Defect name',
  },
  abbreviation: {
    id: 'SettingDefectHeader.abbreviation',
    defaultMessage: 'Abbreviation',
  },
  color: {
    id: 'SettingDefectHeader.color',
    defaultMessage: 'Color',
  },
  diagram: {
    id: 'SettingDefectHeader.diagram',
    defaultMessage: 'Diagram',
  },
  // Defect group
  PRODUCT_BUG_MSG: {
    id: 'defectTypesGroup.titleProductBug',
    defaultMessage: 'PRODUCT BUGS GROUP',
  },
  AUTOMATION_BUG_MSG: {
    id: 'defectTypesGroup.titleAutomationBug',
    defaultMessage: 'AUTOMATION BUGS GROUP',
  },
  NO_DEFECT_MSG: {
    id: 'defectTypesGroup.titleNoDefect',
    defaultMessage: 'NO DEFECTS GROUP',
  },
  TO_INVESTIGATE_MSG: {
    id: 'defectTypesGroup.titleToInvestigate',
    defaultMessage: 'TO INVESTIGATE',
  },
  SYSTEM_ISSUE_MSG: {
    id: 'defectTypesGroup.titleSystemIssue',
    defaultMessage: 'SYSTEM ISSUES GROUP',
  },
});
