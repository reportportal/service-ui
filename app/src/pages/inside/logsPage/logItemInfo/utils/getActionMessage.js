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

import { messages } from '../translations';

export const getActionMessage = (intl, activityItem) => {
  switch (activityItem.event_name) {
    case 'updateItem':
      return intl.formatMessage(
        activityItem.details.history.length > 1 ? messages.updateItemIssue : messages.updateItem,
      );
    case 'postIssue':
      return intl.formatMessage(messages.postIssue);
    case 'linkIssue':
      return intl.formatMessage(messages.linkIssue);
    case 'unlinkIssue':
      return intl.formatMessage(messages.unlinkIssue);
    case 'analyzeItem':
      return intl.formatMessage(messages.changedByAnalyzer);
    case 'linkIssueAa':
      return intl.formatMessage(messages.issueLoadByAnalyzer);
    default:
      return activityItem.event_name;
  }
};
