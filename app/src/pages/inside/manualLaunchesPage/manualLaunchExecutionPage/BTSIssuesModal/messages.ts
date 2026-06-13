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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  postIssue: {
    id: 'BTSIssuesModal.postIssue',
    defaultMessage: 'Post issue',
  },
  linkIssue: {
    id: 'BTSIssuesModal.linkIssue',
    defaultMessage: 'Link issue',
  },
  selectAnActionForBTS: {
    id: 'BTSIssuesModal.selectAnActionForBTS',
    defaultMessage: 'Select an action for BTS',
  },
  ticketName: {
    id: 'BTSIssuesModal.ticketName',
    defaultMessage: 'Ticket name',
  },
  postIssueSuccess: {
    id: 'BTSIssuesModal.postIssueSuccess',
    defaultMessage: 'The issue was successfully posted to BTS',
  },
  postIssueFailed: {
    id: 'BTSIssuesModal.postIssueFailed',
    defaultMessage: 'Failed to post issue',
  },
  linkIssueSuccess: {
    id: 'BTSIssuesModal.linkIssueSuccess',
    defaultMessage: 'The issue was successfully linked with BTS tiket',
  },
  linkIssueFailed: {
    id: 'BTSIssuesModal.linkIssueFailed',
    defaultMessage: 'Failed to link issue',
  },
  linkToIssue: {
    id: 'LinkBTSIssueForm.linkToIssue',
    defaultMessage: 'Link to issue',
  },
  linkToIssuePlaceholder: {
    id: 'LinkBTSIssueForm.linkToIssuePlaceholder',
    defaultMessage: 'Enter link to issue',
  },
  issueId: {
    id: 'LinkBTSIssueForm.issueId',
    defaultMessage: 'Issue ID',
  },
  issueIdPlaceholder: {
    id: 'LinkBTSIssueForm.issueIdPlaceholder',
    defaultMessage: 'Enter issue ID (e.g. EXMPL-12345)',
  },
  addNewIssue: {
    id: 'LinkBTSIssueForm.addNewIssue',
    defaultMessage: 'Add New Issue',
  },
});
