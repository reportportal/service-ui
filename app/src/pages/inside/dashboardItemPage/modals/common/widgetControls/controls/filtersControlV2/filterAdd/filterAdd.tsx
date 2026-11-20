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

import { useSelector } from 'react-redux';
import { reduxForm, InjectedFormProps, formValueSelector } from 'redux-form';
import { defineMessages, useIntl } from 'react-intl';
import { FieldText } from '@reportportal/ui-kit';
import { validateAsync } from 'common/utils/validation';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Filter } from 'pages/inside/dashboardItemPage/modals/widgetWizardModal/types';
import { FILTER_ADD_FORM, FILTER_NAME_KEY } from '../../filtersControl/common/constants';
import { AddEditFilter } from '../common/addEditFilter';

const FILTER_NAME_MIN_LENGTH = 3;
const FILTER_NAME_MAX_LENGTH = 128;

const selector = formValueSelector(FILTER_ADD_FORM);

const localMessages = defineMessages({
  blockTitle: {
    id: 'FilterAdd.blockTitle',
    defaultMessage: 'Create Filter',
  },
  filterName: {
    id: 'FilterAdd.filterName',
    defaultMessage: 'Filter name',
  },
  placeholderFilterName: {
    id: 'FilterAdd.placeholderFilterName',
    defaultMessage: 'Enter filter name',
  },
  filterNameHelpText: {
    id: 'FilterAdd.filterNameHelpText',
    defaultMessage: 'Filter name length should have size from 3 to 128 characters.',
  },
});

interface OwnProps {
  filter: Filter;
  onSave: () => void;
  onCancel: () => void;
  onChange: (filter: Filter) => void;
  // Read by reduxForm asyncValidate (props.projectKey), not by the component body
  // eslint-disable-next-line react/no-unused-prop-types
  projectKey: string;
}

type FilterAddFormValues = { name?: string };

type FilterAddBaseProps = OwnProps & InjectedFormProps<FilterAddFormValues, OwnProps>;

const FilterAddBase = ({ filter, valid, onSave, onCancel, onChange }: FilterAddBaseProps) => {
  const { formatMessage } = useIntl();
  const name = useSelector((state) => selector(state, FILTER_NAME_KEY) as string);
  const isNameValid = (name?.trim().length ?? 0) >= FILTER_NAME_MIN_LENGTH;

  const handleFilterChange = (updatedFilter: Filter) => {
    onChange({ ...updatedFilter, name });
  };

  return (
    <AddEditFilter
      filter={filter}
      onCancel={onCancel}
      onSubmit={onSave}
      onChange={handleFilterChange}
      isValid={valid && isNameValid}
      blockTitle={formatMessage(localMessages.blockTitle)}
      submitTitle={formatMessage(localMessages.blockTitle)}
      customBlock={
        <FieldProvider name={FILTER_NAME_KEY}>
          <FieldErrorHint provideHint={false}>
            <FieldText
              label={formatMessage(localMessages.filterName)}
              placeholder={formatMessage(localMessages.placeholderFilterName)}
              helpText={formatMessage(localMessages.filterNameHelpText)}
              maxLength={FILTER_NAME_MAX_LENGTH}
              maxLengthDisplay={FILTER_NAME_MAX_LENGTH}
              defaultWidth={false}
              isRequired
            />
          </FieldErrorHint>
        </FieldProvider>
      }
    />
  );
};

export const FilterAdd = reduxForm<FilterAddFormValues, OwnProps>({
  form: FILTER_ADD_FORM,
  // Length is helper text + disabled Create; field error only for duplicate (async)
  asyncValidate: ({ name }: FilterAddFormValues, _dispatch, props: OwnProps) => {
    if ((name?.trim().length ?? 0) < FILTER_NAME_MIN_LENGTH) {
      return Promise.resolve();
    }

    return validateAsync.filterNameUnique(props.projectKey, undefined, name);
  },
  asyncChangeFields: ['name'],
  asyncBlurFields: ['name'],
  onChange: ({ name }: FilterAddFormValues, _dispatcher, props: OwnProps) =>
    props.onChange({ name }),
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(FilterAddBase);
