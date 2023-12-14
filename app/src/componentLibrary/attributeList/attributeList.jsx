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

import React, { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { notSystemAttributePredicate } from 'common/utils/attributeUtils';
import { AttributeEditor } from 'componentLibrary/attributeEditor';
import { Button } from 'componentLibrary/button';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { ENTER_KEY_CODE, TAB_KEY_CODE } from 'common/constants/keyCodes';
import { EditableAttribute } from './editableAttribute';
import styles from './attributeList.scss';

const cx = classNames.bind(styles);

const attributeKeyValueRef = 'attributeKeyValueRef';
const crossIconRef = 'crossIconRef';
const attributeWrapperRef = 'attributeWrapperRef';

const scheduleUpdate = (update, timer = 0) => setTimeout(update, timer);

const handleChangeFocus = (node) => {
  if (node) {
    node.focus();
  }
};

export const AttributeList = ({
  attributes,
  onChange,
  onAddNew,
  disabled,
  getURIKey,
  getURIValue,
  newAttrMessage,
  maxLength,
  customClass,
  showButton,
  editable,
  attributesListClassname,
  editorDefaultOpen,
  autocompleteProps,
}) => {
  const addNewAttrRef = useRef(null);
  const attributesRefs = useRef(null);

  const addNewAttButtonRefCb = (node) => {
    addNewAttrRef.current = node;
  };

  const getAttributesRefsMap = () => {
    if (!attributesRefs.current) {
      attributesRefs.current = new Map();
    }

    return attributesRefs.current;
  };

  const addToAttributesRefsMap = (key, value) => {
    const attributesRefsMap = getAttributesRefsMap();

    if (attributesRefsMap.has(key)) {
      attributesRefsMap.set(key, Object.assign(attributesRefsMap.get(key), value));
    } else {
      attributesRefsMap.set(key, value);
    }
  };

  const handleAddNewAttrFocus = () => {
    scheduleUpdate(() => {
      if (addNewAttrRef.current) {
        addNewAttrRef.current.focus();
      }
    });
  };

  const getExistEditableAttr = () => {
    return attributes.find((attr) => attr.edited);
  };

  const getIndexEditableAttr = () => {
    return attributes.findIndex((attr) => attr.edited);
  };

  const isNewAttribute = (attribute) => !attribute.value;

  const getAttributesMapValue = (uniqueIdentifier, refName) => {
    const attributesRefsMap = getAttributesRefsMap();

    return attributesRefsMap.get(uniqueIdentifier)[refName];
  };

  const getAttributeUniqueKey = ({ key, value }) => (key ? `${key}_${value}` : value);

  const createChangeHandler = () => (attribute) => {
    const index = getIndexEditableAttr();
    const newAttributes = [...attributes];
    const { edited, ...newAttribute } = attribute;
    newAttributes[index] = newAttribute;
    onChange(newAttributes);

    if (isNewAttribute(attributes[index])) {
      handleAddNewAttrFocus();
    } else {
      scheduleUpdate(() =>
        handleChangeFocus(
          getAttributesMapValue(getAttributeUniqueKey(attribute), attributeWrapperRef),
        ),
      );
    }
  };

  const createRemoveHandler = (index) => () => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    onChange(newAttributes);
  };

  const createCancelEditHandler = (index) => () => {
    const newAttributes = [...attributes];
    if (isNewAttribute(attributes[index])) {
      newAttributes.splice(index, 1);

      handleAddNewAttrFocus();
    } else {
      const { edited, ...attribute } = newAttributes[index];
      newAttributes[index] = attribute;

      scheduleUpdate(() =>
        handleChangeFocus(
          getAttributesMapValue(getAttributeUniqueKey(attribute), attributeWrapperRef),
        ),
      );
    }

    onChange(newAttributes);

    return newAttributes;
  };

  const hasEditedAttribute = attributes.some((attribute) => !!attribute.edited);

  const createEditHandler = (index) => () => {
    let newAttributes;
    if (getExistEditableAttr()) {
      const oldIndex = getIndexEditableAttr();
      newAttributes = createCancelEditHandler(oldIndex)();
    }
    newAttributes = newAttributes || [...attributes];
    newAttributes[index] = {
      ...newAttributes[index],
      edited: true,
    };
    handleAddNewAttrFocus();
    onChange(newAttributes);
  };

  const editableAttr = getExistEditableAttr();
  const indexEditableAttr = getIndexEditableAttr();

  const availableAttributes = useMemo(
    () =>
      attributes.filter((attribute) => notSystemAttributePredicate(attribute) && !attribute.new),
    [attributes],
  );

  const removeFromAttributesRefsMap = (key) => {
    const attributesRefsMap = getAttributesRefsMap();

    attributesRefsMap.delete(key);
  };

  const createAttributeElementRefCb = (uniqueIdentifier, refName) => (node) => {
    if (node) {
      addToAttributesRefsMap(uniqueIdentifier, { [refName]: node });
    } else {
      removeFromAttributesRefsMap(uniqueIdentifier);
    }
  };

  const updateFocusOnRemove = (uniqueIdentifier) => {
    const attributesRefsMap = getAttributesRefsMap();
    const attributesRefsKeys = Array.from(attributesRefsMap.keys());
    const offsetIndexToLength = 1;

    const uniqueIdentifierIndex = attributesRefsKeys.findIndex((key) => key === uniqueIdentifier);

    const isLastAttributeRemoved =
      uniqueIdentifierIndex + offsetIndexToLength === attributesRefsKeys.length;

    if (isLastAttributeRemoved) {
      handleAddNewAttrFocus();
    } else {
      const nextItemIndex = uniqueIdentifierIndex + 1;
      const nextAttributeUniqueIdentifier = attributesRefsKeys[nextItemIndex];

      scheduleUpdate(() => {
        handleChangeFocus(
          getAttributesMapValue(nextAttributeUniqueIdentifier, attributeWrapperRef),
        );
      });
    }
  };

  const createAttributeContentKeyDownHandler = (uniqueIdentifier, handler, refName) => (event) => {
    const { keyCode, shiftKey } = event;

    if (keyCode === ENTER_KEY_CODE) {
      event.preventDefault();
      handler();

      if (refName === attributeKeyValueRef) {
        updateFocusOnRemove(uniqueIdentifier);
      }

      return;
    }

    if (keyCode === TAB_KEY_CODE && !shiftKey) {
      event.preventDefault();
      handleChangeFocus(getAttributesMapValue(uniqueIdentifier, refName));
    }
  };

  const createAttributeWrapperKeyDownHandler = (uniqueIdentifier) => (event) => {
    const { keyCode } = event;

    if (keyCode === ENTER_KEY_CODE) {
      handleChangeFocus(getAttributesMapValue(uniqueIdentifier, attributeKeyValueRef));
    }
  };

  return (
    <div className={cx(attributesListClassname)} data-automation-id={'attributesField'}>
      {editableAttr && (
        <AttributeEditor
          attribute={editableAttr}
          attributes={attributes}
          onChange={createChangeHandler()}
          onConfirm={createChangeHandler()}
          onRemove={createRemoveHandler(indexEditableAttr)}
          onEdit={editable && createEditHandler(indexEditableAttr)}
          onCancel={createCancelEditHandler(indexEditableAttr)}
          getURIKey={getURIKey}
          getURIValue={getURIValue}
          editorDefaultOpen={editorDefaultOpen}
          autocompleteProps={autocompleteProps}
        />
      )}
      <div className={cx('attributes-wrapper')}>
        {availableAttributes.length > 0 && (
          <span className={cx('attributes', { 'editable-attribute': editableAttr })}>
            {availableAttributes.map((attribute, i) => {
              const keyAttrValue = getAttributeUniqueKey(attribute);
              const editHandler = createEditHandler(i);
              const removeHandler = createRemoveHandler(i);
              const attributeCrossIconRefCb = createAttributeElementRefCb(
                keyAttrValue,
                crossIconRef,
              );
              const attributeKeyValueRefCb = createAttributeElementRefCb(
                keyAttrValue,
                attributeKeyValueRef,
              );
              const attributeWrapperRefCb = createAttributeElementRefCb(
                keyAttrValue,
                attributeWrapperRef,
              );
              const handleAttributeKeyValueKeyDown = createAttributeContentKeyDownHandler(
                keyAttrValue,
                editHandler,
                crossIconRef,
              );
              const handleCrossIconKeyDown = createAttributeContentKeyDownHandler(
                keyAttrValue,
                removeHandler,
                attributeKeyValueRef,
              );
              const handleAttributeWrapperKeyDown = createAttributeWrapperKeyDownHandler(
                keyAttrValue,
              );

              return (
                <EditableAttribute
                  key={keyAttrValue}
                  attribute={attribute}
                  attributes={availableAttributes}
                  editMode={attribute.edited}
                  onChange={createChangeHandler()}
                  onRemove={removeHandler}
                  onEdit={editable && editHandler}
                  onCancelEdit={createCancelEditHandler(i)}
                  disabled={disabled}
                  customClass={customClass}
                  keyValueRefCallback={attributeKeyValueRefCb}
                  crossIconRefCallback={attributeCrossIconRefCb}
                  wrapperRefCallback={attributeWrapperRefCb}
                  handleWrapperKeyDown={handleAttributeWrapperKeyDown}
                  handleAttributeKeyValueKeyDown={handleAttributeKeyValueKeyDown}
                  handleCrossIconKeyDown={handleCrossIconKeyDown}
                />
              );
            })}
          </span>
        )}
        {!hasEditedAttribute && !disabled && showButton && attributes.length < maxLength && (
          <Button
            refCallback={addNewAttButtonRefCb}
            customClassName={cx('button-focused')}
            startIcon={PlusIcon}
            onClick={onAddNew}
            variant={'text'}
            dataAutomationId={'addAttributeButton'}
          >
            {newAttrMessage || (
              <FormattedMessage id="AttributeList.addNew" defaultMessage="Add new" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
AttributeList.propTypes = {
  attributes: PropTypes.arrayOf(PropTypes.object),
  editedAttribute: PropTypes.object,
  disabled: PropTypes.bool,
  newAttrMessage: PropTypes.string,
  maxLength: PropTypes.number,
  customClass: PropTypes.string,
  onChange: PropTypes.func,
  onEdit: PropTypes.func,
  onAddNew: PropTypes.func,
  onRemove: PropTypes.func,
  getURIKey: PropTypes.func,
  getURIValue: PropTypes.func,
  showButton: PropTypes.bool,
  editable: PropTypes.bool,
  attributesListClassname: PropTypes.string,
  editorDefaultOpen: PropTypes.bool,
  autocompleteProps: PropTypes.object,
};
AttributeList.defaultProps = {
  attributes: [],
  editedAttribute: null,
  disabled: false,
  keyURLCreator: null,
  valueURLCreator: null,
  newAttrMessage: '',
  maxLength: Infinity,
  customClass: '',
  onChange: () => {},
  onRemove: () => {},
  onEdit: () => {},
  onAddNew: () => {},
  getURIKey: () => {},
  getURIValue: () => {},
  showButton: true,
  editable: true,
  attributesListClassname: '',
  editorDefaultOpen: false,
  autocompleteProps: {},
};
