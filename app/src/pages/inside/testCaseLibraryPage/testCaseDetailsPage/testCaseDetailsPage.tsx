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

import { type ReactNode } from 'react';
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
import { TestCaseManualScenario } from 'pages/inside/common/testCaseList/types';

import { TestCaseDetailsHeader } from './testCaseDetailsHeader';
import { useAddTestCasesToTestPlanModal } from '../addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';
import { useDescriptionModal } from './descriptionModal';
import { useTestCaseTags } from './useTestCaseTags';
import { messages } from './messages';
import { DetailsEmptyState } from '../emptyState/details/detailsEmptyState';
import { AttachmentList } from '../attachmentList';
import { ManualScenario, Tag, hasTagShape } from '../types';
import { Precondition } from './precondition';
import { StepsList } from './stepsList';
import { Scenario } from './scenario';
import { TagPopover } from '../tagPopover';
import { checkScenario, hasStepContent } from './utils';

import styles from './testCaseDetailsPage.scss';

const cx = createClassnames(styles);

const SIDEBAR_COLLAPSIBLE_SECTIONS_CONFIG = ({
  canEditTestCaseTag,
  canEditTestCaseDescription,
  tags,
  testCaseDescription,
  headerControlKeys,
  onTagRemove,
  tagAddButton,
  handleDescriptionModal,
}: {
  canEditTestCaseTag: boolean;
  canEditTestCaseDescription: boolean;
  tags: string[];
  testCaseDescription: string;
  headerControlKeys: { ADD: string };
  onTagRemove?: (tagKey: string) => void;
  tagAddButton?: ReactNode;
  handleDescriptionModal: () => void;
}) => {
  return [
    {
      titleKey: 'tags',
      defaultMessage: commonMessages.noTagsAdded,
      childComponent: !isEmpty(tags) && (
        <AdaptiveTagList tags={tags} isShowAllView onRemoveTag={onTagRemove} />
      ),
      headerControl: canEditTestCaseTag && tagAddButton,
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
  manualScenario,
}: {
  manualScenario: ManualScenario;
}) => {
  const sections = [
    {
      titleKey: 'requirements',
      defaultMessage: commonMessages.requirementsAreNotSpecified,
      childComponent: isEmpty(manualScenario?.requirements) ? null : (
        <RequirementsList items={manualScenario.requirements} isCopyEnabled />
      ),
    },
  ];

  if (manualScenario?.manualScenarioType === TestCaseManualScenario.STEPS) {
    const firstStep = manualScenario?.steps?.[0];

    sections.push(
      {
        titleKey: 'preconditions',
        defaultMessage: messages.noPrecondition,
        childComponent: (manualScenario?.preconditions?.value ||
          !isEmpty(manualScenario?.preconditions?.attachments)) && (
          <Precondition preconditions={manualScenario.preconditions} />
        ),
      },
      {
        titleKey: 'steps',
        defaultMessage: messages.noSteps,
        childComponent: hasStepContent(firstStep) && (
          <StepsList steps={manualScenario.steps.filter(hasStepContent)} />
        ),
      },
    );
  } else {
    sections.push(
      {
        titleKey: 'scenario',
        defaultMessage: messages.noPrecondition,
        childComponent: (manualScenario?.preconditions?.value ||
          manualScenario?.instructions ||
          manualScenario?.expectedResult) && (
          <Scenario
            expectedResult={manualScenario.expectedResult}
            instructions={manualScenario.instructions}
            precondition={manualScenario.preconditions?.value}
          />
        ),
      },
      {
        titleKey: 'attachments',
        defaultMessage: messages.noAttachments,
        childComponent: !isEmpty(manualScenario?.attachments) && (
          <AttachmentList
            attachments={manualScenario.attachments}
            className={cx('page__attachments-list')}
          />
        ),
      },
    );
  }

  return sections;
};

export const TestCaseDetailsPage = () => {
  const { formatMessage } = useIntl();
  const { canEditTestCaseTag, canEditTestCaseDescription } = useUserPermissions();
  const { openModal: openAddTestCasesToTestPlanModal } = useAddTestCasesToTestPlanModal();
  const { openModal: openDescriptionModal } = useDescriptionModal();

  const testCaseDetails = useSelector(testCaseDetailsSelector);

  const testCaseId = testCaseDetails?.id || 0;

  const {
    addTag,
    removeTag,
    isLoading: isTagsLoading,
  } = useTestCaseTags({
    testCaseId,
  });

  if (!testCaseDetails) return null;

  const attributes = (testCaseDetails.attributes || []).filter(hasTagShape);

  const handleTagSelect = (tag: Tag) => {
    addTag(tag).catch(noop);
  };

  const handleTagRemove = (tagKey: string) => {
    removeTag(tagKey).catch(noop);
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

  const tagAddButton = (
    <TagPopover
      onTagSelect={handleTagSelect}
      selectedTags={attributes}
      trigger={
        <Button variant="text" adjustWidthOn="content" icon={<PlusIcon />} disabled={isTagsLoading}>
          {formatMessage(COMMON_LOCALE_KEYS.ADD)}
        </Button>
      }
    />
  );

  const tags = attributes.map(({ key }) => key);

  const isScenarioEmpty = checkScenario(testCaseDetails?.manualScenario);

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div className={cx('page')}>
          <TestCaseDetailsHeader
            className={cx('page__header')}
            testCase={testCaseDetails}
            onAddToTestPlan={handleAddToTestPlan}
            onMenuAction={noop}
            isScenarioEmpty={isScenarioEmpty}
          />
          <div className={cx('page__sidebar')}>
            {SIDEBAR_COLLAPSIBLE_SECTIONS_CONFIG({
              tagAddButton,
              onTagRemove: canEditTestCaseTag && !isTagsLoading ? handleTagRemove : undefined,
              handleDescriptionModal,
              headerControlKeys: { ADD: formatMessage(COMMON_LOCALE_KEYS.ADD) },
              testCaseDescription: testCaseDetails.description || '',
              tags,
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
          <ScrollWrapper>
            <div
              className={cx(
                'page__main-content',
                testCaseDetails?.id ? 'page__main-content-with-data' : '',
              )}
            >
              {isScenarioEmpty ? (
                <DetailsEmptyState testCase={testCaseDetails} />
              ) : (
                MAIN_CONTENT_COLLAPSIBLE_SECTIONS_CONFIG({
                  manualScenario: testCaseDetails.manualScenario,
                }).map(({ titleKey, defaultMessage, childComponent }) => (
                  <CollapsibleSectionWithHeaderControl
                    key={titleKey}
                    title={formatMessage(commonMessages[titleKey])}
                    defaultMessage={formatMessage(defaultMessage)}
                  >
                    {childComponent}
                  </CollapsibleSectionWithHeaderControl>
                ))
              )}
            </div>
          </ScrollWrapper>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
