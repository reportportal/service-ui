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

import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';
import { change } from 'redux-form';
import { Button, PlusIcon, FieldLabel } from '@reportportal/ui-kit';
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
import { Filter } from 'pages/inside/dashboardItemPage/modals/widgetWizardModal/types';
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

const messages = defineMessages({
  insertFilterSuccess: {
    id: 'FiltersControlV2.insertFilterSuccess',
    defaultMessage: 'Filter has been created',
  },
  insertFilterError: {
    id: 'FiltersControlV2.insertFilterError',
    defaultMessage: "Filter don't created",
  },
  updateFilterSuccess: {
    id: 'FiltersControlV2.updateFilterSuccess',
    defaultMessage: 'Filter has been updated',
  },
  updateFilterError: {
    id: 'FiltersControlV2.updateFilterError',
    defaultMessage: "Filter don't updated",
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
});

interface FilterValue {
  value?: string;
  name?: string;
}

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

export const FiltersControlV2: FC<FiltersControlV2Props> = ({
  value = {},
  formAppearance,
  onFormAppearanceChange,
  required = false,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const projectKey = useSelector(projectKeySelector) as string;
  const userRoles = useSelector(userRolesSelector);

  const menuPortalRoot = document.getElementById('tooltip-root') || document.body;

  useEffect(() => {
    if (formAppearance.predefinedFilter) {
      handleActiveFilterChange(
        formAppearance.predefinedFilter.id.toString(),
        formAppearance.predefinedFilter,
      );
    }
  }, []);

  const getFilterForSubmit = (filter: Filter) => ({
    ...filter,
    conditions: (filter.conditions as Array<{ value: string }>)?.filter((item) =>
      item.value.trim(),
    ),
  });

  const handleActiveFilterChange = (id: string, filterItem?: Filter) => {
    dispatch(change(WIDGET_WIZARD_FORM, 'filters', [{ value: id, name: filterItem?.name }], null));
  };

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
        handleActiveFilterChange(String(id), filter);
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
      ? ({ id: Number(value.value), name: value.name ?? '' })
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
    ? ({ id: Number(value.value), name: value.name ?? '' })
    : null;

  const getURI = (searchValue: string) =>
    `${URLS.filtersSearch(projectKey)}${encodeURIComponent(searchValue)}`;

  const makeFilterOptions = (response: { content: Filter[] }) => response.content;

  return (
    <div className={cx('filters-control')}>
      <div className={cx('filters-control-field')}>
        <FieldLabel isRequired={required}>{formatMessage(messages.filterLabel)}</FieldLabel>
        <AsyncAutocompleteV2
          value={selectedFilter}
          placeholder={formatMessage(messages.filterPlaceholder)}
          getURI={getURI}
          makeOptions={makeFilterOptions}
          onChange={(selected: Filter | null | undefined) => {
            if (selected) handleActiveFilterChange(String(selected.id), selected);
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
          renderOption={(item: Filter, index: number, isNew: boolean, getItemProps) => (
            <AutocompleteOption key={item.id} {...getItemProps({ item, index })} isNew={isNew}>
              <div className={cx('filter-option-name')}>{item.name}</div>
              <div className={cx('filter-option-description')}>{item.description}</div>
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
  );
};
