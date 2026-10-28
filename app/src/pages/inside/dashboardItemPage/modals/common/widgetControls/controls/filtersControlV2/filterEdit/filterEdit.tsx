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

import { FC } from 'react';
import { Radio } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';
import { Filter } from 'pages/inside/dashboardItemPage/modals/widgetWizardModal/types';
import { messages } from '../../filtersControl/common/messages';
import { AddEditFilter } from '../common/addEditFilter';
import styles from './filterEdit.scss';

const cx = createClassnames(styles);


interface FilterEditProps {
  filter: Filter;
  onSave: (filter: Filter) => void;
  onCancel: (filter: Filter) => void;
  onChange: (data: Partial<Filter>) => void;
}

export const FilterEdit: FC<FilterEditProps> = ({
  filter,
  onSave,
  onCancel,
  onChange,
}) => (
  <AddEditFilter
    filter={filter}
    onCancel={() => onCancel(filter)}
    onSubmit={() => onSave(filter)}
    onChange={onChange}
    customBlock={
      <div className={cx('filter-edit-header')}>
        <Radio
          option={{ value: filter.id, label: filter.name, disabled: false }}
          value={filter.id}
        />
      </div>
    }
    blockTitle={messages.editTitle}
  />
);
