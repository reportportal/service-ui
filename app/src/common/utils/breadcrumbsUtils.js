import { parse, stringify } from 'qs';
// import { matchPath } from 'react-router';
import { pathToAction, NOT_FOUND } from 'redux-first-router';

const LEVEL_PARAMS_SUFFIX = 'Params';

const calculateNamespaceKey = (namespace) => `${namespace}${LEVEL_PARAMS_SUFFIX}`;
const getNamespaceFromKey = (key) =>
  key.indexOf(LEVEL_PARAMS_SUFFIX) && key.substr(0, key.indexOf(LEVEL_PARAMS_SUFFIX));

export const extractNamespacedQuery = (query, namespace) =>
  parse(query[calculateNamespaceKey(namespace)]);

export const createNamespacedQuery = (query, namespace) =>
  namespace ? { [calculateNamespaceKey(namespace)]: stringify(query) } : query;

// TODO remove after redux-first-router merge and use routesMap instead
// const PATHS = ['/:projectId/launch/:launchId', '/:projectId/launch/:launchId/suite/:suiteId'];
//
// const BREADCRUMBS_MAP = [
//   {
//     path: '/:projectId/launch/:launchId',
//     level: 'launch',
//   },
//   {
//     path: '/:projectId/launch/:launchId/suite/:suiteId',
//     level: 'suite',
//   },
// ];

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

// TODO delete?
// const addQueryParametersToPath = (path, query) => {
//   if (!query) {
//     return path;
//   }
//   const crumbDescription = BREADCRUMBS_MAP.find((crumb) =>
//     matchPath(path, { path: crumb.path, exact: true, strict: false }),
//   );
//   const extractedQuery = extractQueryForCurrentLevel(query, crumbDescription.level);
//   return `${path}${stringify(extractedQuery, { addQueryPrefix: true })}`;
// };

// TODO delete?
// export const splitURLToCrumbs = (pathname, query) => {
//   const chunks = [];
//   pathname.split('/').reduce((prev, curr, index) => {
//     chunks[index] = `${prev}/${curr}`;
//     return chunks[index];
//   });
//   // TODO reduce?
//   return chunks
//     .filter((chunk) => PATHS.find((path) => matchPath(chunk, { path, exact: true, strict: false })))
//     .map((chunk) => addQueryParametersToPath(chunk, query));
// };

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
