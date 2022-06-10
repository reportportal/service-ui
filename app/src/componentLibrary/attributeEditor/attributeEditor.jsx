/*
 * Copyright 2022 EPAM Systems
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
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { activeProjectSelector } from 'controllers/user';
import {
  validate,
  commonValidators,
  bindMessageToValidator,
  composeBoundValidators,
} from 'common/utils/validation';
import { isEmpty } from 'common/utils/validation/validatorHelpers';
import CheckIcon from 'common/img/check-inline.svg';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { AttributeInput } from './attributeInput';
import styles from './attributeEditor.scss';

const cx = classNames.bind(styles);

const attributeKeyValidator = commonValidators.attributeKey;
const attributeValueValidator = composeBoundValidators([
  commonValidators.requiredField,
  bindMessageToValidator(validate.attributeValue, 'attributeValueLengthHint'),
]);

@connect((state) => ({
  projectId: activeProjectSelector(state),
}))
export class AttributeEditor extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    attributes: PropTypes.array,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    handleSubmit: PropTypes.func,
    invalid: PropTypes.bool,
    keyURLCreator: PropTypes.func,
    valueURLCreator: PropTypes.func,
    intl: PropTypes.object.isRequired,
    attribute: PropTypes.object,
    keyPlaceholder: PropTypes.string,
    valuePlaceholder: PropTypes.string,
  };

  static defaultProps = {
    projectId: null,
    attributes: [],
    handleSubmit: () => {},
    onConfirm: () => {},
    onCancel: () => {},
    keyURLCreator: null,
    valueURLCreator: null,
    invalid: false,
    attribute: {},
    keyPlaceholder: 'Key',
    valuePlaceholder: 'Value',
  };

  constructor(props) {
    super(props);

    this.state = {
      key: props.attribute.key,
      value: props.attribute.value,
      errors: this.getValidationErrors(props.attribute.key, props.attribute.value),
      isKeyEdited: false,
    };
  }

  getValidationErrors = (key, value) => ({
    key: attributeKeyValidator(key),
    value: this.props.attribute.edited && attributeValueValidator(value),
  });

  byKeyComparator = (attribute, item, key, value) =>
    attribute.key === item && attribute.value === value;

  byValueComparator = (attribute, item, key) => attribute.key === key && attribute.value === item;

  handleKeyChange = (key) => {
    this.setState((oldState) => ({
      // prevent setting null from [downshift](https://www.npmjs.com/package/downshift#onchange) as attribute key
      key: key || undefined,
      errors: this.getValidationErrors(key, oldState.value),
    }));
  };

  handleValueChange = (value) => {
    this.setState((oldState) => ({
      value,
      errors: this.getValidationErrors(oldState.key, value),
    }));
  };

  isAttributeUnique = () =>
    !this.props.attributes.some(
      (attribute) => attribute.key === this.state.key && attribute.value === this.state.value,
    );

  isAttributeEmpty = () => isEmpty(this.state.key) && isEmpty(this.state.value);

  isFormValid = () =>
    !this.state.errors.key &&
    !this.state.errors.value &&
    this.isAttributeUnique() &&
    !this.isAttributeEmpty() &&
    !this.state.isKeyEdited;

  handleSubmit = () => {
    if (!this.isFormValid()) {
      return;
    }
    const { key, value } = this.state;
    this.props.onConfirm({
      key,
      value,
    });
    this.clearInputValues();
  };

  clearInputValues = () => this.setState({ key: '', value: '' });

  handleCancel = () => this.props.onCancel() || this.clearInputValues();
  handleAttributeKeyInputChange = (text) => this.setState({ isKeyEdited: !!text });

  render() {
    const {
      projectId,
      attributes,
      keyURLCreator,
      valueURLCreator,
      keyPlaceholder,
      valuePlaceholder,
    } = this.props;
    return (
      <div className={cx('attribute-editor')}>
        <div>
          <AttributeInput
            attributes={attributes}
            minLength={1}
            attributeComparator={this.byKeyComparator}
            getURI={keyURLCreator(projectId)}
            creatable
            placeholder={keyPlaceholder}
            onChange={this.handleKeyChange}
            value={this.state.key}
            attributeKey={this.state.key}
            attributeValue={this.state.value}
            onInputChange={this.handleAttributeKeyInputChange}
            autocompleteVariant={'key-variant'}
          />
        </div>
        <div className={cx('separator')}>:</div>
        <div>
          <AttributeInput
            minLength={1}
            attributes={attributes}
            attributeComparator={this.byValueComparator}
            getURI={valueURLCreator(projectId, this.state.key)}
            creatable
            onChange={this.handleValueChange}
            value={this.state.value}
            placeholder={valuePlaceholder}
            attributeKey={this.state.key}
            attributeValue={this.state.value}
            autocompleteVariant={'value-variant'}
          />
        </div>
        <div className={cx('buttons')}>
          <div
            className={cx('check-btn', { disabled: !this.isFormValid() })}
            onClick={this.isFormValid() ? this.handleSubmit : null}
          >
            {Parser(CheckIcon)}
          </div>
          <div className={cx('cross-btn')} onClick={this.handleCancel}>
            {Parser(CrossIcon)}
          </div>
        </div>
      </div>
    );
  }
}
