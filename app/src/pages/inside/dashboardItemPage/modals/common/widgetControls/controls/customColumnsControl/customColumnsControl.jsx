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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { ModalField } from 'components/main/modal';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FIELD_LABEL_WIDTH } from '../constants';
import styles from './customColumnsControl.scss';
import { CustomColumnItem } from './customColumnItem';

const cx = classNames.bind(styles);
const messages = defineMessages({
  tip: {
    id: 'CustomColumnsControl.tip',
    defaultMessage: 'You can add custom column to view attributes with chosen key',
  },
  addColumn: {
    id: 'CustomColumnsControl.addColumn',
    defaultMessage: '+ Add custom column',
  },
});

@injectIntl
export class CustomColumnsControl extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.array.isRequired,
    error: PropTypes.string,
    getURI: PropTypes.func,
  };

  static defaultProps = {
    error: '',
    getURI: () => '',
  };

  onChangeColumn = (itemValue, index) => {
    const { value, onChange } = this.props;
    onChange(value.map((val, i) => (index === i ? itemValue : val)));
  };

  addColumn = () => {
    const { value, onChange } = this.props;
    onChange(value.concat([{ name: '', value: '' }]));
  };

  removeColumn = (index) => {
    const { value, onChange } = this.props;
    onChange(value.filter((val, i) => index !== i));
  };

  render() {
    const { intl, value, error, getURI } = this.props;
    return (
      <div className={cx('custom-columns-control')}>
        {value.map((column, i) => (
          <CustomColumnItem
            key={`column_${i + 1}`}
            index={i}
            name={column.name}
            attributeKey={column.value}
            last={value.length === i + 1}
            getURI={getURI}
            onChange={this.onChangeColumn}
            onRemove={this.removeColumn}
            noRemove={value.length === 1}
          />
        ))}
        {error && (
          <ModalField className={cx('warning-field')} label=" " labelWidth={FIELD_LABEL_WIDTH}>
            <FieldErrorHint error={error} active />
          </ModalField>
        )}
        {value.length < 3 && !error && (
          <Fragment>
            <ModalField className={cx('tip-field')} label=" " labelWidth={FIELD_LABEL_WIDTH}>
              <div className={cx('tip')}>{intl.formatMessage(messages.tip)}</div>
            </ModalField>
            <ModalField className={cx('add-column-field')} label=" " labelWidth={FIELD_LABEL_WIDTH}>
              <div className={cx('add-column')} onClick={this.addColumn}>
                {intl.formatMessage(messages.addColumn)}
              </div>
            </ModalField>
          </Fragment>
        )}
      </div>
    );
  }
}
