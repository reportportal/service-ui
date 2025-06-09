/*
 * Copyright 2025 EPAM Systems
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
import { Field, formValueSelector } from 'redux-form';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Dropdown, FieldText } from '@reportportal/ui-kit';
import { CONDITION_BETWEEN, CONDITION_CNT } from 'components/filterEntities/constants';
import { fetchFilteredOrganizationsAction } from 'controllers/instance/organizations';
import {
  FilterButton,
  ACCOUNT_TYPE_FILTER_NAME,
  EMAIL_FILTER_NAME,
  EMAIL_FILTER_NAME_CONDITION,
  getAccountTypes,
  getEmailComparisons,
  getLastLogin,
  getPermissions,
  LAST_LOGIN_FILTER_NAME,
  USERS_PERMISSIONS_FILTER_NAME,
  FILTER_FORM,
} from 'components/main/filterButton';
import { ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/allUsersPage';
import { getApplyFilterEventParams } from 'components/main/analytics/utils';
import {
  DateRangeFormField,
  formatDisplayedValue,
  parseFormattedDate,
} from 'components/main/dateRange';
import { messages } from './messages';
import styles from './allUsersFilter.scss';

const cx = classNames.bind(styles);

const selector = formValueSelector(FILTER_FORM);

export const AllUsersFilter = ({
  entities,
  onFilterChange,
  appliedFiltersCount,
  setAppliedFiltersCount,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const permissions = getPermissions(formatMessage);
  const accountTypes = getAccountTypes(formatMessage);
  const lastLogin = getLastLogin(formatMessage);
  const emailComparisons = getEmailComparisons(formatMessage);
  const lastRunDate = useSelector((state) => selector(state, LAST_LOGIN_FILTER_NAME));

  const filters = {
    [USERS_PERMISSIONS_FILTER_NAME]: {
      filterName: USERS_PERMISSIONS_FILTER_NAME,
      title: formatMessage(messages.permissions),
      defaultCondition: CONDITION_CNT.toUpperCase(),
      fields: [
        {
          component: Dropdown,
          name: USERS_PERMISSIONS_FILTER_NAME,
          props: {
            options: permissions,
            value: [],
            placeholder: formatMessage(messages.permissionsPlaceholder),
          },
        },
      ],
    },
    [ACCOUNT_TYPE_FILTER_NAME]: {
      filterName: ACCOUNT_TYPE_FILTER_NAME,
      title: formatMessage(messages.type),
      defaultCondition: CONDITION_CNT.toUpperCase(),
      fields: [
        {
          component: Dropdown,
          name: ACCOUNT_TYPE_FILTER_NAME,
          props: {
            options: accountTypes,
            value: [],
            multiSelect: true,
            placeholder: formatMessage(messages.typePlaceholder),
          },
        },
      ],
    },
    [LAST_LOGIN_FILTER_NAME]: {
      filterName: LAST_LOGIN_FILTER_NAME,
      title: formatMessage(messages.lastLogin),
      defaultCondition: CONDITION_BETWEEN.toUpperCase(),
      fields: [
        {
          component: Dropdown,
          name: LAST_LOGIN_FILTER_NAME,
          props: {
            value: '',
            options: lastLogin,
            placeholder: formatMessage(messages.lastLoginPlaceholder),
            formatDisplayedValue,
            notScrollable: true,
            footer: <Field name={LAST_LOGIN_FILTER_NAME} component={DateRangeFormField} />,
          },
        },
      ],
    },
    [EMAIL_FILTER_NAME]: {
      filterName: EMAIL_FILTER_NAME,
      title: formatMessage(messages.email),
      fieldsWrapperClassName: cx('dual-input'),
      fields: [
        {
          component: Dropdown,
          name: EMAIL_FILTER_NAME_CONDITION,
          containerClassName: cx('dropdown-condition'),
          props: {
            options: emailComparisons,
            condition: emailComparisons[0].value,
          },
        },
        {
          component: FieldText,
          name: EMAIL_FILTER_NAME,
          containerClassName: cx('text-field-container'),
          props: {
            value: '',
            placeholder: formatMessage(messages.emailPlaceholder),
            clearable: true,
            defaultWidth: false,
            maxLength: 256,
          },
        },
      ],
    },
  };

  const defaultFilterState = {
    [USERS_PERMISSIONS_FILTER_NAME]: '',
    [ACCOUNT_TYPE_FILTER_NAME]: [],
    [LAST_LOGIN_FILTER_NAME]: '',
    [EMAIL_FILTER_NAME]: '',
    [EMAIL_FILTER_NAME_CONDITION]: emailComparisons[0].value,
  };

  const initialFilterState = {
    [USERS_PERMISSIONS_FILTER_NAME]: entities[USERS_PERMISSIONS_FILTER_NAME]?.value || '',
    [ACCOUNT_TYPE_FILTER_NAME]: entities[ACCOUNT_TYPE_FILTER_NAME]?.value?.split(',') || [],
    [LAST_LOGIN_FILTER_NAME]:
      parseFormattedDate(entities[LAST_LOGIN_FILTER_NAME]?.value) ||
      entities[LAST_LOGIN_FILTER_NAME]?.value ||
      '',
    [EMAIL_FILTER_NAME_CONDITION]:
      entities[EMAIL_FILTER_NAME]?.condition || emailComparisons[0].value,
    [EMAIL_FILTER_NAME]: entities[EMAIL_FILTER_NAME]?.value || '',
  };

  const eventHandler = (fields) => {
    const { type, condition } = getApplyFilterEventParams(
      fields,
      initialFilterState,
      entities[LAST_LOGIN_FILTER_NAME]?.value,
      LAST_LOGIN_FILTER_NAME,
    );

    return ALL_USERS_PAGE_EVENTS.clickApplyFilterButton(type, condition);
  };

  const getClearButtonState = (formValues) => {
    return (
      [USERS_PERMISSIONS_FILTER_NAME, LAST_LOGIN_FILTER_NAME, EMAIL_FILTER_NAME].every(
        (prop) => formValues?.[prop] === '',
      ) && formValues[ACCOUNT_TYPE_FILTER_NAME].length === 0
    );
  };

  const getApplyButtonState = (formValues) => {
    if (!formValues) {
      return false;
    }

    if (typeof lastRunDate === 'object' && (!lastRunDate.startDate || !lastRunDate?.endDate)) {
      return true;
    }

    let isApply =
      [USERS_PERMISSIONS_FILTER_NAME, LAST_LOGIN_FILTER_NAME, EMAIL_FILTER_NAME].every(
        (prop) => formValues[prop] === initialFilterState[prop],
      ) &&
      formValues[ACCOUNT_TYPE_FILTER_NAME].every((type) =>
        initialFilterState[ACCOUNT_TYPE_FILTER_NAME].includes(type),
      ) &&
      formValues[ACCOUNT_TYPE_FILTER_NAME].length ===
        initialFilterState[ACCOUNT_TYPE_FILTER_NAME].length;

    if (initialFilterState[EMAIL_FILTER_NAME] !== '') {
      isApply =
        formValues[EMAIL_FILTER_NAME_CONDITION] ===
          initialFilterState[EMAIL_FILTER_NAME_CONDITION] && isApply;
    }

    if (typeof lastRunDate === 'object') {
      const initialDate = formatDisplayedValue(initialFilterState[LAST_LOGIN_FILTER_NAME]);
      const currentDate = formatDisplayedValue(lastRunDate);
      isApply = initialDate === currentDate && isApply;
    } else {
      isApply =
        formValues[LAST_LOGIN_FILTER_NAME] === initialFilterState[LAST_LOGIN_FILTER_NAME] &&
        isApply;
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
      searchProp="full_name"
      event={eventHandler}
    />
  );
};

AllUsersFilter.propTypes = {
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
