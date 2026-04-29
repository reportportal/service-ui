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
  (formData.requirements ?? []).filter(({ value }) => Boolean(value?.trim())).length;

const countTags = (formData: CreateTestCaseFormData): number =>
  (formData.attributes ?? []).length;

const countSteps = (formData: CreateTestCaseFormData): number =>
  toStepsArray(formData.steps).filter(
    (step) =>
      Boolean(step?.instructions?.trim()) ||
      Boolean(step?.expectedResult?.trim()) ||
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
  tagsA: CreateTestCaseFormData['attributes'],
  tagsB: CreateTestCaseFormData['attributes'],
): boolean => {
  const left = tagsA ?? [];
  const right = tagsB ?? [];
  if (left.length !== right.length) {
    return false;
  }
  const serialize = (list: typeof left) =>
    list
      .map(({ key, value }) => `${key ?? ''}=${value ?? ''}`)
      .sort((a, b) => a.localeCompare(b))
      .join('|');
  return serialize(left) === serialize(right);
};

const areRequirementsEqual = (
  requirementsA: CreateTestCaseFormData['requirements'],
  requirementsB: CreateTestCaseFormData['requirements'],
): boolean => {
  const left = (requirementsA ?? []).map((requirement) => requirement?.value?.trim() ?? '').filter(Boolean);
  const right = (requirementsB ?? []).map((requirement) => requirement?.value?.trim() ?? '').filter(Boolean);
  if (left.length !== right.length) {
    return false;
  }
  const sortedLeft = [...left].sort((a, b) => a.localeCompare(b)).join('|');
  const sortedRight = [...right].sort((a, b) => a.localeCompare(b)).join('|');
  return sortedLeft === sortedRight;
};

const areStepsEqual = (stepsA: unknown, stepsB: unknown): boolean => {
  const left = toStepsArray(stepsA);
  const right = toStepsArray(stepsB);
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
  attachmentsA: CreateTestCaseFormData,
  attachmentsB: CreateTestCaseFormData,
): boolean => {
  if ((attachmentsA.preconditionAttachments ?? []).length !== (attachmentsB.preconditionAttachments ?? []).length) {
    return false;
  }
  if ((attachmentsA.textAttachments ?? []).length !== (attachmentsB.textAttachments ?? []).length) {
    return false;
  }

  return true;
};

type EditFieldKey =
  | (typeof TEST_CASE_STEP_EDIT_FIELD)[keyof typeof TEST_CASE_STEP_EDIT_FIELD]
  | (typeof TEST_CASE_TEXT_EDIT_FIELD)[keyof typeof TEST_CASE_TEXT_EDIT_FIELD];

type EditFieldDiffer = (initial: CreateTestCaseFormData, current: CreateTestCaseFormData) => boolean;

const EDIT_FIELD_DIFFERS: Record<EditFieldKey, EditFieldDiffer> = {
  [TEST_CASE_STEP_EDIT_FIELD.TAGS]: (initial, current) =>
    !areTagsEqual(initial.attributes, current.attributes),
  [TEST_CASE_STEP_EDIT_FIELD.PRECONDITION]: (initial, current) =>
    (initial.precondition ?? '') !== (current.precondition ?? ''),
  [TEST_CASE_STEP_EDIT_FIELD.REQUIREMENTS]: (initial, current) =>
    !areRequirementsEqual(initial.requirements, current.requirements),
  [TEST_CASE_STEP_EDIT_FIELD.EXECUTIONS_TIME]: (initial, current) =>
    (initial.executionEstimationTime ?? null) !== (current.executionEstimationTime ?? null),
  [TEST_CASE_STEP_EDIT_FIELD.STEPS]: (initial, current) =>
    !areStepsEqual(initial.steps, current.steps),
  [TEST_CASE_TEXT_EDIT_FIELD.INSTRUCTIONS]: (initial, current) =>
    (initial.instructions ?? '') !== (current.instructions ?? ''),
  [TEST_CASE_TEXT_EDIT_FIELD.EXPECTED_RESULTS]: (initial, current) =>
    (initial.expectedResult ?? '') !== (current.expectedResult ?? ''),
  [TEST_CASE_STEP_EDIT_FIELD.ATTACHMENTS]: (initial, current) =>
    !areAttachmentsEqual(initial, current),
};

export const getEditedFieldsParam = (
  initial: CreateTestCaseFormData,
  current: CreateTestCaseFormData,
): string => {
  const fields = isStepTemplate(current) ? STEP_EDIT_FIELDS : TEXT_EDIT_FIELDS;

  return fields.filter((field) => EDIT_FIELD_DIFFERS[field](initial, current)).join('#');
};
