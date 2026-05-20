/*
 * Copyright 2026 EPAM Systems
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
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { NumerableBlock } from 'pages/common/numerableBlock';
import { commonMessages } from 'pages/inside/testPlansPage/commonMessages';
import { messages as emptyStateMessages } from 'pages/inside/testPlansPage/emptyTestPlans/messages';

import styles from './emptyMilestones.scss';

const cx = createClassnames(styles);

interface EmptyMilestonesProps {
  onCreateMilestone?: () => void;
}

const benefitMessages = [
  emptyStateMessages.progressTracking,
  emptyStateMessages.goalAlignment,
  emptyStateMessages.resourceManagement,
];

export const EmptyMilestones = ({ onCreateMilestone }: EmptyMilestonesProps) => {
  const { formatMessage } = useIntl();
  const benefits = benefitMessages.map((translation) =>
    Parser(formatMessage(translation, {}, { ignoreTag: true })),
  );
  const buttons = onCreateMilestone
    ? [
        {
          name: formatMessage(commonMessages.createMilestone),
          dataAutomationId: 'createMilestoneEmptyStateButton',
          isCompact: true,
          handleButton: onCreateMilestone,
        },
      ]
    : [];

  return (
    <div className={cx('empty-milestones')}>
      <EmptyStatePage
        title={formatMessage(emptyStateMessages.pageHeader)}
        description={formatMessage(emptyStateMessages.pageDescription)}
        imageType="flag"
        documentationLink={referenceDictionary.rpDoc}
        documentationLinkClassName={cx('empty-milestones__documentation-link')}
        buttons={buttons}
      />
      <NumerableBlock
        items={benefits}
        title={formatMessage(emptyStateMessages.numerableBlockTitle)}
        className={cx('empty-milestones__numerable-block')}
        fullWidth
      />
    </div>
  );
};
