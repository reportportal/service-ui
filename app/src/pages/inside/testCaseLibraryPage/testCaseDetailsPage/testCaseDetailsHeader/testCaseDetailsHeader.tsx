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
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { useDispatch, useSelector } from 'react-redux';
import { BreadcrumbsTreeIcon, Button, MeatballMenuIcon } from '@reportportal/ui-kit';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import PencilIcon from 'common/img/newIcons/pencil-inline.svg';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { ProjectDetails } from 'pages/organization/constants';
import { PopoverControl } from 'pages/common/popoverControl';
import { PopoverItem } from 'pages/common/popoverControl/popoverControl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  TEST_CASE_DETAILS_HISTORY_OF_ACTIONS_PAGE,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import { testCaseLibraryBreadcrumbsSelector } from 'controllers/pages/selectors';
import { TestCase } from '../../types';
import { messages } from './messages';
import { commonMessages } from '../../commonMessages';

import styles from './testCaseDetailsHeader.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface TestCaseDetailsHeaderProps {
  className?: string;
  testCase: TestCase;
  onAddToLaunch: () => void;
  onAddToTestPlan: () => void;
  onMenuAction?: () => void;
}

export const TestCaseDetailsHeader = ({
  className,
  testCase,
  onAddToLaunch,
  onAddToTestPlan,
  onMenuAction = () => {},
}: TestCaseDetailsHeaderProps) => {
  const { formatMessage } = useIntl();
  const {
    canDeleteTestCase,
    canDuplicateTestCase,
    canEditTestCase,
    canAddTestCaseToLaunch,
    canAddTestCaseToTestPlan,
  } = useUserPermissions();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const dispatch = useDispatch();

  const breadcrumbsTitles = {
    mainTitle: formatMessage(commonMessages.testCaseLibraryBreadcrumb),
    testTitle: testCase.name,
  };

  const breadcrumbs = useSelector(testCaseLibraryBreadcrumbsSelector(breadcrumbsTitles));

  const handleHistoryOfActions = () => {
    dispatch({
      type: TEST_CASE_DETAILS_HISTORY_OF_ACTIONS_PAGE,
      payload: { organizationSlug, projectSlug, testCaseSlug: testCase.id },
    });
  };

  const menuItems = () => {
    const items: PopoverItem[] = [
      {
        label: formatMessage(messages.historyOfActions),
        onClick: handleHistoryOfActions,
      },
    ];

    if (canDuplicateTestCase) {
      items.push({ label: formatMessage(COMMON_LOCALE_KEYS.DUPLICATE) });
    }
    if (canDeleteTestCase) {
      items.push({
        label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        variant: 'destructive',
      });
    }

    return items;
  };

  return (
    <div className={cx('header', className)}>
      <div className={cx('header__breadcrumb')}>
        <BreadcrumbsTreeIcon />
        <Breadcrumbs descriptors={breadcrumbs} />
      </div>
      <div className={cx('header__title')}>
        <PriorityIcon priority={testCase.priority} className={cx('header__title-icon')} />
        {testCase.name}
        {canEditTestCase && (
          <button type="button" className={cx('header__edit-button')}>
            {Parser(PencilIcon as unknown as string)}
          </button>
        )}
      </div>
      <div className={cx('header__info-wrapper')}>
        <div className={cx('header__meta')}>
          <div className={cx('header__meta-item')}>
            <span className={cx('header__meta-label')}>{formatMessage(messages.created)}</span>
            <span className={cx('header__meta-value')}>{testCase.created}</span>
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
          <PopoverControl items={menuItems()} placement="bottom-end">
            <Button
              variant="ghost"
              adjustWidthOn="content"
              onClick={onMenuAction}
              className={cx('header__more-button')}
            >
              <MeatballMenuIcon />
            </Button>
          </PopoverControl>

          {canAddTestCaseToLaunch && (
            <Button onClick={onAddToLaunch} variant="ghost" disabled>
              {formatMessage(messages.addToLaunch)}
            </Button>
          )}
          {canAddTestCaseToTestPlan && (
            <Button onClick={onAddToTestPlan} variant="ghost">
              {formatMessage(messages.addToTestPlan)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
