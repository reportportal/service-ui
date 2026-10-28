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

import { defineMessages, useIntl } from 'react-intl';
import { createClassnames } from 'common/utils';
import { WidgetInfoBlock } from '../../../common/widgetInfoBlock';
import { Widget } from '../../types';
import { StepLabelItem } from './stepLabelItem';
import styles from './wizardInfoSection.scss';

const cx = createClassnames(styles);

const STEPS = ['WidgetSelection', 'WidgetConfiguring'] as const;

const messages = defineMessages({
  WidgetSelectionStepLabel: {
    id: 'WizardInfoSection.WidgetSelectionStepLabel',
    defaultMessage: 'Select widget type',
  },
  WidgetConfiguringStepLabel: {
    id: 'WizardInfoSection.WidgetConfiguringStepLabel',
    defaultMessage: 'Name and settings',
  },
});

interface WizardInfoSectionProps {
  projectKey: string;
  step?: number;
  activeWidget?: Widget;
  widgetSettings?: Record<string, unknown>;
}

export const WizardInfoSection = ({
  projectKey,
  step = 0,
  activeWidget = null,
  widgetSettings = {},
}: WizardInfoSectionProps) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('wizard-info-section')}>
      <div className={cx('steps-block')}>
        {STEPS.map((value, index) => (
          <StepLabelItem
            key={value}
            step={index}
            label={formatMessage(messages[`${value}StepLabel`])}
            active={step === index}
            completed={step > index}
          />
        ))}
      </div>
      {activeWidget?.id && <div className={cx('divider')} />}
      <WidgetInfoBlock
        projectKey={projectKey}
        widgetSettings={widgetSettings}
        activeWidget={activeWidget}
        customCondition={step === 1}
      />
    </div>
  );
};
