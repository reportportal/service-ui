/*
 * Copyright 2026 EPAM Systems
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

import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';
import { change } from 'redux-form';
import { Button, PlusIcon, FieldLabel, BaseIconButton, EditIcon } from '@reportportal/ui-kit';
import { AutocompleteOption } from '@reportportal/ui-kit/autocompletes';
import { projectKeySelector } from 'controllers/project';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import { fetch, createClassnames } from 'common/utils';
import { URLS } from 'common/urls';
import { updateFilterSuccessAction } from 'controllers/filter';
import { canWorkWithFilters } from 'common/utils/permissions';
import { userRolesSelector } from 'controllers/pages';
import { handleEnterOrSpaceKey } from 'common/utils/helperUtils/eventUtils';
import { AsyncAutocompleteV2 } from 'componentLibrary/autocompletes/asyncAutocompleteV2';
import { Condition, Filter } from 'pages/inside/dashboardItemPage/modals/widgetWizardModal/types';
import { FilterOptions } from 'pages/inside/filtersPage/filterGrid/filterOptions';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { WIDGET_WIZARD_FORM } from '../../../constants';
import { LockedActiveFilter } from '../filtersControl/lockedActiveFilter';
import { FilterEdit } from './filterEdit';
import { FilterAdd } from './filterAdd';
import {
  FORM_APPEARANCE_MODE_ADD,
  FORM_APPEARANCE_MODE_EDIT,
  FORM_APPEARANCE_MODE_LOCKED,
  NEW_FILTER_DEFAULT_CONFIG,
} from '../filtersControl/common/constants';
import styles from './filtersControlV2.scss';

const cx = createClassnames(styles);

const PRELOAD_PAGE_SIZE = 10;

const messages = defineMessages({
  insertFilterSuccess: {
    id: 'FiltersControlV2.insertFilterSuccess',
    defaultMessage: 'Filter has been created',
  },
  insertFilterError: {
    id: 'FiltersControlV2.insertFilterError',
    defaultMessage: 'Filter has not been created',
  },
  updateFilterSuccess: {
    id: 'FiltersControlV2.updateFilterSuccess',
    defaultMessage: 'Filter has been updated',
  },
  updateFilterError: {
    id: 'FiltersControlV2.updateFilterError',
    defaultMessage: 'Filter has not been updated',
  },
  filtersNotFound: {
    id: 'FiltersControlV2.notFound',
    defaultMessage: `No filters found for "{filter}".`,
  },
  filtersNotFoundOnProject: {
    id: 'FiltersControlV2.notFoundOnProject',
    defaultMessage: `No filters on a project`,
  },
  createFilterButton: {
    id: 'FiltersControlV2.createFilterButton',
    defaultMessage: 'Create filter',
  },
  filterPlaceholder: {
    id: 'FiltersControlV2.filterPlaceholder',
    defaultMessage: 'Search and select filter by name',
  },
  filterLabel: {
    id: 'FiltersControlV2.filterLabel',
    defaultMessage: 'Filter',
  },
  latestFiltersHint: {
    id: 'FiltersControlV2.latestFiltersHint',
    defaultMessage: 'Showing the 10 latest filters. Start typing to find others.',
  },
});

interface FilterValue {
  id?: number;
  value?: number;
  name?: string;
  type?: string;
  description?: string;
  owner?: string;
  conditions?: Filter['conditions'];
  orders?: Filter['orders'];
}

const LAUNCH_FILTER_TYPE = 'launch';

interface FormAppearance {
  mode: string | false;
  isMainControlsLocked?: boolean;
  filter?: Filter | null;
  predefinedFilter?: Filter | null;
}
interface FiltersControlV2Props {
  // Injected by FieldProvider
  value?: FilterValue;
  onChange?: (value: FilterValue | FilterValue[]) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  touched?: boolean;
  error?: string | boolean;
  // Own props
  formAppearance: FormAppearance;
  onFormAppearanceChange: (mode: string | false, filter: Filter | null) => void;
  eventsInfo?: Record<string, unknown>;
  required?: boolean;
}

export const FiltersControlV2 = ({
  value = {},
  formAppearance,
  onFormAppearanceChange,
  required = false,
}: FiltersControlV2Props) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const projectKey = useSelector(projectKeySelector);
  const userRoles = useSelector(userRolesSelector);
  const lastSearchRef = useRef('');
  const [showLatestFiltersHint, setShowLatestFiltersHint] = useState(false);

  const menuPortalRoot = document.getElementById('tooltip-root') || document.body;

  const getFilterForSubmit = ({ value: _value, ...filter }: Filter): Filter => ({
    ...filter,
    type: filter.type || LAUNCH_FILTER_TYPE,
    conditions: filter.conditions?.filter((item: Condition) => item.value.trim()),
  });

  const handleActiveFilterChange = (id: number, filterItem?: Filter) => {
    dispatch(
      change(
        WIDGET_WIZARD_FORM,
        'filters',
        [
          {
            ...filterItem,
            id,
            value: id,
            type: (filterItem?.type as string) || LAUNCH_FILTER_TYPE,
          },
        ],
        null,
      ),
    );
  };

  useEffect(() => {
    if (formAppearance.predefinedFilter?.id != null) {
      handleActiveFilterChange(formAppearance.predefinedFilter.id, formAppearance.predefinedFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearFilter = () => {
    dispatch(change(WIDGET_WIZARD_FORM, 'filters', [], null));
  };

  const clearFormAppearance = () => onFormAppearanceChange(false, null);

  const handleFilterChange = (newFilter: Filter) => {
    const { mode, filter = {} } = formAppearance;
    onFormAppearanceChange(mode, { ...filter, ...newFilter });
  };

  const handleFilterInsert = () => {
    const { filter = null } = formAppearance;
    fetch(URLS.filters(projectKey), {
      method: 'post',
      data: getFilterForSubmit(filter),
    })
      .then(({ id }: { id: number }) => {
        handleActiveFilterChange(id, filter);
        dispatch(showSuccessNotification({ message: formatMessage(messages.insertFilterSuccess) }));
      })
      .catch(() => {
        dispatch(showErrorNotification({ message: formatMessage(messages.insertFilterError) }));
      });
    clearFormAppearance();
  };

  const handleFilterUpdate = (filter: Filter) => {
    const data = getFilterForSubmit(filter);
    fetch(URLS.filter(projectKey, String(filter.id)) as string, {
      method: 'put',
      data,
    })
      .then(() => {
        if (filter.id != null) {
          handleActiveFilterChange(filter.id, data);
        }
        dispatch(updateFilterSuccessAction(data));
        dispatch(showSuccessNotification({ message: formatMessage(messages.updateFilterSuccess) }));
      })
      .catch(() => {
        dispatch(showErrorNotification({ message: formatMessage(messages.updateFilterError) }));
      });
    clearFormAppearance();
  };

  const handleFormAppearanceMode = (
    event: React.KeyboardEvent | React.MouseEvent,
    mode: string,
    filter?: Filter | null,
  ) => {
    // handleEnterOrSpaceKey expects a KeyboardEvent — if a mouse event is passed we skip it
    if ((event as React.KeyboardEvent).key) {
      handleEnterOrSpaceKey(event as React.KeyboardEvent);
    }
    onFormAppearanceChange(mode || formAppearance.mode, filter ?? null);
  };

  if (formAppearance.mode !== false) {
    const { mode, filter: formAppearanceFilter = null } = formAppearance;
    const activeFilter: Filter | null = value?.value
      ? { id: value.value, name: value.name ?? '' }
      : null;

    const getComponent = () => {
      switch (mode) {
        case FORM_APPEARANCE_MODE_EDIT:
          return (
            <FilterEdit
              filter={formAppearanceFilter}
              onChange={handleFilterChange}
              onCancel={clearFormAppearance}
              onSave={handleFilterUpdate}
            />
          );
        case FORM_APPEARANCE_MODE_ADD:
          return (
            <FilterAdd
              filter={
                formAppearanceFilter && formAppearanceFilter.conditions
                  ? formAppearanceFilter
                  : NEW_FILTER_DEFAULT_CONFIG
              }
              projectKey={projectKey}
              onChange={handleFilterChange}
              onCancel={clearFormAppearance}
              onSave={handleFilterInsert}
            />
          );
        case FORM_APPEARANCE_MODE_LOCKED:
          return <LockedActiveFilter filter={activeFilter} onEdit={clearFormAppearance} />;
        default:
          return null;
      }
    };

    return <div className={cx('filters-control-form')}>{getComponent()}</div>;
  }

  const selectedFilter: Filter | null = value?.value
    ? {
        ...value,
        id: value.id ?? value.value,
        name: value.name ?? '',
        type: value.type || LAUNCH_FILTER_TYPE,
      }
    : null;

  const getURI = (searchValue: string) => {
    const search = (searchValue || '').trim();
    lastSearchRef.current = search;

    if (!search) {
      return `${URLS.filters(projectKey)}?page.page=1&page.size=${PRELOAD_PAGE_SIZE}&page.sort=id,DESC`;
    }

    return `${URLS.filters(projectKey)}?page.page=1&page.size=50&page.sort=name&filter.cnt.name=${encodeURIComponent(search)}`;
  };

  const makeFilterOptions = (response: {
    content?: Filter[];
    page?: { totalElements?: number };
  }): Filter[] => {
    setShowLatestFiltersHint(
      !lastSearchRef.current && (response.page?.totalElements ?? 0) > PRELOAD_PAGE_SIZE,
    );

    return response.content ?? [];
  };

  return (
    <div className={cx('filters-control-wrapper')}>
      <div className={cx('filters-control')}>
        <div className={cx('filters-control-field')}>
          <FieldLabel isRequired={required}>{formatMessage(messages.filterLabel)}</FieldLabel>
          <AsyncAutocompleteV2
            value={selectedFilter}
            placeholder={formatMessage(messages.filterPlaceholder)}
            getURI={getURI}
            makeOptions={makeFilterOptions}
            onChange={(selected: Filter | null | undefined) => {
              if (selected?.id != null) handleActiveFilterChange(selected.id, selected);
              else handleClearFilter();
            }}
            parseValueToString={(v: { name?: string }) => v?.name || ''}
            getUniqKey={(v: { id?: number }) => v?.id}
            createWithoutConfirmation
            skipOptionCreation
            isDropdownMode
            minLength={0}
            menuPortalRoot={menuPortalRoot}
            dropdownMatchInputWidth
            menuClassName={cx('filter-autocomplete-menu')}
            menuFooter={
              showLatestFiltersHint ? formatMessage(messages.latestFiltersHint) : undefined
            }
            renderOption={(item: Filter, index: number, isNew: boolean, getItemProps) => (
              <AutocompleteOption key={item.id} {...getItemProps({ item, index })} isNew={isNew}>
                <div className={cx('filter-option-name')}>{item.name}</div>
                <FilterOptions
                  className={cx('filter-option-description', 'clamped')}
                  entities={item.conditions}
                  sort={item.orders}
                />
              </AutocompleteOption>
            )}
            inputProps={{
              clearable: true,
              required,
            }}
          />
        </div>
        <Button
          variant="ghost"
          icon={<PlusIcon />}
          adjustWidthOn="content"
          className={cx('create-filter-btn')}
          onClick={(e) => handleFormAppearanceMode(e, FORM_APPEARANCE_MODE_ADD)}
          disabled={!canWorkWithFilters(userRoles)}
        >
          {formatMessage(messages.createFilterButton)}
        </Button>
      </div>
      {selectedFilter && (
        <div className={cx('filter-card')}>
          <div className={cx('filter-card-header')}>
            <span className={cx('filter-option-name')}>{selectedFilter.name}</span>
            <BaseIconButton
              aria-label={formatMessage(COMMON_LOCALE_KEYS.EDIT)}
              onClick={(e) =>
                handleFormAppearanceMode(e, FORM_APPEARANCE_MODE_EDIT, selectedFilter)
              }
            >
              <EditIcon />
            </BaseIconButton>
          </div>
          <FilterOptions
            className={cx('filter-option-description')}
            entities={selectedFilter.conditions}
            sort={selectedFilter.orders}
          />
        </div>
      )}
    </div>
  );
};
