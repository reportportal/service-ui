import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { FieldText } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import isNumber from 'lodash.isnumber';

import { FieldErrorHint, FieldProvider } from 'components/fields';
import { Template } from './template';
import { AttachmentArea } from '../attachmentArea';
import { Precondition } from './precondition';
import { Steps } from './steps';

import styles from './testCaseDetails.scss';

const cx = classNames.bind(styles) as typeof classNames;

const messages = defineMessages({
  requirementsLink: {
    id: 'createTestCaseModal.requirementsLink',
    defaultMessage: 'Requirements link',
  },
  enterLink: {
    id: 'createTestCaseModal.enterLink',
    defaultMessage: 'Enter link to requirements',
  },
});

export interface StepData {
  id: string;
  instructions: string;
  expectedResult: string;
  attachments?: string[];
}

const createEmptyStep = (): StepData => ({
  id: `step_${Date.now()}`,
  instructions: '',
  expectedResult: '',
  attachments: [],
});

export const TestCaseDetails = () => {
  const [steps, setSteps] = useState<StepData[]>([createEmptyStep()]);
  const { formatMessage } = useIntl();

  const handleAddStep = (index?: number) => {
    setSteps((prevState) => {
      const newStep = createEmptyStep();

      if (isNumber(index)) {
        return [...prevState.slice(0, index + 1), newStep, ...prevState.slice(index + 1)];
      }

      return [...prevState, newStep];
    });
  };

  const handleRemoveStep = (stepId: string) =>
    setSteps((prevState) => prevState.filter((step) => step.id !== stepId));

  return (
    <div className={cx('test-case-details')}>
      <Template />
      <FieldProvider name="requirementsLink" placeholder={formatMessage(messages.enterLink)}>
        <FieldErrorHint provideHint={false}>
          <FieldText label={formatMessage(messages.requirementsLink)} defaultWidth={false} />
        </FieldErrorHint>
      </FieldProvider>
      <AttachmentArea isNumberable={false}>
        <Precondition />
      </AttachmentArea>
      <FieldProvider name="steps">
        <Steps steps={steps} onAddStep={handleAddStep} onRemoveStep={handleRemoveStep} />
      </FieldProvider>
    </div>
  );
};
