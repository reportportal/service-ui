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
import { AsyncAutocomplete } from 'components/inputs/autocompletes/asyncAutocomplete';

export class AttributeInput extends Component {
  static propTypes = {
    attributes: PropTypes.array,
    attributeKey: PropTypes.string,
    attributeValue: PropTypes.string,
    attributeComparator: PropTypes.func,
  };

  static defaultProps = {
    attributes: [],
    attributeKey: null,
    attributeValue: null,
    attributeComparator: () => {},
  };

  isAttributeUnique = (value) => {
    const { attributes, attributeKey, attributeValue, attributeComparator } = this.props;
    return !attributes.find((attribute) =>
      attributeComparator(attribute, value, attributeKey, attributeValue),
    );
  };

  filterOption = (item) => {
    const { attributes, attributeKey, attributeValue, attributeComparator } = this.props;
    return !attributes.find((attribute) =>
      attributeComparator(attribute, item, attributeKey, attributeValue),
    );
  };

  render() {
    const { attributes, attributeKey, attributeValue, attributeComparator, ...rest } = this.props;
    return (
      <AsyncAutocomplete
        {...rest}
        filterOption={this.filterOption}
        isOptionUnique={this.isAttributeUnique}
      />
    );
  }
}
