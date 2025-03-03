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

import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { defineMessages, useIntl } from 'react-intl';
import { Button } from '@reportportal/ui-kit';
import PlusIcon from 'common/img/plus-button-inline.svg';
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
});

export const VariablesControl = () => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('variables-control-wrapper')}>
      <h4 className={cx('integration-name')} title={formatMessage(messages.variables)}>
        {formatMessage(messages.variables)}
      </h4>
      <div className={cx('variables-control-wrapper__description')}>
        {formatMessage(messages.globalProjectKeys)}
      </div>
      <Button icon={Parser(PlusIcon)}>{formatMessage(messages.addVariable)}</Button>
    </div>
  );
};
