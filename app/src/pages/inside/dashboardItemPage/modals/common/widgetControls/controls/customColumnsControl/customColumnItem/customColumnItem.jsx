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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { ModalField } from 'components/main/modal';
import { Input } from 'components/inputs/input';
import { AsyncAutocomplete } from 'components/inputs/autocompletes/asyncAutocomplete';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { FIELD_LABEL_WIDTH } from '../../constants';
import styles from './customColumnItem.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  label: {
    id: 'CustomColumnItem.label',
    defaultMessage: 'Custom column',
  },
  namePlaceholder: {
    id: 'CustomColumnItem.namePlaceholder',
    defaultMessage: 'Column name',
  },
  attributeKeyPlaceholder: {
    id: 'CustomColumnItem.attributeKeyPlaceholder',
    defaultMessage: 'Attribute key',
  },
});

@injectIntl
export class CustomColumnItem extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    name: PropTypes.string,
    getURI: PropTypes.func,
    attributeKey: PropTypes.object,
    index: PropTypes.number,
    last: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    noRemove: PropTypes.bool,
  };
  static defaultProps = {
    name: '',
    getURI: '',
    attributeKey: {},
    index: 0,
    last: false,
    onRemove: () => {},
    onChange: () => {},
    noRemove: false,
  };
  onRemove = () => {
    const { index, onRemove, noRemove } = this.props;
    !noRemove && onRemove(index);
  };
  onChangeName = (e) => {
    const { index, onChange, attributeKey } = this.props;
    onChange({ name: e.target.value, value: attributeKey }, index);
  };
  onChangeAttributeKey = (value) => {
    const { index, onChange, name } = this.props;
    onChange({ name, value }, index);
  };
  render() {
    const { intl, name, getURI, attributeKey, index, last, noRemove } = this.props;
    return (
      <ModalField
        className={cx({ 'last-custom-column-field': last })}
        label={`${intl.formatMessage(messages.label)} ${index + 1}`}
        labelWidth={FIELD_LABEL_WIDTH}
      >
        <div className={cx('custom-column-item')}>
          <Input
            className={cx('name-input')}
            value={name}
            placeholder={intl.formatMessage(messages.namePlaceholder)}
            onChange={this.onChangeName}
          />
          <div className={cx('attribute-key-input')}>
            <AsyncAutocomplete
              value={attributeKey}
              placeholder={intl.formatMessage(messages.attributeKeyPlaceholder)}
              onChange={this.onChangeAttributeKey}
              minLength={1}
              getURI={getURI}
              creatable
            />
          </div>
          <div className={cx('remove-icon', { 'no-remove': noRemove })} onClick={this.onRemove}>
            {!noRemove && Parser(CrossIcon)}
          </div>
        </div>
      </ModalField>
    );
  }
}
