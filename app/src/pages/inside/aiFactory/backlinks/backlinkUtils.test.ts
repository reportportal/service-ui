/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { parsePipelineIterationIdentity, parseTestCaseIdentity } from './backlinkUtils';

describe('backlinkUtils', () => {
  describe('parseTestCaseIdentity', () => {
    test('returns a validated Library test case identity', () => {
      expect(parseTestCaseIdentity({ id: 42, displayId: 'TC42', ignored: 'value' })).toEqual({
        id: 42,
        displayId: 'TC42',
      });
    });

    test.each([
      null,
      'TC42',
      {},
      { id: 0, displayId: 'TC42' },
      { id: -1, displayId: 'TC42' },
      { id: 1.5, displayId: 'TC42' },
      { id: Number.MAX_SAFE_INTEGER + 1, displayId: 'TC42' },
      { id: '42', displayId: 'TC42' },
      { id: 42 },
      { id: 42, displayId: '' },
      { id: 42, displayId: '   ' },
    ])('fails closed for an invalid test case identity %#', (value) => {
      expect(parseTestCaseIdentity(value)).toBeNull();
    });
  });

  describe('parsePipelineIterationIdentity', () => {
    test('returns a validated pipeline iteration identity and ignores unrelated attributes', () => {
      expect(
        parsePipelineIterationIdentity([
          { key: 'build', value: '2026.10' },
          { key: 'pipeline', value: '17/103' },
        ]),
      ).toEqual({ pipelineId: 17, iterationId: 103 });
    });

    test.each([
      null,
      {},
      [],
      [null, { key: 'build', value: '17/103' }],
      [{ key: 'pipeline' }],
      [{ key: 'pipeline', value: 17 }],
      [{ key: 'pipeline', value: '' }],
      [{ key: 'pipeline', value: '17' }],
      [{ key: 'pipeline', value: '17/' }],
      [{ key: 'pipeline', value: '/103' }],
      [{ key: 'pipeline', value: '17/103/4' }],
      [{ key: 'pipeline', value: ' 17/103' }],
      [{ key: 'pipeline', value: '17/103 ' }],
      [{ key: 'pipeline', value: '01/103' }],
      [{ key: 'pipeline', value: '17/0103' }],
      [{ key: 'pipeline', value: '0/103' }],
      [{ key: 'pipeline', value: '17/0' }],
      [{ key: 'pipeline', value: `${Number.MAX_SAFE_INTEGER + 1}/103` }],
      [{ key: 'pipeline', value: `17/${Number.MAX_SAFE_INTEGER + 1}` }],
      [
        { key: 'pipeline', value: '17/103' },
        { key: 'pipeline', value: '18/104' },
      ],
      [
        { key: 'pipeline', value: '17/103' },
        { key: 'pipeline', value: 'malformed' },
      ],
    ])('fails closed for missing, malformed, incomplete, or duplicate attributes %#', (value) => {
      expect(parsePipelineIterationIdentity(value)).toBeNull();
    });
  });
});
