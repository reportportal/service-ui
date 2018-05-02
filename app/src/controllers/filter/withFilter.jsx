import { PureComponent } from 'react';
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

export const withFilter = WrappedComponent => connectRouter(query => ({
  filter: query[FILTER_KEY],
}), {
  updateFilter: filter => ({ [FILTER_KEY]: filter }),
})(
  class FilterWrapper extends PureComponent {
    static displayName = `withFilter(${WrappedComponent.displayName || WrappedComponent.name})`;

    static propTypes = {
      filter: PropTypes.string,
      updateFilter: PropTypes.func,
    };

    static defaultProps = {
      filter: null,
      updateFilter: () => {
      },
    };

    handleFilterChange = debounce((value) => {
      this.props.updateFilter(value || undefined);
    }, 300);

    render() {
      const {
        filter,
        updateFilter,
        ...rest
      } = this.props;
      return (
        <WrappedComponent
          filter={filter}
          onFilterChange={this.handleFilterChange}
          {...rest}
        />
      );
    }
  });
