import * as React from 'react';
import { FormattedMessage } from 'react-intl';

const issueTypes = {
  failed: <FormattedMessage id="MostFailedTests.header.issueType.failed" defaultMessage="Failed" />,
  skipped: (
    <FormattedMessage id="MostFailedTests.header.issueType.skipped" defaultMessage="Skipped" />
  ),
  product_bug: (
    <FormattedMessage
      id="MostFailedTests.header.issueType.product_bug"
      defaultMessage="Product Bug"
    />
  ),
  automation_bug: (
    <FormattedMessage
      id="MostFailedTests.header.issueType.automation_bug"
      defaultMessage="Automation Bug"
    />
  ),
  system_issue: (
    <FormattedMessage
      id="MostFailedTests.header.issueType.system_issue"
      defaultMessage="System Issue"
    />
  ),
  no_defect: (
    <FormattedMessage id="MostFailedTests.header.issueType.no_defect" defaultMessage="No Defect" />
  ),
};

const columns = {
  name: {
    header: (
      <FormattedMessage id="MostFailedTests.table.header.testCase" defaultMessage="Test case" />
    ),
    nameKey: 'name',
  },
  count: {
    header: (
      <FormattedMessage
        id="MostFailedTests.table.header.issuesInExec"
        defaultMessage="Issues in execution"
      />
    ),
    headerShort: (
      <FormattedMessage
        id="MostFailedTests.table.header.issuesInExecShort"
        defaultMessage="Issues"
      />
    ),
    countKey: 'criteria',
    matrixKey: 'status',
    renderAsBool: true,
  },
  percents: {
    header: (
      <FormattedMessage id="MostFailedTests.table.header.ofIssues" defaultMessage="% of issues" />
    ),
    headerShort: (
      <FormattedMessage id="MostFailedTests.table.header.ofIssuesShort" defaultMessage="% issues" />
    ),
  },
  date: {
    header: (
      <FormattedMessage id="MostFailedTests.table.header.lastIssue" defaultMessage="Last issue" />
    ),
    dateKey: 'startTime',
  },
};

export { issueTypes, columns };
