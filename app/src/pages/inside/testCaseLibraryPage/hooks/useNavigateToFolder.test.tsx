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
import {
  TEST_CASE_LIBRARY_PAGE,
  locationSelector,
  urlFolderIdSelector,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import {
  foldersSelector,
  testCasesPageSelector,
} from 'controllers/testCase';
import { GET_TEST_CASES_BY_FOLDER_ID } from 'controllers/testCase/constants';

import { useNavigateToFolder } from './useNavigateToFolder';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('controllers/pages', () => ({
  TEST_CASE_LIBRARY_PAGE: 'TEST_CASE_LIBRARY_PAGE',
  locationSelector: jest.fn(),
  urlFolderIdSelector: jest.fn(),
  urlOrganizationAndProjectSelector: jest.fn(),
}));
jest.mock('controllers/testCase', () => ({
  foldersSelector: jest.fn(),
  testCasesPageSelector: jest.fn(),
}));

interface HookResult {
  navigateToFolder: (params: { folderId: number; parentIdToExpand?: number }) => void;
}

const dispatch = jest.fn();
let hookResult: HookResult;
let currentFolderId = '7';
let query: Record<string, string> = {};

const Harness = ({ onResult }: { onResult: (value: HookResult) => void }) => {
  const value = useNavigateToFolder();

  useEffect(() => onResult(value), [onResult, value]);

  return null;
};

const renderHook = (isAiFactoryEnabled: boolean) => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(isAiFactoryEnabled);
  jest.mocked(useDispatch).mockReturnValue(dispatch);
  jest.mocked(useSelector).mockImplementation((selector) => {
    if (selector === urlFolderIdSelector) return currentFolderId;
    if (selector === testCasesPageSelector) {
      return { number: 2, size: 25, totalElements: 75, totalPages: 3 };
    }
    if (selector === foldersSelector) return [];
    if (selector === locationSelector) return { query };
    if (selector === urlOrganizationAndProjectSelector) {
      return { organizationSlug: 'org', projectSlug: 'project' };
    }
    return undefined;
  });

  mount(
    <Harness
      onResult={(value) => {
        hookResult = value;
      }}
    />,
  );
};

describe('useNavigateToFolder AI filter preservation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentFolderId = '7';
    query = {
      testCasesSearchParams: 'login',
      filterTags: 'smoke',
      lifecycle: 'DRAFT',
      ai: 'NO_AI',
      iteration: '103',
    };
  });

  test('preserves normalized AI filters when refetching the current folder', () => {
    renderHook(true);

    hookResult.navigateToFolder({ folderId: 7 });

    expect(dispatch).toHaveBeenCalledWith({
      type: GET_TEST_CASES_BY_FOLDER_ID,
      payload: {
        folderId: 7,
        offset: 25,
        limit: 25,
        testCasesSearchParams: 'login',
        filterPriorities: undefined,
        filterTags: 'smoke',
        lifecycle: 'DRAFT',
        hasAi: false,
        iterationId: 103,
      },
    });
  });

  test('preserves normalized AI query values when navigating to another folder', () => {
    renderHook(true);

    hookResult.navigateToFolder({ folderId: 9 });

    expect(dispatch).toHaveBeenCalledWith({
      type: TEST_CASE_LIBRARY_PAGE,
      payload: {
        testCasePageRoute: 'folder/9',
        organizationSlug: 'org',
        projectSlug: 'project',
      },
      query: {
        testCasesSearchParams: 'login',
        filterTags: 'smoke',
        lifecycle: 'DRAFT',
        ai: 'NO_AI',
        iteration: '103',
      },
    });
  });

  test.each([
    ['refetching the current folder', 7, GET_TEST_CASES_BY_FOLDER_ID],
    ['navigating to another folder', 9, TEST_CASE_LIBRARY_PAGE],
  ])('drops all AI query values while the feature is disabled when %s', (_label, folderId, type) => {
    renderHook(false);

    hookResult.navigateToFolder({ folderId });

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type,
        ...(folderId === 7
          ? {
              payload: expect.not.objectContaining({
                lifecycle: expect.anything(),
                hasAi: expect.anything(),
                iterationId: expect.anything(),
              }),
            }
          : {
              query: {
                testCasesSearchParams: 'login',
                filterTags: 'smoke',
              },
            }),
      }),
    );
  });

  test('does not preserve malformed AI query values', () => {
    query = { lifecycle: 'draft', ai: 'yes', iteration: '-3' };
    renderHook(true);

    hookResult.navigateToFolder({ folderId: 9 });

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ query: {} }));
  });
});
