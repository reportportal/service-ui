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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { adaptLivePipelineIterationsPage } from 'controllers/aiFactory/pipelines/liveAdapters';
import {
  getLiveIterationIdentity,
  type LiveIterationIdentity,
} from 'pages/inside/aiFactory/common/iterationReferences/liveIterationIdentity';

export const COMPARE_ITERATION_PAGE_SIZE = 200;

type IterationChoice = Pick<LiveIterationIdentity, 'id' | 'number'>;

interface CompareIterationHistoryRequest {
  projectKey: string;
  pipelineId: number;
  signal: AbortSignal;
}

const loadPage = async (
  { projectKey, pipelineId, signal }: CompareIterationHistoryRequest,
  pageIndex: number,
) => {
  const raw = await fetch(
    URLS.pipelineCatalogIterations(projectKey, pipelineId, {
      offset: pageIndex * COMPARE_ITERATION_PAGE_SIZE,
      limit: COMPARE_ITERATION_PAGE_SIZE,
    }),
    { signal },
  );
  const { content, page } = adaptLivePipelineIterationsPage(raw, pipelineId);
  if (
    page.number !== pageIndex + 1 ||
    page.size !== COMPARE_ITERATION_PAGE_SIZE ||
    content.some((iteration, index) => index > 0 && iteration.number >= content[index - 1].number)
  ) {
    throw new Error('Unexpected iteration history page');
  }
  return { content, page };
};

// LP2 orders iterations by descending number. A page starting below the candidate may
// have a closer match on a newer page, so recurse toward the boundary before using it.
const findEarlierInHistory = async (
  request: CompareIterationHistoryRequest,
  candidateNumber: number,
  firstIndex: number,
  lastIndex: number,
): Promise<IterationChoice | null> => {
  if (request.signal.aborted || firstIndex > lastIndex) return null;

  const index = firstIndex + Math.floor((lastIndex - firstIndex) / 2);
  const { content } = await loadPage(request, index);
  const earlier = content.find(({ number }) => number < candidateNumber);
  if (!earlier) return findEarlierInHistory(request, candidateNumber, index + 1, lastIndex);
  if (earlier !== content[0]) return earlier;
  return (await findEarlierInHistory(request, candidateNumber, firstIndex, index - 1)) ?? earlier;
};

export const resolvePreviousCompareIteration = async (
  request: CompareIterationHistoryRequest,
  candidateId: number,
): Promise<IterationChoice | null> => {
  const candidate = await getLiveIterationIdentity(request.projectKey, candidateId, request.signal);
  if (candidate?.pipelineId !== request.pipelineId) {
    throw new Error('Invalid comparison candidate');
  }
  if (request.signal.aborted || candidate.number === 1) return null;

  const { content, page } = await loadPage(request, 0);
  const earlier = content.find(({ number }) => number < candidate.number);
  return earlier ?? findEarlierInHistory(request, candidate.number, 1, page.totalPages - 1);
};
