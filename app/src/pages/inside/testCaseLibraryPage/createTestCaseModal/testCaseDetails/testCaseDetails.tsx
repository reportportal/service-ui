import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { isNumber, isEmpty } from 'es-toolkit/compat';
import { FieldText } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { Step } from 'pages/inside/testCaseLibraryPage/types';

import { Template } from './template';
import { AttachmentArea } from '../attachmentArea';
import { Precondition } from './precondition';
import { Steps } from './steps';
import { TextTemplate } from './textTemplate';
import { ManualScenarioType } from '../../types';
import { CREATE_TEST_CASE_FORM_NAME } from '../createTestCaseModal';
import { manualScenarioTypeSelector, stepsDataSelector } from '../selectors';

import styles from './testCaseDetails.scss';

const cx = createClassnames(styles);

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

const createEmptyStep = (): Step => ({
  id: Date.now(),
  instructions: '',
  expectedResult: '',
  attachments: [],
});

interface TestCaseDetailsProps {
  className?: string;
}

export const TestCaseDetails = ({ className }: TestCaseDetailsProps) => {
  const [steps, setSteps] = useState<Step[]>([createEmptyStep()]);
  const { formatMessage } = useIntl();
  const manualScenarioType = useSelector(manualScenarioTypeSelector);
  const stepsData = useSelector(stepsDataSelector);

  useEffect(() => {
    if (!isEmpty(stepsData)) {
      const stepsArray = Object.values(stepsData) as Step[];
      setSteps(stepsArray);
    }
  }, [stepsData]);

  const handleAddStep = (index?: number) => {
    setSteps((prevState) => {
      const newStep = createEmptyStep();

      if (isNumber(index)) {
        return [...prevState.slice(0, index + 1), newStep, ...prevState.slice(index + 1)];
      }

      return [...prevState, newStep];
    });
  };

  const handleRemoveStep = (stepId: number) =>
    setSteps((prevState) => prevState.filter((step) => step.id !== stepId));

  const handleMoveStep = ({ stepId, direction }: { stepId: number; direction: 'up' | 'down' }) => {
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

  const isTextTemplate = manualScenarioType === ManualScenarioType.TEXT;

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
