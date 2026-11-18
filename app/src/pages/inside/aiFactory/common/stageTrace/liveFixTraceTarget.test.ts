/* Copyright 2026 EPAM Systems
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import {
  getLiveFixTraceTarget,
  getLiveFixRoundTraceTarget,
  isFixStageKey,
} from './liveFixTraceTarget';

jest.mock('common/utils', () => ({ fetch: jest.fn() }));
const fetchMock = fetch as jest.MockedFunction<
  (url: string, options?: Record<string, unknown>) => Promise<unknown>
>;
const signal = new AbortController().signal;
const response = (stages: unknown) => ({ id: 72, pipelineId: 8, iterationNumber: 3, stages });
beforeEach(() => jest.clearAllMocks());

test.each(['fix', 'test-case-fix', 'TEST-CASE-FIX', ' fix '])(
  'resolves and retains exact reported fix key %p',
  async (stageKey) => {
    fetchMock.mockResolvedValue(response([{ stageKey }]));
    await expect(getLiveFixTraceTarget('demo', 72, signal)).resolves.toEqual({
      id: 72,
      pipelineId: 8,
      number: 3,
      stageKey,
    });
    expect(fetch).toHaveBeenCalledWith(URLS.pipelineIterationById('demo', 72), { signal });
  },
);

test.each([
  undefined,
  null,
  {},
  [],
  [{ stageKey: 'review', name: 'Fix' }],
  [{ stageKey: 'fix-tests' }],
  [{ name: 'fix' }],
  [{ stageKey: 'fix' }, { stageKey: 'test-case-fix' }],
  [{ stageKey: 'fix' }, { stageKey: 'fix' }],
])('does not guess a missing or ambiguous fix stage %#', async (stages) => {
  fetchMock.mockResolvedValue(response(stages));
  await expect(getLiveFixTraceTarget('demo', 72, signal)).resolves.toBeUndefined();
});

test('ignores unrelated malformed optional stage fields without rejecting a proven identity and key', async () => {
  fetchMock.mockResolvedValue(
    response([
      null,
      { stageKey: 'create', attempts: null },
      { stageKey: 'test-case-fix', attributes: false, attempts: [null] },
    ]),
  );
  await expect(getLiveFixTraceTarget('demo', 72, signal)).resolves.toMatchObject({
    id: 72,
    pipelineId: 8,
    stageKey: 'test-case-fix',
  });
});

test.each([{ id: 99 }, { pipelineId: 0 }, { iterationNumber: 0 }, { rerunOf: { id: -1 } }])(
  'rejects an unproven result identity %p',
  async (invalid) => {
    fetchMock.mockResolvedValue({ ...response([{ stageKey: 'fix' }]), ...invalid });
    await expect(getLiveFixTraceTarget('demo', 72, signal)).resolves.toBeUndefined();
  },
);

test.each([
  ['', 72],
  ['demo', 0],
  ['demo', -1],
] as const)('does not request invalid target %p/%p', async (project, id) => {
  await expect(getLiveFixTraceTarget(project, id, signal)).resolves.toBeUndefined();
  expect(fetch).not.toHaveBeenCalled();
});

test('propagates cancellation so caller can discard an aborted lookup', async () => {
  const canceled = Object.assign(new Error('Canceled'), { code: 'REQUEST_CANCELED' });
  fetchMock.mockRejectedValue(canceled);
  await expect(getLiveFixTraceTarget('demo', 72, signal)).rejects.toBe(canceled);
});

test.each([undefined, null, 7, 'prefix-fix', 'fix-suffix', 'review'])(
  'does not classify arbitrary key %p as fix',
  (key) => {
    expect(isFixStageKey(key)).toBe(false);
  },
);

describe('Library fix round trace provenance', () => {
  const source = { id: 31, pipelineId: 8, iterationNumber: 1 };
  const result = {
    ...response([{ stageKey: 'test-case-fix' }]),
    rerunOf: { id: 31, iterationNumber: 1 },
  };
  test('resolves a failed round reported result only when source and result identities are coherent', async () => {
    fetchMock.mockImplementation((url) => Promise.resolve(url.endsWith('/31') ? source : result));
    await expect(getLiveFixRoundTraceTarget('demo', 31, 72, signal)).resolves.toMatchObject({
      id: 72,
      pipelineId: 8,
      stageKey: 'test-case-fix',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(URLS.pipelineIterationById('demo', 31), { signal });
    expect(fetchMock).toHaveBeenCalledWith(URLS.pipelineIterationById('demo', 72), { signal });
  });
  test.each([
    { ...result, pipelineId: 99 },
    { ...result, rerunOf: { id: 99 } },
    { ...result, rerunOf: { id: 31, iterationNumber: 99 } },
    { ...result, stages: [{ stageKey: 'review' }] },
  ])('refuses mismatched pipeline, lineage or stage %#', async (invalidResult) => {
    fetchMock.mockImplementation((url) =>
      Promise.resolve(url.endsWith('/31') ? source : invalidResult),
    );
    await expect(getLiveFixRoundTraceTarget('demo', 31, 72, signal)).resolves.toBeUndefined();
  });
  test.each([undefined, 0, -1, 72])(
    'does not guess a missing or self-referencing source %p',
    async (previousIterationId) => {
      await expect(
        getLiveFixRoundTraceTarget('demo', previousIterationId, 72, signal),
      ).resolves.toBeUndefined();
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
});
