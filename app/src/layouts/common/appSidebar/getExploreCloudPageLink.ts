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

import {
  EXPLORE_CLOUD_PAGE_INSTANCE_LEVEL,
  EXPLORE_CLOUD_PAGE_ORGANIZATION_LEVEL,
  EXPLORE_CLOUD_PAGE_PROJECT_LEVEL,
} from 'controllers/pages';

type ExploreCloudPageLink = {
  type:
    | typeof EXPLORE_CLOUD_PAGE_INSTANCE_LEVEL
    | typeof EXPLORE_CLOUD_PAGE_ORGANIZATION_LEVEL
    | typeof EXPLORE_CLOUD_PAGE_PROJECT_LEVEL;
  payload?: {
    organizationSlug: string;
    projectSlug?: string;
  };
};

export const getExploreCloudPageLink = (
  organizationSlug?: string,
  projectSlug?: string,
): ExploreCloudPageLink => {
  if (projectSlug && organizationSlug) {
    return {
      type: EXPLORE_CLOUD_PAGE_PROJECT_LEVEL,
      payload: { organizationSlug, projectSlug },
    };
  }

  if (organizationSlug) {
    return {
      type: EXPLORE_CLOUD_PAGE_ORGANIZATION_LEVEL,
      payload: { organizationSlug },
    };
  }

  return {
    type: EXPLORE_CLOUD_PAGE_INSTANCE_LEVEL,
  };
};
