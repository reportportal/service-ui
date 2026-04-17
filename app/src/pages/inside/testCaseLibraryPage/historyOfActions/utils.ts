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
import { isEmpty } from 'es-toolkit/compat';

import type {
  TestCaseActivityHistoryEntry,
  TestCaseActivityItem,
  TestCaseActivityTableRow,
} from './types';

/**
 * Splits a string on commas and returns trimmed non-empty segments (one UI line each).
 */
export const splitCommaSeparatedValueToLines = (value: string): string[] =>
  value
    .split(',')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

/**
 * Collapses runs of newlines / blank lines so `white-space: pre-line` does not show empty rows
 * between content (common when backend stores CRLF or paragraph breaks).
 */
export const normalizeHistoryCellMultilineText = (value: string): string =>
  value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !isEmpty(line))
    .join('\n');

export const formatHistoryValueCell = (
  historyEntry: TestCaseActivityHistoryEntry | null,
  raw: string | undefined,
): string => {
  if (!historyEntry) {
    return '-';
  }
  const field = historyEntry.field?.trim() ?? '';

  return `${field}: ${raw}`;
};

export const flattenActivityContent = (content: TestCaseActivityItem[]): TestCaseActivityTableRow[] => {
  const rows: TestCaseActivityTableRow[] = [];

  content.forEach((item) => {
    const history = item.details?.history ?? [];

    if (isEmpty(history)) {
      rows.push({
        rowKey: `${item.id}-0`,
        item,
        historyEntry: null,
      });
      return;
    }

    history.forEach((entry, index) => {
      rows.push({
        rowKey: `${item.id}-${index}`,
        item,
        historyEntry: entry,
      });
    });
  });

  return rows;
};
