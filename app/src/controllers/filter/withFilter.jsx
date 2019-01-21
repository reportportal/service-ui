import { Component } from 'react';
import PropTypes from 'prop-types';
import { connectRouter } from 'common/utils';

const FILTER_KEY = 'filter.cnt.name';

const debounce = (callback, time) => {
  let interval;
  return (...args) => {
    clearTimeout(interval);
    interval = setTimeout(() => {
      interval = null;
      callback(...args);
    }, time);
  };
};

export const withFilter = ({ filterKey = FILTER_KEY, namespace } = {}) => (WrappedComponent) =>
  connectRouter(
    (query) => ({
      filter: query[filterKey],
    }),
    {
      updateFilter: (filter) => ({ [filterKey]: filter, 'page.page': '1' }),
    },
    { namespace },
  )(
    class FilterWrapper extends Component {
      static displayName = `withFilter(${WrappedComponent.displayName || WrappedComponent.name})`;

      static propTypes = {
        filter: PropTypes.string,
        updateFilter: PropTypes.func,
      };

      static defaultProps = {
        filter: null,
        updateFilter: () => {},
      };

      state = {
        prevValue: '',
      };

      handleFilterChange = debounce((value) => {
        if (this.state.prevValue !== String(value)) {
          this.setState({ prevValue: String(value) });
          this.props.updateFilter(value || undefined);
        }
      }, 300);

      render() {
        const { filter, updateFilter, ...rest } = this.props;
        return (
          <WrappedComponent filter={filter} onFilterChange={this.handleFilterChange} {...rest} />
        );
      }
    },
  );
