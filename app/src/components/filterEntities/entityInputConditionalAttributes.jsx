/*
 * Copyright 2021 EPAM Systems
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

import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { InputConditionalAttributes } from 'components/inputs/inputConditionalAttributes';
import { injectIntl } from 'react-intl';

@injectIntl
export class EntityInputConditionalAttributes extends PureComponent {
  static propTypes = {
    value: PropTypes.object.isRequired,
    title: PropTypes.string,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    customProps: PropTypes.object,
  };
  static defaultProps = {
    title: '',
    removable: true,
    placeholder: '',
    onChange: () => {},
    onRemove: () => {},
    customProps: {},
  };

  render() {
    const { value, onRemove, onChange, removable, title, customProps } = this.props;
    const { projectId, keyURLCreator, valueURLCreator } = customProps;

    return (
      <FieldFilterEntity title={title} removable={removable} onRemove={onRemove} stretchable>
        <InputConditionalAttributes
          value={value}
          onChange={onChange}
          keyURLCreator={keyURLCreator}
          valueURLCreator={valueURLCreator}
          projectId={projectId}
          isAttributeValueRequired={false}
        />
      </FieldFilterEntity>
    );
  }
}
