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
import {
  CONDITION_HAS,
  CONDITION_NOT_HAS,
  CONDITION_ANY,
  CONDITION_NOT_ANY,
} from 'components/filterEntities/constants';
import { getInputConditions } from 'common/constants/inputConditions';
import { AttributeEditor } from 'components/main/attributeList/editableAttribute/attributeEditor';
import { AttributeListField } from 'components/main/attributeList';
import { formatAttribute, parseQueryAttributes } from 'common/utils/attributeUtils';
import styles from './inputConditionalAttributes.scss';

const cx = classNames.bind(styles);

export class InputConditionalAttributes extends Component {
  static propTypes = {
    value: PropTypes.object,
    conditions: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    valueURLCreator: PropTypes.func,
    keyURLCreator: PropTypes.func,
    projectKey: PropTypes.string.isRequired,
    isAttributeKeyRequired: PropTypes.bool,
    isAttributeValueRequired: PropTypes.bool,
    canAddSinglePair: PropTypes.bool,
    disabled: PropTypes.bool,
    browserTooltipTitle: PropTypes.string,
    withValidationMessage: PropTypes.bool,
  };

  static defaultProps = {
    value: {},
    onChange: () => {},
    valueURLCreator: () => {},
    keyURLCreator: () => {},
    conditions: [CONDITION_HAS, CONDITION_NOT_HAS, CONDITION_ANY, CONDITION_NOT_ANY],
    browserTooltipTitle: '',
    isAttributeKeyRequired: false,
    isAttributeValueRequired: true,
    canAddSinglePair: false,
    disabled: false,
    withValidationMessage: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      opened: false,
      attributes: parseQueryAttributes(props.value),
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value.value !== this.props.value.value) {
      this.updateStateAttributes();
    }
  }

  updateStateAttributes = () => {
    this.setState({ attributes: parseQueryAttributes(this.props.value) });
  };

  onClickConditionBlock = () => {
    this.setState({ opened: !this.state.opened });
  };

  onClickConditionItem = (condition) => {
    if (condition.value !== this.props.value.condition) {
      this.setState({ opened: false });
      this.props.onChange({
        value: this.props.value.value,
        condition: condition.value,
      });
    }
  };

  onChangeAttributes = (attribute) => {
    const { value = '' } = this.props.value;
    const newAttributes = [
      ...this.state.attributes,
      { key: attribute.key || '', value: attribute.value || '' },
    ];
    this.setState({ attributes: newAttributes });
    this.props.onChange({
      attributes: newAttributes,
      value: `${value.length > 0 ? `${value},` : ''}${formatAttribute({
        key: attribute.key,
        value: attribute.value,
      })}`,
      condition: this.props.value.condition,
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

  formatAttributesToString = (attributes) => {
    return attributes.map((attr) => formatAttribute(attr)).join(',');
  };

  onRemove = (attributes) => {
    this.setState({ attributes }, () =>
      this.props.onChange({
        attributes: this.state.attributes,
        value: this.formatAttributesToString(attributes),
      }),
    );
  };

  render() {
    const {
      value,
      keyURLCreator,
      valueURLCreator,
      projectKey,
      isAttributeKeyRequired,
      isAttributeValueRequired,
      canAddSinglePair,
      disabled,
      browserTooltipTitle,
      withValidationMessage,
    } = this.props;
    const inputConditions = this.getConditions();
    const hideEdit = canAddSinglePair && this.state?.attributes?.length;

    return (
      <div
        className={cx('input-conditional-attributes', {
          opened: this.state.opened,
          disabled,
        })}
        title={browserTooltipTitle}
      >
        <div className={cx('attributes-block')}>
          <AttributeListField
            value={this.state.attributes}
            showButton={false}
            editable={false}
            onChange={this.onRemove}
          />
          {!hideEdit && (
            <AttributeEditor
              keyURLCreator={keyURLCreator}
              valueURLCreator={valueURLCreator}
              projectKey={projectKey}
              onConfirm={this.onChangeAttributes}
              nakedView
              isAttributeKeyRequired={isAttributeKeyRequired}
              isAttributeValueRequired={isAttributeValueRequired}
              withValidationMessage={withValidationMessage}
            />
          )}
        </div>
        <div className={cx('conditions-block')} ref={this.setConditionsBlockRef}>
          <div className={cx('conditions-selector')} onClick={this.onClickConditionBlock}>
            <span className={cx('condition-selected')}>
              {inputConditions.length &&
                value?.condition &&
                inputConditions.filter((condition) => condition.value === value.condition)[0]
                  .shortLabel}
            </span>
            <i className={cx('arrow', { rotated: this.state.opened })} />
          </div>
          <div className={cx('conditions-list', { visible: this.state.opened })}>
            {inputConditions?.map((condition) => (
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
