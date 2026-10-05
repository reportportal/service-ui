/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import type { ReactNode } from 'react';
import { shallow } from 'enzyme';
import { useSelector } from 'react-redux';
import Link from 'redux-first-router-link';

import { PROJECT_PIPELINE_ITERATION_PAGE } from 'controllers/pages';
import { AiDetailsSectionState } from 'pages/inside/aiFactory/common/aiDetailsSectionState';
import { StageKey } from 'types/aiFactory';
import type { TestCaseAiLoadState } from 'pages/inside/aiFactory/lifecycle';

import { PipelineLinks } from './pipelineLinks';

jest.mock('@reportportal/ui-kit', () => ({ BubblesLoader: 'BubblesLoader', Button: 'Button' }));
jest.mock('react-intl', () =>
  jest.requireActual<typeof import('../aiFactoryTestUtils')>(
    'pages/inside/aiFactory/aiFactoryTestUtils',
  ).reactIntlTestMock,
);
jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('redux-first-router-link', () => 'Link');
jest.mock('controllers/pages', () => ({
  PROJECT_PIPELINE_ITERATION_PAGE: 'PROJECT_PIPELINE_ITERATION_PAGE',
  urlOrganizationAndProjectSelector: jest.fn(),
}));
jest.mock('components/collapsibleSection', () => ({ CollapsibleSection: 'CollapsibleSection' }));

const state: TestCaseAiLoadState = {
  data: {
    lifecycleHistory: [],
    pipelineLinks: [
      {
        pipelineId: 1,
        pipelineName: 'Test case generation',
        iterationId: 101,
        iterationNumber: 1,
        requirementId: 'US-TMS-MIG-001',
        stage: StageKey.GRADE,
      },
      {
        pipelineId: 1,
        iterationId: 101,
        iterationNumber: 1,
        stage: StageKey.REVIEW,
        fixRound: 1,
      },
      { pipelineId: 1, iterationId: 101, iterationNumber: 1, stage: StageKey.CREATE },
    ],
  },
  isLoading: false,
  isError: false,
  reload: jest.fn(),
};

describe('PipelineLinks', () => {
  beforeEach(() => {
    jest.mocked(useSelector).mockReturnValue({
      organizationSlug: 'org',
      projectSlug: 'project',
    });
  });

  test('links the source to Grade and each fix round to Review', () => {
    const wrapper = shallow(<PipelineLinks aiDetailsState={state} />);
    const content = shallow(
      <div>{wrapper.find(AiDetailsSectionState).prop('children') as ReactNode}</div>,
    );
    const links = wrapper.find(Link);
    const sourceLink = wrapper.find('[data-automation-id="pipeline-link-GRADE-source"]');
    const fixRoundLink = wrapper.find('[data-automation-id="pipeline-link-REVIEW-1"]');

    expect(links).toHaveLength(2);
    expect(sourceLink.text()).toBe('Test case generation · Iteration #1 ↗');
    expect(sourceLink.prop('to')).toEqual({
      type: PROJECT_PIPELINE_ITERATION_PAGE,
      payload: {
        organizationSlug: 'org',
        projectSlug: 'project',
        pipelineId: 1,
        iterationId: 101,
      },
      query: { stage: StageKey.GRADE },
    });
    expect(fixRoundLink.text()).toBe('Iteration #1 · Fix round 1 ↗');
    expect(fixRoundLink.prop('to')).toMatchObject({ query: { stage: StageKey.REVIEW } });
    expect(content.text()).toContain('Fix round 1');
    expect(content.text()).toContain('created · US-TMS-MIG-001');
    expect(content.text()).toContain('Review');
  });

  test('passes no content to the collapsible section when links are unavailable', () => {
    const wrapper = shallow(
      <PipelineLinks
        aiDetailsState={{ ...state, data: { pipelineLinks: [], lifecycleHistory: [] } }}
      />,
    );

    expect(wrapper.prop('children')).toBeNull();
  });
});
