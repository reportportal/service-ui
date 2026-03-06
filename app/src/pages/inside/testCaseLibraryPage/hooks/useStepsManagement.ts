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

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { change, touch, untouch } from 'redux-form';
import { keyBy, isNumber, isEmpty } from 'es-toolkit/compat';

import { Step } from '../types';

const createEmptyStep = (): Step => ({
  id: Date.now(),
  instructions: '',
  expectedResult: '',
  attachments: [],
});

interface UseStepsManagementParams {
  formName: string;
  stepsData: Record<number, Step> | Step[] | undefined;
  createEmptyStepFn?: () => Step;
}

export const useStepsManagement = ({
  formName,
  stepsData,
  createEmptyStepFn = createEmptyStep,
}: UseStepsManagementParams) => {
  const dispatch = useDispatch();

  const isEditMode = !Array.isArray(stepsData) && !isEmpty(stepsData);

  const normalizedSteps = useMemo(() => {
    const source = Array.isArray(stepsData) ? stepsData : Object.values(stepsData || {});
    const sorted = source.filter(Boolean).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return sorted.length ? sorted : [createEmptyStepFn()];
  }, [stepsData, createEmptyStepFn]);

  const [steps, setSteps] = useState<Step[]>(normalizedSteps);

  useEffect(() => {
    setSteps(normalizedSteps);
  }, [normalizedSteps]);

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

  const handleAddStep = useCallback(
    (index?: number) => {
      const newStep = createEmptyStepFn();
      const updatedSteps = isNumber(index)
        ? [...steps.slice(0, index + 1), newStep, ...steps.slice(index + 1)]
        : [...steps, newStep];

      setUpdatedSteps(updatedSteps);
    },
    [steps, setUpdatedSteps, createEmptyStepFn],
  );

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

  return {
    steps,
    isEditMode,
    handleAddStep,
    handleRemoveStep,
    handleMoveStep,
    handleReorderSteps,
  };
};
