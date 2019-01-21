import { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
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

  static getDerivedStateFromProps(props, state) {
    if (props.entities !== state.values && !isEqual(props.entities, state.prevEntities)) {
      return {
        values: props.entities,
        prevEntities: props.entities,
      };
    }
    return null;
  }

  state = {
    errors: {},
    values: this.props.entities,
    prevEntities: this.props.entities,
  };

  collectEntities = (values) =>
    Object.keys(values).reduce((acc, entityId) => {
      const value = values[entityId];
      return !this.isValidChange(entityId) ? acc : { ...acc, [entityId]: value };
    }, {});

  isValidChange = (entityId) => {
    const value = this.state.values[entityId] && this.state.values[entityId].value;
    if (!value) {
      return true;
    }
    return !this.state.errors[entityId];
  };

  handleChange = (entityId, value) => {
    this.setState(
      {
        values: { ...this.state.values, [entityId]: { ...this.state.values[entityId], ...value } },
      },
      () =>
        this.isValidChange(entityId) &&
        this.props.onChange(this.collectEntities(this.state.values)),
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
      (prevState) => ({
        values: { ...prevState.values, [entity.id]: entity.value },
      }),
      () =>
        entity.value.value !== null && this.props.onChange(this.collectEntities(this.state.values)),
    );

  handleRemove = (entityId) => {
    const values = omit(this.state.values, [entityId]);
    this.setState({ values }, () => this.props.onChange(this.collectEntities(this.state.values)));
  };

  render() {
    const { errors, values } = this.state;
    const { render, level } = this.props;
    const EntitiesProvider = ENTITY_PROVIDERS[level];
    return (
      <EntitiesProvider
        filterErrors={errors}
        filterValues={values}
        onFilterChange={this.handleChange}
        onFilterValidate={this.handleValidate}
        onFilterAdd={this.handleAdd}
        onFilterRemove={this.handleRemove}
        render={(props) => <FilterEntitiesAddHandlerContainer {...props} render={render} />}
      />
    );
  }
}
