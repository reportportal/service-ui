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
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
import Parser from 'html-react-parser';
import {
  validate,
  commonValidators,
  bindMessageToValidator,
  composeBoundValidators,
} from 'common/utils/validation';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import CircleCrossIcon from 'common/img/circle-cross-icon-inline.svg';
import CircleCheckIcon from 'common/img/circle-check-inline.svg';
import { isEmpty } from 'common/utils/validation/validatorHelpers';
import { activeProjectKeySelector } from 'controllers/user';
import { AttributeInput } from './attributeInput';
import styles from './attributeEditor.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  keyLabel: {
    id: 'AttributeEditor.keyLabel',
    defaultMessage: 'Key',
  },
  valueLabel: {
    id: 'AttributeEditor.valueLabel',
    defaultMessage: 'Value',
  },
});

const attributeKeyValidator = commonValidators.attributeKey;
const attributeValueValidator = composeBoundValidators([
  commonValidators.requiredField,
  bindMessageToValidator(validate.attributeValue, 'attributeValueLengthHint'),
]);
const attributeFilterValueValidator = bindMessageToValidator(
  validate.nonRequiredAttributeValueValidator,
  'attributeValueLengthHint',
);

@connect((state) => ({
  projectKey: activeProjectKeySelector(state),
}))
@injectIntl
export class AttributeEditor extends Component {
  static propTypes = {
    attributes: PropTypes.array,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    handleSubmit: PropTypes.func,
    invalid: PropTypes.bool,
    keyURLCreator: PropTypes.func,
    valueURLCreator: PropTypes.func,
    intl: PropTypes.object.isRequired,
    attribute: PropTypes.shape({
      edited: PropTypes.bool,
      system: PropTypes.bool,
      key: PropTypes.string,
      value: PropTypes.string,
    }),
    customClass: PropTypes.string,
    nakedView: PropTypes.bool,
    isAttributeValueRequired: PropTypes.bool,
    projectKey: PropTypes.string.isRequired,
  };

  static defaultProps = {
    attributes: [],
    handleSubmit: () => {},
    onConfirm: () => {},
    onCancel: () => {},
    keyURLCreator: null,
    valueURLCreator: null,
    invalid: false,
    attribute: {
      edited: true,
      system: false,
      key: '',
      value: '',
    },
    customClass: '',
    nakedView: false,
    isAttributeValueRequired: true,
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

  getAttributeValueValidator = (value) =>
    this.props.isAttributeValueRequired
      ? attributeValueValidator(value)
      : attributeFilterValueValidator(value);

  getValidationErrors = (key, value) => ({
    key: attributeKeyValidator(key),
    value: this.props.attribute.edited && this.getAttributeValueValidator(value),
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
      // prevent setting null from [downshift](https://www.npmjs.com/package/downshift#onchange) as attribute value
      value: value || undefined,
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
  clearErrors = () =>
    this.setState(() => ({
      errors: {
        key: undefined,
        value: undefined,
      },
    }));

  handleCancel = () => {
    this.props.onCancel() || this.clearInputValues();
    this.clearErrors();
  };

  handleAttributeKeyInputChange = (text) => this.setState({ isKeyEdited: !!text });

  render() {
    const {
      attributes,
      keyURLCreator,
      valueURLCreator,
      customClass,
      intl,
      nakedView,
      projectKey,
    } = this.props;
    return (
      <div className={cx('attribute-editor', customClass)}>
        <div className={cx('control')}>
          <FieldErrorHint error={this.state.errors.key} staticHint>
            <AttributeInput
              customClass={cx('input')}
              attributes={attributes}
              minLength={1}
              attributeComparator={this.byKeyComparator}
              getURI={keyURLCreator(projectKey)}
              creatable
              placeholder={intl.formatMessage(messages.keyLabel)}
              onChange={this.handleKeyChange}
              value={this.state.key}
              attributeKey={this.state.key}
              attributeValue={this.state.value}
              onInputChange={this.handleAttributeKeyInputChange}
              nakedView={nakedView}
            />
          </FieldErrorHint>
        </div>
        <div className={cx('control')}>
          <FieldErrorHint error={this.state.errors.value} staticHint>
            <AttributeInput
              customClass={cx('input')}
              minLength={1}
              attributes={attributes}
              attributeComparator={this.byValueComparator}
              getURI={valueURLCreator(projectKey, this.state.key)}
              creatable
              onChange={this.handleValueChange}
              value={this.state.value}
              placeholder={intl.formatMessage(messages.valueLabel)}
              attributeKey={this.state.key}
              attributeValue={this.state.value}
              nakedView={nakedView}
            />
          </FieldErrorHint>
        </div>
        <div className={cx('control')}>
          <div
            className={cx('icon', 'check-icon', { disabled: !this.isFormValid() })}
            onClick={this.isFormValid() ? this.handleSubmit : null}
          >
            {Parser(CircleCheckIcon)}
          </div>
        </div>
        <div className={cx('control')}>
          <div className={cx('icon')} onClick={this.handleCancel}>
            {Parser(CircleCrossIcon)}
          </div>
        </div>
      </div>
    );
  }
}
