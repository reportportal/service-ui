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

import type { MessageDescriptor } from 'react-intl';

import type { TestCaseExecution } from 'controllers/manualLaunch';
import type { UseModalData } from 'common/hooks';

export type ExecutionStatusType = 'passed' | 'failed' | 'skipped';

export interface ExecutionContentProps {
  execution: TestCaseExecution;
}

export interface StatusButtonConfig {
  status: string;
  message: MessageDescriptor;
}

export interface StatusConfig {
  label: MessageDescriptor;
  colorClass: string;
}

export interface ExecutionStatusDropdownProps {
  executionId: number;
  currentStatus: string;
}

export interface ExecutionStatusButtonsProps {
  executionId: number;
}

export interface ExecutionStatusData {
  executionId: number;
  status: ExecutionStatusType;
  currentStatus?: string;
}

export type ExecutionStatusConfirmModalData = ExecutionStatusData;

export interface ExecutionStatusConfirmFormValues {
  comment: string;
  postIssueToBts: boolean;
  attachments: File[];
}

export type ExecutionStatusConfirmModalProps = UseModalData<ExecutionStatusConfirmModalData>;
