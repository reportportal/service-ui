/*
 * Copyright 2026 EPAM Systems
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import type { ReducedPipelineAttribute } from './liveAdapters';
import {
  adaptIterationReference,
  getIterationFixLabel,
  isFixIteration,
} from './iterationProvenance';

describe('iteration provenance classification', () => {
  test.each<ReducedPipelineAttribute[]>([
    [{ key: 'fixRoundId', type: 'NONE', value: '5' }],
    [{ key: 'fixRound', type: 'META', value: 'Fix TC101' }],
  ])('recognizes published fix attributes %p', (...attributes) => {
    expect(isFixIteration(attributes)).toBe(true);
  });

  test.each<ReducedPipelineAttribute[]>([
    [],
    [{ key: 'fixRoundId', type: 'TAG', value: '5' }],
    [{ key: 'fixRoundId', type: 'NONE', value: '-1' }],
    [{ key: 'fixRoundId', type: 'NONE', value: '1.5' }],
    [{ key: 'fixRound', type: 'TAG', value: 'Fix TC101' }],
    [{ key: 'trigger', type: 'META', value: 'fix' }],
  ])('does not infer a fix from unrelated or malformed attributes %p', (...attributes) => {
    expect(isFixIteration(attributes)).toBe(false);
    expect(getIterationFixLabel(attributes)).toBeUndefined();
  });

  test('preserves a readable fix label separately from the internal round ID', () => {
    expect(
      getIterationFixLabel([
        { key: 'fixRoundId', type: 'NONE', value: '5' },
        { key: 'fixRound', type: 'META', value: 'Fix TC101' },
      ]),
    ).toBe('Fix TC101');
    expect(adaptIterationReference({ id: 31, iterationNumber: 'invalid' })).toEqual({ id: 31 });
  });
});
