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
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { ModalField } from 'components/main/modal';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { AsyncAutocomplete } from 'components/inputs/autocompletes/asyncAutocomplete';
import { FIELD_LABEL_WIDTH } from '../constants';
import styles from './attributesFieldArrayControl.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  attributeKeyFieldLabel: {
    id: 'AttributesFieldArrayControl.attributeKeyFieldLabel',
    defaultMessage: 'Level {number} {view}',
  },
  attributeKeyFieldPlaceholder: {
    id: 'AttributesFieldArrayControl.attributeKeyFieldPlaceholder',
    defaultMessage: 'Enter an attribute key',
  },
  addOneMoreLevel: {
    id: 'AttributesFieldArrayControl.addOneMoreLevel',
    defaultMessage: '+ Add one more level',
  },
  levelsCanBeAddedMessage: {
    id: 'AttributesFieldArrayControl.levelsCanBeAddedMessage',
    defaultMessage: '{amount} levels can be added',
  },
  levelCanBeAddedMessage: {
    id: 'AttributesFieldArrayControl.levelCanBeAddedMessage',
    defaultMessage: '1 level can be added',
  },
});

@injectIntl
export class AttributesFieldArrayControl extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    fieldValidator: PropTypes.func.isRequired,
    maxAttributesAmount: PropTypes.number.isRequired,
    getURI: PropTypes.func.isRequired,
    attributeKeyFieldViewLabels: PropTypes.array,
    showRemainingLevels: PropTypes.bool,
  };

  static defaultProps = {
    attributeKeyFieldViewLabels: [],
    showRemainingLevels: false,
  };

  constructor(props) {
    super(props);

    if (props.fields.length) {
      this.numberRemainingLevels = props.maxAttributesAmount - props.fields.length;
    } else {
      this.numberRemainingLevels = props.maxAttributesAmount - 1;
      props.fields.push('');
    }
  }

  getAttributes = () => this.props.fields.getAll() || [];

  filterAttribute = (item) => !this.getAttributes().includes(item);

  render() {
    const {
      intl: { formatMessage },
      fields,
      getURI,
      fieldValidator,
      maxAttributesAmount,
      attributeKeyFieldViewLabels,
      showRemainingLevels,
    } = this.props;
    const attributes = this.getAttributes();
    const canAddNewItems = fields.length < maxAttributesAmount;

    return (
      <Fragment>
        {fields.map((item, index) => {
          const isFirstItem = index === 0;
          return (
            <ModalField
              // eslint-disable-next-line
              key={item}
              label={formatMessage(messages.attributeKeyFieldLabel, {
                number: index + 1,
                view: attributeKeyFieldViewLabels[index],
              })}
              labelWidth={FIELD_LABEL_WIDTH}
              className={cx('attribute-modal-field')}
            >
              <div className={cx({ 'attr-selector': !isFirstItem })}>
                <FieldProvider name={item} validate={fieldValidator(attributes)}>
                  <FieldErrorHint hintType="top">
                    <AsyncAutocomplete
                      getURI={getURI}
                      minLength={1}
                      placeholder={formatMessage(messages.attributeKeyFieldPlaceholder)}
                      creatable
                      filterOption={this.filterAttribute}
                    />
                  </FieldErrorHint>
                </FieldProvider>
              </div>
              {!isFirstItem && (
                <span
                  className={cx('remove-icon')}
                  onClick={() => {
                    this.numberRemainingLevels = this.numberRemainingLevels + 1;
                    return fields.remove(index);
                  }}
                >
                  {Parser(CrossIcon)}
                </span>
              )}
            </ModalField>
          );
        })}
        {canAddNewItems ? (
          <ModalField label=" " labelWidth={FIELD_LABEL_WIDTH}>
            <div
              className={cx('add-level')}
              onClick={() => {
                this.numberRemainingLevels = this.numberRemainingLevels - 1;
                return fields.push('');
              }}
            >
              {formatMessage(messages.addOneMoreLevel)}
            </div>
            {showRemainingLevels && (
              <div className={cx('remaining-level')}>
                {this.numberRemainingLevels === 1
                  ? formatMessage(messages.levelCanBeAddedMessage)
                  : formatMessage(messages.levelsCanBeAddedMessage, {
                      amount: this.numberRemainingLevels,
                    })}
              </div>
            )}
          </ModalField>
        ) : null}
      </Fragment>
    );
  }
}
