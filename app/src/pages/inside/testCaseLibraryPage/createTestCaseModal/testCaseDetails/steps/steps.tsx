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

import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { Button, PlusIcon } from '@reportportal/ui-kit';

import { AttachmentArea } from '../../attachmentArea';
import { StepData } from '../testCaseDetails';
import { Step } from './step';

import styles from './steps.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface StepsProps {
  steps: StepData[];
  onAddStep: (index?: number) => void;
  onRemoveStep: (stepId: string) => void;
  onMoveStep: ({ stepId, direction }: { stepId: string; direction: 'up' | 'down' }) => void;
}

const messages = defineMessages({
  steps: {
    id: 'CreateTestCaseModal.steps',
    defaultMessage: 'Steps',
  },
  addStep: {
    id: 'CreateTestCaseModal.addStep',
    defaultMessage: 'Add Step',
  },
});

export const Steps = ({ steps, onAddStep, onRemoveStep, onMoveStep }: StepsProps) => {
  const { formatMessage } = useIntl();

  const renderBetweenStepsArea = (index: number) => {
    const isLastStep = index === steps.length - 1;

    return (
      !isLastStep && (
        <div className={cx('steps__between-area')}>
          <Button
            icon={<PlusIcon />}
            className={cx('steps__floating-button')}
            variant="text"
            adjustWidthOn="content"
            onClick={() => onAddStep(index)}
          >
            {formatMessage(messages.addStep)}
          </Button>
        </div>
      )
    );
  };

  return (
    <div className={cx('steps')}>
      <span className={cx('steps__label')}>{formatMessage(messages.steps)}</span>
      {steps.map((step, index) => (
        <div key={step.id} className={cx('steps__step-container')}>
          <AttachmentArea
            isDraggable
            index={index}
            totalCount={steps.length}
            onRemove={() => onRemoveStep(step.id)}
            onMove={(direction) => onMoveStep({ stepId: step.id, direction })}
          >
            <Step stepId={step.id} />
          </AttachmentArea>
          {renderBetweenStepsArea(index)}
        </div>
      ))}
      <div>
        <Button
          icon={<PlusIcon />}
          variant="text"
          adjustWidthOn="content"
          onClick={() => onAddStep()}
        >
          {formatMessage(messages.addStep)}
        </Button>
      </div>
    </div>
  );
};
