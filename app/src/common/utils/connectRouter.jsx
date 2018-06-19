import { connect } from 'react-redux';
import { pagePropertiesSelector, updatePagePropertiesAction } from 'controllers/pages';

const takeAll = (x) => ({ ...x });

export const connectRouter = (mapURLParamsToProps = takeAll, queryUpdaters = {}) => (
  WrappedComponent,
) =>
  connect(
    (state) => {
      const pageProperties = pagePropertiesSelector(state);
      return {
        ...mapURLParamsToProps(pageProperties),
      };
    },
    (dispatch) => {
      const mappedUpdaters = {};
      Object.keys(queryUpdaters).forEach((key) => {
        mappedUpdaters[key] = (...args) =>
          dispatch(updatePagePropertiesAction(queryUpdaters[key](...args)));
      });
      return mappedUpdaters;
    },
  )(WrappedComponent);
