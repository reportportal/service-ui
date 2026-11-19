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
const HISTORY_CHANGED = Symbol('ITERATION_HISTORY_CHANGED');

type IterationChoice = Pick<LiveIterationIdentity, 'id' | 'number'>;
type HistoryLookup = IterationChoice | typeof HISTORY_CHANGED | null;

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
  totalElements: number,
): Promise<HistoryLookup> => {
  if (request.signal.aborted || firstIndex > lastIndex) return null;

  const index = firstIndex + Math.floor((lastIndex - firstIndex) / 2);
  const { content, page } = await loadPage(request, index);
  if (page.totalElements !== totalElements) return HISTORY_CHANGED;

  const earlier = content.find(({ number }) => number < candidateNumber);
  if (!earlier) {
    return findEarlierInHistory(request, candidateNumber, index + 1, lastIndex, totalElements);
  }
  if (earlier !== content[0]) return earlier;
  return (
    (await findEarlierInHistory(request, candidateNumber, firstIndex, index - 1, totalElements)) ??
    earlier
  );
};

const findPreviousInHistory = async (
  request: CompareIterationHistoryRequest,
  candidateNumber: number,
): Promise<HistoryLookup> => {
  const { content, page } = await loadPage(request, 0);
  const earlier = content.find(({ number }) => number < candidateNumber);
  return (
    earlier ??
    findEarlierInHistory(request, candidateNumber, 1, page.totalPages - 1, page.totalElements)
  );
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

  let previous = await findPreviousInHistory(request, candidate.number);
  // A new iteration can shift offsets mid-search. Retry once from the first page.
  if (previous === HISTORY_CHANGED && !request.signal.aborted) {
    previous = await findPreviousInHistory(request, candidate.number);
  }
  if (request.signal.aborted) return null;
  if (previous === HISTORY_CHANGED) {
    throw new Error('Iteration history changed during comparison lookup');
  }
  return previous;
};
