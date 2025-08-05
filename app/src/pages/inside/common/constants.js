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

export const ISSUE_OPERATION_MAX_ITEMS = 300;
export const SPINNER_DEBOUNCE = 300;

export const actionMessages = defineMessages({
  editDefects: {
    id: 'ActionPanel.editDefects',
    defaultMessage: 'Edit defects',
  },
  postIssue: {
    id: 'ActionPanel.postIssue',
    defaultMessage: 'Post issue',
  },
  linkIssue: {
    id: 'ActionPanel.linkIssue',
    defaultMessage: 'Link issue',
  },
  unlinkIssue: {
    id: 'ActionPanel.unlinkIssue',
    defaultMessage: 'Unlink issue',
  },
  ignoreInAA: {
    id: 'ActionPanel.ignoreInAA',
    defaultMessage: 'Ignore in Auto Analysis',
  },
  includeInAA: {
    id: 'ActionPanel.includeInAA',
    defaultMessage: 'Include into Auto Analysis',
  },
  actionsBtnTooltip: {
    id: 'ActionPanel.actionsBtnTooltip',
    defaultMessage: ' Select several items to processing',
  },
  btsIntegrationIsNotConfigured: {
    id: 'ActionPanel.btsIntegrationIsNotConfigured',
    defaultMessage: 'BTS integration is not configured. Connect with Admin',
  },
  noBtsIntegration: {
    id: 'ActionPanel.noBtsIntegration',
    defaultMessage: 'There is no BTS integration. Connect with Admin',
  },
  noBtsPlugin: {
    id: 'ActionPanel.noBtsPlugin',
    defaultMessage: 'There is no BTS plugin. Connect with Admin',
  },
  noAvailableBtsPlugin: {
    id: 'ActionPanel.noAvailableBtsPlugin',
    defaultMessage: 'BTS plugin is disabled. Contact Admin',
  },
  issueActionUnavailable: {
    id: 'ActionPanel.issueActionUnavailable',
    defaultMessage: 'This operation can be done only for 300 items simultaneously',
  },
});
