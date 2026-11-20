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

import { defineMessages, useIntl } from 'react-intl';
import { Filter } from 'pages/inside/dashboardItemPage/modals/widgetWizardModal/types';
import { AddEditFilter } from '../common/addEditFilter';

const messages = defineMessages({
  blockTitle: {
    id: 'FilterEdit.blockTitle',
    defaultMessage: 'Edit Filter: {name}',
  },
  submitTitle: {
    id: 'FilterEdit.submitTitle',
    defaultMessage: 'Save Filter',
  },
});

interface FilterEditProps {
  filter: Filter;
  onSave: (filter: Filter) => void;
  onCancel: (filter: Filter) => void;
  onChange: (data: Partial<Filter>) => void;
}

export const FilterEdit = ({ filter, onSave, onCancel, onChange }: FilterEditProps) => {
  const { formatMessage } = useIntl();

  return (
    <AddEditFilter
      filter={filter}
      onCancel={() => onCancel(filter)}
      onSubmit={() => onSave(filter)}
      onChange={onChange}
      blockTitle={formatMessage(messages.blockTitle, { name: filter.name })}
      submitTitle={formatMessage(messages.submitTitle)}
    />
  );
};
