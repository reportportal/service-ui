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
    (acc, key) => (isEmptyValue(newQuery[key]) ? acc : { ...acc, [key]: newQuery[key] }),
    {},
  );
};

export const mergeNamespacedQuery = (oldQuery, paramsToMerge, namespace) =>
  namespace ? mergeQuery(oldQuery, paramsToMerge) : paramsToMerge;
