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

import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import { TestCaseDetailsHeader } from './testCaseDetailsHeader';
import styles from './testCaseDetailsPage.scss';
import { DetailsEmptyState } from '../emptyState/details/detailsEmptyState';
import { EditableTagsSection } from '../editableTagsSection';
import { EditableDescriptionSection } from '../editableDescriptionSection';
import { TestCase } from '../types';

const cx = classNames.bind(styles);

const noopHandler = () => {};

const testCase: TestCase = {
  id: '2775277527',
  name: '24.2 PV',
  created: '2025-03-26',
  priority: 'high',
  tags: [],
  description: '',
  hasScenario: false,
};

export const TestCaseDetailsPage = () => (
  <SettingsLayout>
    <ScrollWrapper resetRequired>
      <div className={cx('page')}>
        <TestCaseDetailsHeader
          className={cx('page__header')}
          testCase={testCase}
          onAddToLaunch={noopHandler}
          onAddToTestPlan={noopHandler}
          onMenuAction={noopHandler}
        />
        <div className={cx('page__sidebar')}>
          <EditableTagsSection onAddTag={noopHandler} variant="sidebar" />
          <EditableDescriptionSection onAddDescription={noopHandler} />
        </div>
        <div className={cx('page__main-content')}>
          <ScrollWrapper>
            <DetailsEmptyState />
          </ScrollWrapper>
        </div>
      </div>
    </ScrollWrapper>
  </SettingsLayout>
);
