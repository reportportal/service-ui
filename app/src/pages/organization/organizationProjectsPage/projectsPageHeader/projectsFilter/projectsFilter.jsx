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

import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  LAUNCHES_FILTER_NAME,
  FILTER_NAME,
  TEAMMATES_FILTER_NAME,
  LAST_RUN_DATE_FILTER_NAME,
  getContainmentComparisons,
  getRangeComparisons,
  getTimeRange,
} from 'components/main/filterButton';
import { FilterButton } from 'components/main/filterButton/filterButton';
import { fetchFilteredProjectAction } from 'controllers/organization/projects';
import { messages } from './messages';

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
  const containmentComparisons = getContainmentComparisons(formatMessage);

  const filters = {
    [LAST_RUN_DATE_FILTER_NAME]: {
      filterName: LAST_RUN_DATE_FILTER_NAME,
      value: timeRange[0].value,
      title: formatMessage(messages.lastRunDate),
      options: timeRange,
      placeholder: formatMessage(messages.lastRunDatePlaceholder),
    },
    [LAUNCHES_FILTER_NAME]: {
      filterName: LAUNCHES_FILTER_NAME,
      value: '',
      title: formatMessage(messages.launches),
      placeholder: formatMessage(messages.launchesPlaceholder),
      options: rangeComparisons,
      condition: rangeComparisons[0].value,
      withField: true,
    },
    [TEAMMATES_FILTER_NAME]: {
      filterName: TEAMMATES_FILTER_NAME,
      value: '',
      title: formatMessage(messages.users),
      placeholder: formatMessage(messages.usersPlaceholder),
      options: rangeComparisons,
      condition: rangeComparisons[0].value,
      withField: true,
    },
    [FILTER_NAME]: {
      filterName: FILTER_NAME,
      value: '',
      title: formatMessage(messages.name),
      placeholder: formatMessage(messages.namePlaceholder),
      options: containmentComparisons,
      condition: containmentComparisons[0].value,
      withField: true,
    },
  };

  return (
    <FilterButton
      defaultFilters={filters}
      appliedFiltersCount={appliedFiltersCount}
      setAppliedFiltersCount={setAppliedFiltersCount}
      definedFilters={entities}
      onFilterChange={onFilterChange}
      filteredAction={() => dispatch(fetchFilteredProjectAction())}
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
  onFilterChange: PropTypes.func,
  appliedFiltersCount: PropTypes.number,
  setAppliedFiltersCount: PropTypes.func,
  defaultFilters: PropTypes.object,
};
