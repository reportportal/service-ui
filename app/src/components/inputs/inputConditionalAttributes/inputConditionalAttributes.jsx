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
} from 'components/filterEntities/constants';
import { getInputConditions } from 'common/constants/inputConditions';
import { AttributeEditor } from 'components/main/attributeList/editableAttribute/attributeEditor';
import { AttributeListField } from 'components/main/attributeList';
import styles from './inputConditionalAttributes.scss';

const cx = classNames.bind(styles);

@injectIntl
export class InputConditionalAttributes extends Component {
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
    launchId: PropTypes.string,
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
    launchId: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      opened: false,
      attributes: this.parseQueryAttributes(this.props.value),
    };
  }

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
      this.props.onChange({
        value: this.props.value.value,
        condition: condition.value,
      });
    }
  };

  parseQueryAttributes = (value) => {
    if (!value.value) return [];
    const attributes = value.value.split(',').map((item) => {
      if (item.includes(':')) {
        if (item.indexOf(':') === item.length - 1) {
          return {
            key: item,
            value: '',
          };
        } else {
          const values = item.split(':');
          return {
            key: `${values[0]}:`,
            value: values[1],
          };
        }
      } else {
        return {
          key: '',
          value: item,
        };
      }
    });
    return attributes;
  };

  onChangeTags = (tags) => {
    const newAttributes = [
      ...this.state.attributes,
      { key: this.parseTags(tags.key), value: this.parseTags(undefined, tags.value) },
    ];
    this.setState({ attributes: newAttributes });
    this.props.onChange({
      attributes: newAttributes,
      value: `${
        this.props.value.value.length > 0 ? `${this.props.value.value},` : ''
      }${this.parseTags(tags.key, tags.value)}`,
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

  parseTagsToString = (attributes) => {
    return attributes.map((attr) => `${attr.key}${attr.value}`).join(',');
  };

  onRemove = (attributes) => {
    this.setState({ attributes }, () =>
      this.props.onChange({
        attributes: this.state.attributes,
        value: this.parseTagsToString(attributes),
      }),
    );
  };

  parseTags = (key, value) => {
    if (key && value) {
      return `${key}:${value}`;
    }
    if (key) {
      return `${key}:`;
    }
    if (value) {
      return `${value}`;
    }
    return '';
  };

  render() {
    const { value, keyURLCreator, valueURLCreator, projectId, launchId } = this.props;
    const inputConditions = this.getConditions();
    return (
      <div className={cx('input-conditional-attributes', { opened: this.state.opened })}>
        <div className={cx('attributes-block')}>
          <AttributeListField
            value={this.state.attributes}
            showButton={false}
            editable={false}
            onChange={this.onRemove}
            customClass={cx('not-editable')}
          />
          <AttributeEditor
            keyURLCreator={keyURLCreator}
            valueURLCreator={valueURLCreator}
            projectId={projectId}
            launchId={launchId}
            onConfirm={this.onChangeTags}
          />
        </div>
        <div className={cx('conditions-block')} ref={this.setConditionsBlockRef}>
          <div className={cx('conditions-selector')} onClick={this.onClickConditionBlock}>
            <span className={cx('condition-selected')}>
              {inputConditions.length &&
                value &&
                value.condition &&
                inputConditions.filter((condition) => condition.value === value.condition)[0]
                  .shortLabel}
            </span>
            <i className={cx('arrow', { rotated: this.state.opened })} />
          </div>
          <div className={cx('conditions-list', { visible: this.state.opened })}>
            {inputConditions &&
              inputConditions.map((condition) => (
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
