import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';
import classNames from 'classnames/bind';
import { isNumber } from 'es-toolkit/compat';
import { FieldText } from '@reportportal/ui-kit';

import { FieldErrorHint, FieldProvider } from 'components/fields';

import type { AppState } from 'types/store';

import { Template } from './template';
import { AttachmentArea } from '../attachmentArea';
import { Precondition } from './precondition';
import { Steps } from './steps';
import { TextTemplate } from './textTemplate';
import { CREATE_TEST_CASE_FORM_NAME, ManualScenarioType } from '../createTestCaseModal';

import styles from './testCaseDetails.scss';

const cx = classNames.bind(styles) as typeof classNames;

const messages = defineMessages({
  requirementsLink: {
    id: 'createTestCaseModal.requirementsLink',
    defaultMessage: 'Requirements link',
  },
  enterLink: {
    id: 'createTestCaseModal.enterLink',
    defaultMessage: 'Enter link to requirements (e.g. https://example.com)',
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

interface TestCaseDetailsProps {
  className?: string;
}

const selector = formValueSelector('create-test-case-modal-form');

export const TestCaseDetails = ({ className }: TestCaseDetailsProps) => {
  const [steps, setSteps] = useState<StepData[]>([createEmptyStep()]);
  const { formatMessage } = useIntl();
  const manualScenarioType = useSelector(
    (state: AppState) => selector(state, 'manualScenarioType') as ManualScenarioType,
  );

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

  const handleMoveStep = ({ stepId, direction }: { stepId: string; direction: 'up' | 'down' }) => {
    setSteps((prevState) => {
      const currentIndex = prevState.findIndex((step) => step.id === stepId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const shouldNotMove = newIndex < 0 || newIndex >= prevState.length;

      if (currentIndex === -1 || shouldNotMove) {
        return prevState;
      }

      const reorderedSteps = [...prevState];
      const [movedStep] = reorderedSteps.splice(currentIndex, 1);

      reorderedSteps.splice(newIndex, 0, movedStep);

      return reorderedSteps;
    });
  };

  const isTextTemplate = manualScenarioType === 'TEXT';

  return (
    <div className={cx('test-case-details', className)}>
      <Template />
      <FieldProvider name="linkToRequirements" placeholder={formatMessage(messages.enterLink)}>
        <FieldErrorHint provideHint={false}>
          <FieldText label={formatMessage(messages.requirementsLink)} defaultWidth={false} />
        </FieldErrorHint>
      </FieldProvider>
      {isTextTemplate ? (
        <>
          <Precondition />
          <TextTemplate />
        </>
      ) : (
        <>
          <AttachmentArea
            isNumerable={false}
            attachmentFieldName="preconditionAttachments"
            formName={CREATE_TEST_CASE_FORM_NAME}
          >
            <Precondition />
          </AttachmentArea>
          <FieldProvider name="steps">
            <Steps
              steps={steps}
              onAddStep={handleAddStep}
              onRemoveStep={handleRemoveStep}
              onMoveStep={handleMoveStep}
            />
          </FieldProvider>
        </>
      )}
    </div>
  );
};
