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
import { connect } from 'react-redux';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields';
import { injectIntl, defineMessages } from 'react-intl';
import { FieldNumber, Checkbox } from '@reportportal/ui-kit';
import { URLS } from 'common/urls';
import { validate, bindMessageToValidator, commonValidators } from 'common/utils/validation';
import { projectKeySelector } from 'controllers/project';
import { createClassnames } from 'common/utils';
import { TagsControl } from './controls';
import styles from './widgetControls.scss';

const cx = createClassnames(styles);

const DEFAULT_ITEMS_COUNT = '30';
const messages = defineMessages({
  ItemsFieldLabel: {
    id: 'FlakyTestCasesTableControls.ItemsFieldLabel',
    defaultMessage: 'Launches count',
  },
  LaunchNameFieldLabel: {
    id: 'FlakyTestCasesTableControls.LaunchNameFieldLabel',
    defaultMessage: 'Launch name',
  },
  LaunchNamePlaceholder: {
    id: 'FlakyTestCasesTableControls.LaunchNamePlaceholder',
    defaultMessage: 'Enter launch name',
  },
  IncludeMethodsControlText: {
    id: 'FlakyTestCasesTableControls.IncludeMethodsControlText',
    defaultMessage: 'Include Before and After methods',
  },
  ItemsValidationError: {
    id: 'FlakyTestCasesTableControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 2 to 100',
  },
  LaunchNamesValidationError: {
    id: 'FlakyTestCasesTableControls.LaunchNamesValidationError',
    defaultMessage: 'You must select at least one item',
  },
});

const itemsValidator = (message) =>
  bindMessageToValidator(validate.flakyWidgetNumberOfLaunches, message);

@injectIntl
@connect((state) => ({
  projectKey: projectKeySelector(state),
}))
export class FlakyTestCasesTableControls extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    projectKey: PropTypes.string.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    isMainControlsDisabled: PropTypes.bool,
  };

  static defaultProps = {
    isMainControlsDisabled: false,
  };

  constructor(props) {
    super(props);
    const { widgetSettings, initializeControlsForm } = props;
    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        itemsCount: DEFAULT_ITEMS_COUNT,
        widgetOptions: {
          includeMethods: false,
          launchNameFilter: null,
        },
      },
      filters: [],
    });
  }

  normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');

  render() {
    const {
      intl: { formatMessage },
      projectKey,
      isMainControlsDisabled,
    } = this.props;

    return (
      <Fragment>
        <FieldProvider
          name="contentParameters.itemsCount"
          validate={itemsValidator(formatMessage(messages.ItemsValidationError))}
          format={String}
          normalize={this.normalizeValue}
          className={cx('field-number')}
        >
          <FieldErrorHint provideHint={false}>
            <FieldNumber
              label={formatMessage(messages.ItemsFieldLabel)}
              maxLength={3}
              defaultWidth={false}
              disabled={isMainControlsDisabled}
            />
          </FieldErrorHint>
        </FieldProvider>
        <FieldProvider
          name="contentParameters.widgetOptions.launchNameFilter"
          validate={commonValidators.createWidgetContentFieldsValidator(
            formatMessage(messages.LaunchNamesValidationError),
          )}
        >
          <TagsControl
            fieldLabel={formatMessage(messages.LaunchNameFieldLabel)}
            placeholder={formatMessage(messages.LaunchNamePlaceholder)}
            minLength={3}
            maxLength={256}
            getURI={URLS.launchNameSearch(projectKey)}
            disabled={isMainControlsDisabled}
          />
        </FieldProvider>
        <FieldProvider name="contentParameters.widgetOptions.includeMethods">
          <Checkbox disabled={isMainControlsDisabled}>
            {formatMessage(messages.IncludeMethodsControlText)}
          </Checkbox>
        </FieldProvider>
      </Fragment>
    );
  }
}
