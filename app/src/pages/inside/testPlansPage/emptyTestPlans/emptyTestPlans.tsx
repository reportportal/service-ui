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

import { createClassnames, referenceDictionary } from 'common/utils';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { NumerableBlock } from 'pages/common/numerableBlock';

import { useCreateTestPlanModal } from '../testPlanModals';
import { commonMessages } from '../commonMessages';
import { messages } from './messages';

import styles from './emptyTestPlans.scss';

const cx = createClassnames(styles);

interface ActionButton {
  name: string;
  dataAutomationId: string;
  isCompact: boolean;
  handleButton: () => void;
}

const benefitMessages = [
  messages.progressTracking,
  messages.goalAlignment,
  messages.resourceManagement,
];

export const EmptyTestPlans = () => {
  const { formatMessage } = useIntl();
  const { openModal } = useCreateTestPlanModal();
  const { canCreateTestPlan } = useUserPermissions();
  const benefits = benefitMessages.map((translation) =>
    Parser(formatMessage(translation, {}, { ignoreTag: true })),
  );

  const getAvailableActions = (): ActionButton[] =>
    canCreateTestPlan
      ? [
          {
            name: formatMessage(commonMessages.createMilestone),
            dataAutomationId: 'createTestPlansButton',
            isCompact: true,
            handleButton: openModal,
          },
        ]
      : [];

  return (
    <div className={cx('empty-test-plans')}>
      <EmptyStatePage
        title={formatMessage(messages.pageHeader)}
        description={formatMessage(messages.pageDescription)}
        imageType="flag"
        documentationLink={referenceDictionary.rpDoc}
        buttons={getAvailableActions()}
      />
      <NumerableBlock
        items={benefits}
        title={formatMessage(messages.numerableBlockTitle)}
        className={cx('empty-test-plans__numerableBlock')}
        fullWidth
      />
    </div>
  );
};
