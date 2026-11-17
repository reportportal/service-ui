/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import type { CommonWrapper, ReactWrapper } from 'enzyme';
import { useDispatch, useSelector } from 'react-redux';

import { useAiFactoryEnabled } from 'controllers/aiFactory';

jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('@reportportal/ui-kit', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    Button: ({
      children,
      onClick,
      disabled,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
    }) => React.createElement('button', { onClick, disabled }, children),
  };
});
jest.mock(
  'react-intl',
  () =>
    jest.requireActual<typeof import('../../aiFactoryTestUtils')>(
      'pages/inside/aiFactory/aiFactoryTestUtils',
    ).reactIntlTestMock,
);
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('controllers/pages', () => ({
  PROJECT_PIPELINE_STAGE_TRACE_PAGE: 'PROJECT_PIPELINE_STAGE_TRACE_PAGE',
  urlOrganizationAndProjectSelector: jest.fn(),
}));

export interface MountedTraceWrapper extends ReactWrapper {
  update: () => MountedTraceWrapper;
}

export interface TraceNodes extends CommonWrapper {
  at: (index: number) => CommonWrapper;
}

export const resetStageTraceTestContext = (dispatch: jest.Mock) => {
  jest.clearAllMocks();
  jest.mocked(useDispatch).mockReturnValue(dispatch);
  jest.mocked(useSelector).mockReturnValue({ organizationSlug: 'org', projectSlug: 'demo' });
  jest.mocked(useAiFactoryEnabled).mockReturnValue(true);
};
