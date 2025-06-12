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

import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { CONDITION_BETWEEN } from 'components/filterEntities/constants';
import {
  FilterButton,
  LAUNCHES_FILTER_NAME,
  TEAMMATES_FILTER_NAME,
  LAST_RUN_DATE_FILTER_NAME,
  LAUNCHES_FILTER_NAME_CONDITION,
  TEAMMATES_FILTER_NAME_CONDITION,
  getRangeComparisons,
  getTimeRange,
  messages as helpMessage,
} from 'components/main/filterButton';
import { fetchFilteredProjectAction } from 'controllers/organization/projects';
import { PROJECTS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/projectsPageEvents';
import { getApplyFilterEventParams } from 'components/main/analytics/utils';
import { Dropdown, FieldText } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import { messages } from './messages';
import styles from './projectsFilter.scss';

const cx = classNames.bind(styles);
export const ProjectsFilter = ({
  entities,
  onFilterChange,
  appliedFiltersCount,
  setAppliedFiltersCount,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const timeRange = getTimeRange(formatMessage);
  const rangeComparisons = getRangeComparisons(formatMessage);

  const filters = {
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
          },
        },
        {
          component: FieldText,
          name: TEAMMATES_FILTER_NAME,
          containerClassName: cx('text-field-container'),
          props: {
            value: '',
            placeholder: formatMessage(messages.usersPlaceholder),
            type: 'number',
            helpText: formatMessage(helpMessage.helpText),
            clearable: true,
            defaultWidth: false,
          },
        },
      ],
    },
  };

  const eventHandler = (fields, initialState) => {
    const { type, condition } = getApplyFilterEventParams(
      fields,
      initialState,
      LAST_RUN_DATE_FILTER_NAME,
    );

    return PROJECTS_PAGE_EVENTS.clickApplyFilterButton(type, condition);
  };

  const defaultFilterState = {
    [LAST_RUN_DATE_FILTER_NAME]: '',
    [LAUNCHES_FILTER_NAME]: '',
    [LAUNCHES_FILTER_NAME_CONDITION]: rangeComparisons[0].value,
    [TEAMMATES_FILTER_NAME]: '',
    [TEAMMATES_FILTER_NAME_CONDITION]: rangeComparisons[0].value,
  };

  const initialFilterState = {
    [LAST_RUN_DATE_FILTER_NAME]: entities[LAST_RUN_DATE_FILTER_NAME]?.value || timeRange[0].value,
    [LAUNCHES_FILTER_NAME]: entities[LAUNCHES_FILTER_NAME]?.value || '',
    [LAUNCHES_FILTER_NAME_CONDITION]:
      entities[LAUNCHES_FILTER_NAME]?.condition || rangeComparisons[0].value,
    [TEAMMATES_FILTER_NAME]: entities[TEAMMATES_FILTER_NAME]?.value || '',
    [TEAMMATES_FILTER_NAME_CONDITION]:
      entities[TEAMMATES_FILTER_NAME]?.condition || rangeComparisons[0].value,
  };

  const getClearButtonState = (formValues) => {
    return [LAST_RUN_DATE_FILTER_NAME, LAUNCHES_FILTER_NAME, TEAMMATES_FILTER_NAME].every(
      (prop) => formValues?.[prop] === '',
    );
  };

  const getApplyButtonState = (formValues) => {
    if (!formValues) {
      return false;
    }

    let isApply = [LAST_RUN_DATE_FILTER_NAME, LAUNCHES_FILTER_NAME, TEAMMATES_FILTER_NAME].every(
      (prop) => formValues[prop] === initialFilterState[prop],
    );

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
      filteredAction={() => dispatch(fetchFilteredProjectAction())}
      getClearButtonState={getClearButtonState}
      getApplyButtonState={getApplyButtonState}
      searchProp="name"
      event={eventHandler}
    />
  );
};

ProjectsFilter.propTypes = {
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
