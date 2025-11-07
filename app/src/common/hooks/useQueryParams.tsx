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

import { useSelector } from 'react-redux';
import { locationQuerySelector } from 'controllers/pages';

import { queryParamsType } from '../../types/common';

export const useQueryParams = ({ offset, limit }: queryParamsType): queryParamsType => {
  const query = useSelector(locationQuerySelector);

  if (query?.offset === undefined || query?.limit === undefined) {
    return { offset, limit };
  }

  const queryOffset = Number(query.offset);
  const queryLimit = Number(query.limit);

  if (Number.isNaN(queryOffset) || Number.isNaN(queryLimit)) {
    return { offset, limit };
  }

  return { offset: queryOffset, limit: queryLimit };
};
