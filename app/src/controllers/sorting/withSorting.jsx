import { Component } from 'react';
import PropTypes from 'prop-types';
import { connectRouter } from 'common/utils';
import { SORTING_ASC, SORTING_DESC, SORTING_KEY } from './constants';
import { parseSortingString, createSortingString } from './utils';

export const withSorting = ({ namespace, namespaceSelector, defaultSorting } = {}) => (
  WrappedComponent,
) =>
  @connectRouter(
    (query) => {
      const sortingString = query[SORTING_KEY] || defaultSorting;
      const parsedSorting = parseSortingString(sortingString);
      return {
        sortingColumns: parsedSorting.fields,
        sortingDirection: parsedSorting.direction,
      };
    },
    {
      updateSorting: (columns, direction) => ({
        [SORTING_KEY]: createSortingString(columns, direction),
      }),
    },
    { namespace, namespaceSelector },
  )
  class SortingWrapper extends Component {
    static displayName = `withSorting(${WrappedComponent.displayName || WrappedComponent.name})`;

    static propTypes = {
      sortingColumns: PropTypes.arrayOf(PropTypes.string),
      sortingDirection: PropTypes.oneOf([SORTING_DESC, SORTING_ASC]),
      updateSorting: PropTypes.func.isRequired,
      queryNamespace: PropTypes.string,
    };

    static defaultProps = {
      sortingColumns: [],
      sortingDirection: SORTING_DESC,
      queryNamespace: null,
    };

    changeSorting = (sortingColumn) => {
      const { sortingColumns, sortingDirection, updateSorting, queryNamespace } = this.props;
      if (sortingColumn === sortingColumns[0]) {
        const newDirection = this.toggleSortingDirection();
        updateSorting(sortingColumns, newDirection, queryNamespace);
        return;
      }
      const newSortingColumns = [...sortingColumns];
      newSortingColumns[0] = sortingColumn;
      updateSorting(newSortingColumns, sortingDirection, queryNamespace);
    };

    toggleSortingDirection = () =>
      this.props.sortingDirection === SORTING_DESC ? SORTING_ASC : SORTING_DESC;

    render() {
      return (
        <WrappedComponent
          {...this.props}
          sortingColumn={this.props.sortingColumns[0]}
          sortingDirection={this.props.sortingDirection}
          onChangeSorting={this.changeSorting}
        />
      );
    }
  };
