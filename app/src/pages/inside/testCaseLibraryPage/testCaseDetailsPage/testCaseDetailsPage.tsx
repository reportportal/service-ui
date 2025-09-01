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
import { isEmpty, noop } from 'lodash';
import { useIntl } from 'react-intl';

import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import { CollapsibleSectionWithHeaderControl } from 'components/collapsibleSection';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { AdaptiveTagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import { Button, EditIcon, PlusIcon } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { TestCaseDetailsHeader } from './testCaseDetailsHeader';
import { messages } from './messages';
import { DetailsEmptyState } from '../emptyState/details/detailsEmptyState';
import { TestCase } from '../types';
import { mockTestCases, mockedTestCaseDescription } from '../testCaseList/mockData';

import styles from './testCaseDetailsPage.scss';

const cx = classNames.bind(styles) as typeof classNames;

const COLLAPSIBLE_SECTIONS_CONFIG = ({
  tags,
  testCaseDescription,
  headerControlKeys,
  handleAddTags,
  handleAddDescription,
  handleEditDescription,
}: {
  tags: string[];
  testCaseDescription: string;
  headerControlKeys: { ADD: string };
  handleAddTags: () => void;
  handleAddDescription: () => void;
  handleEditDescription: () => void;
}) => {
  const { canEditTestCaseTag, canEditTestCaseDescription } = useUserPermissions();

  return [
    {
      titleKey: 'tags',
      defaultMessageKey: 'noTagsAdded',
      childComponent: !isEmpty(tags) && <AdaptiveTagList tags={tags} isShowAllView />,
      headerControl: canEditTestCaseTag && (
        <Button variant="text" adjustWidthOn="content" onClick={handleAddTags} icon={<PlusIcon />}>
          {headerControlKeys.ADD}
        </Button>
      ),
    },
    {
      titleKey: 'description',
      defaultMessageKey: 'noDescriptionAdded',
      childComponent: !isEmpty(testCaseDescription) && (
        <ExpandedTextSection text={testCaseDescription} defaultVisibleLines={5} />
      ),
      headerControl: canEditTestCaseDescription && (
        <Button
          variant="text"
          adjustWidthOn="content"
          iconPlace={isEmpty(testCaseDescription) ? 'start' : 'end'}
          onClick={isEmpty(testCaseDescription) ? handleEditDescription : handleAddDescription}
          className={cx('fixed-button-height')}
          icon={isEmpty(testCaseDescription) ? <PlusIcon /> : <EditIcon />}
        >
          {isEmpty(testCaseDescription) && headerControlKeys.ADD}
        </Button>
      ),
    },
  ] as const;
};

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
            onAddToLaunch={noop}
            onAddToTestPlan={noop}
            onMenuAction={noop}
          />
          <div className={cx('page__sidebar')}>
            {COLLAPSIBLE_SECTIONS_CONFIG({
              handleAddTags,
              handleAddDescription,
              handleEditDescription,
              headerControlKeys: { ADD: formatMessage(COMMON_LOCALE_KEYS.ADD) },
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
