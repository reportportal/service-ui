/*
 * Copyright 2026 EPAM Systems
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import { shallow } from 'enzyme';

import type { ReducedPipelineIterationDetail } from 'controllers/aiFactory/pipelines';
import { IterationReferenceLinks } from '../common/iterationReferences/iterationReferenceLinks';
import { IterationProvenance } from './iterationProvenance';

jest.mock(
  'react-intl',
  () =>
    jest.requireActual<typeof import('../aiFactoryTestUtils')>(
      'pages/inside/aiFactory/aiFactoryTestUtils',
    ).reactIntlTestMock,
);
jest.mock('../common/iterationReferences/iterationReferenceLinks', () => ({
  IterationReferenceLinks: 'IterationReferenceLinks',
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...names: string[]) =>
      names.join(' '),
}));
const detail = (
  overrides: Partial<ReducedPipelineIterationDetail> = {},
): ReducedPipelineIterationDetail => ({
  kind: 'reduced',
  id: 72,
  pipelineId: 7,
  number: 3,
  status: 'WAITING',
  attributes: [],
  stages: [],
  ...overrides,
});

describe('iteration provenance details', () => {
  test('shows a fix label, source number and resolves the actual source ID on demand', () => {
    const iteration = detail({
      rerunOf: { id: 31, iterationNumber: 1 },
      attributes: [{ key: 'fixRound', type: 'META', value: 'Fix TC101' }],
    });
    const wrapper = shallow(<IterationProvenance iteration={iteration} projectKey="project" />);
    expect(wrapper.text()).toContain('Fix iteration');
    expect(wrapper.text()).toContain('Fix TC101');
    expect(wrapper.text()).toContain('#1');
    expect(wrapper.find(IterationReferenceLinks).props()).toEqual({
      projectKey: 'project',
      resourceKey: iteration,
      previousIterationId: 31,
      resultIterationId: 72,
    });
  });
  test('retains ordinary rerun provenance without claiming it is a fix', () => {
    const wrapper = shallow(
      <IterationProvenance iteration={detail({ rerunOf: { id: 31 } })} projectKey="project" />,
    );
    expect(wrapper.text()).not.toContain('Fix iteration');
    expect(wrapper.text()).not.toContain('#31');
    expect(wrapper.find(IterationReferenceLinks).prop('previousIterationId')).toBe(31);
  });
  test('renders no provenance or lookup for an ordinary initial iteration', () => {
    const wrapper = shallow(<IterationProvenance iteration={detail()} projectKey="project" />);
    expect(wrapper.html()).toBeNull();
    expect(wrapper.find(IterationReferenceLinks)).toHaveLength(0);
  });
  test('shows known provenance without lookup when the project is unavailable', () => {
    const wrapper = shallow(
      <IterationProvenance iteration={detail({ rerunOf: { id: 31, iterationNumber: 1 } })} />,
    );
    expect(wrapper.text()).toContain('#1');
    expect(wrapper.find(IterationReferenceLinks)).toHaveLength(0);
  });
});
