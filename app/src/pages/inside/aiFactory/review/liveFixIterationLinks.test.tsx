/*
 * Copyright 2026 EPAM Systems
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import { act } from 'react';
import { mount, type ReactWrapper } from 'enzyme';
import { useSelector } from 'react-redux';

import { IterationReferenceLinks } from '../common/iterationReferences/iterationReferenceLinks';
import { LiveFixIterationLinks } from './liveFixIterationLinks';
import type { LiveReviewCommentsLoadState } from './useLiveReviewComments';

jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('../common/iterationReferences/iterationReferenceLinks', () => ({
  IterationReferenceLinks: () => null,
}));

const reviewState = (
  overrides: Partial<LiveReviewCommentsLoadState> = {},
): LiveReviewCommentsLoadState => ({
  resourceKey: {},
  comments: [],
  unsentCount: 0,
  fixInProgress: false,
  isLoaded: true,
  isLoading: false,
  isError: false,
  isMutating: false,
  isMutationError: false,
  reload: jest.fn(),
  addComment: jest.fn(() => Promise.resolve(true)),
  deleteComment: jest.fn(() => Promise.resolve(true)),
  discardPending: jest.fn(() => Promise.resolve(true)),
  ...overrides,
});
const round = {
  id: 5,
  testCaseId: 42,
  roundNumber: 9,
  status: 'FIXED' as const,
  previousIterationId: 31,
  resultIterationId: 72,
};
interface MountedWrapper extends ReactWrapper {
  update: () => MountedWrapper;
}

describe('native Review fix iteration references', () => {
  let wrapper: MountedWrapper | undefined;
  beforeEach(() => {
    jest.mocked(useSelector).mockReturnValue('project');
  });
  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  test('uses native linked iteration IDs and scopes lookups to the current case and round', async () => {
    const state = reviewState({ fixRoundState: round });
    await act(async () => {
      wrapper = mount(
        <LiveFixIterationLinks reviewState={state} isReadOnly={false} />,
      ) as MountedWrapper;
      await Promise.resolve();
    });
    wrapper?.update();
    const links = () => wrapper?.find(IterationReferenceLinks);
    expect(links()?.props()).toMatchObject({
      projectKey: 'project',
      previousIterationId: 31,
      resultIterationId: 72,
    });
    expect(links()?.props()).not.toHaveProperty('pipelineId');
    expect(links()?.props()).not.toHaveProperty('roundNumber');
    const originalScope = links()?.prop('resourceKey');
    act(() => {
      wrapper?.setProps({ reviewState: { ...state, unsentCount: 1 } });
    });
    wrapper?.update();
    expect(links()?.prop('resourceKey')).toBe(originalScope);
    act(() => {
      wrapper?.setProps({ reviewState: { ...state, resourceKey: {} } });
    });
    wrapper?.update();
    expect(links()?.prop('resourceKey')).not.toBe(originalScope);
    const caseScope = links()?.prop('resourceKey');
    act(() => {
      wrapper?.setProps({ reviewState: { ...state, fixRoundState: { ...round, id: 6 } } });
    });
    wrapper?.update();
    expect(links()?.prop('resourceKey')).not.toBe(caseScope);
  });

  test('offers no fabricated lookup when a round or its iteration IDs are absent', async () => {
    await act(async () => {
      wrapper = mount(
        <LiveFixIterationLinks reviewState={reviewState()} isReadOnly />,
      ) as MountedWrapper;
      await Promise.resolve();
    });
    wrapper?.update();
    expect(wrapper?.find(IterationReferenceLinks)).toHaveLength(0);
    act(() => {
      wrapper?.setProps({
        reviewState: reviewState({
          fixRoundState: { id: 5, testCaseId: 42, roundNumber: 9, status: 'PENDING' },
        }),
      });
    });
    wrapper?.update();
    expect(wrapper?.find(IterationReferenceLinks).props()).toMatchObject({
      previousIterationId: undefined,
      resultIterationId: undefined,
    });
  });
});
