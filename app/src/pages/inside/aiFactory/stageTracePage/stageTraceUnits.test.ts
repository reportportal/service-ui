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

import type { ReducedPipelineSection } from 'controllers/aiFactory/pipelines/liveAdapters';
import {
  filterStageTraceEvents,
  getStageTraceUnits,
  getStageTraceUnitFilter,
  getStageTraceEventUnit,
} from './stageTraceUnits';

const key = '  opaque:/unit:stage  ';
const sections = [
  {
    key: 'units',
    rows: [
      { key, cells: { name: '<img src=x>Case A' } },
      { key: 'fallback', cells: { name: 42 } },
    ],
  },
] as unknown as ReducedPipelineSection[];
const events = [
  { seq: 0, type: 'START' },
  { seq: 2, type: 'STEP', unitKey: key },
  { seq: 8, type: 'STEP', unitKey: 'unknown' },
  { seq: 9, type: 'STEP', unitKey: 'fallback' },
];

test('uses only units sections, preserves exact keys and names, and falls back to row key', () => {
  expect(Array.from(getStageTraceUnits(sections))).toEqual([
    [key, '<img src=x>Case A'],
    ['fallback', 'fallback'],
  ]);
  expect(getStageTraceUnits([{ ...sections[0], key: 'transcript' }]).size).toBe(0);
});
test('keeps unknown and absent unit keys under Stage, preserving sparse sequence order', () => {
  const units = getStageTraceUnits(sections);
  expect(filterStageTraceEvents(events, units, 'all')).toBe(events);
  expect(filterStageTraceEvents(events, units, 'stage').map(({ seq }) => seq)).toEqual([0, 8]);
  expect(filterStageTraceEvents(events, units, `unit:${key}`).map(({ seq }) => seq)).toEqual([2]);
  expect(filterStageTraceEvents(events, new Map(), 'stage')).toEqual(events);
});
test('resets a disappeared unit filter to All without interpreting reserved key strings', () => {
  expect(getStageTraceUnitFilter(`unit:${key}`, new Map())).toBe('all');
  expect(getStageTraceUnitFilter('stage', new Map())).toBe('stage');
  expect(getStageTraceUnitFilter('unit:stage', new Map([['stage', 'Stage unit']]))).toBe(
    'unit:stage',
  );
});

test('distinguishes special and case-sensitive row keys from the Stage filter', () => {
  const units = new Map([
    ['stage', 'Stage unit'],
    ['__proto__', 'Prototype unit'],
    ['Case', 'Uppercase unit'],
  ]);
  const keyedEvents = [
    { seq: 0, type: 'START' },
    { seq: 3, type: 'STEP', unitKey: 'stage' },
    { seq: 5, type: 'STEP', unitKey: '__proto__' },
    { seq: 8, type: 'STEP', unitKey: 'case' },
    { seq: 13, type: 'STEP', unitKey: 'Case' },
  ];
  expect(filterStageTraceEvents(keyedEvents, units, 'stage').map(({ seq }) => seq)).toEqual([0, 8]);
  expect(filterStageTraceEvents(keyedEvents, units, 'unit:stage').map(({ seq }) => seq)).toEqual([
    3,
  ]);
  expect(
    filterStageTraceEvents(keyedEvents, units, 'unit:__proto__').map(({ seq }) => seq),
  ).toEqual([5]);
  expect(filterStageTraceEvents(keyedEvents, units, 'unit:Case').map(({ seq }) => seq)).toEqual([
    13,
  ]);
  expect(getStageTraceEventUnit(keyedEvents[3], units)).toBeUndefined();
  expect(getStageTraceEventUnit(keyedEvents[4], units)).toBe('Case');
});

test('does not overwrite a unit name with duplicate rows and does not mutate the input', () => {
  const duplicates = [
    {
      ...sections[0],
      rows: [...sections[0].rows, { key, cells: { name: 'Duplicate name' }, details: [] }],
    },
  ];
  const units = getStageTraceUnits(duplicates);
  expect(units.get(key)).toBe('<img src=x>Case A');
  expect(duplicates[0].rows).toHaveLength(3);
  expect(getStageTraceUnits()).toEqual(new Map());
  expect(getStageTraceUnitFilter('all', units)).toBe('all');
});
