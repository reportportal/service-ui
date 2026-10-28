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
import { commonValidators, validateAsync } from 'common/utils/validation';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { createClassnames } from 'common/utils';
import { Filter } from 'pages/inside/dashboardItemPage/modals/widgetWizardModal/types';
import { messages } from '../../filtersControl/common/messages';
import { FILTER_ADD_FORM, FILTER_NAME_KEY } from '../../filtersControl/common/constants';
import { AddEditFilter } from '../common/addEditFilter';
import styles from './filterAdd.scss';

const cx = createClassnames(styles);

const selector = formValueSelector(FILTER_ADD_FORM);

const localMessages = defineMessages({
  filterName: {
    id: 'AddFilter.filterName',
    defaultMessage: 'Filter Name',
  },
  placeholderFilterName: {
    id: 'AddFilter.placeholderFilterName',
    defaultMessage: 'Input filter name',
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

  const handleFilterChange = (updatedFilter: Filter) => {
    onChange({ ...updatedFilter, name });
  };

  return (
    <AddEditFilter
      filter={filter}
      onCancel={onCancel}
      onSubmit={onSave}
      onChange={handleFilterChange}
      isValid={valid}
      blockTitle={messages.addTitle}
      customBlock={
        <div className={cx('filter-add-custom-block')}>
          <span className={cx('custom-block-text')}>{formatMessage(localMessages.filterName)}</span>
          <FieldProvider name={FILTER_NAME_KEY}>
            <FieldErrorHint provideHint={false}>
              <FieldText
                placeholder={formatMessage(localMessages.placeholderFilterName)}
                maxLength={128}
                defaultWidth={false}
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
      }
    />
  );
};

export const FilterAdd = reduxForm<FilterAddFormValues, OwnProps>({
  form: FILTER_ADD_FORM,
  validate: ({ name }: FilterAddFormValues) => ({
    name: commonValidators.filterName(name),
  }),
  asyncValidate: ({ name }: FilterAddFormValues, _dispatch, props: OwnProps) =>
    validateAsync.filterNameUnique(props.projectKey, undefined, name),
  asyncChangeFields: ['name'],
  asyncBlurFields: ['name'],
  onChange: ({ name }: FilterAddFormValues, _dispatcher, props: OwnProps) => props.onChange({ name }),
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(FilterAddBase);
