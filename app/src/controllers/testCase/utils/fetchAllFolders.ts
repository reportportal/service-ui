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

import { times } from 'es-toolkit/compat';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';

import { Folder } from '../types';

interface FoldersDto {
  content: Folder[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export const fetchAllFolders = async ({
  projectKey,
  filters = {},
  signal,
}: {
  projectKey: string;
  filters?: Record<string, string | number>;
  signal?: AbortSignal;
}): Promise<Folder[]> => {
  const limit = 1000;

  const firstPageResponse = await fetch<FoldersDto>(
    URLS.testFolders(projectKey, {
      ...filters,
      offset: 0,
      limit,
      sort: 'id,ASC',
    }),
    { signal },
  );

  const { totalPages } = firstPageResponse.page;
  const allFolders: Folder[] = [...firstPageResponse.content];

  if (totalPages <= 1 || signal?.aborted) {
    return allFolders;
  }

  const responses = await Promise.all(
    times(totalPages - 1, (index) =>
      fetch<FoldersDto>(
        URLS.testFolders(projectKey, {
          ...filters,
          offset: (index + 1) * limit,
          limit,
          sort: 'id,ASC',
        }),
        { signal },
      ),
    ),
  );

  responses.forEach((response) => allFolders.push(...response.content));

  return allFolders;
};
