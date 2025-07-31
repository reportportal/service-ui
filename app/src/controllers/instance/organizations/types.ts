/*
 * Copyright 2025 EPAM Systems
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
  ORGANIZATION_EXTERNAL_TYPE,
  ORGANIZATION_INTERNAL_TYPE,
} from '../../../common/constants/organizationTypes';

interface OrganizationMetaCount {
  count: number;
}

interface OrganizationRelationships {
  users: {
    meta: OrganizationMetaCount;
  };
  projects: {
    meta: OrganizationMetaCount;
  };
  launches: {
    meta: OrganizationMetaCount;
  };
}

export interface OrganizationSearchesItem {
  id: number;
  name: string;
  slug: string;
  type: typeof ORGANIZATION_EXTERNAL_TYPE | typeof ORGANIZATION_INTERNAL_TYPE;
  relationships: OrganizationRelationships;
  created_at: string;
  updated_at: string;
}

export interface OrganizationsSearchesResponseData {
  offset: number;
  limit: number;
  total_count: number;
  sort: string;
  order: string;
  items: OrganizationSearchesItem[];
}
