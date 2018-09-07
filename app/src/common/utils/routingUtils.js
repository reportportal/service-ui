import { parse, stringify } from 'qs';

const LEVEL_PARAMS_SUFFIX = 'Params';

const calculateNamespaceKey = (namespace) => `${namespace}${LEVEL_PARAMS_SUFFIX}`;
const getNamespaceFromKey = (key) =>
  key.indexOf(LEVEL_PARAMS_SUFFIX) && key.substr(0, key.indexOf(LEVEL_PARAMS_SUFFIX));

export const extractNamespacedQuery = (query, namespace) =>
  parse(query[calculateNamespaceKey(namespace)]);

export const createNamespacedQuery = (query, namespace) =>
  namespace ? { [calculateNamespaceKey(namespace)]: stringify(query) } : query;

export const copyQuery = (query, namespacesToCopy) =>
  Object.keys(query).reduce((acc, key) => {
    if (namespacesToCopy.indexOf(getNamespaceFromKey(key)) !== -1) {
      return {
        ...acc,
        [key]: query[key],
      };
    }
    return acc;
  }, {});
