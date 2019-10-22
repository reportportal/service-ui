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
