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
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import className from 'classnames/bind';
import { URLS } from 'common/urls';
import { validate } from 'common/utils/validation';
import { projectIdSelector } from 'controllers/pages';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FormField } from 'components/fields/formField';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { AttributeListField } from 'components/main/attributeList';
import { AsyncMultipleAutocomplete } from 'components/inputs/autocompletes/asyncMultipleAutocomplete';
import {
  LAUNCH_CASES,
  LABEL_WIDTH,
  ATTRIBUTES_FIELD_KEY,
  INFORM_OWNER_FIELD_KEY,
  LAUNCH_NAMES_FIELD_KEY,
  RECIPIENTS_FIELD_KEY,
  SEND_CASE_FIELD_KEY,
} from '../../../constants';
import { messages } from '../../../messages';
import styles from './notificationCaseFormFields.scss';

const cx = className.bind(styles);

@injectIntl
@connect((state) => ({
  activeProject: projectIdSelector(state),
}))
@track()
export class NotificationCaseFormFields extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    activeProject: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    activeProject: '',
  };

  getDropdownInputConfig = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    return [
      {
        value: LAUNCH_CASES.ALWAYS,
        label: formatMessage(messages[LAUNCH_CASES.ALWAYS]),
      },
      {
        value: LAUNCH_CASES.MORE_10,
        label: formatMessage(messages[LAUNCH_CASES.MORE_10]),
      },
      {
        value: LAUNCH_CASES.MORE_20,
        label: formatMessage(messages[LAUNCH_CASES.MORE_20]),
      },
      {
        value: LAUNCH_CASES.MORE_50,
        label: formatMessage(messages[LAUNCH_CASES.MORE_50]),
      },
      {
        value: LAUNCH_CASES.FAILED,
        label: formatMessage(messages[LAUNCH_CASES.FAILED]),
      },
      {
        value: LAUNCH_CASES.TO_INVESTIGATE,
        label: formatMessage(messages[LAUNCH_CASES.TO_INVESTIGATE]),
      },
    ];
  };

  render() {
    const {
      intl: { formatMessage },
      activeProject,
      tracking,
    } = this.props;

    return (
      <Fragment>
        <FormField
          label={formatMessage(messages.recipientsLabel)}
          name={RECIPIENTS_FIELD_KEY}
          fieldWrapperClassName={cx('form-input')}
          labelClassName={cx('form-label')}
          onChange={() =>
            tracking.trackEvent(SETTINGS_PAGE_EVENTS.EDIT_RECIPIENTS_INPUT_NOTIFICATIONS)
          }
        >
          <FieldErrorHint hintType="top">
            <AsyncMultipleAutocomplete
              placeholder={formatMessage(messages.recipientsPlaceholder)}
              notFoundPrompt={formatMessage(messages.recipientsHint)}
              minLength={3}
              getURI={URLS.projectUsernamesSearch(activeProject)}
              creatable
              showDynamicSearchPrompt
              isValidNewOption={validate.requiredEmail}
            />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={INFORM_OWNER_FIELD_KEY}
          format={Boolean}
          onChange={() =>
            tracking.trackEvent(SETTINGS_PAGE_EVENTS.CHECKBOX_LAUNCH_OWNER_NOTIFICATIONS)
          }
          fieldWrapperClassName={cx('form-input-checkbox')}
          labelClassName={cx('form-label')}
        >
          <InputCheckbox>{formatMessage(messages.launchOwnerLabel)}</InputCheckbox>
        </FormField>
        <FormField
          label={formatMessage(messages.inCaseLabel)}
          labelWidth={LABEL_WIDTH}
          name={SEND_CASE_FIELD_KEY}
          fieldWrapperClassName={cx('form-input')}
          labelClassName={cx('form-label')}
          onChange={() =>
            tracking.trackEvent(SETTINGS_PAGE_EVENTS.EDIT_IN_CASE_INPUT_NOTIFICATIONS)
          }
        >
          <InputDropdown options={this.getDropdownInputConfig()} />
        </FormField>
        <FormField
          label={formatMessage(messages.launchNamesLabel)}
          customBlock={{
            node: <p>{formatMessage(messages.launchNamesNote)}</p>,
          }}
          name={LAUNCH_NAMES_FIELD_KEY}
          fieldWrapperClassName={cx('form-input')}
          labelClassName={cx('form-label')}
          onChange={() => tracking.trackEvent(SETTINGS_PAGE_EVENTS.LAUNCH_NAME_INPUT_NOTIFICATIONS)}
        >
          <FieldErrorHint hintType="top">
            <AsyncMultipleAutocomplete
              placeholder={formatMessage(messages.launchNamesPlaceholder)}
              notFoundPrompt={formatMessage(messages.launchNamesHint)}
              minLength={3}
              getURI={URLS.launchNameSearch(activeProject)}
              creatable
              isValidNewOption={validate.launchName}
              showDynamicSearchPrompt
            />
          </FieldErrorHint>
        </FormField>
        <FormField
          label={formatMessage(messages.attributesLabel)}
          customBlock={{
            node: <p>{formatMessage(messages.attributesNote)}</p>,
          }}
          fieldWrapperClassName={cx('form-input')}
          labelClassName={cx('form-label')}
          name={ATTRIBUTES_FIELD_KEY}
          onChange={() => tracking.trackEvent(SETTINGS_PAGE_EVENTS.TAGS_INPUT_NOTIFICATIONS)}
        >
          <AttributeListField
            keyURLCreator={URLS.launchAttributeKeysSearch}
            valueURLCreator={URLS.launchAttributeValuesSearch}
          />
        </FormField>
      </Fragment>
    );
  }
}
