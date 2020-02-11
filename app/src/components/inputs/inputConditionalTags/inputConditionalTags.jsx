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
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { AsyncMultipleAutocomplete } from 'components/inputs/autocompletes/asyncMultipleAutocomplete';
import {
  CONDITION_HAS,
  CONDITION_NOT_HAS,
  CONDITION_ANY,
  CONDITION_NOT_ANY,
} from 'components/filterEntities/constants';
import { getInputConditions } from 'common/constants/inputConditions';
import styles from './inputConditionalTags.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  tagsHint: {
    id: 'InputConditionalTags.tagsHint',
    defaultMessage: 'Please enter 1 or more characters',
  },
});

@injectIntl
export class InputConditionalTags extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    value: PropTypes.object,
    conditions: PropTypes.arrayOf(PropTypes.string),
    inputProps: PropTypes.object,
    placeholder: PropTypes.string,
    getURI: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
  };

  static defaultProps = {
    value: {},
    inputProps: {},
    placeholder: '',
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    conditions: [CONDITION_HAS, CONDITION_NOT_HAS, CONDITION_ANY, CONDITION_NOT_ANY],
  };
  state = {
    opened: false,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  onClickConditionBlock = () => {
    this.setState({ opened: !this.state.opened });
  };

  onClickConditionItem = (condition) => {
    if (condition.value !== this.props.value.condition) {
      this.setState({ opened: false });
      this.props.onChange({ value: this.props.value.value, condition: condition.value });
    }
  };

  onChangeTags = (tags) => {
    this.props.onChange({ value: this.parseTags(tags), condition: this.props.value.condition });
  };

  setConditionsBlockRef = (conditionsBlock) => {
    this.conditionsBlock = conditionsBlock;
  };
  getConditions = () => {
    const { conditions } = this.props;
    return getInputConditions(conditions);
  };
  handleClickOutside = (e) => {
    if (this.conditionsBlock && !this.conditionsBlock.contains(e.target) && this.state.opened) {
      this.setState({ opened: false });
    }
  };

  parseTags = (options) => options.join(',');

  render() {
    const { intl, value, getURI, placeholder, inputProps } = this.props;
    const formattedValue = value.value ? value.value.split(',') : [];
    return (
      <div className={cx('input-conditional-tags', { opened: this.state.opened })}>
        <AsyncMultipleAutocomplete
          placeholder={placeholder}
          beforeSearchPrompt={intl.formatMessage(messages.tagsHint)}
          minLength={1}
          getURI={getURI}
          creatable
          value={formattedValue}
          onChange={this.onChangeTags}
          inputProps={inputProps}
          customClass={cx('tags')}
        />
        <div className={cx('conditions-block')} ref={this.setConditionsBlockRef}>
          <div className={cx('conditions-selector')} onClick={this.onClickConditionBlock}>
            <span className={cx('condition-selected')}>
              {this.getConditions().length &&
                value.condition &&
                this.getConditions().filter((condition) => condition.value === value.condition)[0]
                  .shortLabel}
            </span>
            <i className={cx('arrow', { rotated: this.state.opened })} />
          </div>
          <div className={cx('conditions-list', { visible: this.state.opened })}>
            {this.getConditions() &&
              this.getConditions().map((condition) => (
                <div
                  key={condition.value}
                  className={cx('condition', {
                    active: condition.value === value.condition,
                    disabled: condition.disabled,
                  })}
                  onClick={() => {
                    !condition.disabled && this.onClickConditionItem(condition);
                  }}
                >
                  {condition.label}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }
}
