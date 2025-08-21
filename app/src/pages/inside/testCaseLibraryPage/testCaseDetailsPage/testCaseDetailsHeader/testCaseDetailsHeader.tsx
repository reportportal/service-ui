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
import { BreadcrumbsTreeIcon, Button, MeatballMenuIcon } from '@reportportal/ui-kit';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import PencilIcon from 'common/img/newIcons/pencil-inline.svg';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { ProjectDetails } from 'pages/organization/constants';
import { PopoverControl } from 'pages/common/popoverControl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  TEST_CASE_LIBRARY_PAGE,
  urlFolderIdSelector,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { useDispatch, useSelector } from 'react-redux';
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
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const folderId = useSelector(urlFolderIdSelector);
  const dispatch = useDispatch();

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
        testCasePageRoute: ['folder', folderId, 'test-cases', testCase.id, 'historyOfActions'],
      },
    });
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
        <button type="button" className={cx('header__edit-button')}>
          {Parser(PencilIcon as unknown as string)}
        </button>
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
          <PopoverControl
            items={[
              {
                label: formatMessage(COMMON_LOCALE_KEYS.DUPLICATE),
              },
              {
                label: formatMessage(commonMessages.historyOfActions),
                onClick: handleHistoryOfActions,
              },
              {
                label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
                variant: 'destructive',
              },
            ]}
            placement="bottom-end"
          >
            <Button
              variant="ghost"
              adjustWidthOn="content"
              onClick={onMenuAction}
              className={cx('header__more-button')}
            >
              <MeatballMenuIcon />
            </Button>
          </PopoverControl>

          <Button onClick={onAddToLaunch} variant="ghost" disabled>
            {formatMessage(messages.addToLaunch)}
          </Button>
          <Button onClick={onAddToTestPlan} variant="ghost">
            {formatMessage(messages.addToTestPlan)}
          </Button>
        </div>
      </div>
    </div>
  );
};
