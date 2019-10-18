/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
import { filterValueShape } from '../propTypes';
import { FilterEntitiesAddHandlerContainer } from './filterEntitiesAddHandlerContainer';

const ENTITY_PROVIDERS = {
  [LEVEL_LAUNCH]: LaunchLevelEntities,
  [LEVEL_SUITE]: SuiteLevelEntities,
  [LEVEL_TEST]: SuiteLevelEntities,
  [LEVEL_STEP]: StepLevelEntities,
};

export class FilterEntitiesContainer extends Component {
  static propTypes = {
    entities: PropTypes.objectOf(filterValueShape),
    onChange: PropTypes.func,
    render: PropTypes.func.isRequired,
    level: PropTypes.string,
    entitiesProvider: PropTypes.elementType,
  };

  static defaultProps = {
    entities: {},
    onChange: () => {},
    entitiesProvider: null,
    level: '',
  };

  static getDerivedStateFromProps(props, state) {
    if (props.entities !== state.values && !isEqual(props.entities, state.prevEntities)) {
      return {
        errors: {},
        values: props.entities,
        prevEntities: props.entities,
        visibleFilters: Object.keys(props.entities),
      };
    }
    return null;
  }
  state = {
    errors: {},
    values: this.props.entities,
    prevEntities: this.props.entities,
    visibleFilters: Object.keys(this.props.entities),
  };
  collectEntities = (values) =>
    Object.keys(values).reduce((acc, entityId) => {
      const value = values[entityId];
      return this.isValidChange(entityId)
        ? { ...acc, [entityId]: value }
        : { ...acc, [entityId]: { ...value, value: '' } };
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

  handleAdd = (entities) => {
    this.setState(
      (prevState) => {
        let entitiesObj;
        let entitiesId;

        if (Array.isArray(entities)) {
          entitiesObj = entities.reduce(
            (acc, entity) => ({ ...acc, [entity.id]: entity.value }),
            {},
          );
          entitiesId = entities.map((entity) => entity.id);
        } else {
          entitiesObj = { [entities.id]: entities.value };
          entitiesId = [entities.id];
        }

        return {
          values: { ...prevState.values, ...entitiesObj },
          visibleFilters: [...prevState.visibleFilters, ...entitiesId],
        };
      },
      () => this.props.onChange(this.collectEntities(this.state.values)),
    );
  };

  handleRemove = (entityId) => {
    this.setState(
      (prevState) => {
        let values;
        let visibleFilters;
        if (Array.isArray(entityId)) {
          values = omit(prevState.values, entityId);
          visibleFilters = prevState.visibleFilters.filter((item) => !entityId.includes(item));
        } else {
          values = omit(prevState.values, [entityId]);
          visibleFilters = prevState.visibleFilters.filter((item) => item !== entityId);
        }
        return { values, visibleFilters };
      },
      () => this.props.onChange(this.collectEntities(this.state.values)),
    );
  };

  render() {
    const { errors, values, visibleFilters } = this.state;
    const { render, level, entitiesProvider } = this.props;
    const EntitiesProvider = entitiesProvider || ENTITY_PROVIDERS[level];
    return (
      <EntitiesProvider
        visibleFilters={visibleFilters}
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
