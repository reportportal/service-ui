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

import { useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { change, touch, untouch } from 'redux-form';
import { keyBy, isEmpty } from 'es-toolkit/compat';
import { MIME_TYPES } from '@reportportal/ui-kit/fileDropArea';
import { FieldNumber } from '@reportportal/ui-kit';
import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import { FieldProvider } from 'components/fields';
import { Step } from 'pages/inside/testCaseLibraryPage/types';

import { AttachmentArea } from '../createTestCaseModal/attachmentArea';
import { Precondition } from '../createTestCaseModal/testCaseDetails/precondition';
import { Steps } from '../createTestCaseModal/testCaseDetails/steps';
import { TextTemplate } from '../createTestCaseModal/testCaseDetails/textTemplate';
import { Requirements } from '../createTestCaseModal/testCaseDetails/requirements/requirements';
import { ManualScenarioType } from '../types';
import { manualScenarioTypeSelector, stepsDataSelector } from '../createTestCaseModal/selectors';
import { commonMessages } from '../commonMessages';
import { ScenarioFieldsProps } from './types';
import { createEmptyStep } from './constants';

import styles from './scenarioFields.scss';

const cx = createClassnames(styles);

export const ScenarioFields = ({ formName }: ScenarioFieldsProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const manualScenarioType = useSelector(manualScenarioTypeSelector(formName));
  const stepsData = useSelector(stepsDataSelector(formName));

  // Determine if we're in edit mode based on the structure of stepsData
  const isEditMode = useMemo(() => !isEmpty(stepsData), [stepsData]);

  // Initialize steps from existing data or create empty step
  const initialSteps = useMemo(() => {
    if (!isEmpty(stepsData)) {
      return Object.values(stepsData)
        .filter(Boolean)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }
    return [createEmptyStep()];
  }, [stepsData]);

  const [steps, setSteps] = useState<Step[]>(initialSteps);

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

  const setUpdatedSteps = useCallback(
    (updatedSteps: Step[]) => {
      setSteps(updatedSteps);
      syncStepsToForm(updatedSteps);
    },
    [syncStepsToForm],
  );

  const handleAddStep = useCallback(() => {
    const newStep = createEmptyStep();
    setUpdatedSteps([...steps, newStep]);
  }, [steps, setUpdatedSteps]);

  const handleRemoveStep = useCallback(
    (stepId: number) => {
      if (steps.length === 1) {
        return;
      }

      const filteredSteps = steps.filter((step) => step.id !== stepId);
      setUpdatedSteps(filteredSteps);
    },
    [steps, setUpdatedSteps],
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
    <div className={cx('scenario-fields')}>
      <FieldProvider name="executionEstimationTime">
        <div className={cx('scenario-fields__field')}>
          <FieldNumber
            min={1}
            label={formatMessage(commonMessages.executionTime)}
            onChange={() => {}}
          />
        </div>
      </FieldProvider>

      <div className={cx('scenario-fields__field')}>
        <Requirements />
      </div>

      {isTextTemplate ? (
        <>
          <div className={cx('scenario-fields__field')}>
            <Precondition />
          </div>
          <div className={cx('scenario-fields__field')}>
            <TextTemplate formName={formName} />
          </div>
        </>
      ) : (
        <>
          <div className={cx('scenario-fields__field')}>
            <AttachmentArea
              isNumerable={false}
              attachmentFieldName="preconditionAttachments"
              formName={formName}
              acceptFileMimeTypes={[MIME_TYPES.jpeg, MIME_TYPES.png]}
            >
              <Precondition />
            </AttachmentArea>
          </div>
          <div className={cx('scenario-fields__field')}>
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
          </div>
        </>
      )}
    </div>
  );
};
