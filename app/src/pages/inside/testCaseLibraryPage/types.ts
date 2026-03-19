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

import { FC, SVGProps, ReactNode } from 'react';
import { isString, isObject, isNil } from 'es-toolkit/compat';

import type { Tag, Attribute, Requirement, ExtendedTestCase } from 'types/testCase';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import { FolderWithFullPath } from 'controllers/testCase/types';

import { Attachment } from '../common/attachmentList';

// The structure must be corrected after BE integration
export interface IAttachment {
  fileName: string;
  size: number;
}

export enum ManualScenarioType {
  STEPS = 'STEPS',
  TEXT = 'TEXT',
}

interface ManualScenarioCommon {
  executionEstimationTime: number;
  requirements: Requirement[];
  manualScenarioType: ManualScenarioType;
  preconditions?: {
    value: string;
  };
}

interface ManualScenarioSteps extends ManualScenarioCommon {
  steps: TestStep[];
}

interface ManualScenarioText extends ManualScenarioCommon {
  instructions?: string;
  expectedResult?: string;
  attachments?: Attachment[];
}

export type ManualScenarioDto = ManualScenarioSteps | ManualScenarioText;

export interface ActionButton {
  name: string;
  dataAutomationId: string;
  icon?: FC<SVGProps<SVGSVGElement>> | string;
  isCompact: boolean;
  variant?: string;
  handleButton: () => void;
}

export interface CreateTestCaseFormData {
  name: string;
  description?: string;
  folder: FolderWithFullPath | string;
  priority?: TestCasePriority;
  requirements?: Requirement[];
  executionEstimationTime?: number;
  manualScenarioType: ManualScenarioType;
  precondition?: string;
  preconditionAttachments?: Attachment[];
  steps?: TestStep[];
  instructions?: string;
  expectedResult?: string;
  textAttachments?: Attachment[];
  tags?: Tag[];
  attributes?: Attribute[];
}

export interface TestStep {
  instructions: string;
  expectedResult: string;
  attachments?: Attachment[];
  position?: number;
}

export interface DetailsEmptyStateProps {
  testCase: ExtendedTestCase;
}

export interface TagPopoverProps {
  trigger: ReactNode;
  onTagSelect: (tag: Tag | Attribute) => void;
  selectedTags?: (Tag | Attribute)[];
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-end';
  className?: string;
  shouldParseSelectedTags?: boolean;
}

export interface UseTestCaseTagsParams {
  testCaseId: number;
}

export enum TagError {
  TAG_ALREADY_ADDED = 'tagAlreadyAdded',
  CREATE_TAG_FAILED = 'createTagFailed',
}

export interface AttributesResponse {
  content: Tag[];
}

export const hasTagShape = (attr: Tag | Attribute): attr is Tag => {
  return (
    isObject(attr) &&
    'key' in attr &&
    isString((attr as Tag).key) &&
    (!('value' in attr) || isNil(attr.value))
  );
};

export const hasAttributeValue = (attr: Tag | Attribute): attr is Attribute => {
  return (
    isObject(attr) &&
    'key' in attr &&
    isString((attr as Attribute).key) &&
    'value' in attr &&
    !isNil(attr.value) &&
    isString(attr.value)
  );
};

export const isIconComponent = (
  icon: FC<SVGProps<SVGSVGElement>> | string,
): icon is FC<SVGProps<SVGSVGElement>> => !isString(icon);
