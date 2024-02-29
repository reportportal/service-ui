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
import className from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { Checkbox } from 'componentLibrary/checkbox';
import { AttributeListContainer } from 'components/containers/attributeListContainer';
import styles from './attributeListFormField.scss';

const cx = className.bind(styles);

const messages = defineMessages({
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

export const AttributeListFormField = ({
  shown,
  name,
  changeValue,
  setShowEditor,
  value,
  attributesNote,
  ...rest
}) => {
  const { formatMessage } = useIntl();

  const attributeControlHandler = (e) => {
    setShowEditor(e.target.checked);
    const filteredAttributes = value.reduce((acc, curr) => {
      const attr = { ...curr };
      if (attr.new) return [...acc];
      if (attr.edited) {
        delete attr.edited;
      }
      return [...acc, attr];
    }, []);

    changeValue(name, filteredAttributes);
  };

  return (
    <>
      <Checkbox
        value={shown}
        onChange={attributeControlHandler}
        dataAutomationId={'showAttributesCheckbox'}
      >
        {formatMessage(messages.attributes)}
      </Checkbox>
      <div className={cx('description')}>
        {!shown && value?.length ? formatMessage(messages.attributesNotActive) : attributesNote}
      </div>
      <AttributeListContainer value={value} {...rest} />
    </>
  );
};
AttributeListFormField.propTypes = {
  name: PropTypes.string,
  setShowEditor: PropTypes.func,
  shown: PropTypes.bool,
  value: PropTypes.array,
  keyURLCreator: PropTypes.func,
  valueURLCreator: PropTypes.func,
  changeValue: PropTypes.func,
  attributesValue: PropTypes.arrayOf(PropTypes.object),
  attributesNote: PropTypes.string,
};
AttributeListFormField.defaultProps = {
  name: '',
  setShowEditor: () => {},
  shown: false,
  value: [],
  keyURLCreator: () => {},
  valueURLCreator: () => {},
  changeValue: () => {},
  attributesValue: [],
  attributesNote: '',
};
