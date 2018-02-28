import { withRouter } from 'react-router';

const noop = () => {
};

export const connectRouter = (mapURLParamsToProps = noop, queryUpdaters = {}) =>
  WrappedComponent =>
    withRouter(
      ({ location: { query, pathname }, match: { params }, history, ...rest }) => {
        const mappedProps = mapURLParamsToProps(query, params);
        const mergeLocation = newQuery => ({
          pathname,
          query: {
            ...query,
            ...newQuery,
          },
        });
        const mappedUpdaters = {};
        Object.keys(queryUpdaters).forEach((key) => {
          mappedUpdaters[key] =
            (...args) => history.replace(mergeLocation(queryUpdaters[key](...args)));
        });

        return (
          <WrappedComponent
            {...mappedProps}
            {...mappedUpdaters}
            {...rest}
          />
        );
      },
    );
