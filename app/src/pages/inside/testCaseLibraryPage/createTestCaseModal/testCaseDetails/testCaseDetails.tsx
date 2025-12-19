import { useEffect, useState, useRef, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { change, touch, untouch } from 'redux-form';
import { isNumber, isEmpty, keyBy } from 'es-toolkit/compat';
import { FieldText } from '@reportportal/ui-kit';
import { MIME_TYPES } from '@reportportal/ui-kit/fileDropArea';

import { createClassnames } from 'common/utils';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { Step } from 'pages/inside/testCaseLibraryPage/types';

import { Template } from './template';
import { AttachmentArea } from '../attachmentArea';
import { Precondition } from './precondition';
import { Steps } from './steps';
import { TextTemplate } from './textTemplate';
import { ManualScenarioType } from '../../types';
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
  formName: string;
  isTemplateFieldDisabled?: boolean;
}

export const TestCaseDetails = ({
  className,
  formName,
  isTemplateFieldDisabled = false,
}: TestCaseDetailsProps) => {
  const [steps, setSteps] = useState<Step[]>([createEmptyStep()]);
  const [isEditMode, setIsEditMode] = useState(false);
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const manualScenarioType = useSelector(manualScenarioTypeSelector(formName));
  const stepsData = useSelector(stepsDataSelector(formName));
  const isEditModeRef = useRef(!isEmpty(stepsData));

  const buildStepsObjectWithPositions = useCallback(
    (updatedSteps: Step[]) =>
      keyBy(
        updatedSteps.map((step, idx) => ({
          ...(stepsData?.[step.id] || step),
          id: step.id,
          position: idx,
        })),
        (step) => step.id,
      ),
    [stepsData],
  );

  const getStepDataFromFormState = useCallback(
    (step: Step, oldIndex: number): Step => {
      if (isEditMode) {
        return stepsData?.[step.id] || step;
      }

      return (Array.isArray(stepsData) ? stepsData[oldIndex] : undefined) || step;
    },
    [isEditMode, stepsData],
  );

  const syncEditModeSteps = useCallback(
    (updatedSteps: Step[]) => {
      const stepsObject = buildStepsObjectWithPositions(updatedSteps);

      // Force a detectable change by unsetting/resetting the field
      dispatch(untouch(formName, 'steps'));
      dispatch(change(formName, 'steps', stepsObject));
      dispatch(touch(formName, 'steps'));
    },
    [formName, dispatch, buildStepsObjectWithPositions],
  );

  const syncCreateModeSteps = useCallback(
    (updatedSteps: Step[]) => {
      updatedSteps.forEach((step, newIndex) => {
        const oldIndex = steps.findIndex(({ id }) => id === step.id);
        const stepData = getStepDataFromFormState(step, oldIndex);

        dispatch(change(formName, `steps.${newIndex}`, stepData));
      });

      // Clear removed step indices
      for (let i = updatedSteps.length; i < steps.length; i += 1) {
        dispatch(change(formName, `steps.${i}`, undefined));
      }
    },
    [steps, formName, dispatch, getStepDataFromFormState],
  );

  const syncStepsToForm = useCallback(
    (updatedSteps: Step[]) => {
      if (isEditMode) {
        syncEditModeSteps(updatedSteps);
      } else {
        syncCreateModeSteps(updatedSteps);
      }
    },
    [isEditMode, syncEditModeSteps, syncCreateModeSteps],
  );

  useEffect(() => {
    if (isEditModeRef.current && !isEmpty(stepsData)) {
      setSteps(Object.values(stepsData));
      setIsEditMode(true);
      isEditModeRef.current = false;
    }
  }, [stepsData]);

  const setUpdatedSteps = useCallback(
    (updatedSteps: Step[]) => {
      setSteps(updatedSteps);
      syncStepsToForm(updatedSteps);
    },
    [syncStepsToForm],
  );

  const handleAddStep = useCallback(
    (index?: number) => {
      const newStep = createEmptyStep();
      const updatedSteps = isNumber(index)
        ? [...steps.slice(0, index + 1), newStep, ...steps.slice(index + 1)]
        : [...steps, newStep];

      setUpdatedSteps(updatedSteps);
    },
    [steps, syncStepsToForm],
  );

  const handleRemoveStep = useCallback(
    (stepId: number) => {
      const updatedSteps = steps.filter((step) => step.id !== stepId);

      setUpdatedSteps(updatedSteps);
    },
    [steps, syncStepsToForm],
  );

  const handleMoveStep = useCallback(
    ({ stepId, direction }: { stepId: number; direction: 'up' | 'down' }) => {
      const currentIndex = steps.findIndex((step) => step.id === stepId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex === -1 || newIndex < 0 || newIndex >= steps.length) {
        return;
      }

      const reorderedSteps = [...steps];
      const [movedStep] = reorderedSteps.splice(currentIndex, 1);
      reorderedSteps.splice(newIndex, 0, movedStep);

      setSteps(reorderedSteps);
      syncStepsToForm(reorderedSteps);
    },
    [steps, syncStepsToForm],
  );

  const handleReorderSteps = useCallback(
    (reorderedSteps: Step[]) => {
      setUpdatedSteps(reorderedSteps);
    },
    [setUpdatedSteps],
  );

  const isTextTemplate = manualScenarioType === ManualScenarioType.TEXT;

  return (
    <div className={cx('test-case-details', className)}>
      <Template isTemplateFieldDisabled={isTemplateFieldDisabled} />
      <FieldProvider name="linkToRequirements" placeholder={formatMessage(messages.enterLink)}>
        <FieldErrorHint provideHint={false}>
          <FieldText label={formatMessage(messages.requirementsLink)} defaultWidth={false} />
        </FieldErrorHint>
      </FieldProvider>
      {isTextTemplate ? (
        <>
          <Precondition />
          <TextTemplate formName={formName} />
        </>
      ) : (
        <>
          <AttachmentArea
            isNumerable={false}
            attachmentFieldName="preconditionAttachments"
            formName={formName}
            acceptFileMimeTypes={[MIME_TYPES.jpeg, MIME_TYPES.png]}
          >
            <Precondition />
          </AttachmentArea>
          <FieldProvider name="steps">
            <Steps
              steps={steps}
              onAddStep={handleAddStep}
              onRemoveStep={handleRemoveStep}
              onMoveStep={handleMoveStep}
              onReorderSteps={handleReorderSteps}
              formName={formName}
              isKeyById={isEditMode}
            />
          </FieldProvider>
        </>
      )}
    </div>
  );
};
