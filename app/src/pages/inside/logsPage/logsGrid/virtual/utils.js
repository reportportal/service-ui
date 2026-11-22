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

import { LOGS_SIZE, DEFAULT_LOGS_SIZE } from 'common/constants/logsSettings';
import { ROW_KIND } from './buildLogRows';

// Rows rendered above and below the visible ones. Only rendered rows can be found with the
// browser search (Ctrl+F); the log message filter is the supported way to search the logs.
export const LOGS_OVERSCAN = 20;

// Heights the rows are expected to have before they are measured, by log size preset.
export const ESTIMATED_ROW_SIZE = {
  [LOGS_SIZE.SMALL]: { [ROW_KIND.LOG]: 28, [ROW_KIND.STEP_HEADER]: 48 },
  [LOGS_SIZE.MEDIUM]: { [ROW_KIND.LOG]: 36, [ROW_KIND.STEP_HEADER]: 56 },
  [LOGS_SIZE.LARGE]: { [ROW_KIND.LOG]: 44, [ROW_KIND.STEP_HEADER]: 64 },
};
export const ESTIMATED_LOAD_ROW_SIZE = 32;

export const estimateRowSize = (row, logsSize) => {
  const sizes = ESTIMATED_ROW_SIZE[logsSize] || ESTIMATED_ROW_SIZE[DEFAULT_LOGS_SIZE];
  return sizes[row.kind] || ESTIMATED_LOAD_ROW_SIZE;
};

// Heights of the spacer rows that stand for the rows above and below the rendered ones.
// The starts and ends of the virtual items include the scroll margin, the total size does not.
export const getPadding = (virtualItems, totalSize, scrollMargin = 0) => {
  if (!virtualItems.length) {
    return { top: 0, bottom: 0 };
  }
  const first = virtualItems[0];
  const last = virtualItems[virtualItems.length - 1];
  return {
    top: Math.max(first.start - scrollMargin, 0),
    bottom: Math.max(totalSize - (last.end - scrollMargin), 0),
  };
};

// Offset of the element from the top of the scrolled content of the scroll element.
export const getScrollMargin = (scrollElement, element) =>
  Math.round(
    element.getBoundingClientRect().top -
      scrollElement.getBoundingClientRect().top +
      scrollElement.scrollTop,
  );

// The first row at the top of the view and how far into it the view starts, recorded to keep the
// view in place when rows are added or removed above it or the rows move down (scroll margin).
// There is none when the top of the view is above the rows.
export const getScrollAnchor = (virtualItems, scrollOffset, scrollMargin, rows) => {
  if (scrollOffset === null || scrollOffset < scrollMargin) {
    return null;
  }
  const item = virtualItems.find(({ end }) => end > scrollOffset);
  return item
    ? {
        key: item.key,
        start: item.start,
        offsetInRow: scrollOffset - item.start,
        rows,
        scrollMargin,
      }
    : null;
};

// The scroll offset that shows the anchor row as it was, from its new start; null when the row is
// gone or did not move (the recorded offset into the row can lag behind a running scroll, it is
// not written back then).
export const getAnchoredScrollOffset = (anchor, anchorStart, scrollMargin) => {
  if (
    anchorStart === undefined ||
    (anchorStart === anchor.start && scrollMargin === anchor.scrollMargin)
  ) {
    return null;
  }
  return Math.max(anchorStart + anchor.offsetInRow, 0);
};
