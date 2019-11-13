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

export const validateIgnoreInAA = (item) => {
  if (!item.issue || !item.issue.issueType) {
    return 'noDefectType';
  }
  if (item.issue && item.issue.ignoreAnalyzer) {
    return 'alreadyIgnored';
  }
  return null;
};

export const validateIncludeInAA = (item) => {
  if (!item.issue || !item.issue.issueType) {
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

export const validatePostIssue = (item) =>
  !item.issue || !item.issue.issueType ? 'noDefectTypeToPostIssue' : null;
