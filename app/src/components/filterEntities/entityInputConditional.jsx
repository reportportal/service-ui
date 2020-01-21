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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { InputConditional } from 'components/inputs/inputConditional';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';

const messages = defineMessages({
  placeholder: {
    id: 'entityInputConditional.defaultPlaceholder',
    defaultMessage: 'Enter name',
  },
});

@injectIntl
export class EntityInputConditional extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    title: PropTypes.string,
    smallSize: PropTypes.bool,
    removable: PropTypes.bool,
    onChange: PropTypes.func,
    onRemove: PropTypes.func,
    placeholder: PropTypes.shape({
      id: PropTypes.string,
      defaultMessage: PropTypes.string,
    }),
    maxLength: PropTypes.number,
    customProps: PropTypes.object,
    error: PropTypes.string,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
  };
  static defaultProps = {
    title: '',
    smallSize: false,
    removable: true,
    onChange: () => {},
    onRemove: () => {},
    onBlur: () => {},
    onFocus: () => {},
    placeholder: messages.placeholder,
    maxLength: 128,
    customProps: {},
    error: null,
  };
  render() {
    const {
      intl,
      value,
      onRemove,
      removable,
      title,
      smallSize,
      customProps,
      onChange,
      maxLength,
      placeholder,
      error,
      ...rest
    } = this.props;
    return (
      <FieldErrorHint error={error} {...rest}>
        <FieldFilterEntity
          title={title}
          smallSize={smallSize}
          removable={removable}
          onRemove={onRemove}
        >
          <InputConditional
            error={error}
            maxLength={maxLength}
            placeholder={intl.formatMessage(messages.placeholder)}
            onChange={onChange}
            value={value}
            touched
            onBlur={this.props.onBlur}
            onFocus={this.props.onFocus}
            {...customProps}
          />
        </FieldFilterEntity>
      </FieldErrorHint>
    );
  }
}
