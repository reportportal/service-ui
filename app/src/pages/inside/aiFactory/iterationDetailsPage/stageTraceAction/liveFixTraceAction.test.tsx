/* Copyright 2026 EPAM Systems
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */
// Register shared module mocks before importing the components under test.
import {
  resetStageTraceTestContext,
  type MountedTraceWrapper,
} from 'pages/inside/aiFactory/common/stageTrace/stageTraceTestSetup';

import { act } from 'react';
import { mount } from 'enzyme';
import { useSelector } from 'react-redux';

import { useAiFactoryEnabled } from 'controllers/aiFactory';

import { getLiveFixRoundTraceTarget } from 'pages/inside/aiFactory/common/stageTrace/liveFixTraceTarget';

import { LiveFixTraceAction, type LiveFixTraceActionProps } from './liveFixTraceAction';

jest.mock('pages/inside/aiFactory/common/stageTrace/liveFixTraceTarget', () => ({
  getLiveFixRoundTraceTarget: jest.fn(),
}));

const dispatch = jest.fn();
const identity = { id: 72, pipelineId: 800, number: 5, stageKey: 'test-case-fix' };
const props = (): LiveFixTraceActionProps => ({
  projectKey: 'demo',
  resourceKey: {},
  previousIterationId: 31,
  resultIterationId: 72,
  roundNumber: 9,
});
let wrapper: MountedTraceWrapper | undefined;

const mountAction = async (overrides: Partial<LiveFixTraceActionProps> = {}) => {
  await act(async () => {
    wrapper = mount(<LiveFixTraceAction {...props()} {...overrides} />) as MountedTraceWrapper;
    await Promise.resolve();
  });
  wrapper?.update();
};
const click = async () => {
  await act(async () => {
    (wrapper?.find('button').prop('onClick') as () => void)();
    await Promise.resolve();
  });
  wrapper?.update();
};

beforeEach(() => {
  resetStageTraceTestContext(dispatch);
  jest.mocked(getLiveFixRoundTraceTarget).mockResolvedValue(identity);
});
afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

test('resolves only on click and routes to the actual result pipeline and fix stage', async () => {
  await mountAction();
  expect(getLiveFixRoundTraceTarget).not.toHaveBeenCalled();
  await click();
  expect(getLiveFixRoundTraceTarget).toHaveBeenCalledWith('demo', 31, 72, expect.any(AbortSignal));
  expect(dispatch).toHaveBeenCalledWith({
    type: 'PROJECT_PIPELINE_STAGE_TRACE_PAGE',
    payload: {
      organizationSlug: 'org',
      projectSlug: 'demo',
      pipelineId: 800,
      iterationId: 72,
      stageKey: 'test-case-fix',
    },
    query: { fixRoundNumber: '9' },
  });
});

test('locks duplicate clicks until the lookup completes', async () => {
  jest.mocked(getLiveFixRoundTraceTarget).mockImplementation(() => new Promise(() => {}));
  await mountAction();
  const open = wrapper?.find('button').prop('onClick') as () => void;
  act(() => {
    open();
    open();
  });
  expect(getLiveFixRoundTraceTarget).toHaveBeenCalledTimes(1);
  wrapper?.update();
  expect(wrapper?.find('button').prop('disabled')).toBe(true);
});

test.each(['missing', 'failed'])('shows a retryable error for a %s lookup', async (failure) => {
  if (failure === 'missing') jest.mocked(getLiveFixRoundTraceTarget).mockResolvedValue(undefined);
  else jest.mocked(getLiveFixRoundTraceTarget).mockRejectedValue(new Error('Unavailable'));
  await mountAction();
  await click();
  expect(dispatch).not.toHaveBeenCalled();
  expect(wrapper?.find('[role="alert"]')).toHaveLength(1);
  jest.mocked(getLiveFixRoundTraceTarget).mockResolvedValue(identity);
  await click();
  expect(dispatch).toHaveBeenCalledTimes(1);
  expect(wrapper?.find('[role="alert"]')).toHaveLength(0);
});

test.each(['project', 'resource', 'round', 'source', 'route', 'disabled', 'unmount'])(
  'aborts and ignores a late lookup after %s changes',
  async (change) => {
    let resolve!: (value: typeof identity) => void;
    jest.mocked(getLiveFixRoundTraceTarget).mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    await mountAction();
    const oldClick = wrapper?.find('button').prop('onClick') as () => void;
    await click();
    const signal = jest.mocked(getLiveFixRoundTraceTarget).mock.calls[0][3];
    act(() => {
      if (change === 'project') wrapper?.setProps({ projectKey: 'another' });
      if (change === 'resource') wrapper?.setProps({ resourceKey: {} });
      if (change === 'source') wrapper?.setProps({ previousIterationId: 99 });
      if (change === 'round') wrapper?.setProps({ resultIterationId: 73, roundNumber: 10 });
      if (change === 'route') {
        jest
          .mocked(useSelector)
          .mockReturnValue({ organizationSlug: 'org', projectSlug: 'another' });
        wrapper?.setProps({});
      }
      if (change === 'disabled') {
        jest.mocked(useAiFactoryEnabled).mockReturnValue(false);
        wrapper?.setProps({});
      }
      if (change === 'unmount') {
        wrapper?.unmount();
        wrapper = undefined;
      }
    });
    expect(signal.aborted).toBe(true);
    await act(async () => {
      resolve(identity);
      await Promise.resolve();
      oldClick();
    });
    wrapper?.update();
    expect(dispatch).not.toHaveBeenCalled();
    expect(getLiveFixRoundTraceTarget).toHaveBeenCalledTimes(1);
    expect(wrapper?.find('output').length ?? 0).toBe(0);
  },
);

test('does not load when disabled or when the project is absent', async () => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(false);
  await mountAction();
  expect(wrapper?.find('button')).toHaveLength(0);
  jest.mocked(useAiFactoryEnabled).mockReturnValue(true);
  act(() => {
    wrapper?.setProps({ projectKey: '' });
  });
  await click();
  expect(getLiveFixRoundTraceTarget).not.toHaveBeenCalled();
});
