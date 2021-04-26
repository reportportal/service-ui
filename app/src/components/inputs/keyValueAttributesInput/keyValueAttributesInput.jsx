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

import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import {
  CONDITION_HAS,
  CONDITION_NOT_HAS,
  CONDITION_ANY,
  CONDITION_NOT_ANY,
  ENTITY_ATTRIBUTE_VALUES,
  ENTITY_ATTRIBUTE_KEYS,
} from 'components/filterEntities/constants';
import { getInputConditions } from 'common/constants/inputConditions';
import { AttributeEditor } from 'components/main/attributeList/editableAttribute/attributeEditor/attributeEditor';
import { Attribute } from 'components/main/attributeList/editableAttribute/attribute/attribute';
import { activeFilterSelector } from 'controllers/filter';
import { connect } from 'react-redux';
import styles from './keyValueAttributesInput.scss';

const cx = classNames.bind(styles);
@connect((state) => ({
  filteredAttributes: activeFilterSelector(state),
}))
@injectIntl
export class KeyValueAttributesInput extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    value: PropTypes.object,
    conditions: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    valueURLCreator: PropTypes.func,
    keyURLCreator: PropTypes.func,
    projectId: PropTypes.string,
    filteredAttributes: PropTypes.object,
  };

  static defaultProps = {
    value: {},
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    valueURLCreator: () => {},
    keyURLCreator: () => {},
    conditions: [CONDITION_HAS, CONDITION_NOT_HAS, CONDITION_ANY, CONDITION_NOT_ANY],
    projectId: '',
    filteredAttributes: {},
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
    this.props.onChange({
      [tags.value ? ENTITY_ATTRIBUTE_VALUES : ENTITY_ATTRIBUTE_KEYS]: {
        filteringField: tags.value ? ENTITY_ATTRIBUTE_VALUES : ENTITY_ATTRIBUTE_KEYS,
        value: this.parseTags(Array.of(tags.value || tags.key)),
        condition: this.props.value.attributeKey.condition,
      },
    });
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
    const { value, keyURLCreator, valueURLCreator, filteredAttributes, projectId } = this.props;
    return (
      <>
        <div className={cx('attributes-block')}>
          {filteredAttributes &&
            filteredAttributes.conditions.map(
              (item) =>
                (item.attributeKey.value || item.attributeKey.value) && (
                  <Attribute
                    key={item.filteringField}
                    attribute={{ key: item.attributeKey.value, value: item.attributeValue.value }}
                    onRemove={() => {}}
                  />
                ),
            )}
        </div>
        <div className={cx('input-conditional-tags', { opened: this.state.opened })}>
          <AttributeEditor
            keyURLCreator={keyURLCreator}
            valueURLCreator={valueURLCreator}
            projectId={projectId}
            onConfirm={this.onChangeTags}
          />
          <div className={cx('conditions-block')} ref={this.setConditionsBlockRef}>
            <div className={cx('conditions-selector')} onClick={this.onClickConditionBlock}>
              <span className={cx('condition-selected')}>
                {this.getConditions().length &&
                  value &&
                  value.attributeKey &&
                  value.attributeKey.condition &&
                  this.getConditions().filter(
                    (condition) => condition.value === value.attributeKey.condition,
                  )[0].shortLabel}
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
      </>
    );
  }
}
