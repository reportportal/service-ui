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

import { memo, useRef, useState } from 'react';
import { useIntl, MessageDescriptor } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import Parser from 'html-react-parser';
import {
  Button,
  MeatballMenuIcon,
  Tooltip,
  CopyIcon,
  RerunIcon,
  DurationIcon,
} from '@reportportal/ui-kit';
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames, copyToClipboard } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useOnClickOutside } from 'common/hooks';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { PopoverControl } from 'pages/common/popoverControl';
import { ProjectDetails } from 'pages/organization/constants';
import { CollapsibleSection } from 'components/collapsibleSection';
import { PathBreadcrumb } from 'componentLibrary/breadcrumbs/pathBreadcrumb';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { TEST_CASE_LIBRARY_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { AdaptiveTagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import { foldersSelector } from 'controllers/testCase';
import { AttachmentList } from 'pages/inside/testCaseLibraryPage/attachmentList';
import { ManualScenario, ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
import { useAddTestCasesToTestPlanModal } from 'pages/inside/testCaseLibraryPage/addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';
import { useEditTestCaseModal } from 'pages/inside/testCaseLibraryPage/createTestCaseModal';
import { useDeleteTestCaseModal } from 'pages/inside/testCaseLibraryPage/deleteTestCaseModal';
import { useMoveTestCaseModal } from 'pages/inside/testCaseLibraryPage/moveTestCaseModal/useMoveTestCaseModal';
import { AddToLaunchButton } from 'pages/inside/testCaseLibraryPage/addToLaunchButton';

import { TestCaseMenuAction, TestCaseManualScenario } from '../types';
import {
  formatTimestamp,
  formatDuration,
  getExcludedActionsFromPermissionMap,
  buildBreadcrumbs,
} from '../utils';
import { createTestCaseMenuItems } from '../configUtils';
import { Scenario } from './scenario';
import { messages } from './messages';
import { commonMessages } from '../../common-messages';

import styles from './testCaseSidePanel.scss';

const cx = createClassnames(styles);

const safeGetMessage = (
  key: string,
  formatMessage: (descriptor: MessageDescriptor) => string,
): string => {
  const allMessages: Record<string, MessageDescriptor> = { ...messages, ...commonMessages };
  const messageDescriptor = allMessages[key];

  return messageDescriptor ? formatMessage(messageDescriptor) : key;
};

const COLLAPSIBLE_SECTIONS_CONFIG = ({
  attributes,
  scenario,
  testCaseDescription,
}: {
  attributes: string[];
  scenario: ManualScenario;
  testCaseDescription: string;
}) => {
  const firstStep = scenario?.steps?.[0];
  const isStepsManualScenario = scenario.manualScenarioType === TestCaseManualScenario.STEPS;
  const isEmptyPreconditions =
    !scenario?.preconditions?.value &&
    isEmpty(scenario?.preconditions?.attachments) &&
    !firstStep?.instructions &&
    !firstStep?.expectedResult &&
    isEmpty(firstStep?.attachments);
  const isScenarioDataHidden = isStepsManualScenario
    ? isEmptyPreconditions
    : !scenario?.preconditions?.value && !scenario?.instructions && !scenario?.expectedResult;

  return [
    {
      titleKey: 'tags',
      defaultMessageKey: 'noTagsAdded',
      childComponent: isEmpty(attributes) ? null : (
        <AdaptiveTagList tags={attributes} isShowAllView />
      ),
    },
    {
      titleKey: 'scenarioTitle',
      defaultMessageKey: 'noDetailsForScenario',
      childComponent: isScenarioDataHidden ? null : <Scenario scenario={scenario} />,
    },
    ...(scenario?.manualScenarioType === TestCaseManualScenario.TEXT
      ? [
          {
            titleKey: 'attachments',
            defaultMessageKey: 'noAttachmentsAdded',
            childComponent: isEmpty(scenario?.attachments) ? null : (
              <AttachmentList attachments={scenario.attachments} />
            ),
          },
        ]
      : []),
    {
      titleKey: 'description',
      defaultMessageKey: 'descriptionNotSpecified',
      childComponent: testCaseDescription ? (
        <ExpandedTextSection text={testCaseDescription} defaultVisibleLines={5} />
      ) : null,
    },
  ] as const;
};

interface TestCaseSidePanelProps {
  testCase: ExtendedTestCase | null;
  isVisible: boolean;
  onClose: () => void;
}

export const TestCaseSidePanel = memo(
  ({ testCase, isVisible, onClose }: TestCaseSidePanelProps) => {
    const dispatch = useDispatch();
    const {
      canEditTestCase,
      canDeleteTestCase,
      canDuplicateTestCase,
      canMoveTestCase,
      canAddTestCaseToLaunch,
      canAddTestCaseToTestPlan,
    } = useUserPermissions();
    const { organizationSlug, projectSlug } = useSelector(
      urlOrganizationAndProjectSelector,
    ) as ProjectDetails;
    const folders = useSelector(foldersSelector);
    const { formatMessage } = useIntl();
    const sidePanelRef = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { openModal: openEditTestCaseModal } = useEditTestCaseModal();
    const { openModal: openAddTestCasesToTestPlanModal } = useAddTestCasesToTestPlanModal();
    const { openModal: openDeleteTestCaseModal } = useDeleteTestCaseModal();
    const { openModal: openMoveTestCaseModal } = useMoveTestCaseModal();

    const folderId = testCase?.testFolder?.id;
    const path = buildBreadcrumbs(folders, folderId);

    useOnClickOutside(sidePanelRef, onClose);

    if (!isVisible || !testCase) {
      return null;
    }

    const handleEditTestCase = () => {
      openEditTestCaseModal({ testCase });
    };

    const permissionMap = [
      { isAllowed: canEditTestCase, action: TestCaseMenuAction.EDIT },
      { isAllowed: canDeleteTestCase, action: TestCaseMenuAction.DELETE },
      { isAllowed: canDuplicateTestCase, action: TestCaseMenuAction.DUPLICATE },
      { isAllowed: canMoveTestCase, action: TestCaseMenuAction.MOVE },
    ];

    const menuItems = createTestCaseMenuItems(
      formatMessage,
      {
        [TestCaseMenuAction.EDIT]: handleEditTestCase,
        [TestCaseMenuAction.DELETE]: () => openDeleteTestCaseModal({ testCase }),
        [TestCaseMenuAction.MOVE]: () => openMoveTestCaseModal({ testCase }),
        [TestCaseMenuAction.HISTORY]: () => {
          dispatch({
            type: TEST_CASE_LIBRARY_PAGE,
            payload: {
              organizationSlug,
              projectSlug,
              testCasePageRoute: `test-cases/${testCase.id}/historyOfActions`,
            },
          });
        },
      },
      getExcludedActionsFromPermissionMap(permissionMap),
    );

    const handleThreeDotsClick = () => {
      setIsMenuOpen(!isMenuOpen);
    };

    const handleOpenDetailsClick = () => {
      dispatch({
        type: TEST_CASE_LIBRARY_PAGE,
        payload: {
          organizationSlug,
          projectSlug,
          testCasePageRoute: `test-cases/${testCase.id}`,
        },
      });
    };

    const handleAddToTestPlanClick = () => {
      openAddTestCasesToTestPlanModal({
        selectedTestCaseIds: [testCase.id],
        isSingleTestCaseMode: true,
      });
    };

    const handleCopyId = async () => {
      await copyToClipboard(testCase.id.toString());
    };

    return (
      <div ref={sidePanelRef} className={cx('test-case-side-panel')}>
        <div className={cx('header')}>
          <div className={cx('header-top')}>
            <div className={cx('test-case-name')}>
              <PriorityIcon priority={testCase.priority} className={cx('priority-icon')} />
              <span className={cx('test-name')}>{testCase.name}</span>
            </div>
            <button
              type="button"
              className={cx('close-button')}
              onClick={onClose}
              aria-label={formatMessage(commonMessages.closePanel)}
              data-automation-id="close-test-case-panel"
            >
              {Parser(CrossIcon as unknown as string)}
            </button>
          </div>
          {!isEmpty(path) && <PathBreadcrumb path={path} />}
          <div className={cx('header-meta')}>
            <div className={cx('meta-row')}>
              <div className={cx('meta-item-row', 'id-row')}>
                <span className={cx('meta-label')}>ID:</span>
                <span className={cx('meta-value')}>{testCase.id}</span>
                <button
                  type="button"
                  className={cx('copy-button')}
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={handleCopyId}
                  aria-label={formatMessage(commonMessages.copyId)}
                  data-automation-id="copy-test-case-id"
                >
                  <CopyIcon />
                </button>
              </div>
              <div className={cx('meta-item-row')}>
                <span className={cx('meta-label')}>Created:</span>
                <span className={cx('meta-value')}>{formatTimestamp(testCase.createdAt)}</span>
              </div>
            </div>
            <div className={cx('meta-row')}>
              {!!testCase?.lastExecution?.startedAt && (
                <div className={cx('meta-item-row')}>
                  <RerunIcon />
                  <span className={cx('meta-value')}>
                    {formatTimestamp(testCase.lastExecution.startedAt)}
                  </span>
                </div>
              )}
              {!!testCase?.lastExecution?.duration && (
                <div className={cx('meta-item-row')}>
                  <DurationIcon />
                  <span className={cx('meta-value')}>
                    {formatDuration(testCase.lastExecution.duration)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={cx('content')}>
          {COLLAPSIBLE_SECTIONS_CONFIG({
            attributes: testCase?.manualScenario?.attributes?.map(({ key }) => key),
            scenario: testCase?.manualScenario,
            testCaseDescription: testCase.description,
          }).map(({ titleKey, defaultMessageKey, childComponent }) => (
            <CollapsibleSection
              key={titleKey}
              title={safeGetMessage(titleKey, formatMessage)}
              defaultMessage={safeGetMessage(defaultMessageKey, formatMessage)}
            >
              {childComponent}
            </CollapsibleSection>
          ))}
        </div>
        <div className={cx('footer')}>
          <PopoverControl
            items={menuItems}
            placement="bottom-end"
            isOpened={isMenuOpen}
            setIsOpened={setIsMenuOpen}
          >
            <Tooltip placement="top" content={formatMessage(messages.moreActionsTooltip)}>
              <Button
                variant="ghost"
                icon={<MeatballMenuIcon />}
                className={cx('action-button', 'more-actions-button')}
                onClick={handleThreeDotsClick}
                data-automation-id="test-case-more-actions"
              />
            </Tooltip>
          </PopoverControl>
          <Button
            variant="ghost"
            className={cx('action-button')}
            onClick={handleOpenDetailsClick}
            data-automation-id="test-case-open-details"
          >
            {formatMessage(messages.openDetails)}
          </Button>
          {canAddTestCaseToLaunch && (
            <AddToLaunchButton
              isButtonDisabled={isEmpty(testCase?.manualScenario?.preconditions?.value)}
              testCaseName={testCase.name}
            />
          )}
          {canAddTestCaseToTestPlan && (
            <Button
              variant="primary"
              className={cx('action-button', 'last-button')}
              onClick={handleAddToTestPlanClick}
              data-automation-id="test-case-add-to-test-plan"
            >
              {formatMessage(COMMON_LOCALE_KEYS.ADD_TO_TEST_PLAN)}
            </Button>
          )}
        </div>
      </div>
    );
  },
);
