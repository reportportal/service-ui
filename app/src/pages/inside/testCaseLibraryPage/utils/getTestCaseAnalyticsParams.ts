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

import { isEmpty } from 'es-toolkit/compat';

import {
  TEST_CASE_PRECONDITIONS_ATTACHMENT_STATUS,
  TEST_CASE_STEPS_ATTACHMENT_STATUS,
  TEST_CASE_STEP_EDIT_FIELD,
  TEST_CASE_TEMPLATE_ICON,
  TEST_CASE_TEXT_EDIT_FIELD,
  TEST_CASE_TIME_CONDITION,
  type TestCaseAttachmentStatus,
  type TestCaseTemplateIconType,
  type TestCaseTimeConditionType,
} from 'analyticsEvents/testCaseLibraryPageEvents';

import { CreateTestCaseFormData, ManualScenarioType, TestStep } from '../types';
import { DEFAULT_EXECUTION_ESTIMATION_TIME } from '../createTestCaseModal/constants';

const isStepTemplate = (formData: CreateTestCaseFormData): boolean =>
  formData.manualScenarioType === ManualScenarioType.STEPS;

const toStepsArray = (steps: unknown): TestStep[] => {
  if (!steps) {
    return [];
  }
  if (Array.isArray(steps)) {
    return steps as TestStep[];
  }
  return Object.values(steps as Record<string, TestStep>);
};

export const getTestCaseTemplateIcon = (
  formData: CreateTestCaseFormData,
): TestCaseTemplateIconType =>
  isStepTemplate(formData) ? TEST_CASE_TEMPLATE_ICON.STEP : TEST_CASE_TEMPLATE_ICON.TEXT;

export const getTestCaseTimeCondition = (
  formData: CreateTestCaseFormData,
): TestCaseTimeConditionType =>
  formData.executionEstimationTime !== undefined &&
  formData.executionEstimationTime !== DEFAULT_EXECUTION_ESTIMATION_TIME
    ? TEST_CASE_TIME_CONDITION.CUSTOMIZE
    : TEST_CASE_TIME_CONDITION.NO_CUSTOMIZE;

const countMeaningfulRequirements = (formData: CreateTestCaseFormData): number =>
  (formData.requirements ?? []).filter(({ value }) => Boolean(value && value.trim())).length;

const countTags = (formData: CreateTestCaseFormData): number =>
  (formData.attributes ?? []).length;

const countSteps = (formData: CreateTestCaseFormData): number =>
  toStepsArray(formData.steps).filter(
    (step) =>
      Boolean(step?.instructions && step.instructions.trim()) ||
      Boolean(step?.expectedResult && step.expectedResult.trim()) ||
      !isEmpty(step?.attachments),
  ).length;

export const getTestCaseNumber = (formData: CreateTestCaseFormData): string => {
  const tags = countTags(formData);
  const requirements = countMeaningfulRequirements(formData);

  if (isStepTemplate(formData)) {
    return `${tags}#${requirements}#${countSteps(formData)}`;
  }
  return `${tags}#${requirements}`;
};

const hasStepsAttachments = (formData: CreateTestCaseFormData): boolean => {
  if (isStepTemplate(formData)) {
    return toStepsArray(formData.steps).some((step) => !isEmpty(step?.attachments));
  }
  return !isEmpty(formData.textAttachments);
};

const hasPreconditionsAttachments = (formData: CreateTestCaseFormData): boolean =>
  !isEmpty(formData.preconditionAttachments);

export const getTestCaseAttachmentStatus = (
  formData: CreateTestCaseFormData,
): TestCaseAttachmentStatus => {
  const stepsPart = hasStepsAttachments(formData)
    ? TEST_CASE_STEPS_ATTACHMENT_STATUS.WITH
    : TEST_CASE_STEPS_ATTACHMENT_STATUS.WITHOUT;
  const preconditionsPart = hasPreconditionsAttachments(formData)
    ? TEST_CASE_PRECONDITIONS_ATTACHMENT_STATUS.WITH
    : TEST_CASE_PRECONDITIONS_ATTACHMENT_STATUS.WITHOUT;

  return `${stepsPart}#${preconditionsPart}`;
};

const STEP_EDIT_FIELDS = [
  TEST_CASE_STEP_EDIT_FIELD.TAGS,
  TEST_CASE_STEP_EDIT_FIELD.PRECONDITION,
  TEST_CASE_STEP_EDIT_FIELD.REQUIREMENTS,
  TEST_CASE_STEP_EDIT_FIELD.EXECUTIONS_TIME,
  TEST_CASE_STEP_EDIT_FIELD.STEPS,
  TEST_CASE_STEP_EDIT_FIELD.ATTACHMENTS,
] as const;

const TEXT_EDIT_FIELDS = [
  TEST_CASE_TEXT_EDIT_FIELD.TAGS,
  TEST_CASE_TEXT_EDIT_FIELD.PRECONDITION,
  TEST_CASE_TEXT_EDIT_FIELD.REQUIREMENTS,
  TEST_CASE_TEXT_EDIT_FIELD.EXECUTIONS_TIME,
  TEST_CASE_TEXT_EDIT_FIELD.INSTRUCTIONS,
  TEST_CASE_TEXT_EDIT_FIELD.EXPECTED_RESULTS,
  TEST_CASE_TEXT_EDIT_FIELD.ATTACHMENTS,
] as const;

const areTagsEqual = (
  a: CreateTestCaseFormData['attributes'],
  b: CreateTestCaseFormData['attributes'],
): boolean => {
  const left = a ?? [];
  const right = b ?? [];
  if (left.length !== right.length) {
    return false;
  }
  const serialize = (list: typeof left) =>
    list
      .map(({ key, value }) => `${key ?? ''}=${value ?? ''}`)
      .sort()
      .join('|');
  return serialize(left) === serialize(right);
};

const areRequirementsEqual = (
  a: CreateTestCaseFormData['requirements'],
  b: CreateTestCaseFormData['requirements'],
): boolean => {
  const left = (a ?? []).map((r) => r?.value ?? '').filter(Boolean);
  const right = (b ?? []).map((r) => r?.value ?? '').filter(Boolean);
  if (left.length !== right.length) {
    return false;
  }
  const sortedLeft = [...left].sort().join('|');
  const sortedRight = [...right].sort().join('|');
  return sortedLeft === sortedRight;
};

const areStepsEqual = (a: unknown, b: unknown): boolean => {
  const left = toStepsArray(a);
  const right = toStepsArray(b);
  if (left.length !== right.length) {
    return false;
  }
  return left.every((step, i) => {
    const other = right[i];
    return (
      step?.instructions === other?.instructions &&
      step?.expectedResult === other?.expectedResult &&
      (step?.attachments ?? []).length === (other?.attachments ?? []).length
    );
  });
};

const areAttachmentsEqual = (
  a: CreateTestCaseFormData,
  b: CreateTestCaseFormData,
): boolean => {
  if ((a.preconditionAttachments ?? []).length !== (b.preconditionAttachments ?? []).length) {
    return false;
  }
  if ((a.textAttachments ?? []).length !== (b.textAttachments ?? []).length) {
    return false;
  }
  // For step template, attachments are inside steps and tracked via areStepsEqual.
  return true;
};

export const getEditedFieldsParam = (
  initial: CreateTestCaseFormData,
  current: CreateTestCaseFormData,
): string => {
  const isStep = isStepTemplate(current);
  const fields = isStep ? STEP_EDIT_FIELDS : TEXT_EDIT_FIELDS;

  const changed: string[] = [];

  fields.forEach((field) => {
    switch (field) {
      case TEST_CASE_STEP_EDIT_FIELD.TAGS:
        if (!areTagsEqual(initial.attributes, current.attributes)) {
          changed.push(TEST_CASE_STEP_EDIT_FIELD.TAGS);
        }
        break;
      case TEST_CASE_STEP_EDIT_FIELD.PRECONDITION:
        if ((initial.precondition ?? '') !== (current.precondition ?? '')) {
          changed.push(TEST_CASE_STEP_EDIT_FIELD.PRECONDITION);
        }
        break;
      case TEST_CASE_STEP_EDIT_FIELD.REQUIREMENTS:
        if (!areRequirementsEqual(initial.requirements, current.requirements)) {
          changed.push(TEST_CASE_STEP_EDIT_FIELD.REQUIREMENTS);
        }
        break;
      case TEST_CASE_STEP_EDIT_FIELD.EXECUTIONS_TIME:
        if (
          (initial.executionEstimationTime ?? null) !==
          (current.executionEstimationTime ?? null)
        ) {
          changed.push(TEST_CASE_STEP_EDIT_FIELD.EXECUTIONS_TIME);
        }
        break;
      case TEST_CASE_STEP_EDIT_FIELD.STEPS:
        if (!areStepsEqual(initial.steps, current.steps)) {
          changed.push(TEST_CASE_STEP_EDIT_FIELD.STEPS);
        }
        break;
      case TEST_CASE_TEXT_EDIT_FIELD.INSTRUCTIONS:
        if ((initial.instructions ?? '') !== (current.instructions ?? '')) {
          changed.push(TEST_CASE_TEXT_EDIT_FIELD.INSTRUCTIONS);
        }
        break;
      case TEST_CASE_TEXT_EDIT_FIELD.EXPECTED_RESULTS:
        if ((initial.expectedResult ?? '') !== (current.expectedResult ?? '')) {
          changed.push(TEST_CASE_TEXT_EDIT_FIELD.EXPECTED_RESULTS);
        }
        break;
      case TEST_CASE_STEP_EDIT_FIELD.ATTACHMENTS:
        if (!areAttachmentsEqual(initial, current)) {
          changed.push(TEST_CASE_STEP_EDIT_FIELD.ATTACHMENTS);
        }
        break;
      default:
        break;
    }
  });

  return changed.join('#');
};
