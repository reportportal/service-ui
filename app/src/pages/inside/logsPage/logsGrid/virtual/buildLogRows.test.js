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

import { buildLogRows, findLogRowIndex, ROW_KIND } from './buildLogRows';

const { LOG, STEP_HEADER, LOAD_PREVIOUS, LOAD_NEXT } = ROW_KIND;

const log = (id) => ({ id, message: `log ${id}` });
const step = (id, extra = {}) => ({ id, name: `step ${id}`, hasContent: true, ...extra });
// a step whose pages first..last of 300 rows out of `total` pages are loaded
const loaded = (content, { first = 1, last = 1, total = 1, collapsed = false, ...rest } = {}) => ({
  collapsed,
  loading: false,
  initial: false,
  content,
  page: {
    number: last,
    firstNumber: first,
    totalPages: total,
    size: 300,
    loaded: content.length,
    totalElements: total * 300,
  },
  ...rest,
});

const shape = (rows) => rows.map(({ kind, item, level, stepId }) => [kind, item.id, level, stepId]);

describe('buildLogRows', () => {
  test('returns log rows of the top level in order', () => {
    const rows = buildLogRows([log(1), log(2)]);

    expect(rows).toEqual([
      { key: 'log-1', kind: LOG, item: log(1), level: 0, stepId: null, index: 0 },
      { key: 'log-2', kind: LOG, item: log(2), level: 0, stepId: null, index: 1 },
    ]);
  });

  test('returns nothing for no data', () => {
    expect(buildLogRows([])).toEqual([]);
  });

  test('renders a step that is not in the nested steps state as a collapsed header', () => {
    const rows = buildLogRows([step(10), log(1)], {});

    expect(shape(rows)).toEqual([
      [STEP_HEADER, 10, 0, 10],
      [LOG, 1, 0, null],
    ]);
    expect(rows[0]).toMatchObject({
      key: 'stepHeader-10',
      collapsed: true,
      loading: false,
      showLoadCurrentStep: true,
    });
  });

  test('skips the content of a collapsed step', () => {
    const rows = buildLogRows([step(10)], { 10: loaded([log(1)], { collapsed: true }) });

    expect(shape(rows)).toEqual([[STEP_HEADER, 10, 0, 10]]);
  });

  test('puts the content of an expanded step after its header one level deeper', () => {
    const rows = buildLogRows([log(1), step(10), log(2)], { 10: loaded([log(11), log(12)]) });

    expect(shape(rows)).toEqual([
      [LOG, 1, 0, null],
      [STEP_HEADER, 10, 0, 10],
      [LOG, 11, 1, 10],
      [LOG, 12, 1, 10],
      [LOG, 2, 0, null],
    ]);
    expect(rows.map(({ index }) => index)).toEqual([0, 1, 2, 3, 4]);
  });

  test('flattens steps nested in steps', () => {
    const rows = buildLogRows([step(10)], {
      10: loaded([step(20), log(11)]),
      20: loaded([step(30), log(21)]),
      30: loaded([log(31)]),
    });

    expect(shape(rows)).toEqual([
      [STEP_HEADER, 10, 0, 10],
      [STEP_HEADER, 20, 1, 20],
      [STEP_HEADER, 30, 2, 30],
      [LOG, 31, 3, 30],
      [LOG, 21, 2, 20],
      [LOG, 11, 1, 10],
    ]);
  });

  test('adds "load next" after the content when more pages follow', () => {
    const rows = buildLogRows([step(10)], {
      10: loaded([log(11)], { first: 1, last: 1, total: 3 }),
    });

    expect(shape(rows)).toEqual([
      [STEP_HEADER, 10, 0, 10],
      [LOG, 11, 1, 10],
      [LOAD_NEXT, 10, 0, 10],
    ]);
    expect(rows[2].key).toBe('loadNext-10');
  });

  test('adds "load previous" before the content when the first page is not loaded', () => {
    const rows = buildLogRows([step(10)], {
      10: loaded([log(11)], { first: 2, last: 3, total: 3 }),
    });

    expect(shape(rows)).toEqual([
      [STEP_HEADER, 10, 0, 10],
      [LOAD_PREVIOUS, 10, 0, 10],
      [LOG, 11, 1, 10],
    ]);
    expect(rows[1].key).toBe('loadPrevious-10');
  });

  test('adds both load rows in the middle of the pages of a step', () => {
    const rows = buildLogRows([step(10)], {
      10: loaded([log(11)], { first: 2, last: 2, total: 3 }),
    });

    expect(rows.map(({ kind }) => kind)).toEqual([STEP_HEADER, LOAD_PREVIOUS, LOG, LOAD_NEXT]);
  });

  test('adds no load rows when all pages of the step are loaded', () => {
    const rows = buildLogRows([step(10)], {
      10: loaded([log(11)], { first: 1, last: 3, total: 3 }),
    });

    expect(rows.map(({ kind }) => kind)).toEqual([STEP_HEADER, LOG]);
  });

  test('passes the loading and collapsed state of the step to its rows', () => {
    const rows = buildLogRows([step(10)], {
      10: loaded([log(11)], { first: 2, last: 2, total: 3, loading: true }),
    });

    expect(rows.filter(({ kind }) => kind !== LOG)).toEqual(
      [STEP_HEADER, LOAD_PREVIOUS, LOAD_NEXT].map((kind) =>
        expect.objectContaining({ kind, loading: true, collapsed: false }),
      ),
    );
  });

  test('shows "load current step" while not all rows of the step are loaded', () => {
    const partial = buildLogRows([step(10)], { 10: loaded([log(11)], { total: 2 }) });
    const complete = buildLogRows([step(10)], {
      10: { ...loaded([log(11)]), page: { number: 1, totalPages: 1, size: 300, totalElements: 1 } },
    });

    expect(partial[0].showLoadCurrentStep).toBe(true);
    expect(complete[0].showLoadCurrentStep).toBe(false);
  });

  test('shows "load current step" of a parent while a nested step is not loaded', () => {
    const complete = { number: 1, totalPages: 1, size: 300, totalElements: 2 };
    const rows = buildLogRows([step(10)], {
      10: { ...loaded([step(20), log(11)]), page: complete },
    });

    expect(rows[0].showLoadCurrentStep).toBe(true);
  });

  test('renders a step whose first load failed as an expandable header only', () => {
    // the reducer keeps the step collapsed with nothing loaded after an error
    const rows = buildLogRows([step(10)], {
      10: { collapsed: true, loading: false, initial: true, content: [], page: {} },
    });

    expect(shape(rows)).toEqual([[STEP_HEADER, 10, 0, 10]]);
  });

  test('renders an expanded step without loaded pages as the header without load rows', () => {
    const rows = buildLogRows([step(10)], {
      10: { collapsed: false, loading: false, initial: true, content: [], page: {} },
    });

    expect(shape(rows)).toEqual([[STEP_HEADER, 10, 0, 10]]);
  });

  test('starts from the given level and parent step', () => {
    const rows = buildLogRows([log(1)], {}, { level: 2, parentStepId: 7 });

    expect(shape(rows)).toEqual([[LOG, 1, 2, 7]]);
  });

  test('gives a log and a step with the same id different keys', () => {
    const rows = buildLogRows([step(5), log(5)], {});

    expect(rows.map(({ key }) => key)).toEqual(['stepHeader-5', 'log-5']);
  });
});

describe('findLogRowIndex', () => {
  const rows = buildLogRows([step(5), log(5), step(10)], { 10: loaded([log(11)]) });

  test('finds the index of a log row by the log id', () => {
    expect(findLogRowIndex(rows, 5)).toBe(1);
    expect(findLogRowIndex(rows, 11)).toBe(3);
  });

  test('does not match step rows or missing ids', () => {
    expect(findLogRowIndex(rows, 10)).toBe(-1);
    expect(findLogRowIndex(rows, 404)).toBe(-1);
  });
});
