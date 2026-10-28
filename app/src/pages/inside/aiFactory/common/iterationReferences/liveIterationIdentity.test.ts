/*
 * Copyright 2026 EPAM Systems
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';

import {
  adaptLiveIterationIdentity,
  areIterationReferencesCoherent,
  getLiveIterationIdentity,
} from './liveIterationIdentity';

jest.mock('common/utils', () => ({ fetch: jest.fn() }));
const dto = { id: 72, pipelineId: 7, iterationNumber: 3 };
const previous = { id: 31, pipelineId: 7, number: 1 };
const result = { id: 72, pipelineId: 7, number: 3 };
const fetchMock = fetch as jest.MockedFunction<
  (url: string, options?: Record<string, unknown>) => Promise<unknown>
>;

describe('canonical iteration identity', () => {
  beforeEach(() => jest.clearAllMocks());
  test('preserves database and display identities independently', () => {
    expect(
      adaptLiveIterationIdentity({ ...dto, rerunOf: { id: 31, iterationNumber: 1 } }, 72),
    ).toEqual({ ...result, rerunOf: { id: 31, iterationNumber: 1 } });
  });
  test.each([
    null,
    [],
    {},
    { ...dto, id: 73 },
    { ...dto, id: '72' },
    { ...dto, pipelineId: 0 },
    { ...dto, pipelineId: '7' },
    { ...dto, iterationNumber: 0 },
    { ...dto, iterationNumber: '3' },
    { ...dto, rerunOf: { id: -1 } },
  ])('rejects mismatched or incomplete identity %p', (value) => {
    expect(adaptLiveIterationIdentity(value, 72)).toBeUndefined();
  });
  test('rejects an invalid expected identity even when the raw payload echoes it', () => {
    expect(adaptLiveIterationIdentity({ ...dto, id: 0 }, 0)).toBeUndefined();
  });
  test('loads only the canonical by-ID read endpoint with cancellation', async () => {
    fetchMock.mockResolvedValue(dto);
    const signal = new AbortController().signal;
    await expect(getLiveIterationIdentity('project', 72, signal)).resolves.toEqual(result);
    expect(fetchMock).toHaveBeenCalledWith(URLS.pipelineIterationById('project', 72), { signal });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  test.each([0, -1, NaN, 1.5])('never requests an invalid iteration ID %p', async (id) => {
    await expect(
      getLiveIterationIdentity('project', id, new AbortController().signal),
    ).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  test('accepts a matching pipeline pair and optional coherent source identity', () => {
    expect(areIterationReferencesCoherent(previous, result)).toBe(true);
    expect(
      areIterationReferencesCoherent(previous, {
        ...result,
        rerunOf: { id: 31, iterationNumber: 1 },
      }),
    ).toBe(true);
  });
  test.each([
    { ...result, pipelineId: 9 },
    previous,
    { ...result, rerunOf: { id: 31, iterationNumber: 99 } },
    { ...result, rerunOf: { id: 99, iterationNumber: 1 } },
  ])('rejects a contradictory pair %p', (candidate) => {
    expect(areIterationReferencesCoherent(previous, candidate)).toBe(false);
  });
});
