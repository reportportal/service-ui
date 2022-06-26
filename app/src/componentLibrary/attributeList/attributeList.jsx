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

import { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { notSystemAttributePredicate } from 'common/utils/attributeUtils';
import { AttributeEditor } from 'componentLibrary/attributeEditor';
import { Button } from 'componentLibrary/button';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { EditableAttribute } from './editableAttribute';
import styles from './attributeList.scss';

const cx = classNames.bind(styles);

export const AttributeList = ({
  attributes,
  onChange,
  onAddNew,
  disabled,
  keyURLCreator,
  valueURLCreator,
  newAttrMessage,
  maxLength,
  customClass,
  showButton,
  editable,
  trackEvent,
  eventsInfo,
  projectId,
}) => {
  const getExistEditableAttr = () => {
    return attributes.find((attr) => attr.edited);
  };

  const getIndexEditableAttr = () => {
    return attributes.findIndex((attr) => attr.edited);
  };

  const createChangeHandler = () => (attribute) => {
    const index = getIndexEditableAttr();
    const newAttributes = [...attributes];
    const { edited, ...newAttribute } = attribute;
    newAttributes[index] = newAttribute;
    onChange(newAttributes);
    if (Object.keys(eventsInfo).length > 0) {
      trackEvent(eventsInfo.addAttribute);
    }
  };

  const createRemoveHandler = (index) => () => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    onChange(newAttributes);
  };

  const isNewAttribute = (attribute) => !attribute.value;

  const createCancelEditHandler = (index) => () => {
    const newAttributes = [...attributes];
    if (isNewAttribute(attributes[index])) {
      newAttributes.splice(index, 1);
    } else {
      const { edited, ...attribute } = newAttributes[index];
      newAttributes[index] = attribute;
    }
    onChange(newAttributes);
    return newAttributes;
  };

  const hasEditedAttribute = () => attributes.some((attribute) => !!attribute.edited);

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
    onChange(newAttributes);
  };

  const editableAttr = getExistEditableAttr();
  const indexEditableAttr = getIndexEditableAttr();

  return (
    <Fragment>
      {editableAttr ? (
        <div className={cx('editor-wrapper')}>
          <AttributeEditor
            attribute={editableAttr}
            onChange={createChangeHandler()}
            onConfirm={createChangeHandler()}
            onRemove={createRemoveHandler(indexEditableAttr)}
            onEdit={editable && createEditHandler(indexEditableAttr)}
            onCancel={createCancelEditHandler(indexEditableAttr)}
            keyURLCreator={keyURLCreator}
            valueURLCreator={valueURLCreator}
            projectId={projectId}
            trackEvent={trackEvent}
          />
        </div>
      ) : (
        ''
      )}
      {attributes
        .filter((attribute) => notSystemAttributePredicate(attribute) && !attribute.new)
        .map((attribute, i, filteredAttributes) => (
          <EditableAttribute
            key={`${attribute.key}_${attribute.value}`}
            attribute={attribute}
            attributes={filteredAttributes}
            editMode={attribute.edited}
            onChange={createChangeHandler()}
            onRemove={createRemoveHandler(i)}
            onEdit={editable && createEditHandler(i)}
            onCancelEdit={createCancelEditHandler(i)}
            disabled={disabled}
            keyURLCreator={keyURLCreator}
            valueURLCreator={valueURLCreator}
            customClass={customClass}
          />
        ))}
      {!hasEditedAttribute() && !disabled && showButton && attributes.length < maxLength && (
        <Button startIcon={PlusIcon} onClick={onAddNew} variant={'text'}>
          {newAttrMessage || (
            <FormattedMessage id="AttributeList.addNew" defaultMessage="Add new" />
          )}
        </Button>
      )}
    </Fragment>
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
  keyURLCreator: PropTypes.func,
  valueURLCreator: PropTypes.func,
  showButton: PropTypes.bool,
  editable: PropTypes.bool,
  trackEvent: PropTypes.func,
  eventsInfo: PropTypes.object,
  projectId: PropTypes.string,
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
  showButton: true,
  editable: true,
  trackEvent: () => {},
  eventsInfo: {},
  projectId: '',
};
