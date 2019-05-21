export const validateIgnoreInAA = (item) => {
  if (item.issue && !item.issue.issueType) {
    return 'noDefectType';
  }
  if (item.issue && item.issue.ignoreAnalyzer) {
    return 'alreadyIgnored';
  }
  return null;
};

export const validateIncludeInAA = (item) => {
  if (item.issue && !item.issue.issueType) {
    return 'noDefectType';
  }
  if (item.issue && !item.issue.ignoreAnalyzer) {
    return 'alreadyIncluded';
  }
  return null;
};

export const validateUnlinkIssue = (item) => {
  if (!item.issue || !item.issue.externalSystemIssues || !item.issue.externalSystemIssues.length) {
    return 'noLinkedIssue';
  }
  return null;
};

export const validateLinkIssue = (item) =>
  !item.issue || !item.issue.issueType ? 'noDefectTypeToLinkIssue' : null;

export const validateEditDefect = (item) =>
  !item.issue || !item.issue.issueType ? 'noIssue' : null;
