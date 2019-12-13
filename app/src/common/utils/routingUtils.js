/*
 * Copyright 2019 EPAM Systems
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

import { parse, stringify } from 'qs';
import { isEmptyValue } from './isEmptyValue';

const LEVEL_PARAMS_SUFFIX = 'Params';

const calculateNamespaceKey = (namespace) => `${namespace}${LEVEL_PARAMS_SUFFIX}`;
const getNamespaceFromKey = (key) =>
  key.indexOf(LEVEL_PARAMS_SUFFIX) && key.substr(0, key.indexOf(LEVEL_PARAMS_SUFFIX));

export const extractNamespacedQuery = (query, namespace) =>
  parse(query[calculateNamespaceKey(namespace)]);

export const createNamespacedQuery = (query, namespace) =>
  namespace ? { [calculateNamespaceKey(namespace)]: stringify(query) } : query;

export const copyQuery = (query = {}, namespacesToCopy = []) =>
  Object.keys(query).reduce((acc, key) => {
    const namespace = getNamespaceFromKey(key);
    if (namespace && namespacesToCopy.indexOf(namespace) !== -1) {
      return {
        ...acc,
        [key]: query[key],
      };
    }
    return acc;
  }, {});

export const mergeQuery = (oldQuery, paramsToMerge) => {
  const newQuery = { ...oldQuery, ...paramsToMerge };
  return Object.keys(newQuery).reduce(
    (acc, key) => (isEmptyValue(newQuery[key]) ? acc : { ...acc, [key]: String(newQuery[key]) }),
    {},
  );
};

export const mergeNamespacedQuery = (oldQuery, paramsToMerge, namespace) =>
  namespace ? mergeQuery(oldQuery, paramsToMerge) : paramsToMerge;
