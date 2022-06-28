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

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
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

export const AttributeEditor = ({
  attributes,
  onConfirm,
  onCancel,
  getURIKey,
  getURIValue,
  attribute,
  keyPlaceholder,
  valuePlaceholder,
}) => {
  const [touched, setTouched] = useState(false);
  const getValidationErrors = (key, value) => ({
    key: attributeKeyValidator(key),
    value: attribute.edited && attributeValueValidator(value),
  });

  const [state, setState] = useState({
    key: attribute.key,
    value: attribute.value,
    errors: touched && getValidationErrors(attribute.key, attribute.value),
    isKeyEdited: false,
  });

  const clearInputValues = () => setState({ key: '', value: '', errors: '', isKeyEdited: false });

  useEffect(() => {
    const { key, value } = attribute;
    setState({
      key,
      value,
      errors: touched && getValidationErrors(key, value),
      isKeyEdited: false,
    });
  }, [attribute]);

  const byKeyComparator = (attr, item, key, value) => attr.key === item && attr.value === value;

  const byValueComparator = (attr, item, key) => attr.key === key && attr.value === item;

  const handleKeyChange = (key) => {
    setState((oldState) => ({
      ...oldState,
      key: key || undefined,
      errors: touched && getValidationErrors(key, oldState.value),
    }));
  };

  const handleValueChange = (value) => {
    setState((oldState) => ({
      ...oldState,
      value,
      errors: touched && getValidationErrors(oldState.key, value),
    }));
  };

  const isAttributeUnique = () =>
    !attributes.some((attr) => attr.key === state.key && attr.value === state.value);

  const isAttributeEmpty = () => isEmpty(state.key) && isEmpty(state.value);

  const isFormValid = () =>
    !state.errors.key &&
    !state.errors.value &&
    isAttributeUnique() &&
    !isAttributeEmpty() &&
    !state.isKeyEdited;

  const handleSubmit = () => {
    if (!isFormValid()) {
      return;
    }
    const { key, value } = state;
    onConfirm({
      key,
      value,
    });
    clearInputValues();
  };

  const handleCancel = () => onCancel() || clearInputValues();
  const handleAttributeKeyInputChange = (text) => setState({ isKeyEdited: !!text });

  return (
    <div className={cx('attribute-editor')}>
      <div>
        <AttributeInput
          attributes={attributes}
          minLength={1}
          attributeComparator={byKeyComparator}
          getURI={getURIKey}
          creatable
          placeholder={keyPlaceholder}
          onChange={handleKeyChange}
          value={state.key}
          attributeKey={state.key}
          attributeValue={state.value}
          onInputChange={handleAttributeKeyInputChange}
          autocompleteVariant={'key-variant'}
        />
      </div>
      <div className={cx('separator')}>:</div>
      <div>
        <AttributeInput
          minLength={1}
          attributes={attributes}
          attributeComparator={byValueComparator}
          getURI={getURIValue(state.key)}
          creatable
          onChange={handleValueChange}
          value={state.value}
          placeholder={valuePlaceholder}
          attributeKey={state.key}
          attributeValue={state.value}
          isRequired
          autocompleteVariant={'value-variant'}
          error={state.errors.value}
          setTouched={setTouched}
        />
      </div>
      <div className={cx('buttons')}>
        <div
          className={cx('check-btn', { disabled: !isFormValid() })}
          onClick={isFormValid() ? handleSubmit : null}
        >
          {Parser(CheckIcon)}
        </div>
        <div className={cx('cross-btn')} onClick={handleCancel}>
          {Parser(CrossIcon)}
        </div>
      </div>
    </div>
  );
};

AttributeEditor.propTypes = {
  attributes: PropTypes.array,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  handleSubmit: PropTypes.func,
  getURIKey: PropTypes.func,
  getURIValue: PropTypes.func,
  intl: PropTypes.object.isRequired,
  attribute: PropTypes.object,
  keyPlaceholder: PropTypes.string,
  valuePlaceholder: PropTypes.string,
};
AttributeEditor.defaultProps = {
  attributes: [],
  handleSubmit: () => {},
  getURIKey: () => {},
  getURIValue: () => {},
  onConfirm: () => {},
  onCancel: () => {},
  keyURLCreator: null,
  valueURLCreator: null,
  attribute: {},
  keyPlaceholder: 'Key',
  valuePlaceholder: 'Value',
};
