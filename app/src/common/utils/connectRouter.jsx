import { connect } from 'react-redux';
import { pagePropertiesSelector, updatePagePropertiesAction } from 'controllers/pages';
import { createNamespacedQuery, extractNamespacedQuery } from 'common/utils/routingUtils';
import { omit } from './omit';

const takeAll = (x) => ({ ...x });

const mergeQuery = (oldQuery, paramsToMerge) => {
  const newQuery = { ...oldQuery, ...paramsToMerge };
  return Object.keys(newQuery).reduce(
    (acc, key) => (!newQuery[key] ? acc : { ...acc, [key]: newQuery[key] }),
    {},
  );
};

export const connectRouter = (mapURLParamsToProps = takeAll, queryUpdaters = {}, options = {}) => (
  WrappedComponent,
) =>
  connect(
    (state) => {
      const pageProperties = pagePropertiesSelector(state);
      let namespace = options.namespace;
      if (!options.namespace && options.namespaceSelector) {
        namespace = options.namespaceSelector(state);
      }
      const namespacedQuery = namespace
        ? extractNamespacedQuery(pageProperties, namespace)
        : pageProperties;
      return {
        namespace,
        ...mapURLParamsToProps(namespacedQuery),
        namespacedQuery,
      };
    },
    (dispatch) => {
      const mappedUpdaters = {};
      Object.keys(queryUpdaters).forEach((key) => {
        mappedUpdaters[key] = (namespace, oldQuery) => (...args) =>
          dispatch(
            updatePagePropertiesAction(
              createNamespacedQuery(mergeQuery(oldQuery, queryUpdaters[key](...args)), namespace),
            ),
          );
      });
      return mappedUpdaters;
    },
    (stateProps, dispatchProps, ownProps) => ({
      ...omit(stateProps, ['namespace', 'namespacedQuery']),
      ...ownProps,
      ...Object.keys(queryUpdaters).reduce(
        (acc, key) => ({
          ...acc,
          [key]: acc[key](stateProps.namespace, stateProps.namespacedQuery),
        }),
        dispatchProps,
      ),
    }),
  )(WrappedComponent);
