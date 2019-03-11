import { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { namespaceSelector } from 'controllers/testItem';
import { connectRouter, debounce } from 'common/utils';
import { isEmptyValue } from 'common/utils/isEmptyValue';

const collectFilterEntities = (query) =>
  Object.keys(query || {}).reduce((result, key) => {
    if (key.indexOf('filter.') !== 0) {
      return result;
    }
    const [, condition, filterName] = key.split('.');
    return {
      ...result,
      [filterName]: {
        condition,
        value: query[key] || null,
      },
    };
  }, {});

@connectRouter(
  (query) => ({
    entities: collectFilterEntities(query),
  }),
  {
    updateFilters: (query) => ({ ...query }),
  },
  { namespaceSelector },
)
export class FilterEntitiesURLContainer extends Component {
  static propTypes = {
    entities: PropTypes.object,
    updateFilters: PropTypes.func,
    render: PropTypes.func.isRequired,
  };

  static defaultProps = {
    entities: {},
    updateFilters: () => {},
  };

  handleChange = debounce((entities) => {
    if (isEqual(entities, this.props.entities)) {
      return;
    }
    const mergedEntities = { ...this.props.entities, ...entities };
    const query = Object.keys(mergedEntities).reduce((res, key) => {
      const entity = entities[key];
      const oldEntity = this.props.entities[key];
      if (!entity && oldEntity) {
        return { ...res, [`filter.${oldEntity.condition}.${key}`]: undefined };
      }
      return {
        ...res,
        [`filter.${entity.condition}.${key}`]: !isEmptyValue(entity.value)
          ? entity.value
          : undefined,
      };
    }, {});
    this.props.updateFilters(query);
  }, 1000);

  render() {
    const { render, entities } = this.props;
    return render({ entities, onChange: this.handleChange });
  }
}
