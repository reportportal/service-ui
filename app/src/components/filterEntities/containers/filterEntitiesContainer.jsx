import { Component } from 'react';
import PropTypes from 'prop-types';
import { omit } from 'common/utils/omit';
import { LEVEL_STEP, LEVEL_SUITE, LEVEL_TEST, LEVEL_LAUNCH } from 'common/constants/launchLevels';
import {
  StepLevelEntities,
  SuiteLevelEntities,
  LaunchLevelEntities,
} from 'pages/inside/common/filterEntitiesGroups';
import { FilterEntitiesAddHandlerContainer } from './filterEntitiesAddHandlerContainer';

const ENTITY_PROVIDERS = {
  [LEVEL_LAUNCH]: LaunchLevelEntities,
  [LEVEL_SUITE]: SuiteLevelEntities,
  [LEVEL_TEST]: SuiteLevelEntities,
  [LEVEL_STEP]: StepLevelEntities,
};

export class FilterEntitiesContainer extends Component {
  static propTypes = {
    entities: PropTypes.object,
    onChange: PropTypes.func,
    render: PropTypes.func.isRequired,
    level: PropTypes.string.isRequired,
  };

  static defaultProps = {
    entities: {},
    onChange: () => {},
  };

  state = {
    errors: {},
    values: this.props.entities,
  };

  getValues = () => ({ ...this.state.values, ...this.props.entities });

  collectEntities = (values) => {
    const { errors } = this.state;
    return Object.keys(values).reduce((acc, entityId) => {
      const value = values[entityId];
      return entityId in errors ? acc : { ...acc, [entityId]: value };
    }, {});
  };

  handleChange = (entityId, value) => {
    this.setState(
      {
        values: { ...this.state.values, [entityId]: { ...this.state.values[entityId], ...value } },
      },
      () => this.props.onChange(this.collectEntities(this.state.values)),
    );
  };

  handleValidate = (entityId, error) => {
    if (!error) {
      this.setState({ errors: omit(this.state.errors, [entityId]) });
    } else {
      this.setState({ errors: { ...this.state.errors, [entityId]: error } });
    }
  };

  handleAdd = (entity) =>
    this.setState(
      {
        values: { ...this.state.values, [entity.id]: entity.value },
      },
      () => this.props.onChange(this.collectEntities(this.state.values)),
    );

  handleRemove = (entityId) => {
    const values = omit(this.state.values, [entityId]);
    this.setState({ values }, () => this.props.onChange(this.collectEntities(this.state.values)));
  };

  render() {
    const { errors } = this.state;
    const { render, level } = this.props;
    const EntitiesProvider = ENTITY_PROVIDERS[level];
    return (
      <EntitiesProvider
        filterErrors={errors}
        filterValues={this.getValues()}
        onFilterChange={this.handleChange}
        onFilterValidate={this.handleValidate}
        onFilterAdd={this.handleAdd}
        onFilterRemove={this.handleRemove}
        render={(props) => <FilterEntitiesAddHandlerContainer {...props} render={render} />}
      />
    );
  }
}
