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

import React, { Fragment, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl, defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { FieldArray, change, untouch } from 'redux-form';
import { FieldNumber } from '@reportportal/ui-kit';
import {
  validate,
  bindMessageToValidator,
  composeBoundValidators,
  commonValidators,
} from 'common/utils/validation';
import { URLS } from 'common/urls';
import { STATS_FAILED, STATS_PASSED, STATS_SKIPPED } from 'common/constants/statistics';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields';
import { DEFAULT_LAUNCHES_LIMIT } from 'controllers/testItem';
import { projectKeySelector } from 'controllers/project';
import { FiltersControlV2, AttributesFieldArrayControl } from './controls';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import { WIDGET_WIZARD_FORM } from '../constants';
import { DEFECT_STATISTICS_OPTIONS, TO_INVESTIGATE_OPTION } from './constants';
import styles from './widgetControls.scss';

const cx = classNames.bind(styles);

const MAX_ATTRIBUTES_AMOUNT = 2;
const STATIC_CONTENT_FIELDS = [STATS_FAILED, STATS_SKIPPED, STATS_PASSED];
const ATTRIBUTES_FIELD = 'contentParameters.widgetOptions.attributes';
const DEFAULT_EVENTS_INFO = {};

const messages = defineMessages({
  CriteriaFieldLabel: {
    id: 'CumulativeTrendControls.CriteriaFieldLabel',
    defaultMessage: 'Criteria for widget',
  },
  LaunchesLimitFieldLabel: {
    id: 'CumulativeTrendControls.LaunchesLimitFieldLabel',
    defaultMessage: 'Number of launches',
  },
  LaunchesLimitValidationError: {
    id: 'CumulativeTrendControls.LaunchesLimitValidationError',
    defaultMessage: 'Launches count should have value from 1 to 20000',
  },
  attributeKeyFieldLabelOverview: {
    id: 'CumulativeTrendControls.attributeKeyFieldLabelOverview',
    defaultMessage: '(overview)',
  },
  attributeKeyFieldLabelDetailedView: {
    id: 'CumulativeTrendControls.attributeKeyFieldLabelDetailedView',
    defaultMessage: '(detailed view)',
  },
  attributesArrayValidationError: {
    id: 'CumulativeTrendControls.attributesArrayValidationError',
    defaultMessage:
      'Enter an attribute key whose unique values will be used for combine launches into groups',
  },
});

const itemsValidator = (formatMessage) =>
  bindMessageToValidator(
    validate.cumulativeItemsValidation,
    formatMessage(messages.LaunchesLimitValidationError),
  );

const attributeKeyValidator = (attributes) =>
  composeBoundValidators([
    commonValidators.requiredField,
    commonValidators.attributeKey,
    commonValidators.uniqueAttributeKey(attributes),
  ]);

const parseContentFields = (criteria) =>
  STATIC_CONTENT_FIELDS.concat(
    criteria.map((item) => item.value || item).flat(),
  );

const normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');
const formatFilterValue = (value) => value?.[0];
const parseFilterValue = (value) => value && [value];

// defined at module level so FieldArray keeps the same component between renders
const AttributesField = ({ fields, fieldValidator, projectKey, disabled = false }) => {
  const { formatMessage } = useIntl();

  return (
    <AttributesFieldArrayControl
      fields={fields}
      fieldValidator={fieldValidator}
      maxAttributesAmount={MAX_ATTRIBUTES_AMOUNT}
      getURI={URLS.launchAttributeKeysSearch(projectKey)}
      attributeKeyFieldViewLabels={[
        formatMessage(messages.attributeKeyFieldLabelOverview),
        formatMessage(messages.attributeKeyFieldLabelDetailedView),
      ]}
      description={formatMessage(messages.attributesArrayValidationError)}
      disabled={disabled}
    />
  );
};

AttributesField.propTypes = {
  fields: PropTypes.object.isRequired,
  fieldValidator: PropTypes.func,
  projectKey: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

export const CumulativeTrendControls = ({
  widgetSettings,
  initializeControlsForm,
  formAppearance,
  onFormAppearanceChange,
  eventsInfo = DEFAULT_EVENTS_INFO,
  isMainControlsDisabled = false,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  const filterId = widgetSettings?.filters?.[0]?.value;
  const disabled = !filterId;

  // the form has to be initialized before the fields render, like the constructor did
  const isFormInitializedRef = useRef(null);
  if (isFormInitializedRef.current === null) {
    isFormInitializedRef.current = true;
    const criteria = getWidgetCriteriaOptions(
      [DEFECT_STATISTICS_OPTIONS, TO_INVESTIGATE_OPTION],
      formatMessage,
    );

    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        itemsCount: DEFAULT_LAUNCHES_LIMIT,
        contentFields: parseContentFields(criteria),
        widgetOptions: {
          attributes: [],
        },
      },
    });
  }

  const prevFilterIdRef = useRef(filterId);
  useEffect(() => {
    // the levels are disabled without a filter, so they go back to their default state
    if (prevFilterIdRef.current && !filterId) {
      dispatch(change(WIDGET_WIZARD_FORM, ATTRIBUTES_FIELD, [''], null));
      dispatch(
        untouch(
          WIDGET_WIZARD_FORM,
          ...Array.from(
            { length: MAX_ATTRIBUTES_AMOUNT },
            (_, index) => `${ATTRIBUTES_FIELD}[${index}]`,
          ),
        ),
      );
    }
    prevFilterIdRef.current = filterId;
  }, [filterId, dispatch]);

  const limitValidator = useMemo(() => itemsValidator(formatMessage), [formatMessage]);

  return (
    <Fragment>
      <FieldProvider name="filters" parse={parseFilterValue} format={formatFilterValue}>
        <FiltersControlV2
          formAppearance={formAppearance}
          onFormAppearanceChange={onFormAppearanceChange}
          eventsInfo={eventsInfo}
          required
        />
      </FieldProvider>

      {!formAppearance.isMainControlsLocked && (
        <Fragment>
          <FieldProvider
            name="contentParameters.itemsCount"
            validate={limitValidator}
            format={String}
            normalize={normalizeValue}
            className={cx('field-number')}
          >
            <FieldErrorHint provideHint={false}>
              <FieldNumber
                label={formatMessage(messages.LaunchesLimitFieldLabel)}
                maxLength={6}
                defaultWidth={false}
                disabled={disabled || isMainControlsDisabled}
                max={20000}
              />
            </FieldErrorHint>
          </FieldProvider>

          <FieldArray
            name={ATTRIBUTES_FIELD}
            component={AttributesField}
            fieldValidator={attributeKeyValidator}
            projectKey={projectKey}
            disabled={disabled || isMainControlsDisabled}
          />
        </Fragment>
      )}
    </Fragment>
  );
};

CumulativeTrendControls.propTypes = {
  widgetSettings: PropTypes.object.isRequired,
  initializeControlsForm: PropTypes.func.isRequired,
  formAppearance: PropTypes.object.isRequired,
  onFormAppearanceChange: PropTypes.func.isRequired,
  eventsInfo: PropTypes.object,
  isMainControlsDisabled: PropTypes.bool,
};