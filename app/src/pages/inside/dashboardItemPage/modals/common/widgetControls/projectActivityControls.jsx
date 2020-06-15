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
import { injectIntl, defineMessages } from 'react-intl';
import { URLS } from 'common/urls';
import { arrayRemoveDoubles } from 'common/utils/arrayRemoveDoubles';
import { validate, bindMessageToValidator, commonValidators } from 'common/utils/validation';
import { GROUP_TO_ACTION_MAP, ACTION_TO_GROUP_MAP } from 'common/constants/actionTypes';
import { activeProjectSelector } from 'controllers/user';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import { USER_ACTIONS_OPTIONS, ITEMS_INPUT_WIDTH, CONTENT_FIELDS } from './constants';
import { DropdownControl, InputControl, TagsControl } from './controls';

const DEFAULT_ITEMS_COUNT = '50';
const messages = defineMessages({
  CriteriaFieldLabel: {
    id: 'ProjectActivityControls.CriteriaFieldLabel',
    defaultMessage: 'Criteria for widget',
  },
  ItemsFieldLabel: {
    id: 'ProjectActivityControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  UsernameControlText: {
    id: 'ProjectActivityControls.UsernameControlText',
    defaultMessage: 'User name',
  },
  UsersPlaceholder: {
    id: 'ProjectActivityControls.UsersPlaceholder',
    defaultMessage: 'Enter user name',
  },
  ItemsValidationError: {
    id: 'ProjectActivityControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 600',
  },
  ActionTypesValidationError: {
    id: 'ProjectActivityControls.ActionTypesValidationError',
    defaultMessage: 'You must select at least one item',
  },
});

const actionTypeValidator = (message) => bindMessageToValidator(validate.isNotEmptyArray, message);

@injectIntl
@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class ProjectActivityControls extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    activeProject: PropTypes.string.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { intl, widgetSettings, initializeControlsForm } = props;
    this.criteria = getWidgetCriteriaOptions([USER_ACTIONS_OPTIONS], intl.formatMessage);
    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        contentFields: [
          CONTENT_FIELDS.NAME,
          CONTENT_FIELDS.USER,
          CONTENT_FIELDS.LAST_MODIFIED,
          CONTENT_FIELDS.ACTION_TYPE,
          CONTENT_FIELDS.OBJECT_TYPE,
          CONTENT_FIELDS.PROJECT_REF,
          CONTENT_FIELDS.LOGGED_OBJECT_REF,
          CONTENT_FIELDS.HISTORY,
        ],
        itemsCount: DEFAULT_ITEMS_COUNT,
        widgetOptions: {
          actionType: this.parseActionTypes(this.criteria),
          user: '',
        },
      },
      filters: [],
    });
  }

  formatActionTypes = (criteries) =>
    arrayRemoveDoubles(criteries.map((criteria) => ACTION_TO_GROUP_MAP[criteria] || criteria));
  parseActionTypes = (criteries) => {
    if (!criteries) {
      return this.props.widgetSettings.contentParameters.widgetOptions.actionType;
    }
    return criteries
      .map((criteria) => {
        const value = criteria.value || criteria;
        return GROUP_TO_ACTION_MAP[value] || value;
      })
      .reduce((acc, val) => acc.concat(val), []);
  };

  formatUsernames = (values = '') =>
    (values.length && values.split && values.split(',')) || values || [];

  parseUsernames = (values) => {
    if (values === null) return null;
    if (values && Array.isArray(values)) {
      return values.join(',');
    }

    return undefined;
  };

  normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');

  render() {
    const {
      intl: { formatMessage },
      activeProject,
    } = this.props;

    return (
      <Fragment>
        <FieldProvider
          name="contentParameters.widgetOptions.actionType"
          format={this.formatActionTypes}
          parse={this.parseActionTypes}
          validate={actionTypeValidator(formatMessage(messages.ActionTypesValidationError))}
        >
          <DropdownControl
            fieldLabel={formatMessage(messages.CriteriaFieldLabel)}
            multiple
            selectAll
            options={this.criteria}
          />
        </FieldProvider>
        <FieldProvider
          name="contentParameters.itemsCount"
          validate={commonValidators.createNumberOfLaunchesValidator(
            formatMessage(messages.ItemsValidationError),
          )}
          format={String}
          normalize={this.normalizeValue}
        >
          <InputControl
            fieldLabel={formatMessage(messages.ItemsFieldLabel)}
            inputWidth={ITEMS_INPUT_WIDTH}
            maxLength="3"
          />
        </FieldProvider>
        <FieldProvider
          name="contentParameters.widgetOptions.user"
          format={this.formatUsernames}
          parse={this.parseUsernames}
        >
          <TagsControl
            fieldLabel={formatMessage(messages.UsernameControlText)}
            placeholder={formatMessage(messages.UsersPlaceholder)}
            minLength={3}
            getURI={URLS.projectUsernamesSearch(activeProject)}
            makeOptions={this.formatUsernames}
            multi
          />
        </FieldProvider>
      </Fragment>
    );
  }
}
