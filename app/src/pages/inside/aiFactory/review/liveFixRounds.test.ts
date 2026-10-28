/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { AxiosHeaders, type AxiosResponse } from 'axios';

import { fetch } from 'common/utils';

import { loadLiveFixRound, normalizeLiveFixRound, startLiveFixRound } from './liveFixRounds';

jest.mock('common/utils', () => ({ fetch: jest.fn() }));
const fetchMock = jest.mocked(fetch);
const rawResponse = (data: unknown, status = 200): AxiosResponse<unknown> => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: {},
  config: { headers: new AxiosHeaders() },
});
const pending = { id: 5, testCaseId: 42, roundNumber: 1, status: 'PENDING' };

describe('native fix round transport and validation', () => {
  beforeEach(() => fetchMock.mockReset());

  test.each(['PENDING', 'FIXED', 'FIXED_GRADE_FAILED', 'FAILED'])(
    'preserves the native %s outcome and keeps round ID separate from its number',
    (status) => {
      expect(normalizeLiveFixRound({ ...pending, status }, 42, 5)).toMatchObject({
        id: 5,
        testCaseId: 42,
        roundNumber: 1,
        status,
      });
    },
  );

  test.each([
    null,
    [],
    {},
    { ...pending, id: '5' },
    { ...pending, id: 0 },
    { ...pending, id: 1.5 },
    { ...pending, testCaseId: 43 },
    { ...pending, testCaseId: '42' },
    { ...pending, roundNumber: 0 },
    { ...pending, roundNumber: '1' },
    { ...pending, status: 'PASSED' },
    { ...pending, status: 'RUNNING' },
  ])('rejects malformed or unrelated native rounds: %j', (response) => {
    expect(() => normalizeLiveFixRound(response, 42, 5)).toThrow();
  });

  test('preserves optional backend metadata without inventing grades or version identity', () => {
    const metadata = {
      previousIterationId: 101,
      resultIterationId: 102,
      requestedAt: '2026-10-24T12:00:00Z',
      workflowUrl: 'https://github.com/reportportal/service-ui/actions/runs/123',
      failureReason: 'Grading service unavailable',
    };
    expect(normalizeLiveFixRound({ ...pending, ...metadata }, 42, 5)).toMatchObject(metadata);
    expect(normalizeLiveFixRound(pending, 42, 5)).not.toHaveProperty('scoreAfter');
  });

  test.each([
    { previousIterationId: 0 },
    { resultIterationId: '102' },
    { requestedAt: '2026-02-30T12:00:00Z' },
    { requestedAt: '2026-10-24T12:00:00' },
    { requestedAt: 100 },
    { workflowUrl: 'javascript:alert(1)' },
    { workflowUrl: 'not a URL' },
    { failureReason: 100 },
  ])('validates optional native metadata when present: %j', (metadata) => {
    expect(() => normalizeLiveFixRound({ ...pending, ...metadata }, 42, 5)).toThrow();
  });

  test('rejects the wrong round ID even when its test case and number match', () => {
    expect(() => normalizeLiveFixRound({ ...pending, id: 6 }, 42, 5)).toThrow();
  });

  test('starts through the native endpoint without a legacy request body', async () => {
    const signal = new AbortController().signal;
    fetchMock.mockResolvedValueOnce(rawResponse(pending));

    await expect(startLiveFixRound('demo', 42, signal)).resolves.toMatchObject(pending);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/project\/demo\/tms\/test-case\/42\/review\/fix-round$/),
      expect.objectContaining({ method: 'POST', signal }),
      true,
    );
    expect(fetchMock.mock.calls[0][1]).not.toHaveProperty('data');
  });

  test('loads round ID 5 rather than round number 1 through the native endpoint', async () => {
    const signal = new AbortController().signal;
    fetchMock.mockResolvedValueOnce(rawResponse(pending));

    await expect(loadLiveFixRound('demo', 42, 5, signal)).resolves.toMatchObject(pending);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/test-case\/42\/review\/fix-round\/5$/),
      expect.objectContaining({ signal }),
      true,
    );
  });

  test.each([
    [rawResponse({ message: 'conflict' }, 409), 'CONFLICT'],
    [rawResponse({ message: 'forbidden' }, 403), 'FAILED'],
    [rawResponse({ message: 'missing integration' }, 404), 'FAILED'],
  ])('classifies a definite HTTP start rejection: %j', async (response, reason) => {
    fetchMock.mockResolvedValueOnce(response);
    await expect(startLiveFixRound('demo', 42, new AbortController().signal)).rejects.toMatchObject(
      {
        reason,
      },
    );
  });

  test('recognizes the shared fetch error-body fallback for review conflict 40915', async () => {
    fetchMock.mockRejectedValueOnce({ errorCode: 40915, message: 'Review is busy' });
    await expect(startLiveFixRound('demo', 42, new AbortController().signal)).rejects.toMatchObject(
      {
        reason: 'CONFLICT',
      },
    );
  });

  test.each([rawResponse({}), rawResponse(null)])(
    'does not claim that a malformed accepted response proves the start failed: %j',
    async (response) => {
      fetchMock.mockResolvedValueOnce(response);
      await expect(
        startLiveFixRound('demo', 42, new AbortController().signal),
      ).rejects.toMatchObject({
        reason: 'UNCONFIRMED',
      });
    },
  );

  test('keeps a network-lost start outcome distinct from a server FAILED round', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network request failed'));
    await expect(startLiveFixRound('demo', 42, new AbortController().signal)).rejects.toMatchObject(
      {
        reason: 'UNCONFIRMED',
      },
    );
  });

  test('reports raw HTTP 404 as a missing round rather than a failed fix', async () => {
    fetchMock.mockResolvedValueOnce(rawResponse({ message: 'Round not found' }, 404));
    await expect(
      loadLiveFixRound('demo', 42, 5, new AbortController().signal),
    ).rejects.toMatchObject({
      reason: 'MISSING',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('propagates a failed round read so the monitor can stop and offer a read-only retry', async () => {
    const error = { errorCode: 40401, message: 'Round not found' };
    fetchMock.mockRejectedValueOnce(error);
    await expect(loadLiveFixRound('demo', 42, 5, new AbortController().signal)).rejects.toBe(error);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
