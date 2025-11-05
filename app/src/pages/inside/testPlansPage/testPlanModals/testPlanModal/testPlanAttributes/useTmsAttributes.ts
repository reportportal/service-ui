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

import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { TmsAttribute } from 'controllers/testPlan';

import { Attribute } from '../testPlanModal';

export const transformFormAttributesToBackend = (attributes: Attribute[] = []) =>
  attributes
    .filter((attribute) => attribute.id && attribute.value)
    .map(({ id, value }) => ({
      id,
      value,
    }));

export const useTmsAttributes = () => {
  const projectKey = useSelector(projectKeySelector);

  const createTmsAttribute = useCallback(
    async (key: string) => {
      const url = URLS.tmsAttribute(projectKey);

      return await fetch<TmsAttribute>(url, {
        method: 'post',
        data: { key },
      });
    },
    [projectKey],
  );

  const getTmsAttributeKeys = useCallback(
    (searchValue: string) => URLS.tmsAttribute(projectKey, { 'filter.eq.key': searchValue }),
    [projectKey],
  );

  const getTmsAttributeValues = useCallback(
    (key: string) => (searchValue: string) =>
      URLS.tmsAttribute(projectKey, {
        'filter.eq.key': key,
        'filter.eq.search': searchValue,
      }),
    [projectKey],
  );

  return {
    createTmsAttribute,
    getTmsAttributeKeys,
    getTmsAttributeValues,
  };
};
