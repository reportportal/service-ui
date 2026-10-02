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

import { useEffect } from 'react';
import { mount } from 'enzyme';
import { useDispatch, useSelector } from 'react-redux';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { locationQuerySelector, urlFolderIdSelector } from 'controllers/pages';
import { testCasesPageSelector } from 'controllers/testCase';

import { useLastItemOnThePage } from './useLastItemOnThePage';
import { useRefetchCurrentTestCases } from './useRefetchCurrentTestCases';

jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('controllers/pages', () => ({
  locationQuerySelector: jest.fn(),
  urlFolderIdSelector: jest.fn(),
}));
jest.mock('controllers/testCase', () => ({
  getAllTestCasesAction: (payload: unknown) => ({ type: 'getAllTestCases', payload }),
  getTestCaseByFolderIdAction: (payload: unknown) => ({
    type: 'getTestCasesByFolderId',
    payload,
  }),
  testCasesPageSelector: jest.fn(),
}));
jest.mock('./useLastItemOnThePage', () => ({ useLastItemOnThePage: jest.fn() }));

interface HarnessProps {
  onResult: (refetch: () => void) => void;
}

const Harness = ({ onResult }: HarnessProps) => {
  const refetch = useRefetchCurrentTestCases();

  useEffect(() => onResult(refetch), [onResult, refetch]);

  return null;
};

const dispatch = jest.fn();
const updateUrl = jest.fn();
let folderId = '';
let query: Record<string, string> = {};
let refetch: () => void;

const renderHook = (isAiFactoryEnabled: boolean, isSingleItemOnTheLastPage = false) => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(isAiFactoryEnabled);
  jest.mocked(useDispatch).mockReturnValue(dispatch);
  jest.mocked(useLastItemOnThePage).mockReturnValue({
    updateUrl,
    isSingleItemOnTheLastPage,
  });
  jest.mocked(useSelector).mockImplementation((selector) => {
    if (selector === urlFolderIdSelector) return folderId;
    if (selector === locationQuerySelector) return query;
    if (selector === testCasesPageSelector) {
      return { number: 3, size: 25, totalElements: 100, totalPages: 4 };
    }
    return undefined;
  });

  mount(
    <Harness
      onResult={(value) => {
        refetch = value;
      }}
    />,
  );
};

describe('useRefetchCurrentTestCases filter preservation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    folderId = '';
    query = {
      testCasesSearchParams: 'login',
      filterPriorities: 'HIGH',
      filterTags: 'smoke',
      lifecycle: 'DRAFT',
      ai: 'NO_AI',
      iteration: '103',
    };
  });

  test.each([
    ['', 'getAllTestCases', {}],
    ['7', 'getTestCasesByFolderId', { folderId: 7 }],
  ])('preserves non-AI and AI filters for folder %p', (currentFolderId, type, extraPayload) => {
    folderId = currentFolderId;
    renderHook(true);

    refetch();

    expect(dispatch).toHaveBeenCalledWith({
      type,
      payload: {
        ...extraPayload,
        offset: 50,
        limit: 25,
        testCasesSearchParams: 'login',
        filterPriorities: 'HIGH',
        filterTags: 'smoke',
        lifecycle: 'DRAFT',
        hasAi: false,
        iterationId: 103,
      },
    });
  });

  test.each([
    ['', 'getAllTestCases'],
    ['7', 'getTestCasesByFolderId'],
  ])('omits AI filters while feature OFF for folder %p', (currentFolderId, type) => {
    folderId = currentFolderId;
    renderHook(false);

    refetch();

    expect(dispatch).toHaveBeenCalledWith({
      type,
      payload: {
        ...(currentFolderId ? { folderId: 7 } : {}),
        offset: 50,
        limit: 25,
        testCasesSearchParams: 'login',
        filterPriorities: 'HIGH',
        filterTags: 'smoke',
      },
    });
  });

  test('updates the URL instead of dispatching when deleting the last item on a page', () => {
    renderHook(true, true);

    refetch();

    expect(updateUrl).toHaveBeenCalledTimes(1);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
