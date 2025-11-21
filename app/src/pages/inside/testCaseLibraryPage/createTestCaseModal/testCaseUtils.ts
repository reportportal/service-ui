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

import { FolderWithFullPath } from 'controllers/testCase';
import { isString } from 'es-toolkit';

import { ManualScenarioDto, ManualScenarioType, CreateTestCaseFormData, Attribute } from '../types';
import { NewFolderData, isNewFolderData } from '../utils/getFolderFromFormValues';

export const buildManualScenario = (payload: CreateTestCaseFormData): ManualScenarioDto => {
  const commonData = {
    executionEstimationTime: payload.executionEstimationTime,
    linkToRequirements: payload.linkToRequirements,
    manualScenarioType: payload.manualScenarioType,
    preconditions: {
      value: payload.precondition,
      attachments: payload.preconditionAttachments ?? [],
    },
    attributes:
      payload.attributes?.map(({ id, key, value }) => ({
        id,
        key,
        value,
      })) || [],
  };

  if (payload.manualScenarioType === ManualScenarioType.TEXT) {
    return {
      ...commonData,
      instructions: payload.instructions,
      expectedResult: payload.expectedResult,
      attachments: payload.textAttachments ?? [],
    };
  }

  return {
    ...commonData,
    steps: Object.values(payload?.steps ?? {})
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((step) => ({
        instructions: step.instructions,
        expectedResult: step.expectedResult,
        attachments: step.attachments ?? [],
      })),
  };
};

interface FolderPayload {
  testFolder?: { name: string; parentTestFolderId?: number | null };
  testFolderId?: number;
}

interface ProcessFolderResult {
  payload: FolderPayload;
  newFolderDetails: NewFolderData | undefined;
  existingFolderId: number | undefined;
}

export const processFolder = (
  folder: FolderWithFullPath | NewFolderData | string,
): ProcessFolderResult => {
  if (isString(folder)) {
    return {
      payload: { testFolder: { name: folder } },
      newFolderDetails: { name: folder, parentTestFolderId: undefined },
      existingFolderId: undefined,
    };
  }

  if (isNewFolderData(folder)) {
    const parentId = folder.parentTestFolderId;

    return {
      payload: {
        testFolder: {
          name: folder.name,
          ...(parentId && { parentTestFolderId: parentId }),
        },
      },
      newFolderDetails: folder,
      existingFolderId: undefined,
    };
  }

  return {
    payload: { testFolderId: folder.id },
    newFolderDetails: undefined,
    existingFolderId: folder.id,
  };
};

export const buildTestCaseData = (
  payload: CreateTestCaseFormData,
  manualScenario: ManualScenarioDto,
  attributes: Attribute[],
) => {
  const { payload: folderPayload } = processFolder(payload.folder);

  return {
    description: payload.description,
    name: payload.name,
    ...folderPayload,
    priority: payload.priority?.toUpperCase(),
    manualScenario,
    attributes: attributes.map(({ key: _key, ...rest }) => rest),
  };
};
