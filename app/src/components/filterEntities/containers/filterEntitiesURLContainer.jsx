import { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { connectRouter, debounce } from 'common/utils';
import { collectFilterEntities, createFilterQuery } from './utils';

@connectRouter(
  (query) => ({
    entities: collectFilterEntities(query),
  }),
  {
    updateFilters: (query) => ({ ...query }),
  },
)
export class FilterEntitiesURLContainer extends Component {
  static propTypes = {
    entities: PropTypes.object,
    updateFilters: PropTypes.func,
    render: PropTypes.func.isRequired,
    debounced: PropTypes.bool,
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
    this.props.updateFilters(createFilterQuery(entities, this.props.entities));
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
