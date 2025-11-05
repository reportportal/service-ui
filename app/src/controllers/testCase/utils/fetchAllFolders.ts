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
}: {
  projectKey: string;
  filters?: Record<string, string | number>;
}): Promise<Folder[]> => {
  const limit = 1000;
  let offset = 0;
  const allFolders: Folder[] = [];
  let totalElements = Infinity;

  while (offset < totalElements) {
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch<FoldersDto>(
      URLS.testFolders(projectKey, {
        offset,
        limit,
        sort: 'id,ASC',
        ...filters,
      }),
    );

    allFolders.push(...response.content);
    totalElements = response.page.totalElements;
    offset += limit;
  }

  return allFolders;
};
