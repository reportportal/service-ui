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

import { getStorageItem } from 'common/utils/storageUtils';
import { queryParamsType } from 'types/common';

interface UserSettings {
  [key: string]: string | number | undefined;
}

type RouterParams = {
  limit?: number | string;
  offset?: number | string;
};

type GetRouterParamsType = {
  state: {
    user?: {
      info?: {
        userId?: string;
      };
    };
    location: {
      query?: queryParamsType;
    };
  };
  namespace: string;
  defaultParams: queryParamsType;
};

export const getRouterParams = ({
  state,
  namespace,
  defaultParams,
}: GetRouterParamsType): RouterParams => {
  const userData = getStorageItem(`${state.user?.info?.userId}_settings`) as
    | UserSettings
    | undefined;
  const savedLimit = userData ? userData[`${namespace}PageSize`] : undefined;
  const query = state.location?.query;
  const offset = query?.offset || defaultParams.offset;
  const limit = query?.limit || savedLimit || defaultParams.limit;

  return { offset, limit };
};
