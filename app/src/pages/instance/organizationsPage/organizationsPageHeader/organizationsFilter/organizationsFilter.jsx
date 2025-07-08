/*
 * Copyright 2024 EPAM Systems
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

import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Field, formValueSelector } from 'redux-form';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { Dropdown, FieldText } from '@reportportal/ui-kit';
import { CONDITION_BETWEEN, CONDITION_IN } from 'components/filterEntities/constants';
import { fetchFilteredOrganizationsAction } from 'controllers/instance/organizations';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import {
  FilterButton,
  FILTER_FORM,
  LAUNCHES_FILTER_NAME,
  TEAMMATES_FILTER_NAME,
  LAST_RUN_DATE_FILTER_NAME,
  LAUNCHES_FILTER_NAME_CONDITION,
  TEAMMATES_FILTER_NAME_CONDITION,
  ORGANIZATION_TYPE_FILTER_NAME,
  timeRangeValues,
  getRangeComparisons,
  getTimeRange,
  messages as helpMessage,
} from 'components/main/filterButton';
import { getApplyFilterEventParams } from 'components/main/analytics/utils';
import {
  DateRangeFormField,
  formatDisplayedValue,
  parseFormattedDate,
  formatDateRangeToMinutesString,
} from 'components/main/dateRange';
import { messages } from './messages';
import styles from './organizationFilter.scss';

const cx = classNames.bind(styles);

const selector = formValueSelector(FILTER_FORM);

export const OrganizationsFilter = ({
  entities,
  onFilterChange,
  appliedFiltersCount,
  setAppliedFiltersCount,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const timeRange = getTimeRange(formatMessage);
  const rangeComparisons = getRangeComparisons(formatMessage);
  const organizationTypes = [
    { label: formatMessage(messages.typePersonal), value: 'PERSONAL' },
    { label: formatMessage(messages.typeInternal), value: 'INTERNAL' },
    { label: formatMessage(messages.typeSynched), value: 'EXTERNAL' },
  ];
  const lastRunDate = useSelector((state) => selector(state, LAST_RUN_DATE_FILTER_NAME));

  const filters = {
    [ORGANIZATION_TYPE_FILTER_NAME]: {
      filterName: ORGANIZATION_TYPE_FILTER_NAME,
      title: formatMessage(messages.organizationType),
      defaultCondition: CONDITION_IN.toUpperCase(),
      fields: [
        {
          component: Dropdown,
          name: ORGANIZATION_TYPE_FILTER_NAME,
          props: {
            options: organizationTypes,
            value: [],
            multiSelect: true,
            placeholder: formatMessage(messages.organizationTypePlaceholder),
          },
        },
      ],
    },
    [LAST_RUN_DATE_FILTER_NAME]: {
      filterName: LAST_RUN_DATE_FILTER_NAME,
      title: formatMessage(messages.lastRunDate),
      defaultCondition: CONDITION_BETWEEN.toUpperCase(),
      fields: [
        {
          component: Dropdown,
          name: LAST_RUN_DATE_FILTER_NAME,
          props: {
            value: timeRange[0].value,
            options: timeRange,
            formatDisplayedValue: (displayedValue) =>
              formatDisplayedValue(displayedValue, lastRunDate, timeRangeValues),
            notScrollable: true,
            footer: (
              <Field
                name={LAST_RUN_DATE_FILTER_NAME}
                component={DateRangeFormField}
                format={parseFormattedDate}
                parse={formatDateRangeToMinutesString}
              />
            ),
          },
        },
      ],
    },
    [LAUNCHES_FILTER_NAME]: {
      filterName: LAUNCHES_FILTER_NAME,
      title: formatMessage(messages.launches),
      fieldsWrapperClassName: cx('dual-input'),
      fields: [
        {
          component: Dropdown,
          name: LAUNCHES_FILTER_NAME_CONDITION,
          containerClassName: cx('dropdown-condition'),
          props: {
            options: rangeComparisons,
            condition: rangeComparisons[0].value,
          },
        },
        {
          component: FieldText,
          name: LAUNCHES_FILTER_NAME,
          containerClassName: cx('text-field-container'),
          props: {
            value: '',
            placeholder: formatMessage(messages.launchesPlaceholder),
            type: 'number',
            helpText: formatMessage(helpMessage.helpText),
            clearable: true,
            defaultWidth: false,
          },
        },
      ],
    },
    [TEAMMATES_FILTER_NAME]: {
      filterName: TEAMMATES_FILTER_NAME,
      title: formatMessage(messages.users),
      fieldsWrapperClassName: cx('dual-input'),
      fields: [
        {
          component: Dropdown,
          name: TEAMMATES_FILTER_NAME_CONDITION,
          containerClassName: cx('dropdown-condition'),
          props: {
            options: rangeComparisons,
            condition: rangeComparisons[0].value,
            isListWidthLimited: true,
          },
        },
        {
          component: FieldText,
          name: TEAMMATES_FILTER_NAME,
          containerClassName: cx('text-field-container'),
          props: {
            value: '',
            helpText: formatMessage(helpMessage.helpText),
            placeholder: formatMessage(messages.usersPlaceholder),
            type: 'number',
            defaultWidth: false,
            className: cx('input-field'),
            clearable: true,
          },
        },
      ],
    },
  };

  const defaultFilterState = {
    [ORGANIZATION_TYPE_FILTER_NAME]: [],
    [LAST_RUN_DATE_FILTER_NAME]: '',
    [LAUNCHES_FILTER_NAME]: '',
    [LAUNCHES_FILTER_NAME_CONDITION]: rangeComparisons[0].value,
    [TEAMMATES_FILTER_NAME]: '',
    [TEAMMATES_FILTER_NAME_CONDITION]: rangeComparisons[0].value,
  };

  const initialFilterState = {
    [ORGANIZATION_TYPE_FILTER_NAME]:
      entities[ORGANIZATION_TYPE_FILTER_NAME]?.value?.split(',') || [],
    [LAST_RUN_DATE_FILTER_NAME]: entities[LAST_RUN_DATE_FILTER_NAME]?.value || timeRange[0].value,
    [LAUNCHES_FILTER_NAME]: entities[LAUNCHES_FILTER_NAME]?.value || '',
    [LAUNCHES_FILTER_NAME_CONDITION]:
      entities[LAUNCHES_FILTER_NAME]?.condition || rangeComparisons[0].value,
    [TEAMMATES_FILTER_NAME]: entities[TEAMMATES_FILTER_NAME]?.value || '',
    [TEAMMATES_FILTER_NAME_CONDITION]:
      entities[TEAMMATES_FILTER_NAME]?.condition || rangeComparisons[0].value,
  };

  const eventHandler = (fields) => {
    const { type, condition } = getApplyFilterEventParams(
      fields,
      initialFilterState,
      entities[LAST_RUN_DATE_FILTER_NAME]?.value,
      LAST_RUN_DATE_FILTER_NAME,
    );

    return ORGANIZATION_PAGE_EVENTS.clickApplyFilterButton(type, condition);
  };

  const getClearButtonState = (formValues) => {
    return (
      [LAST_RUN_DATE_FILTER_NAME, LAUNCHES_FILTER_NAME, TEAMMATES_FILTER_NAME].every(
        (prop) => formValues?.[prop] === '',
      ) && formValues[ORGANIZATION_TYPE_FILTER_NAME].length === 0
    );
  };

  const getApplyButtonState = (formValues) => {
    if (!formValues) {
      return false;
    }

    let isApply =
      [LAUNCHES_FILTER_NAME, TEAMMATES_FILTER_NAME].every(
        (prop) => formValues[prop] === initialFilterState[prop],
      ) &&
      formValues[ORGANIZATION_TYPE_FILTER_NAME].every((type) =>
        initialFilterState[ORGANIZATION_TYPE_FILTER_NAME].includes(type),
      ) &&
      formValues[ORGANIZATION_TYPE_FILTER_NAME].length ===
        initialFilterState[ORGANIZATION_TYPE_FILTER_NAME].length;

    if (initialFilterState[LAUNCHES_FILTER_NAME] !== '') {
      isApply =
        formValues[LAUNCHES_FILTER_NAME_CONDITION] ===
          initialFilterState[LAUNCHES_FILTER_NAME_CONDITION] && isApply;
    }
    if (initialFilterState[TEAMMATES_FILTER_NAME] !== '') {
      isApply =
        formValues[TEAMMATES_FILTER_NAME_CONDITION] ===
          initialFilterState[TEAMMATES_FILTER_NAME_CONDITION] && isApply;
    }

    return isApply;
  };

  return (
    <FilterButton
      defaultFilters={filters}
      appliedFiltersCount={appliedFiltersCount}
      setAppliedFiltersCount={setAppliedFiltersCount}
      definedFilters={entities}
      onFilterChange={onFilterChange}
      initialState={initialFilterState}
      defaultState={defaultFilterState}
      filteredAction={() => dispatch(fetchFilteredOrganizationsAction())}
      getClearButtonState={getClearButtonState}
      getApplyButtonState={getApplyButtonState}
      searchProp="name"
      event={eventHandler}
    />
  );
};

OrganizationsFilter.propTypes = {
  entities: PropTypes.objectOf(
    PropTypes.shape({
      filter_key: PropTypes.string,
      value: PropTypes.string,
      condition: PropTypes.string,
    }),
  ),
  onFilterChange: PropTypes.func.isRequired,
  appliedFiltersCount: PropTypes.number.isRequired,
  setAppliedFiltersCount: PropTypes.func.isRequired,
};
