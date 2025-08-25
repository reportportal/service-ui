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
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { referenceDictionary } from 'common/utils';
import { canCreateTestPlan } from 'common/utils/permissions';
import { userRolesSelector } from 'controllers/pages';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { NumerableBlock } from 'pages/common/numerableBlock';
import { useCreateTestPlanModal } from '../hooks';
import { commonMessages } from '../commonMessages';
import { messages } from './messages';
import styles from './emptyTestPlans.scss';

const cx = classNames.bind(styles) as typeof classNames;

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
  const userRoles = useSelector(userRolesSelector);
  const benefits = benefitMessages.map((translation) =>
    Parser(formatMessage(translation, {}, { ignoreTag: true })),
  );

  const availableActions = () => {
    const actions: ActionButton[] = [];

    if (canCreateTestPlan(userRoles)) {
      actions.push({
        name: formatMessage(commonMessages.createTestPlan),
        dataAutomationId: 'createTestPlansButton',
        isCompact: true,
        handleButton: openModal,
      });
    }

    return actions;
  };

  return (
    <div className={cx('empty-test-plans')}>
      <EmptyStatePage
        title={formatMessage(messages.pageHeader)}
        description={Parser(formatMessage(messages.pageDescription))}
        imageType="flag"
        documentationLink={referenceDictionary.rpDoc}
        buttons={availableActions()}
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
