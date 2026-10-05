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

import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  pipelineCatalogProjectKeySelector,
  pipelineCatalogVersionSelector,
  pipelineIterationDetailsSelector,
  pipelineIterationsByPipelineSelector,
} from 'controllers/aiFactory/pipelines';
import { projectKeySelector } from 'controllers/project';
import type { TestCase } from 'types/testCase';

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

const getLoadedIterationNumber = (
  iterationId: number,
  details: ReturnType<typeof pipelineIterationDetailsSelector>,
  iterationsByPipeline: ReturnType<typeof pipelineIterationsByPipelineSelector>,
) => {
  if (details?.id === iterationId) {
    return toPositiveSafeInteger(details.number);
  }
  const summary = Object.values(iterationsByPipeline ?? {})
    .flat()
    .find(({ id }) => id === iterationId);
  return toPositiveSafeInteger(summary?.number);
};

export const useIterationNumber = (
  iteration?: string,
  testCases: TestCase[] = [],
  canLoadMetadata = false,
) => {
  const details = useSelector(pipelineIterationDetailsSelector);
  const iterationsByPipeline = useSelector(pipelineIterationsByPipelineSelector);
  const catalogProjectKey = useSelector(pipelineCatalogProjectKeySelector);
  const catalogVersion = useSelector(pipelineCatalogVersionSelector);
  const projectKey = useSelector(projectKeySelector);
  const iterationId = parseIterationId(iteration);
  const numberFromCases = useMemo(
    () => (iterationId ? findNumberInCases(testCases, iterationId) : undefined),
    [iterationId, testCases],
  );
  const numberFromLoadedMetadata = useMemo(
    () =>
      canLoadMetadata && iterationId && catalogVersion > 0 && catalogProjectKey === projectKey
        ? getLoadedIterationNumber(iterationId, details, iterationsByPipeline)
        : undefined,
    [
      canLoadMetadata,
      catalogProjectKey,
      catalogVersion,
      details,
      iterationId,
      iterationsByPipeline,
      projectKey,
    ],
  );

  return numberFromCases ?? numberFromLoadedMetadata;
};
