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
import { Button, PlusIcon } from '@reportportal/ui-kit';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { createClassnames } from 'common/utils';
import { CustomColumnItem } from './customColumnItem';
import styles from './customColumnsControl.scss';

const cx = createClassnames(styles);

const MAX_CUSTOM_COLUMNS = 3;

const messages = defineMessages({
  tip: {
    id: 'CustomColumnsControl.tip',
    defaultMessage: 'You can add custom column to view attributes with chosen key',
  },
  addColumn: {
    id: 'CustomColumnsControl.addColumn',
    defaultMessage: 'Add custom column',
  },
});

interface CustomColumn {
  name: string;
  value: string;
}

interface CustomColumnsControlProps {
  value?: CustomColumn[];
  onChange?: (value: CustomColumn[]) => void;
  error?: string;
  getURI: (searchValue?: string) => string;
}

export const CustomColumnsControl = ({
  value = [],
  onChange,
  error = '',
  getURI,
}: CustomColumnsControlProps) => {
  const { formatMessage } = useIntl();

  const handleChangeColumn = (itemValue: CustomColumn, index: number) => {
    onChange?.(value.map((val, i) => (index === i ? itemValue : val)));
  };

  const addColumn = () => {
    onChange?.(value.concat([{ name: '', value: '' }]));
  };

  const removeColumn = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  return (
    <div className={cx('custom-columns-control')}>
      {value.map((column, i) => (
        <CustomColumnItem
          key={`column_${i + 1}`}
          index={i}
          name={column.name}
          attributeKey={column.value}
          getURI={getURI}
          onChange={handleChangeColumn}
          onRemove={removeColumn}
          noRemove={value.length === 1}
        />
      ))}
      {error && (
        <div className={cx('warning')}>
          <FieldErrorHint error={error} active touched />
        </div>
      )}
      {value.length < MAX_CUSTOM_COLUMNS && !error && (
        <div className={cx('footer')}>
          <div className={cx('tip')}>{formatMessage(messages.tip)}</div>
          <Button variant="text" adjustWidthOn="content" icon={<PlusIcon />} onClick={addColumn}>
            {formatMessage(messages.addColumn)}
          </Button>
        </div>
      )}
    </div>
  );
};
