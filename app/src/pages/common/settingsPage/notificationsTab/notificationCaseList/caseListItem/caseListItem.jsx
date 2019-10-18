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
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import IconDelete from 'common/img/circle-cross-icon-inline.svg';
import IconEdit from 'common/img/pencil-icon-inline.svg';
import { formatAttribute } from 'common/utils/attributeUtils';
import {
  DEFAULT_CASE_CONFIG,
  ATTRIBUTES_FIELD_KEY,
  RECIPIENTS_FIELD_KEY,
  LAUNCH_NAMES_FIELD_KEY,
  SEND_CASE_FIELD_KEY,
} from '../../constants';
import { messages } from '../../messages';
import styles from './caseListItem.scss';

const cx = classNames.bind(styles);

const ruleFieldsConfig = {
  [RECIPIENTS_FIELD_KEY]: {
    title: messages.recipientsLabel,
    dataFormatter: (data) =>
      data.reduce((acc, item) => `${acc.length ? `${acc}, ` : ''}${item}`, ''),
  },
  [SEND_CASE_FIELD_KEY]: {
    title: messages.inCaseLabel,
    dataFormatter: (data, formatMessage) =>
      messages[data] ? formatMessage(messages[data]) : messages[data],
  },
  [LAUNCH_NAMES_FIELD_KEY]: {
    title: messages.launchNamesLabel,
    dataFormatter: (data) =>
      data.reduce((acc, item) => `${acc.length ? `${acc}, ` : ''}${item}`, ''),
  },
  [ATTRIBUTES_FIELD_KEY]: {
    title: messages.attributesLabel,
    dataFormatter: (data) =>
      data.reduce((acc, item) => `${acc.length ? `${acc}, ` : ''}${formatAttribute(item)}`, ''),
  },
};

@injectIntl
export class CaseListItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    item: PropTypes.object,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    readOnly: PropTypes.bool,
    id: PropTypes.number,
  };

  static defaultProps = {
    item: DEFAULT_CASE_CONFIG,
    onDelete: () => {},
    onEdit: () => {},
    readOnly: false,
    id: 0,
  };

  renderItemField = (fieldKey) => {
    const {
      intl: { formatMessage },
      item,
    } = this.props;

    const fieldInfo = ruleFieldsConfig[fieldKey];
    const fieldData = item[fieldKey];
    const shouldBeRendered = fieldInfo && fieldData && fieldData.length;

    return shouldBeRendered ? (
      <div key={fieldKey} className={cx('rule-field-row')}>
        <span className={cx('rule-field-header')}>{formatMessage(fieldInfo.title)}</span>
        <span className={cx('rule-field-content')}>
          {fieldInfo.dataFormatter(fieldData, formatMessage)}
        </span>
      </div>
    ) : null;
  };

  render() {
    const {
      intl: { formatMessage },
      item,
      id,
      readOnly,
    } = this.props;

    return (
      <div className={cx('case-list-item')}>
        <div className={cx('control-panel')}>
          <span className={cx('control-panel-name')}>
            {formatMessage(messages.controlPanelName)} {id + 1}
          </span>
          {!readOnly && (
            <div className={cx('control-panel-buttons')}>
              <button className={cx('control-panel-button')} onClick={this.props.onEdit}>
                {Parser(IconEdit)}
              </button>
              <button className={cx('control-panel-button')} onClick={this.props.onDelete}>
                {Parser(IconDelete)}
              </button>
            </div>
          )}
        </div>
        <div className={cx('rule-data-block')}>{Object.keys(item).map(this.renderItemField)}</div>
      </div>
    );
  }
}
