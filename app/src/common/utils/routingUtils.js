import { parse, stringify } from 'qs';
import {
  FILTER_PREFIX,
  PREDEFINED_FILTER_PREFIX,
} from 'components/filterEntities/containers/utils';

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

const getFilterNameByKey = (key) => {
  const filterPrefixes = [FILTER_PREFIX, PREDEFINED_FILTER_PREFIX];
  const isFilterRegExp = new RegExp(filterPrefixes.join('|'));
  if (isFilterRegExp.test(key)) {
    return key.split('.').pop();
  }
  return key;
};

const isEqualKeys = (newKey, oldKey) =>
  newKey === oldKey || getFilterNameByKey(newKey) === getFilterNameByKey(oldKey);

const mergeKeys = (oldQuery = {}, paramsToMerge = {}) =>
  Object.keys(oldQuery).reduce(
    (query, oldKey) =>
      query.some((newKey) => isEqualKeys(newKey, oldKey)) ? query : [...query, oldKey],
    Object.keys(paramsToMerge),
  );

export const mergeQuery = (oldQuery, paramsToMerge) => {
  const mixedQuery = { ...oldQuery, ...paramsToMerge };
  const newKeys = mergeKeys(oldQuery, paramsToMerge);
  return newKeys.reduce(
    (acc, key) => (isEmptyValue(mixedQuery[key]) ? acc : { ...acc, [key]: mixedQuery[key] }),
    {},
  );
};
