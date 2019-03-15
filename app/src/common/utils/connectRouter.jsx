import { connect } from 'react-redux';
import { pagePropertiesSelector, updatePagePropertiesAction } from 'controllers/pages';
import { createNamespacedQuery, extractNamespacedQuery } from 'common/utils/routingUtils';
import { omit } from './omit';

const takeAll = (x) => ({ ...x });

export const connectRouter = (mapURLParamsToProps = takeAll, queryUpdaters = {}, options = {}) => (
  WrappedComponent,
) =>
  connect(
    (state, ownProps) => {
      const pageProperties = pagePropertiesSelector(state);
      let namespace = options.namespace || ownProps.namespace;
      const namespaceSelector = options.namespaceSelector || ownProps.namespaceSelector;
      if (!options.namespace && namespaceSelector) {
        namespace = namespaceSelector(state);
      }
      const namespacedQuery = namespace
        ? extractNamespacedQuery(pageProperties, namespace)
        : pageProperties;
      return {
        namespace,
        ...mapURLParamsToProps(namespacedQuery),
      };
    },
    (dispatch) => {
      const mappedUpdaters = {};
      Object.keys(queryUpdaters).forEach((key) => {
        mappedUpdaters[key] = (namespace) => (...args) =>
          dispatch(
            updatePagePropertiesAction(
              createNamespacedQuery(queryUpdaters[key](...args), namespace),
            ),
          );
      });
      return mappedUpdaters;
    },
    (stateProps, dispatchProps, ownProps) => ({
      ...omit(stateProps, ['namespace', 'namespacedQuery', 'namespaceSelector']),
      ...ownProps,
      ...Object.keys(queryUpdaters).reduce(
        (acc, key) => ({
          ...acc,
          [key]: acc[key](stateProps.namespace),
        }),
        dispatchProps,
      ),
    }),
  )(WrappedComponent);
