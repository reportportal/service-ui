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

import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { URLS } from 'common/urls';
import { ERROR_CANCELED, fetch } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import type { TestCase } from 'types/testCase';

interface PipelineIterationDetails {
  id?: unknown;
  iterationNumber?: unknown;
}

interface IterationNumberState {
  number?: number;
  requestKey: string;
}

const INITIAL_STATE: IterationNumberState = {
  number: undefined,
  requestKey: '',
};

const toPositiveSafeInteger = (value: unknown) =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : undefined;

const parseIterationId = (iteration?: string) => {
  if (!iteration || !/^[1-9]\d*$/.test(iteration)) {
    return undefined;
  }

  return toPositiveSafeInteger(Number(iteration));
};

const findNumberInCases = (testCases: TestCase[], iterationId: number) =>
  toPositiveSafeInteger(
    testCases.find(({ ai }) => ai?.generatedByIteration.iterationId === iterationId)?.ai
      ?.generatedByIteration.number,
  );

const getIterationNumber = (response: PipelineIterationDetails, iterationId: number) =>
  toPositiveSafeInteger(response.id) === iterationId
    ? toPositiveSafeInteger(response.iterationNumber)
    : undefined;

export const useIterationNumber = (
  iteration?: string,
  testCases: TestCase[] = [],
  canLoadMetadata = false,
) => {
  const projectKey = useSelector(projectKeySelector);
  const [state, setState] = useState<IterationNumberState>(INITIAL_STATE);
  const iterationId = parseIterationId(iteration);
  const numberFromCases = useMemo(
    () => (iterationId ? findNumberInCases(testCases, iterationId) : undefined),
    [iterationId, testCases],
  );
  const requestKey =
    canLoadMetadata && projectKey && iterationId && !numberFromCases
      ? `${projectKey}:${iterationId}`
      : '';

  useEffect(() => {
    if (!requestKey || !iterationId) {
      return undefined;
    }

    let isActive = true;
    let cancelRequest = () => {};

    void fetch<PipelineIterationDetails>(URLS.pipelineIterationById(projectKey, iterationId), {
      abort: (cancel) => {
        cancelRequest = cancel;
      },
    })
      .then((response) => {
        if (isActive) {
          setState({ number: getIterationNumber(response, iterationId), requestKey });
        }
      })
      .catch((error: unknown) => {
        if (isActive && !(error instanceof Error && error.message === ERROR_CANCELED)) {
          setState({ number: undefined, requestKey });
        }
      });

    return () => {
      isActive = false;
      cancelRequest();
    };
  }, [iterationId, projectKey, requestKey]);

  return numberFromCases ?? (state.requestKey === requestKey ? state.number : undefined);
};
