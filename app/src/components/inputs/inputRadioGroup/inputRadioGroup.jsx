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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InputRadio } from 'components/inputs/inputRadio';
import styles from './inputRadioGroup.scss';

const cx = classNames.bind(styles);

export class InputRadioGroup extends PureComponent {
  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        ownValue: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        disabled: PropTypes.bool,
        tooltip: PropTypes.string,
      }),
    ),
    inline: PropTypes.bool,
    inputGroupClassName: PropTypes.string,
    mode: PropTypes.string,
  };
  static defaultProps = {
    options: [],
    inline: false,
    inputGroupClassName: '',
    mode: '',
  };
  renderRadioInputs = () => {
    const { options, value, mode } = this.props;
    return options.map((item, index) => {
      const { label, ownValue, tooltip, ...rest } = item;
      const onChange = () => this.props.onChange(ownValue);
      return (
        <div
          className={cx([
            'radio-group-item',
            {
              'radio-group-item-first': index === 0,
            },
          ])}
          key={ownValue}
        >
          <InputRadio
            value={value}
            ownValue={ownValue}
            onChange={onChange}
            mode={mode}
            title={tooltip}
            {...rest}
          >
            {label}
          </InputRadio>
        </div>
      );
    });
  };
  render() {
    const { inline, inputGroupClassName } = this.props;
    return (
      <div
        className={cx(
          ['radio-group'],
          {
            'radio-group-inline': inline,
          },
          inputGroupClassName,
        )}
      >
        {this.renderRadioInputs()}
      </div>
    );
  }
}
