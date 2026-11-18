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

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';

import {
  loadStageTrace,
  loadStageTraceAttempts,
  loadTraceIteration,
  normalizeStageTrace,
  normalizeStageTraceAttempts,
  normalizeStageTraceEvent,
  StageTraceError,
} from './stageTrace';

jest.mock('common/utils', () => ({ fetch: jest.fn() }));
const fetchMock = fetch as unknown as jest.MockedFunction<
  (
    url: string,
    params?: Record<string, unknown>,
    raw?: boolean,
  ) => Promise<{ status: number; data: unknown }>
>;
const resource = { projectKey: 'my.project', iterationId: 31, stageKey: 'fix' };
const response = {
  iterationId: 31,
  stageKey: 'fix',
  attempt: 2,
  status: 'REPORTED',
  events: [],
};
const attempt = { attempt: 2, traceStatus: 'REPORTED', eventCount: 0, current: true };

describe('stage trace read contract', () => {
  beforeEach(() => jest.resetAllMocks());

  test('keeps full text and contract field limits without trimming or truncating', () => {
    const text = `  ${'x'.repeat(9_999_995)}\n  `;
    const event = {
      seq: 0,
      type: 'PROMPT',
      title: 't'.repeat(512),
      target: 'p'.repeat(1024),
      text,
      offsetMs: 0,
      durationMs: 0,
      data: { nested: { value: 0 } },
    };
    const result = normalizeStageTrace(
      { ...response, reason: 'r'.repeat(4000), events: [event] },
      resource,
    );
    expect(result.events[0]).toEqual(event);
    expect(result.events[0].text).toHaveLength(10_000_000);
    expect(() => normalizeStageTraceEvent({ ...event, text: `${text}x` })).toThrow(StageTraceError);
  });

  test.each(['', '   ', '\n\t'])('preserves empty or whitespace-only event text %p', (text) => {
    expect(normalizeStageTraceEvent({ seq: 0, type: 'FINAL', text }).text).toBe(text);
  });

  test('accepts more than one write batch and sorts sparse event positions, including seq zero', () => {
    const events = Array.from({ length: 2001 }, (_, index) => ({
      seq: index * 3,
      type: 'STEP',
    })).reverse();
    const result = normalizeStageTrace({ ...response, events }, resource);
    expect(result.events).toHaveLength(2001);
    expect(result.events[0].seq).toBe(0);
    expect(result.events[2000].seq).toBe(6000);
    expect(events[0].seq).toBe(6000);
  });

  test.each([{ iterationId: 32 }, { stageKey: 'review' }, { attempt: 1 }])(
    'rejects a trace for a different resource or selected attempt %p',
    (patch) => {
      expect(() =>
        normalizeStageTrace({ ...response, ...patch }, { ...resource, attempt: 2 }),
      ).toThrow(StageTraceError);
    },
  );

  test.each([
    { title: 'x'.repeat(513) },
    { target: 'x'.repeat(1025) },
    { seq: -1 },
    { seq: 0.5 },
    { offsetMs: -1 },
    { durationMs: -1 },
    { type: '  ' },
    { data: [] },
  ])('rejects an invalid event %p', (patch) => {
    expect(() => normalizeStageTraceEvent({ seq: 0, type: 'STEP', ...patch })).toThrow(
      StageTraceError,
    );
  });

  test('rejects duplicate positions and an oversized reason', () => {
    expect(() =>
      normalizeStageTrace(
        {
          ...response,
          events: [
            { seq: 0, type: 'STEP' },
            { seq: 0, type: 'END' },
          ],
        },
        resource,
      ),
    ).toThrow(StageTraceError);
    expect(() => normalizeStageTrace({ ...response, reason: 'x'.repeat(4001) }, resource)).toThrow(
      StageTraceError,
    );
  });

  test('keeps NOT_REPORTED with a reason distinct from a reported empty trace', () => {
    expect(
      normalizeStageTrace({ ...response, status: 'NOT_REPORTED', reason: 'No output' }, resource),
    ).toMatchObject({ status: 'NOT_REPORTED', reason: 'No output', events: [] });
    expect(normalizeStageTrace(response, resource)).toMatchObject({
      status: 'REPORTED',
      events: [],
    });
  });

  test('sorts attempts oldest first and requires unique identities and exactly one current attempt', () => {
    const earlier = {
      ...attempt,
      attempt: 1,
      current: false,
      stageStatus: 'Failed',
      stageStatusCategory: 'FAILED',
    };
    expect(normalizeStageTraceAttempts([attempt, earlier])).toEqual([earlier, attempt]);
    for (const invalid of [
      [],
      [earlier],
      [attempt, attempt],
      [attempt, { ...attempt, attempt: 3 }],
    ]) {
      expect(() => normalizeStageTraceAttempts(invalid)).toThrow(StageTraceError);
    }
  });

  test('requests the selected attempt with an abort signal and identity-checks the result', async () => {
    const controller = new AbortController();
    fetchMock.mockResolvedValue({ status: 200, data: response });
    await expect(
      loadStageTrace({ ...resource, attempt: 2 }, controller.signal),
    ).resolves.toMatchObject(response);
    expect(fetchMock).toHaveBeenCalledWith(
      URLS.pipelineStageTrace('my.project', 31, 'fix', 2),
      expect.objectContaining({ signal: controller.signal }),
      true,
    );
    fetchMock.mockResolvedValue({ status: 200, data: { ...response, stageKey: 'create' } });
    await expect(loadStageTrace(resource)).rejects.toMatchObject({ reason: 'INVALID_RESPONSE' });
  });

  test('loads cheap attempt metadata independently of full event text', async () => {
    fetchMock.mockResolvedValue({ status: 200, data: [attempt] });
    await expect(loadStageTraceAttempts(resource)).resolves.toEqual([attempt]);
    expect(fetchMock).toHaveBeenCalledWith(
      URLS.pipelineStageTraceAttempts('my.project', 31, 'fix'),
      expect.any(Object),
      true,
    );
  });

  test.each([
    [403, 'FORBIDDEN'],
    [404, 'NOT_FOUND'],
  ] as const)('distinguishes HTTP %s from an empty trace', async (status, reason) => {
    fetchMock.mockResolvedValue({ status, data: {} });
    await expect(loadStageTrace(resource)).rejects.toMatchObject({ reason });
  });

  test('preserves cancellation and authentication errors, and classifies transport failures', async () => {
    const canceled = new Error('REQUEST_CANCELED');
    fetchMock.mockRejectedValueOnce(canceled);
    await expect(loadStageTrace(resource)).rejects.toBe(canceled);
    const unauthorized = new Error('UNAUTHORIZED');
    fetchMock.mockRejectedValueOnce(unauthorized);
    await expect(loadStageTrace(resource)).rejects.toBe(unauthorized);
    fetchMock.mockRejectedValueOnce(new Error('Network Error'));
    await expect(loadStageTrace(resource)).rejects.toMatchObject({ reason: 'REQUEST_FAILED' });
  });

  test('validates iteration ownership before returning snapshot metadata', async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      data: { id: 31, pipelineId: 8, iterationNumber: 1 },
    });
    await expect(loadTraceIteration('my.project', 7, 31)).rejects.toMatchObject({
      reason: 'INVALID_RESPONSE',
    });
  });
});

describe('stage trace event unit identity', () => {
  test.each(['', ' \n\t ', '  opaque / unit:stage  ', '__proto__', 'x'.repeat(5000)])(
    'preserves the exact opaque unit key %# without an undocumented length cap',
    (unitKey) => {
      const result = normalizeStageTrace(
        { ...response, events: [{ seq: 0, type: 'STEP', unitKey }] },
        resource,
      );
      expect(result.events[0].unitKey).toBe(unitKey);
    },
  );

  test.each([undefined, null])('accepts an omitted or null optional key %p', (unitKey) => {
    const result = normalizeStageTraceEvent({ seq: 0, type: 'STEP', unitKey });
    expect(result).not.toHaveProperty('unitKey');
    expect(result).toMatchObject({ seq: 0, type: 'STEP' });
  });

  test.each([0, false, [], {}])(
    'rejects a non-string unit key %p instead of misgrouping it',
    (unitKey) => {
      expect(() => normalizeStageTraceEvent({ seq: 0, type: 'STEP', unitKey })).toThrow(
        StageTraceError,
      );
    },
  );
});
