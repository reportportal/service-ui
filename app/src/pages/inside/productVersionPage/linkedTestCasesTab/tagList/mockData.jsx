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

import React from 'react';
import classNames from 'classnames/bind';
import { Button, FlagIcon } from '@reportportal/ui-kit';

import { TagList } from './tagList';

import styles from '../linkedTestCasesTab.scss';

const cx = classNames.bind(styles);

const tags = [
  'iOS System',
  'iOS System Functionality Test',
  'Cross-Platform App Speed Test',
  'UI Bug',
  'Performance Test',
  'Security Check',
  'API Validation',
  'Data Integrity',
  'Cross-Browser',
  'Accessibility',
];

const tagsShort = ['iOS System', 'iOS System Functionality Test'];

export const getData = () => [
  {
    id: 1,
    testCaseName: {
      component: (
        <div className={cx('table-cell__name')}>
          <div className={cx('table-cell__name-title')}>Login Test 1.2</div>
          <TagList tags={tags} />
        </div>
      ),
    },
    executionStatus: 'Not executed',
    defaultVersion: 'Password changing 2.1',
    setDefault: {
      component: (
        <Button
          className={cx('table-cell__default-button')}
          icon={<FlagIcon />}
          variant="text"
          adjustWidthOn
        >
          Set as Default
        </Button>
      ),
    },
  },
  {
    id: 2,
    testCaseName: {
      component: (
        <div className={cx('table-cell__name')}>
          <div className={cx('table-cell__name-title')}>Password changing 2.2</div>
          <TagList tags={tagsShort} />
        </div>
      ),
    },
    executionStatus: '',
    defaultVersion: 'Password changing 2.1',
    setDefault: {
      component: (
        <Button
          className={cx('table-cell__default-button')}
          icon={<FlagIcon />}
          variant="text"
          adjustWidthOn
        >
          Set as Default
        </Button>
      ),
    },
  },
];
