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
import { useSelector } from "react-redux";

import { locationSelector } from "controllers/pages";
import { TransformedFolder } from "controllers/testCase/types";
import { testPlanFoldersSelector, testPlanTransformedFoldersSelector } from "controllers/testPlan";


export const findFolderById = (folders: TransformedFolder[], id: number): TransformedFolder | undefined => {
  for (const folder of folders) {
    if (folder.id === id) {
      return folder;
    }
    if (folder.folders && folder.folders.length > 0) {
      const found = findFolderById(folder.folders, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

export const useTestPlanActiveFolders = () => {
  const { payload } = useSelector(locationSelector);
  const transformedFolders = useSelector(testPlanTransformedFoldersSelector);
  const folders = useSelector(testPlanFoldersSelector);
  const testPlanRoute = payload.testPlanRoute;
  const match = testPlanRoute?.match(/folder\/(\d+)/);
  const activeFolderId = match ? Number(match[1]) : null;
  const activeFolder = activeFolderId ? findFolderById(transformedFolders, activeFolderId) : null;

  return { activeFolderId, activeFolder, payload, folders, transformedFolders};
}
