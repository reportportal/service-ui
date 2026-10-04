/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { shallow } from 'enzyme';
import { useSelector } from 'react-redux';
import Link from 'redux-first-router-link';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { PROJECT_PIPELINE_ITERATION_PAGE, TEST_CASE_LIBRARY_PAGE } from 'controllers/pages';

import { AiFactoryBacklink } from './aiFactoryBacklink';

jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage?: string; id?: string }) =>
      message.defaultMessage ?? message.id ?? '',
  }),
}));
jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('redux-first-router-link', () => 'Link');
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: Array<string | Record<string, boolean>>) =>
      classNames
        .flatMap((className) =>
          typeof className === 'string'
            ? [className]
            : Object.entries(className)
                .filter(([, isApplied]) => isApplied)
                .map(([name]) => name),
        )
        .join(' '),
}));
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('controllers/pages', () => ({
  PROJECT_PIPELINE_ITERATION_PAGE: 'PROJECT_PIPELINE_ITERATION_PAGE',
  TEST_CASE_LIBRARY_PAGE: 'TEST_CASE_LIBRARY_PAGE',
  urlOrganizationAndProjectSelector: jest.fn(),
}));

const routeContext = { organizationSlug: 'current-org', projectSlug: 'current-project' };

describe('AiFactoryBacklink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAiFactoryEnabled).mockReturnValue(true);
    jest.mocked(useSelector).mockReturnValue(routeContext);
  });

  test('renders the Library backlink with the exact current route context', () => {
    const wrapper = shallow(
      <AiFactoryBacklink
        host="testItem"
        testCase={{ id: 42, displayId: '<img src=x onerror=alert(1)>' }}
      />,
    );
    const link = wrapper.find(Link);

    expect(link.text()).toBe('Library Test Case ↗');
    expect(link.text()).not.toContain('<img');
    expect(link.prop('to')).toEqual({
      type: TEST_CASE_LIBRARY_PAGE,
      payload: {
        organizationSlug: 'current-org',
        projectSlug: 'current-project',
        testCasePageRoute: 'test-cases/42',
      },
    });
  });

  test('renders the strict root Launch backlink with the exact iteration route', () => {
    const wrapper = shallow(
      <AiFactoryBacklink host="launchRoot" attributes={[{ key: 'pipeline', value: '17/103' }]} />,
    );

    expect(wrapper.find(Link).text()).toBe('Automation iteration ↗');
    expect(wrapper.find(Link).prop('to')).toEqual({
      type: PROJECT_PIPELINE_ITERATION_PAGE,
      payload: {
        organizationSlug: 'current-org',
        projectSlug: 'current-project',
        pipelineId: 17,
        iterationId: 103,
      },
    });
  });

  test.each([
    ['test item', { host: 'testItem' as const, testCase: { id: 42, displayId: 'TC42' } }],
    [
      'launch root',
      {
        host: 'launchRoot' as const,
        attributes: [{ key: 'pipeline', value: '17/103' }],
      },
    ],
  ])('renders no %s backlink when the feature flag is off', (_name, props) => {
    jest.mocked(useAiFactoryEnabled).mockReturnValue(false);

    expect(shallow(<AiFactoryBacklink {...props} />).html()).toBeNull();
  });

  test.each([
    undefined,
    {},
    { organizationSlug: '', projectSlug: 'current-project' },
    { organizationSlug: 'current-org', projectSlug: '' },
    { organizationSlug: '   ', projectSlug: 'current-project' },
    { organizationSlug: 'current-org', projectSlug: '   ' },
  ])('fails closed when route context is unavailable %#', (context) => {
    jest.mocked(useSelector).mockReturnValue(context);

    expect(
      shallow(
        <AiFactoryBacklink host="testItem" testCase={{ id: 42, displayId: 'TC42' }} />,
      ).html(),
    ).toBeNull();
  });

  test('renders for a read-only viewer without consulting permissions', () => {
    const wrapper = shallow(
      <AiFactoryBacklink host="testItem" testCase={{ id: 42, displayId: 'TC42' }} />,
    );

    expect(wrapper.find(Link)).toHaveLength(1);
    expect(useAiFactoryEnabled).toHaveBeenCalledTimes(1);
    expect(useSelector).toHaveBeenCalledTimes(1);
  });

  test.each([
    { host: 'testItem' as const },
    { host: 'testItem' as const, testCase: { id: 0, displayId: 'TC0' } },
    { host: 'launchRoot' as const },
    {
      host: 'launchRoot' as const,
      attributes: [
        { key: 'pipeline', value: '17/103' },
        { key: 'pipeline', value: '18/104' },
      ],
    },
  ])('renders no link for invalid source data %#', (props) => {
    expect(shallow(<AiFactoryBacklink {...props} />).html()).toBeNull();
  });
});
