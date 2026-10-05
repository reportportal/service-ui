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

import { useCallback, useEffect, useRef, useState } from 'react';

import { URLS } from 'common/urls';
import { ERROR_CANCELED, fetch } from 'common/utils';
import type { TestCaseAiRS } from 'types/aiFactory';

interface TestCaseAiState {
  data: TestCaseAiRS | null;
  resourceKey: string;
  requestKey: string;
  isError: boolean;
}

export interface TestCaseAiLoadState {
  data: TestCaseAiRS | null;
  isLoading: boolean;
  isError: boolean;
  reload: () => void;
}

const INITIAL_STATE: TestCaseAiState = {
  data: null,
  resourceKey: '',
  requestKey: '',
  isError: false,
};

export const useTestCaseAi = (
  projectKey: string,
  testCaseId: number,
  isEnabled: boolean,
  resourceVersion?: number,
): TestCaseAiLoadState => {
  const [state, setState] = useState<TestCaseAiState>(INITIAL_STATE);
  const [requestIndex, setRequestIndex] = useState(0);
  const activeRequestRef = useRef('');
  const resourceKey = `${projectKey}:${testCaseId}`;
  const requestKey = `${resourceKey}:${resourceVersion ?? ''}:${requestIndex}`;

  const reload = useCallback(() => {
    setRequestIndex((currentIndex) => currentIndex + 1);
  }, []);

  useEffect(() => {
    if (!isEnabled || !projectKey || !testCaseId) {
      activeRequestRef.current = '';
      return undefined;
    }

    activeRequestRef.current = requestKey;
    let cancelRequest = () => {};

    void fetch<TestCaseAiRS>(URLS.testCaseAi(projectKey, testCaseId), {
      abort: (cancel) => {
        cancelRequest = cancel;
      },
    })
      .then((data) => {
        if (activeRequestRef.current === requestKey) {
          setState({ data, resourceKey, requestKey, isError: false });
        }
      })
      .catch((error: unknown) => {
        if (
          activeRequestRef.current !== requestKey ||
          (error instanceof Error && error.message === ERROR_CANCELED)
        ) {
          return;
        }
        setState((currentState) => ({
          data: currentState.resourceKey === resourceKey ? currentState.data : null,
          resourceKey,
          requestKey,
          isError: true,
        }));
      });

    return () => {
      if (activeRequestRef.current === requestKey) {
        activeRequestRef.current = '';
      }
      cancelRequest();
    };
  }, [isEnabled, projectKey, requestKey, resourceKey, testCaseId]);

  const isCurrentRequest = state.requestKey === requestKey;
  const isCurrentResource =
    isEnabled && Boolean(projectKey) && Boolean(testCaseId) && state.resourceKey === resourceKey;

  return {
    data: isCurrentResource ? state.data : null,
    isLoading: isEnabled && Boolean(projectKey) && Boolean(testCaseId) && !isCurrentRequest,
    isError: isCurrentResource && isCurrentRequest && state.isError,
    reload,
  };
};
