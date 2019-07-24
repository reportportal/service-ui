import { PureComponent } from 'react';
import { SORTING_ASC, SORTING_DESC } from './constants';

export const withSorting = ({ defaultSortingColumn, defaultSortingDirection } = {}) => (
  WrappedComponent,
) =>
  class SortingWrapper extends PureComponent {
    static displayName = `withSorting(${WrappedComponent.displayName || WrappedComponent.name})`;

    state = {
      sortingColumn: defaultSortingColumn,
      sortingDirection: defaultSortingDirection || SORTING_DESC,
    };

    changeSorting = (sortingColumn) => {
      if (sortingColumn === this.state.sortingColumn) {
        this.setState({
          sortingDirection: this.toggleSortingDirection(),
        });
      } else {
        this.setState({
          sortingDirection: SORTING_ASC,
          sortingColumn,
        });
      }
    };

    toggleSortingDirection = () =>
      this.state.sortingDirection === SORTING_DESC ? SORTING_ASC : SORTING_DESC;

    createSortingString = () => {
      const { sortingColumn, sortingDirection } = this.state;
      return sortingColumn && sortingDirection && `${sortingColumn},${sortingDirection}`;
    };

    render() {
      return (
        <WrappedComponent
          {...this.props}
          sortingString={this.createSortingString()}
          sortingColumn={this.state.sortingColumn}
          sortingDirection={this.state.sortingDirection}
          onChangeSorting={this.changeSorting}
        />
      );
    }
  };
