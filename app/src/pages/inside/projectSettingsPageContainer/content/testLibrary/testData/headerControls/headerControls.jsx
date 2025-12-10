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

import { defineMessages, useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { Button } from '@reportportal/ui-kit';
import ExportIcon from 'common/img/export-thin-inline.svg';
import ImportIcon from 'common/img/import-thin-inline.svg';
import styles from './headerControls.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  downloadTemplate: {
    id: 'TestData.downloadTemplate',
    defaultMessage: 'Download Template',
  },
  importDataset: {
    id: 'TestData.importDataset',
    defaultMessage: 'Import Dataset',
  },
});

export const HeaderControls = () => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('test-data-header-controls')}>
      <Button
        variant="ghost"
        icon={Parser(ExportIcon)}
        className={cx('test-data-header-controls__button')}
      >
        {formatMessage(messages.downloadTemplate)}
      </Button>
      <Button
        variant="ghost"
        icon={Parser(ImportIcon)}
        className={cx('test-data-header-controls__button')}
      >
        {formatMessage(messages.importDataset)}
      </Button>
    </div>
  );
};
