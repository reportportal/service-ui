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

import classNames from 'classnames/bind';
import { Scrollbars } from 'rc-scrollbars';
import { DisabledButtons, Widget } from '../../types';
import { WizardFirstStepForm } from './wizardFirstStepForm';
import { WizardSecondStepForm } from './wizardSecondStepForm';
import styles from './wizardControlsSection.scss';

const cx = classNames.bind(styles);

interface WizardControlsSectionProps {
  step: number;
  widgets: Widget[];
  activeWidgetId: string;
  eventsInfo: Record<string, unknown>;
  nextStep: () => void;
  onAddWidget: (formData: Record<string, unknown>) => void;
  onDisableButtons: (disabled: DisabledButtons) => void;
}

export const WizardControlsSection = ({
  widgets = [],
  activeWidgetId = '',
  step = 0,
  eventsInfo = {},
  nextStep = () => {},
  onAddWidget = () => {},
  onDisableButtons = () => {},
}: WizardControlsSectionProps) => {
  const getControlsByStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return (
          <WizardSecondStepForm
            widget={widgets.find((widget) => widget.id === activeWidgetId)}
            onSubmit={onAddWidget}
            onDisableButtons={onDisableButtons}
            eventsInfo={eventsInfo}
          />
        );
      default:
        return (
          <WizardFirstStepForm
            widgets={widgets}
            onSubmit={nextStep}
            eventsInfo={eventsInfo}
            onDisableButtons={onDisableButtons}
          />
        );
    }
  };

  return (
    <div className={cx('wizard-controls-section')}>
      <Scrollbars hideTracksWhenNotNeeded>
        <div className={cx('controls-wrapper')}>{getControlsByStep(step)}</div>
      </Scrollbars>
    </div>
  );
};
