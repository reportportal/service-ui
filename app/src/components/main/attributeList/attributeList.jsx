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

import { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { notSystemAttributePredicate } from 'common/utils/attributeUtils';
import { EditableAttribute } from './editableAttribute';
import styles from './attributeList.scss';

const cx = classNames.bind(styles);

const createChangeHandler = (attributes, index, onChange) => (attribute) => {
  const newAttributes = [...attributes];
  const { edited, ...newAttribute } = attribute;
  newAttributes[index] = newAttribute;
  onChange(newAttributes);
};

const createRemoveHandler = (attributes, index, onChange) => () => {
  const newAttributes = [...attributes];
  newAttributes.splice(index, 1);
  onChange(newAttributes);
};

const isNewAttribute = (attribute) => !attribute.value;

const createCancelEditHandler = (attributes, index, onChange) => () => {
  const newAttributes = [...attributes];
  if (isNewAttribute(attributes[index])) {
    newAttributes.splice(index, 1);
  } else {
    const { edited, ...attribute } = newAttributes[index];
    newAttributes[index] = attribute;
  }
  onChange(newAttributes);
};

const hasEditedAttribute = (attributes) => attributes.some((attribute) => !!attribute.edited);

const createEditHandler = (attributes, index, onChange) => () => {
  if (hasEditedAttribute(attributes)) return;
  const newAttributes = [...attributes];
  newAttributes[index] = {
    ...newAttributes[index],
    edited: true,
  };
  onChange(newAttributes);
};

export const AttributeList = ({
  attributes,
  onChange,
  onAddNew,
  disabled,
  keyURLCreator,
  valueURLCreator,
}) => (
  <Fragment>
    {attributes.filter(notSystemAttributePredicate).map((attribute, i, filteredAttributes) => (
      <EditableAttribute
        key={`${attribute.key}_${attribute.value}`}
        attribute={attribute}
        attributes={filteredAttributes}
        editMode={attribute.edited}
        onChange={createChangeHandler(attributes, i, onChange)}
        onRemove={createRemoveHandler(attributes, i, onChange)}
        onEdit={createEditHandler(attributes, i, onChange)}
        onCancelEdit={createCancelEditHandler(attributes, i, onChange)}
        disabled={disabled}
        keyURLCreator={keyURLCreator}
        valueURLCreator={valueURLCreator}
      />
    ))}
    {!hasEditedAttribute(attributes) && !disabled && (
      <div className={cx('add-new-button')} onClick={onAddNew}>
        + <FormattedMessage id="AttributeList.addNew" defaultMessage="Add new" />
      </div>
    )}
  </Fragment>
);
AttributeList.propTypes = {
  attributes: PropTypes.arrayOf(PropTypes.object),
  editedAttribute: PropTypes.object,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onEdit: PropTypes.func,
  onAddNew: PropTypes.func,
  onRemove: PropTypes.func,
  keyURLCreator: PropTypes.func,
  valueURLCreator: PropTypes.func,
};
AttributeList.defaultProps = {
  attributes: [],
  editedAttribute: null,
  disabled: false,
  onChange: () => {},
  onRemove: () => {},
  onEdit: () => {},
  onAddNew: () => {},
  keyURLCreator: null,
  valueURLCreator: null,
};
