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

import { INITIAL_STATE } from 'controllers/log/nestedSteps/constants';
import {
  isLoadMoreButtonVisible,
  isLoadPreviousButtonVisible,
  isLoadCurrentStepButtonVisible,
} from 'controllers/log/nestedSteps';

export const ROW_KIND = {
  LOG: 'log',
  STEP_HEADER: 'stepHeader',
  LOAD_PREVIOUS: 'loadPrevious',
  LOAD_NEXT: 'loadNext',
};

const isStep = (item) => 'hasContent' in item;

const appendRows = (rows, items, nestedSteps, level, parentStepId) => {
  items.forEach((item) => {
    if (!isStep(item)) {
      rows.push({
        key: `${ROW_KIND.LOG}-${item.id}`,
        kind: ROW_KIND.LOG,
        item,
        level,
        stepId: parentStepId,
        index: rows.length,
      });
      return;
    }

    const { collapsed, loading, content, page } = nestedSteps[item.id] || INITIAL_STATE;
    const stepRow = (kind) => ({
      key: `${kind}-${item.id}`,
      kind,
      item,
      level,
      stepId: item.id,
      collapsed,
      loading,
      showLoadCurrentStep: isLoadCurrentStepButtonVisible(page, item, nestedSteps),
      index: rows.length,
    });

    rows.push(stepRow(ROW_KIND.STEP_HEADER));
    if (collapsed) {
      return;
    }
    if (isLoadPreviousButtonVisible(page)) {
      rows.push(stepRow(ROW_KIND.LOAD_PREVIOUS));
    }
    appendRows(rows, content, nestedSteps, level + 1, item.id);
    if (isLoadMoreButtonVisible(page)) {
      rows.push(stepRow(ROW_KIND.LOAD_NEXT));
    }
  });
};

// Flattens the log items and the loaded content of the expanded nested steps into the list of rows
// in the order the recursive nested grid renders them: step header, "load previous", step content,
// "load next". A log row's stepId is its parent step, a step row's stepId is the step itself.
export const buildLogRows = (data, nestedSteps = {}, { level = 0, parentStepId = null } = {}) => {
  const rows = [];
  appendRows(rows, data, nestedSteps, level, parentStepId);
  return rows;
};

export const findLogRowIndex = (rows, logId) =>
  rows.findIndex((row) => row.kind === ROW_KIND.LOG && row.item.id === logId);
