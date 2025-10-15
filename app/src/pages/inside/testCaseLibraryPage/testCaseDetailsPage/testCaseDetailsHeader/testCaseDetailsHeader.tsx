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

import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { BreadcrumbsTreeIcon, Button, MeatballMenuIcon } from '@reportportal/ui-kit';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { createClassnames } from 'common/utils';
import PencilIcon from 'common/img/newIcons/pencil-inline.svg';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { ProjectDetails } from 'pages/organization/constants';
import { PopoverControl } from 'pages/common/popoverControl';
import { PopoverItem } from 'pages/common/popoverControl/popoverControl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { REVERSED_DATE_FORMAT } from 'common/constants/timeDateFormat';
import { showModalAction } from 'controllers/modal';
import { TEST_CASE_LIBRARY_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import { testCaseLibraryBreadcrumbsSelector } from 'controllers/pages/selectors';

import { ExtendedTestCase } from '../../types';
import { messages } from './messages';
import { commonMessages } from '../../commonMessages';
import { EDIT_TEST_CASE_MODAL_KEY } from '../editTestCaseModal/editTestCaseModal';
import { useDeleteTestCaseModal } from '../../deleteTestCaseModal';
import { AddToLaunchButton } from '../../addToLaunchButton';

import styles from './testCaseDetailsHeader.scss';

const cx = createClassnames(styles);

interface TestCaseDetailsHeaderProps {
  className?: string;
  testCase: ExtendedTestCase;
  onAddToTestPlan: () => void;
  onMenuAction?: () => void;
}

export const TestCaseDetailsHeader = ({
  className,
  testCase,
  onAddToTestPlan,
  onMenuAction = () => {},
}: TestCaseDetailsHeaderProps) => {
  const { formatMessage } = useIntl();
  const { canDeleteTestCase, canDuplicateTestCase, canEditTestCase } = useUserPermissions();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const dispatch = useDispatch();
  const { openModal: openDeleteTestCaseModal } = useDeleteTestCaseModal();

  const breadcrumbsTitles = {
    mainTitle: formatMessage(commonMessages.testCaseLibraryBreadcrumb),
    testTitle: testCase.name,
  };

  const breadcrumbs = useSelector(testCaseLibraryBreadcrumbsSelector(breadcrumbsTitles));

  const handleHistoryOfActions = () => {
    dispatch({
      type: TEST_CASE_LIBRARY_PAGE,
      payload: {
        organizationSlug,
        projectSlug,
        testCasePageRoute: `test-cases/${testCase.id}/historyOfActions`,
      },
    });
  };

  const handleDeleteTestCase = () => openDeleteTestCaseModal({ testCase, isDetailsPage: true });

  const getCreationDate = (timestamp: number) => {
    const date = new Date(timestamp);

    return moment(date).format(REVERSED_DATE_FORMAT as string);
  };

  const getMenuItems = () => {
    const items: PopoverItem[] = [
      {
        label: formatMessage(commonMessages.historyOfActions),
        onClick: handleHistoryOfActions,
      },
    ];

    if (canDuplicateTestCase) {
      items.unshift({ label: formatMessage(COMMON_LOCALE_KEYS.DUPLICATE) });
    }

    if (canDeleteTestCase) {
      items.push({
        label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        variant: 'destructive',
        onClick: handleDeleteTestCase,
      });
    }

    return items;
  };

  const openEditTestCaseModal = () => {
    dispatch(
      showModalAction({
        id: EDIT_TEST_CASE_MODAL_KEY,
        data: {
          initialValues: {
            name: testCase.name,
            priority: testCase.priority.toLowerCase(),
            testFolderId: testCase.testFolder.id,
          },
          testCaseId: testCase.id,
        },
      }),
    );
  };

  return (
    <div className={cx('header', className)}>
      <div className={cx('header__breadcrumb')}>
        <BreadcrumbsTreeIcon />
        <Breadcrumbs descriptors={breadcrumbs} />
      </div>
      <div className={cx('header__title')}>
        <PriorityIcon
          priority={testCase.priority.toLocaleLowerCase() as TestCasePriority}
          className={cx('header__title-icon')}
        />
        {testCase.name}
        {canEditTestCase && (
          <button
            type="button"
            className={cx('header__edit-button')}
            onClick={openEditTestCaseModal}
          >
            {Parser(PencilIcon as unknown as string)}
          </button>
        )}
      </div>
      <div className={cx('header__info-wrapper')}>
        <div className={cx('header__meta')}>
          <div className={cx('header__meta-item')}>
            <span className={cx('header__meta-label')}>{formatMessage(messages.created)}</span>
            <span className={cx('header__meta-value')}>{getCreationDate(testCase.createdAt)}</span>
          </div>
          <div className={cx('header__meta-item')}>
            <span className={cx('header__meta-label')}>{formatMessage(messages.id)}</span>
            <span className={cx('header__meta-value')}>{testCase.id}</span>
            <CopyToClipboard text={testCase.id} className={cx('header__copy')}>
              {Parser(IconDuplicate as unknown as string)}
            </CopyToClipboard>
          </div>
        </div>
        <div className={cx('header__actions')}>
          <PopoverControl items={getMenuItems()} placement="bottom-end">
            <Button
              variant="ghost"
              adjustWidthOn="content"
              onClick={onMenuAction}
              className={cx('header__more-button')}
            >
              <MeatballMenuIcon />
            </Button>
          </PopoverControl>
          {canEditTestCase && (
            <>
              <AddToLaunchButton
                manualScenario={testCase?.manualScenario}
                testCaseName={testCase.name}
              />
              <Button onClick={onAddToTestPlan} variant="ghost">
                {formatMessage(COMMON_LOCALE_KEYS.ADD_TO_TEST_PLAN)}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
