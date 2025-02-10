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
import { CONDITION_BETWEEN, CONDITION_IN } from 'components/filterEntities/constants';
import { fetchFilteredOrganizationsAction } from 'controllers/instance/organizations';
import {
  FilterButton,
  LAUNCHES_FILTER_NAME,
  TEAMMATES_FILTER_NAME,
  LAST_RUN_DATE_FILTER_NAME,
  LAUNCHES_FILTER_NAME_CONDITION,
  TEAMMATES_FILTER_NAME_CONDITION,
  ORGANIZATION_TYPE_FILTER_NAME,
  getRangeComparisons,
  getTimeRange,
  getOrganizationTypes,
  messages as helpMessage,
} from 'components/main/filterButton';
import { Dropdown, FieldText } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import { messages } from './messages';
import styles from './organizationFilter.scss';

const cx = classNames.bind(styles);

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
  const organizationTypes = getOrganizationTypes(formatMessage);

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
            value: organizationTypes.map((option) => option.value),
            multiSelect: true,
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
            placeholder: formatMessage(messages.lastRunDatePlaceholder),
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
  const getTypeEntity = () => {
    if (entities[ORGANIZATION_TYPE_FILTER_NAME]) {
      return entities[ORGANIZATION_TYPE_FILTER_NAME].value?.split(',') || [];
    } else {
      return organizationTypes.map((option) => option.value);
    }
  };

  const initialFilterState = {
    [ORGANIZATION_TYPE_FILTER_NAME]: getTypeEntity(),
    [LAST_RUN_DATE_FILTER_NAME]: entities[LAST_RUN_DATE_FILTER_NAME]?.value || timeRange[0].value,
    [LAUNCHES_FILTER_NAME]: entities[LAUNCHES_FILTER_NAME]?.value || '',
    [LAUNCHES_FILTER_NAME_CONDITION]:
      entities[LAUNCHES_FILTER_NAME]?.condition || rangeComparisons[0].value,
    [TEAMMATES_FILTER_NAME]: entities[TEAMMATES_FILTER_NAME]?.value || '',
    [TEAMMATES_FILTER_NAME_CONDITION]:
      entities[TEAMMATES_FILTER_NAME]?.condition || rangeComparisons[0].value,
  };

  return (
    <FilterButton
      defaultFilters={filters}
      appliedFiltersCount={appliedFiltersCount}
      setAppliedFiltersCount={setAppliedFiltersCount}
      definedFilters={entities}
      onFilterChange={onFilterChange}
      initialState={initialFilterState}
      filteredAction={() => dispatch(fetchFilteredOrganizationsAction())}
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
