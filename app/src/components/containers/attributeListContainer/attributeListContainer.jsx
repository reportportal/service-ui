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

import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import className from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { EditableAttributeList } from 'componentLibrary/attributeList/editableAttributeList';
import { Checkbox } from 'componentLibrary/checkbox';
import { FieldProvider } from 'components/fields';
import styles from './attributeListContainer.scss';

const cx = className.bind(styles);

const messages = defineMessages({
  attributesNote: {
    id: 'AttributesContainer.attributesNote',
    defaultMessage: 'Send notifications about launches containing specified attributes',
  },
  attributesNotActive: {
    id: 'AttributesContainer.attributesNotActive',
    defaultMessage: 'Attributes are non active. To activate please select checkbox ‘Attributes’',
  },
  addAttribute: {
    id: 'AttributesContainer.addAttribute',
    defaultMessage: 'Add Attribute',
  },
  attributes: {
    id: 'AttributesContainer.attributes',
    defaultMessage: 'Attributes',
  },
});

export const AttributeListContainer = ({
  name,
  onAddNewAttribute,
  disabled,
  shown,
  setShowEditor,
  keyURLCreator,
  valueURLCreator,
  change,
  defaultOpen,
  withControl,
  attributesValue,
  editable,
  attributes,
  attributesListClassname,
  withoutProvider,
  ...rest
}) => {
  const { formatMessage } = useIntl();
  const projectId = useSelector(activeProjectSelector);
  const getURIKey = keyURLCreator(projectId);
  const getURIValue = (key) => valueURLCreator(projectId, key);

  const attributesCaption =
    shown || (!shown && !attributesValue?.length)
      ? formatMessage(messages.attributesNote)
      : formatMessage(messages.attributesNotActive);

  const attributeControlHandler = (e) => {
    setShowEditor(e.target.checked);
    const filteredAttributes = attributesValue.reduce((acc, curr) => {
      const attr = { ...curr };
      if (attr.new) return [...acc];
      if (attr.edited) {
        delete attr.edited;
      }
      return [...acc, attr];
    }, []);

    change(name, filteredAttributes);
  };

  const AttributeList = (props) => (
    <EditableAttributeList
      getURIKey={getURIKey}
      getURIValue={getURIValue}
      newAttrMessage={formatMessage(messages.addAttribute)}
      attributesListClassname={attributesListClassname}
      defaultOpen={defaultOpen}
      onChange={(v) => change(name, v)}
      onAddNewAttribute={onAddNewAttribute}
      disabled={disabled}
      {...props}
    />
  );

  return (
    <>
      {withControl && (
        <>
          <Checkbox value={shown} onChange={attributeControlHandler}>
            {formatMessage(messages.attributes)}
          </Checkbox>
          <span className={cx('description')}>{attributesCaption}</span>
        </>
      )}
      {withoutProvider ? (
        <AttributeList attributes={attributes} {...rest} />
      ) : (
        <FieldProvider name={name} {...rest}>
          <AttributeList />
        </FieldProvider>
      )}
    </>
  );
};
AttributeListContainer.propTypes = {
  name: PropTypes.string,
  onAddNewAttribute: PropTypes.func,
  disabled: PropTypes.bool,
  setShowEditor: PropTypes.func,
  shown: PropTypes.bool,
  keyURLCreator: PropTypes.func,
  valueURLCreator: PropTypes.func,
  withControl: PropTypes.bool,
  change: PropTypes.func,
  defaultOpen: PropTypes.bool,
  attributesValue: PropTypes.arrayOf(PropTypes.object),
  attributes: PropTypes.arrayOf(PropTypes.object),
  editable: PropTypes.bool,
  attributesListClassname: PropTypes.string,
  withoutProvider: PropTypes.bool,
};
AttributeListContainer.defaultProps = {
  name: '',
  onAddNewAttribute: () => {},
  disabled: false,
  setShowEditor: () => {},
  shown: false,
  keyURLCreator: () => {},
  valueURLCreator: () => {},
  withControl: false,
  change: () => {},
  defaultOpen: false,
  attributesValue: [],
  attributes: [],
  editable: false,
  attributesListClassname: '',
  withoutProvider: true,
};
