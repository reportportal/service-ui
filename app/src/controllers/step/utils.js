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
import { TO_INVESTIGATE } from 'common/constants/defectTypes';
import { showModalAction } from 'controllers/modal';

export const ignoreInAA = (items, { fetchFunc, eventsInfo }) =>
  showModalAction({ id: 'ignoreInAAModal', data: { items, fetchFunc, eventsInfo } });

export const includeInAA = (items, { fetchFunc, eventsInfo }) =>
  showModalAction({ id: 'includeInAAModal', data: { items, fetchFunc, eventsInfo } });

export const linkIssue = (items, { fetchFunc, eventsInfo }) =>
  showModalAction({ id: 'linkIssueModal', data: { items, fetchFunc, eventsInfo } });

export const unlinkIssue = (items, { fetchFunc, eventsInfo }) =>
  showModalAction({ id: 'unlinkIssueModal', data: { items, fetchFunc, eventsInfo } });

export const postIssue = (items, { fetchFunc, eventsInfo }) =>
  showModalAction({ id: 'postIssueModal', data: { items, fetchFunc, eventsInfo } });

export const editDefect = (items, { fetchFunc, debugMode, eventsInfo }) =>
  showModalAction({ id: 'editDefectModal', data: { items, fetchFunc, debugMode, eventsInfo } });

export const isDefectGroupOperationAvailable = ({
  editedData,
  selectedItems,
  getDefectType,
  debugMode,
}) => {
  const items = editedData && editedData.id ? [editedData] : selectedItems;
  return (
    items.length === 1 &&
    items[0].issue &&
    items[0].issue.issueType &&
    getDefectType(items[0].issue.issueType).typeRef.toUpperCase() ===
      TO_INVESTIGATE.toUpperCase() &&
    !debugMode
  );
};
