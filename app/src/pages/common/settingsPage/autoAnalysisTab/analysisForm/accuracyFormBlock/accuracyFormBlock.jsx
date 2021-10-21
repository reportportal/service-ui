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
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { InputWithIcon } from 'components/inputs/inputWithIcon';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { BigButton } from 'components/buttons/bigButton';
import { FormField } from 'components/fields/formField';
import styles from './accuracyFormBlock.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  minimumShouldMatchTitle: {
    id: 'AccuracyFormBlock.minimumShouldMatchTitle',
    defaultMessage: 'Minimum should match for Auto-Analysis',
  },
  numberOfLogLinesTitle: {
    id: 'AccuracyFormBlock.numberOfLogLinesTitle',
    defaultMessage: 'Number of log lines',
  },
  minimumShouldMatchDescription: {
    id: 'AccuracyFormBlock.minimumShouldMatchDescription',
    defaultMessage:
      'Percent of words equality between analyzed log and particular log from the ElasticSearch. If a log from ElasticSearch has the value less then set, this log will be ignored for AA.',
  },
  numberOfLogLinesDescription: {
    id: 'AccuracyFormBlock.numberOfLogLinesDescription',
    defaultMessage:
      'The number of first lines of log message that should be considered in ElasticSearch.',
  },
  numberOfLogLinesAllOption: {
    id: 'AccuracyFormBlock.numberOfLogLinesAllOption',
    defaultMessage: 'All',
  },
  submitButtonText: {
    id: 'AccuracyFormBlock.submitButtonText',
    defaultMessage: 'Submit',
  },
  allMessagesShouldMatchTitle: {
    id: 'AccuracyFormBlock.allMessagesShouldMatchTitle',
    defaultMessage: 'All logs with 3 or more rows should match',
  },
  allMessagesShouldMatchDescription: {
    id: 'AccuracyFormBlock.allMessagesShouldMatchDescription',
    defaultMessage: 'When an analyzed test item contains logs with 3 or more rows',
  },
  searchLogsMinShouldTitle: {
    id: 'AccuracyFormBlock.searchLogsMinShouldTitle',
    defaultMessage: 'Minimum should match for similar To Investigate items',
  },
  searchLogsMinShouldMatchDescription: {
    id: 'AccuracyFormBlock.searchLogsMinShouldMatchDescription',
    defaultMessage: `Percent of words equality between a log from considered test item 
    and a log from To Investigate item in the ElasticSearch. If a log from ElasticSearch 
    has the value less than set, this log won’t be shown in the similar To Investigate items section.`,
  },
});

@injectIntl
export class AccuracyFormBlock extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    intl: PropTypes.object.isRequired,
    onInputChange: PropTypes.func,
  };

  static defaultProps = {
    disabled: false,
    onInputChange: () => {},
  };

  constructor(props) {
    super(props);
    this.dropDownOptions = [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
      { value: '5', label: '5' },
      { value: '6', label: '6' },
      { value: '7', label: '7' },
      { value: '8', label: '8' },
      { value: '9', label: '9' },
      { value: '10', label: '10' },
      { value: '15', label: '15' },
      {
        value: '-1',
        label: props.intl.formatMessage(messages.numberOfLogLinesAllOption),
      },
    ];
  }

  normalizeValue = (value) => value && `${value}`.replace(/^0(?=[0-9])|\D+/g, '');

  render() {
    const { intl, disabled } = this.props;
    return (
      <Fragment>
        <FormField
          name="numberOfLogLines"
          fieldWrapperClassName={cx('accuracy-form-input-wrapper')}
          label={intl.formatMessage(messages.numberOfLogLinesTitle)}
          onChange={this.props.onInputChange}
          format={String}
          customBlock={{
            node: <p>{intl.formatMessage(messages.numberOfLogLinesDescription)}</p>,
          }}
          disabled={disabled}
        >
          <InputDropdown options={this.dropDownOptions} mobileDisabled />
        </FormField>

        <FormField
          name="allMessagesShouldMatch"
          fieldWrapperClassName={cx('accuracy-form-input-wrapper')}
          labelClassName={cx('all-messages-should-match-label')}
          label={intl.formatMessage(messages.allMessagesShouldMatchTitle)}
          onChange={this.props.onInputChange}
          format={Boolean}
          parse={Boolean}
          customBlock={{
            node: <p>{intl.formatMessage(messages.allMessagesShouldMatchDescription)}</p>,
          }}
          disabled={disabled}
        >
          <InputBigSwitcher mobileDisabled />
        </FormField>

        <FormField
          name="minShouldMatch"
          fieldWrapperClassName={cx('accuracy-form-input-wrapper')}
          label={intl.formatMessage(messages.minimumShouldMatchTitle)}
          onChange={this.props.onInputChange}
          normalize={this.normalizeValue}
          format={String}
          customBlock={{
            node: <p>{intl.formatMessage(messages.minimumShouldMatchDescription)}</p>,
          }}
          disabled={disabled}
        >
          <FieldErrorHint>
            <InputWithIcon
              icon={<i className={cx('percent-icon')}>%</i>}
              maxLength="3"
              mobileDisabled
            />
          </FieldErrorHint>
        </FormField>

        <FormField
          name="searchLogsMinShouldMatch"
          fieldWrapperClassName={cx('accuracy-form-input-wrapper')}
          label={intl.formatMessage(messages.searchLogsMinShouldTitle)}
          onChange={this.props.onInputChange}
          normalize={this.normalizeValue}
          format={String}
          customBlock={{
            node: <p>{intl.formatMessage(messages.searchLogsMinShouldMatchDescription)}</p>,
          }}
          disabled={disabled}
        >
          <FieldErrorHint>
            <InputWithIcon
              icon={<i className={cx('percent-icon')}>%</i>}
              maxLength="3"
              mobileDisabled
            />
          </FieldErrorHint>
        </FormField>

        <div className={cx('submit-button-container')}>
          <div className={cx('submit-button-wrapper')}>
            <BigButton type="submit" disabled={disabled}>
              <span className={cx('submit-button-text')}>
                {intl.formatMessage(messages.submitButtonText)}
              </span>
            </BigButton>
          </div>
        </div>
      </Fragment>
    );
  }
}
