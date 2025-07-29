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

import { useState } from 'react';
import classNames from 'classnames/bind';
import isEmpty from 'lodash.isempty';
import { useIntl } from 'react-intl';

import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import { CollapsibleSectionWithHeaderControl } from 'components/collapsibleSection';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { AdaptiveTagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import { Button, EditIcon, PlusIcon } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { TestCaseDetailsHeader } from './testCaseDetailsHeader';
import { messages } from './messages';
import { DetailsEmptyState } from '../emptyState/details/detailsEmptyState';
import { TestCase } from '../types';
import { mockTestCases, mockedTestCaseDescription } from '../testCaseList/mockData';

import styles from './testCaseDetailsPage.scss';

const cx = classNames.bind(styles);

const noopHandler = () => {};

const COLLAPSIBLE_SECTIONS_CONFIG = ({
  tags,
  testCaseDescription,
  headerControllKeys,
  handleAddTags,
  handleAddDescription,
  handleEditDescription,
}: {
  tags: string[];
  testCaseDescription: string;
  headerControllKeys: { ADD: string };
  handleAddTags: () => void;
  handleAddDescription: () => void;
  handleEditDescription: () => void;
}) =>
  [
    {
      titleKey: 'tags',
      defaultMessageKey: 'noTagsAdded',
      childComponent: isEmpty(tags) ? null : <AdaptiveTagList tags={tags} isShowAllView />,
      headerControl: (
        <Button variant="text" adjustWidthOn="content" onClick={handleAddTags} icon={<PlusIcon />}>
          {headerControllKeys.ADD}
        </Button>
      ),
    },
    {
      titleKey: 'description',
      defaultMessageKey: 'noDescriptionAdded',
      childComponent: isEmpty(testCaseDescription) ? null : (
        <ExpandedTextSection text={testCaseDescription} defaultVisibleLines={5} />
      ),
      headerControl: isEmpty(testCaseDescription) ? (
        <Button
          variant="text"
          adjustWidthOn="content"
          onClick={handleAddDescription}
          className={cx('fixed-button-height')}
          icon={<PlusIcon />}
        >
          {headerControllKeys.ADD}
        </Button>
      ) : (
        <Button
          variant="text"
          adjustWidthOn="content"
          iconPlace="end"
          onClick={handleEditDescription}
          className={cx('fixed-button-height')}
          icon={<EditIcon />}
        />
      ),
    },
  ] as const;

const testCase: TestCase = {
  id: '2775277527',
  name: '24.2 PV',
  created: 1751362404546,
  priority: 'high',
  tags: [],
  description: '',
  scenarios: [],
  path: ['24.2 PV'],
};

export const TestCaseDetailsPage = () => {
  const { formatMessage } = useIntl();
  const [isTagsAdded, setIsTagsAdded] = useState(false);
  const [isDescriptionAdded, setIsDescriptionAdded] = useState(false);

  const handleAddTags = () => {
    setIsTagsAdded((prevState) => !prevState);
  };

  const handleAddDescription = () => {
    setIsDescriptionAdded(true);
  };

  const handleEditDescription = () => {
    setIsDescriptionAdded(false);
  };

  // TODO: Remove mock data after integration
  const testCaseDescription = isDescriptionAdded ? mockedTestCaseDescription : testCase.description;
  const tags = isTagsAdded ? mockTestCases[0].tags : testCase.tags;

  return (
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
            {COLLAPSIBLE_SECTIONS_CONFIG({
              handleAddTags,
              handleAddDescription,
              handleEditDescription,
              headerControllKeys: { ADD: formatMessage(COMMON_LOCALE_KEYS.ADD) },
              testCaseDescription,
              tags,
            }).map(({ titleKey, defaultMessageKey, childComponent, headerControl }) => (
              <CollapsibleSectionWithHeaderControl
                key={titleKey}
                title={formatMessage(messages[titleKey])}
                defaultMessage={formatMessage(messages[defaultMessageKey])}
                headerControlComponent={headerControl}
              >
                {childComponent}
              </CollapsibleSectionWithHeaderControl>
            ))}
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
};
