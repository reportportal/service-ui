import { Component } from 'react';
import PropTypes from 'prop-types';

export class FilterEntitiesAddHandlerContainer extends Component {
  static propTypes = {
    filterEntities: PropTypes.array.isRequired,
    render: PropTypes.func.isRequired,
    onFilterAdd: PropTypes.func.isRequired,
    onFilterRemove: PropTypes.func.isRequired,
    onFilterValidate: PropTypes.func.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    filterErrors: PropTypes.object.isRequired,
    filterValues: PropTypes.object.isRequired,
  };

  handleAdd = (entity) => {
    const { filterEntities, onFilterAdd } = this.props;
    if (typeof entity === 'string') {
      onFilterAdd(filterEntities.find((item) => item.id === entity));
    } else {
      onFilterAdd(entity);
    }
  };

  render() {
    const { render, ...rest } = this.props;
    return render({ ...rest, onFilterAdd: this.handleAdd });
  }
}
