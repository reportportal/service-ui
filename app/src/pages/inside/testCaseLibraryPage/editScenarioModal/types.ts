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

import { FormEvent } from 'react';
import { ExtendedTestCase, CreateTestCaseFormData } from '../types';

export interface UseEditScenarioModalOptions {
  testCase: ExtendedTestCase;
}

export type EditScenarioModalProps = Partial<UseEditScenarioModalOptions>;

export interface ModalCommonProps {
  title: string;
  submitButtonText: string;
  isLoading: boolean;
  onSubmitHandler: (formData: CreateTestCaseFormData) => void | Promise<void>;
}

export interface EditScenarioModalContentProps extends ModalCommonProps {
  formName: string;
  pristine?: boolean;
  handleSubmit: (
    handler: (formData: CreateTestCaseFormData) => void | Promise<void>,
  ) => (event: FormEvent) => void;
}

export interface ScenarioFieldsProps {
  formName: string;
}
