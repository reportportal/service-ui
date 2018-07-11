import { parse, stringify } from 'qs';
import { pathToAction, NOT_FOUND } from 'redux-first-router';

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

export const createExtractQueryForCurrentLevel = (breadcrumbsDescriptors, namespace) => (
  query,
  pageName,
) => {
  if (!query || !breadcrumbsDescriptors[namespace]) {
    return null;
  }
  const levels = breadcrumbsDescriptors[namespace];
  const pageLevelIndex = levels.findIndex((v) => v.page === pageName);
  return Object.keys(query).reduce((acc, key) => {
    const levelKey = getNamespaceFromKey(key);
    const levelIndex = levelKey ? levels.findIndex((v) => v.level === levelKey) : -1;
    if (levelIndex === -1 || levelIndex <= pageLevelIndex) {
      acc[key] = query[key];
    }
    return acc;
  }, {});
};

export const createSplitURLToCrumbs = (routesMap, breadcrumbsDescriptors, namespace) => {
  const extractQueryForCurrentLevel = createExtractQueryForCurrentLevel(
    breadcrumbsDescriptors,
    namespace,
  );
  return (pathname, query) => {
    const chunks = [];
    pathname.split('/').reduce((prev, curr, index) => {
      chunks[index] = `${prev}/${curr}`;
      return chunks[index];
    });
    return chunks.reduce((crumbs, chunk) => {
      const routeAction = pathToAction(chunk, routesMap, { parse, stringify });
      if (routeAction.type === NOT_FOUND) {
        return crumbs;
      }
      const newQuery = extractQueryForCurrentLevel(query, routeAction.type);
      if (newQuery) {
        routeAction.meta.query = newQuery;
      }
      return [...crumbs, routeAction];
    }, []);
  };
};
