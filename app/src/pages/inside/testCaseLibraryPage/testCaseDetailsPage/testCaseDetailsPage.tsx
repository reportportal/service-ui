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
import { isEmpty } from 'es-toolkit/compat';
import { noop } from 'es-toolkit';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Button, EditIcon, PlusIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import { CollapsibleSectionWithHeaderControl } from 'components/collapsibleSection';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { AdaptiveTagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import { RequirementsList } from 'pages/inside/common/requirementsList/requirementsList';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { testCaseDetailsSelector } from 'controllers/testCase';
import { commonMessages } from 'pages/inside/common/common-messages';

import { TestCaseDetailsHeader } from './testCaseDetailsHeader';
import { useAddTestCasesToTestPlanModal } from '../addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';
import { useDescriptionModal } from './descriptionModal';
import { messages } from './messages';
import { Requirement } from '../types';

import styles from './testCaseDetailsPage.scss';

const cx = createClassnames(styles);

const SIDEBAR_COLLAPSIBLE_SECTIONS_CONFIG = ({
  canEditTestCaseTag,
  canEditTestCaseDescription,
  tags,
  testCaseDescription,
  headerControlKeys,
  handleAddTags,
  handleDescriptionModal,
}: {
  canEditTestCaseTag: boolean;
  canEditTestCaseDescription: boolean;
  tags: string[];
  testCaseDescription: string;
  headerControlKeys: { ADD: string };
  handleAddTags: () => void;
  handleDescriptionModal: () => void;
}) => {
  return [
    {
      titleKey: 'tags',
      defaultMessage: commonMessages.noTagsAdded,
      childComponent: !isEmpty(tags) && <AdaptiveTagList tags={tags} isShowAllView />,
      headerControl: canEditTestCaseTag && (
        <Button variant="text" adjustWidthOn="content" onClick={handleAddTags} icon={<PlusIcon />}>
          {headerControlKeys.ADD}
        </Button>
      ),
    },
    {
      titleKey: 'description',
      defaultMessage: messages.noDescriptionAdded,
      childComponent: !isEmpty(testCaseDescription) && (
        <ExpandedTextSection text={testCaseDescription} defaultVisibleLines={5} />
      ),
      headerControl: canEditTestCaseDescription && (
        <Button
          variant="text"
          adjustWidthOn="content"
          iconPlace={isEmpty(testCaseDescription) ? 'start' : 'end'}
          onClick={handleDescriptionModal}
          className={cx('fixed-button-height')}
          icon={isEmpty(testCaseDescription) ? <PlusIcon /> : <EditIcon />}
        >
          {isEmpty(testCaseDescription) && headerControlKeys.ADD}
        </Button>
      ),
    },
  ] as const;
};

const MAIN_CONTENT_COLLAPSIBLE_SECTIONS_CONFIG = ({
  requirements,
}: {
  requirements: Requirement[];
}) => {
  return [
    {
      titleKey: 'requirements',
      defaultMessage: commonMessages.requirementsAreNotSpecified,
      childComponent: isEmpty(requirements) ? null : (
        <RequirementsList items={requirements} copyEnabled />
      ),
    },
  ] as const;
};

export const TestCaseDetailsPage = () => {
  const { formatMessage } = useIntl();
  const [isTagsAdded, setIsTagsAdded] = useState(false);
  const { canEditTestCaseTag, canEditTestCaseDescription } = useUserPermissions();
  const { openModal: openAddTestCasesToTestPlanModal } = useAddTestCasesToTestPlanModal();
  const { openModal: openDescriptionModal } = useDescriptionModal();

  const testCaseDetails = useSelector(testCaseDetailsSelector);

  if (!testCaseDetails) return null;

  const handleAddTags = () => {
    setIsTagsAdded((prevState) => !prevState);
  };

  const handleDescriptionModal = () => {
    openDescriptionModal({ testCaseDetails });
  };

  const handleAddToTestPlan = () => {
    openAddTestCasesToTestPlanModal({
      selectedTestCaseIds: [testCaseDetails.id],
      isSingleTestCaseMode: true,
    });
  };

  // TODO: Remove mock data after integration
  const mockedTags = [
    { key: 'sso system', id: 1 },
    { key: 'user interface improvements user interface improvements', id: 2 },
    { key: 'battery usage analysis for a user interface improvements', id: 3 },
  ];

  const tags = isTagsAdded ? mockedTags : [];

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div className={cx('page')}>
          <TestCaseDetailsHeader
            className={cx('page__header')}
            testCase={testCaseDetails}
            onAddToTestPlan={handleAddToTestPlan}
            onMenuAction={noop}
          />
          <div className={cx('page__sidebar')}>
            {SIDEBAR_COLLAPSIBLE_SECTIONS_CONFIG({
              handleAddTags,
              handleDescriptionModal,
              headerControlKeys: { ADD: formatMessage(COMMON_LOCALE_KEYS.ADD) },
              testCaseDescription: testCaseDetails.description,
              tags: tags.map(({ key }) => key),
              canEditTestCaseTag,
              canEditTestCaseDescription,
            }).map(({ titleKey, defaultMessage, childComponent, headerControl }) => (
              <CollapsibleSectionWithHeaderControl
                key={titleKey}
                title={formatMessage(commonMessages[titleKey])}
                defaultMessage={formatMessage(defaultMessage)}
                headerControlComponent={headerControl}
              >
                {childComponent}
              </CollapsibleSectionWithHeaderControl>
            ))}
          </div>
          <div className={cx('page__main-content')}>
            <ScrollWrapper>
              {MAIN_CONTENT_COLLAPSIBLE_SECTIONS_CONFIG({
                requirements: testCaseDetails.manualScenario?.requirements || [],
              }).map(({ titleKey, defaultMessage, childComponent }) => (
                <CollapsibleSectionWithHeaderControl
                  key={titleKey}
                  title={formatMessage(commonMessages[titleKey])}
                  defaultMessage={formatMessage(defaultMessage)}
                >
                  {childComponent}
                </CollapsibleSectionWithHeaderControl>
              ))}
            </ScrollWrapper>
          </div>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
