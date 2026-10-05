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

import { isReducedPipelineIteration, PipelineIterationItem } from 'controllers/aiFactory/pipelines';

/**
 * Matches a search term against a requirement/pipeline name/iteration number, the same fields
 * P2's `search` param matches server-side (01-knowledge-base.md §4.10). Done client-side here:
 * the mock dataset (and the real one, for a while) is small enough that fetching every iteration
 * once and filtering in memory reproduces the same result without a request per keystroke.
 */
export const matchesSearch = (
  iteration: PipelineIterationItem,
  pipelineName: string,
  search: string,
): boolean => {
  if (!search.trim()) {
    return true;
  }
  const term = search.trim().toLowerCase();
  const reducedFields = isReducedPipelineIteration(iteration)
    ? [iteration.trigger, ...iteration.stages.map((stage) => stage.label)]
    : [iteration.requirement?.specId, iteration.requirement?.title, iteration.requirement?.jiraKey];
  const haystack = [pipelineName, `#${iteration.number}`, ...reducedFields]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(term);
};
