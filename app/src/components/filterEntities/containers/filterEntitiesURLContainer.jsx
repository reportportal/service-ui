import { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { connectRouter, debounce } from 'common/utils';
import { defaultPaginationSelector, PAGE_KEY } from 'controllers/pagination';
import { collectFilterEntities, createFilterQuery } from './utils';

@connectRouter(
  (query) => ({
    entities: collectFilterEntities(query),
    defaultPagination: defaultPaginationSelector(),
  }),
  {
    updateFilters: (query, page) => ({ ...query, [PAGE_KEY]: page }),
  },
)
export class FilterEntitiesURLContainer extends Component {
  static propTypes = {
    entities: PropTypes.object,
    updateFilters: PropTypes.func,
    render: PropTypes.func.isRequired,
    debounced: PropTypes.bool,
    defaultPagination: PropTypes.any.isRequired,
  };

  static defaultProps = {
    entities: {},
    updateFilters: () => {},
    debounced: true,
  };
  handleChange = (entities) => {
    if (isEqual(entities, this.props.entities)) {
      return;
    }
    const { defaultPagination } = this.props;
    this.props.updateFilters(
      createFilterQuery(entities, this.props.entities),
      defaultPagination[PAGE_KEY],
    );
  };

  debouncedHandleChange = debounce(this.handleChange, 1000);

  render() {
    const { render, entities, debounced } = this.props;
    return render({
      entities,
      onChange: debounced ? this.debouncedHandleChange : this.handleChange,
    });
  }
}
