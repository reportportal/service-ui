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

import Parser from 'html-react-parser';
import { FC, SVGProps } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';

import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import ImportIcon from 'common/img/import-thin-inline.svg';
import PlusIconInline from 'common/img/plus-button-inline.svg';
import { useUserPermissions } from 'hooks/useUserPermissions';

import { messages } from '../messages';
import { commonMessages } from '../../commonMessages';

import styles from './folderEmptyState.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface FolderEmptyStateProps {
  folderTitle: string;
}

interface Button {
  name: string;
  dataAutomationId: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  variant?: string;
  isCompact: boolean;
}

export const FolderEmptyState = ({ folderTitle }: FolderEmptyStateProps) => {
  const { formatMessage } = useIntl();
  const { canCreateTestCase, canImportTestCases } = useUserPermissions();

  const availableButtons = () => {
    const buttons: Button[] = [];

    if (canCreateTestCase) {
      buttons.push({
        name: formatMessage(commonMessages.createTestCase),
        dataAutomationId: 'createTestCaseButton',
        icon: PlusIconInline,
        isCompact: true,
      });
    }

    if (canImportTestCases) {
      buttons.push({
        name: formatMessage(messages.importTestCases),
        dataAutomationId: 'importTestCaseButton',
        variant: 'ghost',
        icon: ImportIcon,
        isCompact: true,
      });
    }

    return buttons;
  };

  return (
    <div className={cx('folder-empty-state')}>
      <div className={cx('folder-empty-state__title')}>{folderTitle}</div>
      <EmptyStatePage
        title={formatMessage(messages.emptyPageTitle)}
        description={Parser(formatMessage(messages.folderEmptyPageDescription))}
        imageType="docs"
        buttons={availableButtons()}
      />
    </div>
  );
};
