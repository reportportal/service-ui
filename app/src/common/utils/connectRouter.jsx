import { connect } from 'react-redux';
import { pagePropertiesSelector, updatePagePropertiesAction } from 'controllers/pages';
import { createNamespacedQuery, extractNamespacedQuery } from 'common/utils/breadcrumbsUtils';

const takeAll = (x) => ({ ...x });

export const connectRouter = (mapURLParamsToProps = takeAll, queryUpdaters = {}, options = {}) => (
  WrappedComponent,
) =>
  connect(
    (state) => {
      const pageProperties = pagePropertiesSelector(state);
      const namespacedQuery = options.namespace
        ? extractNamespacedQuery(pageProperties, options.namespace)
        : pageProperties;
      return {
        ...mapURLParamsToProps(namespacedQuery),
      };
    },
    (dispatch) => {
      const mappedUpdaters = {};
      Object.keys(queryUpdaters).forEach((key) => {
        mappedUpdaters[key] = (...args) =>
          dispatch(
            updatePagePropertiesAction(
              createNamespacedQuery(queryUpdaters[key](...args), options.namespace),
            ),
          );
      });
      return mappedUpdaters;
    },
  )(WrappedComponent);
