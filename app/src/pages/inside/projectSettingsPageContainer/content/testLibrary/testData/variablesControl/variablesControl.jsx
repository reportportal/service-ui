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

import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import {
  Button,
  FieldText,
  SearchIcon,
  PlusIcon,
  MeatballMenuIcon,
  CopyIcon,
  DeleteIcon,
} from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { PopoverControl } from 'pages/common/popoverControl';
import { VariablesList } from './variablesList';
import { SortDropdown } from './sortDropdown';

import styles from './variablesControl.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  variables: {
    id: 'TestData.variables',
    defaultMessage: 'Variables',
  },
  globalProjectKeys: {
    id: 'TestData.globalProjectKeys',
    defaultMessage: 'Global project keys, defining test data parameters across testing scopes',
  },
  addVariable: {
    id: 'TestData.addVariable',
    defaultMessage: 'Add variable',
  },
  typeToSearchVariable: {
    id: 'TestData.typeToSearchVariable',
    defaultMessage: 'Type to search variable',
  },
  duplicateToProject: {
    id: 'TestData.duplicateToProject',
    defaultMessage: 'Duplicate to Project',
  },
  deleteAllVariables: {
    id: 'TestData.deleteAllVariables',
    defaultMessage: 'Delete all Variables',
  },
});

export const VariablesControl = ({ variables }) => {
  const [searchValue, setSearchValue] = useState('');
  const { formatMessage } = useIntl();

  const variablesToolItems = [
    {
      label: formatMessage(messages.duplicateToProject),
      icon: <CopyIcon />,
    },
    {
      label: formatMessage(messages.deleteAllVariables),
      icon: <DeleteIcon />,
      className: cx('variables-control-wrapper__title-wrapper--tool-red'),
    },
  ];

  return (
    <div className={cx('variables-control-wrapper')}>
      <div className={cx('variables-control-wrapper__title-wrapper')}>
        <h4 title={formatMessage(messages.variables)}>{formatMessage(messages.variables)}</h4>
        <PopoverControl items={variablesToolItems}>
          <MeatballMenuIcon />
        </PopoverControl>
      </div>
      <div className={cx('variables-control-wrapper__description')}>
        {formatMessage(messages.globalProjectKeys)}
      </div>
      {variables.length ? (
        <div>
          <div className={cx('variables-control-wrapper__sort-wrapper')}>
            <SortDropdown />
            <Button variant="text" className={cx('variables-control-wrapper__add-button')}>
              <PlusIcon />
              {formatMessage(COMMON_LOCALE_KEYS.ADD)}
            </Button>
          </div>
          <FieldText
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClear={() => setSearchValue('')}
            placeholder={formatMessage(messages.typeToSearchVariable)}
            startIcon={<SearchIcon />}
            className={cx('variables-control-wrapper__search')}
            maxLength={256}
            clearable
          />
          <VariablesList variables={variables} />
        </div>
      ) : (
        <Button icon={Parser(PlusIcon)}>{formatMessage(messages.addVariable)}</Button>
      )}
    </div>
  );
};

VariablesControl.propTypes = {
  variables: PropTypes.array.isRequired,
};
