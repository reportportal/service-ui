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

import { type ReactNode, useCallback } from 'react';
import { isEmpty } from 'es-toolkit/compat';
import { noop } from 'es-toolkit';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { BubblesLoader, Button, EditIcon, PlusIcon } from '@reportportal/ui-kit';

import { TEST_CASE_LIBRARY_EVENTS } from 'analyticsEvents/testCaseLibraryPageEvents';
import { createClassnames } from 'common/utils';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import { CollapsibleSectionWithHeaderControl } from 'components/collapsibleSection';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { AdaptiveTagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import { RequirementsList } from 'pages/inside/common/requirementsList/requirementsList';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { projectKeySelector } from 'controllers/project';
import {
  GET_TEST_CASE_DETAILS,
  isLoadingTestCaseDetailsSelector,
  testCaseDetailsSelector,
} from 'controllers/testCase';
import { commonMessages } from 'pages/inside/common/common-messages';
import { EvaluationPanel } from 'pages/inside/aiFactory/evaluation';
import { GenerationCost } from 'pages/inside/aiFactory/generationCost';
import { AutomationSection } from 'pages/inside/aiFactory/automation';
import { LifecycleHistory, useTestCaseAi } from 'pages/inside/aiFactory/lifecycle';
import { PipelineLinks } from 'pages/inside/aiFactory/pipelineLinks';
import { LaunchBlockedBanner } from 'pages/inside/aiFactory/readyOnlyGate';
import {
  ReviewStrip,
  ReviewTarget,
  useFixRound,
  useReviewComments,
  type ReviewCommentsLoadState,
} from 'pages/inside/aiFactory/review';
import { CommentTargetType, Lifecycle } from 'types/aiFactory';
import { ManualScenario, Tag, TestCaseManualScenario } from 'types/testCase';

import { TestCaseDetailsHeader } from './testCaseDetailsHeader';
import { useAddTestCasesToTestPlanModal } from '../addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';
import { useDescriptionModal } from './descriptionModal';
import { useTestCaseTags } from './useTestCaseTags';
import { messages } from './messages';
import { DetailsEmptyState } from '../emptyState/details/detailsEmptyState';
import { AttachmentsWithSlider } from '../../common/attachmentsWithSlider';
import { hasTagShape } from '../types';
import { Precondition } from './precondition';
import { StepsList } from './stepsList';
import { Scenario } from '../../common/scenario';
import { TagPopover } from '../tagPopover';
import {
  hasStepContent,
  hasStepsPreconditionContent,
  hasScenarioContent,
} from '../../common/scenarioUtils';
import { checkScenario } from './utils';

import styles from './testCaseDetailsPage.scss';

const cx = createClassnames(styles);

const SIDEBAR_COLLAPSIBLE_SECTIONS_CONFIG = ({
  canManageTestCases,
  tags,
  testCaseDescription,
  headerControlKeys,
  onTagRemove,
  tagAddButton,
  handleDescriptionModal,
}: {
  canManageTestCases: boolean;
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
      headerControl: canManageTestCases && tagAddButton,
    },
    {
      titleKey: 'description',
      defaultMessage: messages.noDescriptionAdded,
      childComponent: !isEmpty(testCaseDescription) && (
        <ExpandedTextSection text={testCaseDescription} defaultVisibleLines={5} />
      ),
      headerControl: canManageTestCases && (
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
  reviewState,
  isReviewReadOnly,
}: {
  manualScenario: ManualScenario;
  reviewState?: ReviewCommentsLoadState;
  isReviewReadOnly?: boolean;
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
    sections.push(
      {
        titleKey: 'precondition',
        defaultMessage: messages.noPrecondition,
        childComponent: hasStepsPreconditionContent(manualScenario?.preconditions) &&
          manualScenario?.preconditions && (
            <Precondition
              preconditions={manualScenario.preconditions}
              reviewControl={
                reviewState && (
                  <ReviewTarget
                    target={{ type: CommentTargetType.PRECONDITION }}
                    reviewState={reviewState}
                    isReadOnly={isReviewReadOnly}
                  />
                )
              }
            />
          ),
      },
      {
        titleKey: 'steps',
        defaultMessage: messages.noSteps,
        childComponent: manualScenario?.steps?.some(hasStepContent) && (
          <StepsList
            steps={manualScenario.steps.filter(hasStepContent)}
            renderReviewControl={
              reviewState
                ? (stepId) => (
                    <ReviewTarget
                      target={{ type: CommentTargetType.STEP, stepId }}
                      reviewState={reviewState}
                      isReadOnly={isReviewReadOnly}
                    />
                  )
                : undefined
            }
          />
        ),
      },
    );
  } else {
    sections.push(
      {
        titleKey: 'scenario',
        defaultMessage: messages.noScenario,
        childComponent: hasScenarioContent(manualScenario) && (
          <Scenario
            expectedResult={manualScenario.expectedResult}
            instructions={manualScenario.instructions}
            precondition={manualScenario.preconditions?.value}
            preconditionReviewControl={
              reviewState && (
                <ReviewTarget
                  target={{ type: CommentTargetType.PRECONDITION }}
                  reviewState={reviewState}
                  isReadOnly={isReviewReadOnly}
                />
              )
            }
            scenarioReviewControl={
              reviewState && (
                <ReviewTarget
                  target={{ type: CommentTargetType.TEXT_SCENARIO }}
                  reviewState={reviewState}
                  isReadOnly={isReviewReadOnly}
                />
              )
            }
          />
        ),
      },
      {
        titleKey: 'attachments',
        defaultMessage: messages.noAttachments,
        childComponent: !isEmpty(manualScenario?.attachments) && (
          <AttachmentsWithSlider
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
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const { canAutomateTestCases, canManageTestCases, canReviewAiTestCases } = useUserPermissions();
  const { openModal: openAddTestCasesToTestPlanModal } = useAddTestCasesToTestPlanModal();
  const { openModal: openDescriptionModal } = useDescriptionModal();

  const testCaseDetails = useSelector(testCaseDetailsSelector);
  const isLoadingTestCaseDetails = useSelector(isLoadingTestCaseDetailsSelector);
  const projectKey = useSelector(projectKeySelector);
  const isAiFactoryEnabled = useAiFactoryEnabled();

  const testCaseId = testCaseDetails?.id || 0;
  const aiDetailsState = useTestCaseAi(
    projectKey,
    testCaseId,
    isAiFactoryEnabled && Boolean(testCaseDetails?.lifecycle),
    testCaseDetails?.updatedAt,
  );
  const isAiReviewEnabled = isAiFactoryEnabled && Boolean(testCaseDetails?.ai);
  const reviewState = useReviewComments(projectKey, testCaseId, isAiReviewEnabled);
  const refreshAfterFixRoundStart = useCallback(() => {
    reviewState.reload();
  }, [reviewState]);
  const refreshAfterFixRound = useCallback(() => {
    reviewState.reload();
    aiDetailsState.reload();
    dispatch({ type: GET_TEST_CASE_DETAILS, payload: { testCaseId } });
  }, [aiDetailsState, dispatch, reviewState, testCaseId]);
  const refreshAfterAutomationStart = useCallback(() => {
    aiDetailsState.reload();
    dispatch({ type: GET_TEST_CASE_DETAILS, payload: { testCaseId } });
  }, [aiDetailsState, dispatch, testCaseId]);
  const fixRoundState = useFixRound(projectKey, testCaseId, isAiReviewEnabled, {
    onStarted: refreshAfterFixRoundStart,
    onFinished: refreshAfterFixRound,
  });

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
    addTag(tag)
      .then(() => {
        trackEvent(TEST_CASE_LIBRARY_EVENTS.submitAddTag(String(testCaseId)));
      })
      .catch(noop);
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
  const isFixRunning =
    fixRoundState.current?.status === 'RUNNING' || Boolean(testCaseDetails.review?.fixRound);
  const isReviewReadOnly = isFixRunning || !canReviewAiTestCases;
  const renderedTestCase = isFixRunning
    ? {
        ...testCaseDetails,
        review: {
          ...testCaseDetails.review,
          unsentCommentsCount: testCaseDetails.review?.unsentCommentsCount ?? 0,
          fixRound: {
            number: fixRoundState.current?.round ?? testCaseDetails.review?.fixRound?.number ?? 1,
            status: 'RUNNING' as const,
          },
        },
      }
    : testCaseDetails;

  const testCaseContent = isScenarioEmpty ? (
    <DetailsEmptyState testCase={testCaseDetails} />
  ) : (
    <>
      {isAiReviewEnabled && testCaseDetails.lifecycle && (
        <ReviewStrip
          lifecycle={testCaseDetails.lifecycle}
          reviewState={reviewState}
          isReadOnly={isReviewReadOnly}
          readOnlyReason={isFixRunning ? 'FIX_RUNNING' : 'NO_PERMISSION'}
          fixRoundState={fixRoundState}
          lastAgentChange={aiDetailsState.data?.lastAgentChange}
        />
      )}
      {MAIN_CONTENT_COLLAPSIBLE_SECTIONS_CONFIG({
        manualScenario: testCaseDetails.manualScenario,
        reviewState: isAiReviewEnabled ? reviewState : undefined,
        isReviewReadOnly,
      }).map(({ titleKey, defaultMessage, childComponent }) => (
        <CollapsibleSectionWithHeaderControl
          key={titleKey}
          title={formatMessage(commonMessages[titleKey])}
          defaultMessage={formatMessage(defaultMessage)}
          isInitiallyExpanded={!!childComponent}
        >
          {childComponent}
        </CollapsibleSectionWithHeaderControl>
      ))}
    </>
  );
  const mainContent = (
    <>
      {isAiFactoryEnabled && testCaseDetails.lifecycle === Lifecycle.DRAFT && (
        <LaunchBlockedBanner plans={testCaseDetails.blockedPlans ?? []} />
      )}
      {testCaseContent}
    </>
  );

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div className={cx('page')}>
          <TestCaseDetailsHeader
            className={cx('page__header')}
            testCase={renderedTestCase}
            onAddToTestPlan={handleAddToTestPlan}
            onMenuAction={noop}
            isScenarioEmpty={isScenarioEmpty}
          />
          <div className={cx('page__sidebar')}>
            {SIDEBAR_COLLAPSIBLE_SECTIONS_CONFIG({
              tagAddButton,
              onTagRemove: canManageTestCases && !isTagsLoading ? handleTagRemove : undefined,
              handleDescriptionModal,
              headerControlKeys: { ADD: formatMessage(COMMON_LOCALE_KEYS.ADD) },
              testCaseDescription: testCaseDetails.description || '',
              tags,
              canManageTestCases,
            }).map(({ titleKey, defaultMessage, childComponent, headerControl }) => (
              <CollapsibleSectionWithHeaderControl
                key={titleKey}
                title={formatMessage(commonMessages[titleKey])}
                defaultMessage={formatMessage(defaultMessage)}
                headerControlComponent={headerControl}
                isInitiallyExpanded={!!childComponent}
              >
                {childComponent}
              </CollapsibleSectionWithHeaderControl>
            ))}
            {isAiFactoryEnabled && testCaseDetails.ai && (
              <>
                <EvaluationPanel aiDetailsState={aiDetailsState} />
                <GenerationCost aiDetailsState={aiDetailsState} />
                <PipelineLinks aiDetailsState={aiDetailsState} />
              </>
            )}
            {isAiFactoryEnabled && canAutomateTestCases && (
              <AutomationSection
                testCase={renderedTestCase}
                onSuccess={refreshAfterAutomationStart}
              />
            )}
            {isAiFactoryEnabled && testCaseDetails.lifecycle && (
              <LifecycleHistory
                key={`${testCaseDetails.id}-${testCaseDetails.lifecycle}-${testCaseDetails.updatedAt}`}
                aiDetailsState={aiDetailsState}
              />
            )}
          </div>
          <ScrollWrapper>
            <div
              className={cx(
                'page__main-content',
                testCaseDetails?.id ? 'page__main-content-with-data' : '',
                isLoadingTestCaseDetails ? 'page__loading-state' : '',
              )}
            >
              {isLoadingTestCaseDetails ? (
                <div className={cx('page__loader')}>
                  <BubblesLoader />
                </div>
              ) : (
                mainContent
              )}
            </div>
          </ScrollWrapper>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
