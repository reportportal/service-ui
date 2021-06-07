export const state = {
  className: '',
  isSelected: true,
  selectedItem: 552853,
  selectItem: () => {},
  project: {
    info: {
      configuration: {
        subTypes: {
          TO_INVESTIGATE: [
            {
              locator: 'ti001',
              typeRef: 'TO_INVESTIGATE',
              longName: 'To Investigate',
              shortName: 'TI',
              color: '#ffb743',
            },
          ],
          NO_DEFECT: [
            {
              locator: 'nd001',
              typeRef: 'NO_DEFECT',
              longName: 'No Defect',
              shortName: 'ND',
              color: '#777777',
            },
          ],
          AUTOMATION_BUG: [
            {
              locator: 'ab001',
              typeRef: 'AUTOMATION_BUG',
              longName: 'Automation Bug',
              shortName: 'AB',
              color: '#f7d63e',
            },
          ],
          PRODUCT_BUG: [
            {
              locator: 'pb001',
              typeRef: 'PRODUCT_BUG',
              longName: 'Product Bug',
              shortName: 'PB',
              color: '#ec3900',
            },
          ],
          SYSTEM_ISSUE: [
            {
              locator: 'si001',
              typeRef: 'SYSTEM_ISSUE',
              longName: 'System Issue',
              shortName: 'SI',
              color: '#0274d1',
            },
          ],
        },
      },
    },
  },
};

export const item = {
  id: 552853,
  uuid: 'fc07c062-aa41-4988-b574-fa0244775053',
  name: 'UpdateLaunchTest',
  codeRef: 'com.epam.ta.reportportal.demodata.UpdateLaunchTest',
  parameters: [],
  attributes: [],
  type: 'STEP',
  startTime: 1614667067279,
  endTime: 1614667068146,
  status: 'FAILED',
  statistics: {
    executions: { total: 1, failed: 1 },
    defects: { product_bug: { total: 1, pb001: 1 } },
  },
  parent: 552707,
  pathNames: {
    launchPathName: { name: 'Demo Api Tests', number: 181 },
    itemPaths: [
      { id: 552704, name: 'Launch Tests' },
      { id: 552707, name: 'Test with nested steps' },
    ],
  },
  issue: {
    issueType: 'pb001',
    comment:
      'Should be marked with custom defect type\n[lol](https://lol.com)\n[lol](vscode://lol.com)',
    autoAnalyzed: false,
    ignoreAnalyzer: false,
    externalSystemIssues: [
      {
        ticketId: 'EPMRPP-60348',
        btsUrl: 'https://jiraeu-api.epam.com',
        btsProject: 'EPMRPP',
        url: 'https://jiraeu.epam.com/browse/EPMRPP-60348',
      },
    ],
  },
  hasChildren: false,
  hasStats: true,
  launchId: 168305,
  uniqueId: 'auto:710a46edcd2e7f341ff1e7bc34388395',
  testCaseId: 'com.epam.ta.reportportal.demodata.UpdateLaunchTest',
  testCaseHash: 525516344,
  patternTemplates: ['error'],
  path: '552704.552707.552853',
  launchNumber: 181,
};
