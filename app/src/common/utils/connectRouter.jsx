import { connect } from 'react-redux';
import { pagePropertiesSelector, updatePagePropertiesAction } from 'controllers/pages';
import {
  createNamespacedQuery,
  extractNamespacedQuery,
  mergeNamespacedQuery,
} from 'common/utils/routingUtils';
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
      const offset = options.offset;
      if (!options.namespace && namespaceSelector) {
        namespace = namespaceSelector(state, offset);
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
        mappedUpdaters[key] = (namespace, oldQuery) => (...args) => {
          dispatch(
            updatePagePropertiesAction(
              createNamespacedQuery(
                mergeNamespacedQuery(oldQuery, queryUpdaters[key](...args), namespace),
                namespace,
              ),
            ),
          );
        };
      });
      return mappedUpdaters;
    },
    (stateProps, dispatchProps, ownProps) => ({
      ...omit(stateProps, ['namespace', 'namespacedQuery', 'namespaceSelector']),
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
