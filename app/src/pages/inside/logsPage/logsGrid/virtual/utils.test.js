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

import { LOGS_SIZE } from 'common/constants/logsSettings';
import { ROW_KIND } from './buildLogRows';
import {
  estimateRowSize,
  getPadding,
  getScrollMargin,
  getScrollAnchor,
  getAnchoredScrollOffset,
  ESTIMATED_LOAD_ROW_SIZE,
} from './utils';

const item = (index, start, size) => ({ index, key: index, start, end: start + size, size });

describe('estimateRowSize', () => {
  test('estimates log rows and step headers by the size preset', () => {
    const log = { kind: ROW_KIND.LOG };
    const header = { kind: ROW_KIND.STEP_HEADER };

    expect(estimateRowSize(log, LOGS_SIZE.SMALL)).toBe(28);
    expect(estimateRowSize(log, LOGS_SIZE.MEDIUM)).toBe(36);
    expect(estimateRowSize(log, LOGS_SIZE.LARGE)).toBe(44);
    expect(estimateRowSize(header, LOGS_SIZE.SMALL)).toBeLessThan(
      estimateRowSize(header, LOGS_SIZE.LARGE),
    );
  });

  test('estimates load rows the same in all presets', () => {
    [ROW_KIND.LOAD_PREVIOUS, ROW_KIND.LOAD_NEXT].forEach((kind) => {
      Object.values(LOGS_SIZE).forEach((size) => {
        expect(estimateRowSize({ kind }, size)).toBe(ESTIMATED_LOAD_ROW_SIZE);
      });
    });
  });

  test('falls back to the default preset for an unknown one', () => {
    expect(estimateRowSize({ kind: ROW_KIND.LOG }, 'unknown')).toBe(
      estimateRowSize({ kind: ROW_KIND.LOG }, LOGS_SIZE.MEDIUM),
    );
  });
});

describe('getPadding', () => {
  test('is empty without rendered rows', () => {
    expect(getPadding([], 500, 100)).toEqual({ top: 0, bottom: 0 });
  });

  test('stands for the rows before the first and after the last rendered row', () => {
    // rows of 10px from index 0, rows 3..5 are rendered, 10 rows in total
    const items = [item(3, 30, 10), item(4, 40, 10), item(5, 50, 10)];

    expect(getPadding(items, 100)).toEqual({ top: 30, bottom: 40 });
  });

  test('takes the scroll margin out of the item positions', () => {
    const items = [item(3, 230, 10), item(4, 240, 10)];

    expect(getPadding(items, 100, 200)).toEqual({ top: 30, bottom: 50 });
  });

  test('is empty when all rows are rendered', () => {
    const items = [item(0, 200, 10), item(1, 210, 10)];

    expect(getPadding(items, 20, 200)).toEqual({ top: 0, bottom: 0 });
  });

  test('is never negative', () => {
    expect(getPadding([item(0, 190, 20)], 5, 200)).toEqual({ top: 0, bottom: 0 });
  });
});

describe('getScrollMargin', () => {
  test('is the offset of the element from the top of the scrolled content', () => {
    const scrollElement = { scrollTop: 300, getBoundingClientRect: () => ({ top: 50 }) };
    const element = { getBoundingClientRect: () => ({ top: -100.4 }) };

    expect(getScrollMargin(scrollElement, element)).toBe(150);
  });
});

describe('getScrollAnchor', () => {
  const rows = [];
  const items = [item(3, 130, 10), item(4, 140, 10), item(5, 150, 10)];

  test('is the first row that reaches below the top of the view and the offset into it', () => {
    expect(getScrollAnchor(items, 140, 100, rows)).toEqual({
      key: 4,
      offsetInRow: 0,
      rows,
      scrollMargin: 100,
    });
    expect(getScrollAnchor(items, 145, 100, rows)).toMatchObject({ key: 4, offsetInRow: 5 });
  });

  test('is none while the top of the view is above the rows', () => {
    expect(getScrollAnchor(items, 99, 100, rows)).toBeNull();
  });

  test('is none without a scroll offset or rows at the top of the view', () => {
    expect(getScrollAnchor(items, null, 0, rows)).toBeNull();
    expect(getScrollAnchor(items, 500, 0, rows)).toBeNull();
  });
});

describe('getAnchoredScrollOffset', () => {
  const anchor = { key: 'log-4', offsetInRow: 5 };

  test('shows the anchor row at its new start as far into it as before', () => {
    expect(getAnchoredScrollOffset(anchor, 440)).toBe(445);
    expect(getAnchoredScrollOffset(anchor, 100)).toBe(105);
  });

  test('is never negative', () => {
    expect(getAnchoredScrollOffset({ key: 'a', offsetInRow: -20 }, 10)).toBe(0);
  });

  test('is null when the anchor row is gone', () => {
    expect(getAnchoredScrollOffset(anchor, undefined)).toBeNull();
  });
});
