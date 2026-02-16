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
import { useIntl } from 'react-intl';
import { Button } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';
import { useUserPermissions } from 'hooks/useUserPermissions';
import NoScenarioIcon from 'pages/inside/common/emptyStatePage/img/no-scenario-details-inline.svg';

import { useEditTestCaseModal } from '../../editSelectedTestCaseModal';
import { DetailsEmptyStateProps } from '../../types';
import { messages } from '../messages';
import styles from './detailsEmptyState.scss';

const cx = createClassnames(styles);

export const DetailsEmptyState = ({ testCase }: DetailsEmptyStateProps) => {
  const { formatMessage } = useIntl();
  const { canEditTestCaseScenario } = useUserPermissions();
  const { openModal } = useEditTestCaseModal();

  const handleEditScenario = () => {
    openModal({ testCase });
  };

  return (
    <div className={cx('container')}>
      <div className={cx('icon')}>{Parser(String(NoScenarioIcon))}</div>
      <div className={cx('title')}>{formatMessage(messages.noScenarioDetails)}</div>
      <div className={cx('description')}>
        {formatMessage(messages.noScenarioDetailsDescription)}
      </div>
      {canEditTestCaseScenario && (
        <Button variant="primary" onClick={handleEditScenario} className={cx('button')}>
          {formatMessage(messages.editScenario)}
        </Button>
      )}
    </div>
  );
};
