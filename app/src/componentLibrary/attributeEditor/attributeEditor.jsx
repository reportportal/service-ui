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

import { useEffect, useRef, useState } from 'react';
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
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { ENTER_KEY_CODE } from 'common/constants/keyCodes';
import { AttributeInput } from './attributeInput';
import styles from './attributeEditor.scss';

const cx = classNames.bind(styles);

const attributeKeyValidator = commonValidators.attributeKey;
const attributeValueValidator = composeBoundValidators([
  commonValidators.requiredField,
  bindMessageToValidator(validate.attributeValue, 'attributeValueLengthHint'),
]);
const attributeFilterValueValidator = bindMessageToValidator(
  validate.nonRequiredAttributeValueValidator,
  'attributeValueLengthHint',
);

export const AttributeEditor = ({
  attributes,
  onConfirm,
  onCancel,
  getURIKey,
  getURIValue,
  attribute,
  keyPlaceholder,
  valuePlaceholder,
  keyLabel,
  valueLabel,
  editorDefaultOpen,
  autocompleteProps,
  isAttributeValueRequired,
}) => {
  const [keyTouched, setTouchKey] = useState(false);
  const [valueTouched, setTouchValue] = useState(false);

  const getAttributeValueValidator = (value) =>
    isAttributeValueRequired
      ? attributeValueValidator(value)
      : attributeFilterValueValidator(value);

  const getValidationErrors = (key, value) => ({
    key: attributeKeyValidator(key),
    value: attribute.edited && valueTouched && getAttributeValueValidator(value),
  });

  const keyEditorRef = useRef(null);

  const [state, setState] = useState({
    key: attribute.key,
    value: attribute.value,
    errors: getValidationErrors(attribute.key, attribute.value),
    isKeyEdited: false,
  });

  const clearInputValues = () => setState({ key: '', value: '', errors: '', isKeyEdited: false });

  useEffect(() => {
    if (keyEditorRef.current) {
      keyEditorRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const { key, value } = attribute;
    setState({ key, value, errors: getValidationErrors(key, value), isKeyEdited: false });
  }, [attribute]);

  const byKeyComparator = (attr, item, key, value) => attr.key === item && attr.value === value;

  const byValueComparator = (attr, item, key) => attr.key === key && attr.value === item;

  const handleKeyChange = (key) => {
    setState({
      ...state,
      key: key || undefined,
      errors: getValidationErrors(key, state.value),
    });
  };

  const handleValueChange = (value) => {
    setState({
      ...state,
      value,
      errors: getValidationErrors(state.key, value),
    });
  };

  const isAttributeUnique = () =>
    !attributes.some(
      (attr) =>
        (attr.key === state.key || (!state.key && attr.key === null)) && attr.value === state.value,
    );

  const isAttributeEmpty = () => isEmpty(state.key) && isEmpty(state.value);

  const isFormValid = () =>
    (isAttributeValueRequired ? state.value : true) &&
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
  const isCancelButtonDisabled =
    editorDefaultOpen && attribute.new && attributes.length === 1 && isAttributeEmpty();
  const handleCancel = () => {
    if (isCancelButtonDisabled) {
      return null;
    } else if (
      editorDefaultOpen &&
      attribute.new &&
      attributes.length === 1 &&
      !isAttributeEmpty()
    ) {
      return clearInputValues();
    }
    return onCancel();
  };
  const handleAttributeKeyInputChange = (text) => setState({ ...state, isKeyEdited: !!text });

  const isValidForm = isFormValid();

  const handleKeyDown = (handler) => ({ keyCode }) => {
    if (keyCode === ENTER_KEY_CODE) {
      handler();

      if (keyEditorRef.current) {
        keyEditorRef.current.focus();
      }
    }
  };

  const refFunction = (node) => {
    keyEditorRef.current = node;
  };

  const getAutocompleteProps = (allAutocompleteProps, label) => ({
    ...allAutocompleteProps,
    inputProps: {
      ...allAutocompleteProps?.inputProps,
      label,
    },
  });

  return (
    <div className={cx('attribute-editor', { 'with-labels': !!(keyLabel || valueLabel) })}>
      <FieldErrorHint
        provideHint={false}
        error={state.errors.key}
        touched={keyTouched}
        setTouch={setTouchKey}
        dataAutomationId="keyField"
      >
        <AttributeInput
          refFunction={refFunction}
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
          optionVariant="key-variant"
          menuClassName={cx('menu')}
          {...getAutocompleteProps(autocompleteProps, keyLabel)}
        />
      </FieldErrorHint>
      <div className={cx('separator')}>:</div>
      <FieldErrorHint
        provideHint={false}
        error={state.errors.value}
        touched={valueTouched}
        setTouch={setTouchValue}
        dataAutomationId="valueField"
      >
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
          isRequired={isAttributeValueRequired}
          optionVariant="value-variant"
          menuClassName={cx('menu')}
          {...getAutocompleteProps(autocompleteProps, valueLabel)}
        />
      </FieldErrorHint>
      <div className={cx('buttons')}>
        <div
          tabIndex={isValidForm ? 0 : -1}
          className={cx('check-btn', { disabled: !isValidForm })}
          onClick={isValidForm ? handleSubmit : null}
          onKeyDown={isValidForm ? handleKeyDown(handleSubmit) : null}
          data-automation-id="saveAttributeButton"
        >
          {Parser(CheckIcon)}
        </div>
        <div
          tabIndex={!isCancelButtonDisabled ? 0 : -1}
          className={cx('cross-btn', { disabled: isCancelButtonDisabled })}
          onClick={handleCancel}
          onKeyDown={handleKeyDown(handleCancel)}
          data-automation-id="cancelAttributeButton"
        >
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
  keyURLCreator: PropTypes.func,
  valueURLCreator: PropTypes.func,
  handleSubmit: PropTypes.func,
  getURIKey: PropTypes.func,
  getURIValue: PropTypes.func,
  attribute: PropTypes.object,
  keyPlaceholder: PropTypes.string,
  valuePlaceholder: PropTypes.string,
  keyLabel: PropTypes.string,
  valueLabel: PropTypes.string,
  editorDefaultOpen: PropTypes.bool,
  autocompleteProps: PropTypes.object,
  isAttributeValueRequired: PropTypes.bool,
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
  keyLabel: '',
  valueLabel: '',
  editorDefaultOpen: false,
  autocompleteProps: {},
  isAttributeValueRequired: true,
};
