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

import { useSelector } from 'react-redux';

import {
  pipelineIdSelector,
  iterationIdSelector,
  querySelector,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import {
  projectKeySelector,
  projectInfoLoadingSelector,
  projectNameSelector,
} from 'controllers/project';
import { activeProjectSelector, activeProjectKeySelector } from 'controllers/user';
import type { ProjectDetails } from 'pages/organization/constants';
import {
  hasResolvedTraceProject,
  isValidTraceRoute,
  readPositiveInteger,
  type StageTracePageRoute,
} from 'pages/inside/aiFactory/stageTracePage/stageTracePageUtils';

const stageKeySelector = (state: { location?: { payload?: { stageKey?: string } } }) =>
  state.location?.payload?.stageKey ?? '';

export const useStageTracePageRoute = () => {
  const projectKey = useSelector(projectKeySelector);
  const projectName = useSelector(projectNameSelector);
  const activeProjectKey = useSelector(activeProjectKeySelector);
  const activeProject = useSelector(activeProjectSelector) as Partial<ProjectDetails>;
  const loading = useSelector(projectInfoLoadingSelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const route: StageTracePageRoute = {
    organizationSlug,
    projectSlug,
    pipelineId: useSelector(pipelineIdSelector),
    iterationId: useSelector(iterationIdSelector),
    stageKey: useSelector(stageKeySelector),
  };
  const query = useSelector(querySelector);
  const hasProject = hasResolvedTraceProject(route, {
    projectKey,
    activeProjectKey,
    loading,
    organizationSlug: activeProject.organizationSlug,
    projectSlug: activeProject.projectSlug,
  });
  return {
    route,
    query,
    projectKey,
    projectName,
    hasProject,
    attempt: readPositiveInteger(query.attempt),
    isValidRoute: isValidTraceRoute(route, query.attempt),
  };
};
