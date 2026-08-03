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
import OwnerIcon from 'common/img/owner-icon-inline.svg';
import { ModalField } from 'components/main/modal';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { AsyncAutocomplete } from 'components/inputs/autocompletes/asyncAutocomplete';
import { ConditionalTooltip } from 'components/main/conditionalTooltip';
import { AutocompleteOption } from 'components/inputs/autocompletes/common/autocompleteOption';
import {
  LAUNCH_OWNER_LEVEL_KEY,
  launchOwnerLevelMessages,
} from 'common/constants/launchOwnerLevel';
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
    disabled: PropTypes.bool,
    inputTooltip: PropTypes.string | PropTypes.null,
    addButtonTooltip: PropTypes.string | PropTypes.null,
    withOwnerLevel: PropTypes.bool,
  };

  static defaultProps = {
    attributeKeyFieldViewLabels: [],
    showRemainingLevels: false,
    inputTooltip: null,
    addButtonTooltip: null,
    disabled: false,
    withOwnerLevel: false,
  };

  constructor(props) {
    super(props);

    if (!props.fields.length) {
      props.fields.push('');
    }
  }

  getAttributes = () => this.props.fields.getAll() || [];

  filterAttribute = (item) => !this.getAttributes().includes(item);

  isOwnerLevelAvailable = (index) =>
    !this.getAttributes().some((value, i) => i !== index && value === LAUNCH_OWNER_LEVEL_KEY);

  parseLevelValueToString = (value) =>
    value === LAUNCH_OWNER_LEVEL_KEY
      ? this.props.intl.formatMessage(launchOwnerLevelMessages.ownerLevelOption)
      : value || '';

  renderLevelOption = (item, index, isNew, getItemProps) =>
    item === LAUNCH_OWNER_LEVEL_KEY ? (
      <AutocompleteOption key={item} {...getItemProps({ item, index })}>
        <span className={cx('owner-option')}>
          <i className={cx('owner-icon')}>{Parser(OwnerIcon)}</i>
          {this.props.intl.formatMessage(launchOwnerLevelMessages.ownerLevelOption)}
        </span>
      </AutocompleteOption>
    ) : (
      <AutocompleteOption key={item} {...getItemProps({ item, index })} isNew={isNew}>
        {item}
      </AutocompleteOption>
    );

  getOwnerLevelBlurHandler = (index) => (e) => {
    const { intl } = this.props;
    const attributes = this.getAttributes();
    if (
      attributes[index] === LAUNCH_OWNER_LEVEL_KEY &&
      e.target.value === intl.formatMessage(launchOwnerLevelMessages.ownerLevelOption)
    ) {
      e.preventDefault();
    }
  };

  getOwnerLevelProps = (index) => {
    const { withOwnerLevel } = this.props;
    if (!withOwnerLevel) return {};

    return {
      pinnedOptions: this.isOwnerLevelAvailable(index) ? [LAUNCH_OWNER_LEVEL_KEY] : [],
      renderOption: this.renderLevelOption,
      parseValueToString: this.parseLevelValueToString,
      isOptionExist: (inputValue, options) =>
        options.some(
          (option) =>
            option !== LAUNCH_OWNER_LEVEL_KEY &&
            this.parseLevelValueToString(option) === inputValue,
        ),
      createNewAtBottom: true,
    };
  };

  render() {
    const {
      intl: { formatMessage },
      fields,
      getURI,
      fieldValidator,
      maxAttributesAmount,
      attributeKeyFieldViewLabels,
      showRemainingLevels,
      inputTooltip,
      addButtonTooltip,
      disabled,
      withOwnerLevel,
    } = this.props;
    const attributes = this.getAttributes();
    const canAddNewItems = fields.length < maxAttributesAmount;
    const numberRemainingLevels = maxAttributesAmount - fields.length;

    return (
      <Fragment>
        {fields.map((item, index) => {
          const isFirstItem = index === 0;
          return (
            <ModalField
              key={item}
              label={formatMessage(messages.attributeKeyFieldLabel, {
                number: index + 1,
                view: attributeKeyFieldViewLabels[index],
              })}
              labelWidth={FIELD_LABEL_WIDTH}
              className={cx('attribute-modal-field')}
            >
              <div className={cx({ 'attr-selector': !isFirstItem && !disabled })}>
                <ConditionalTooltip content={inputTooltip}>
                  <div className={cx('owner-value-wrap')}>
                    {withOwnerLevel && attributes[index] === LAUNCH_OWNER_LEVEL_KEY && (
                      <div className={cx('owner-selected-overlay')}>
                        <i className={cx('owner-icon')}>{Parser(OwnerIcon)}</i>
                        {formatMessage(launchOwnerLevelMessages.ownerLevelOption)}
                      </div>
                    )}
                  </div>
                  <FieldProvider
                    name={item}
                    validate={fieldValidator(attributes)}
                    onBlur={withOwnerLevel ? this.getOwnerLevelBlurHandler(index) : undefined}
                  >
                    <FieldErrorHint hintType="top">
                      <AsyncAutocomplete
                        disabled={disabled}
                        getURI={getURI}
                        minLength={1}
                        placeholder={formatMessage(messages.attributeKeyFieldPlaceholder)}
                        creatable
                        filterOption={this.filterAttribute}
                        {...this.getOwnerLevelProps(index)}
                      />
                    </FieldErrorHint>
                  </FieldProvider>
                </ConditionalTooltip>
              </div>
              {!isFirstItem && !disabled && (
                <button
                  className={cx('remove-button', 'button')}
                  onClick={() => fields.remove(index)}
                >
                  {Parser(CrossIcon)}
                </button>
              )}
            </ModalField>
          );
        })}
        {canAddNewItems && !disabled ? (
          <ModalField label=" " labelWidth={FIELD_LABEL_WIDTH}>
            <ConditionalTooltip
              content={addButtonTooltip}
              wrapperClassName={cx('tooltip-wrapper')}
              tooltipClassName={cx('tooltip')}
            >
              <button
                className={cx('add-level', 'button')}
                disabled={disabled}
                onClick={() => fields.push('')}
              >
                {formatMessage(messages.addOneMoreLevel)}
              </button>
            </ConditionalTooltip>
            {showRemainingLevels && (
              <div className={cx('remaining-level')}>
                {numberRemainingLevels === 1
                  ? formatMessage(messages.levelCanBeAddedMessage)
                  : formatMessage(messages.levelsCanBeAddedMessage, {
                      amount: numberRemainingLevels,
                    })}
              </div>
            )}
          </ModalField>
        ) : null}
      </Fragment>
    );
  }
}
