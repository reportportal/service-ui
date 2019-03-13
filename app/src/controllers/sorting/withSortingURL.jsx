import { Component } from 'react';
import PropTypes from 'prop-types';
import { connectRouter } from 'common/utils';
import { SORTING_DESC, SORTING_ASC, SORTING_KEY } from './constants';
import { parseSortingString, formatSortingString } from './utils';

export const withSortingURL = ({
  defaultFields = [],
  defaultDirection,
  staticFields = [],
  namespace,
  namespaceSelector,
} = {}) => (WrappedComponent) => {
  @connectRouter(
    (query) => ({
      sortingString: query[SORTING_KEY],
    }),
    {
      updateSorting: (sortingString) => ({ [SORTING_KEY]: sortingString }),
    },
    { namespace, namespaceSelector },
  )
  class SortingWrapper extends Component {
    static propTypes = {
      sortingString: PropTypes.string,
      updateSorting: PropTypes.func,
    };

    static defaultProps = {
      sortingString: '',
      updateSorting: () => {},
    };

    changeSorting = (field) => {
      const { fields: oldFields, direction: oldDirection } = parseSortingString(
        this.props.sortingString,
      );
      let direction = oldDirection || defaultDirection;
      const fields = oldFields.length > 0 ? oldFields : defaultFields;
      if (fields.includes(field)) {
        direction = direction === SORTING_ASC ? SORTING_DESC : SORTING_ASC;
      }
      this.props.updateSorting(formatSortingString([field, ...staticFields], direction));
    };

    render() {
      const { sortingString, updateSorting, ...rest } = this.props;
      const { fields, direction } = parseSortingString(this.props.sortingString);
      const sortingColumn = fields[0] || defaultFields[0];
      return (
        <WrappedComponent
          sortingColumn={sortingColumn}
          sortingDirection={direction || defaultDirection}
          onChangeSorting={this.changeSorting}
          {...rest}
        />
      );
    }
  }
  return SortingWrapper;
};
