/*
 * Copyright 2024 EPAM Systems
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

export const formDataForServerUploading = (files) =>
  files
    .filter((item) => item.valid)
    .map((item) => {
      const formData = new FormData();

      formData.append('file', item.file, item.file.name);

      return {
        data: formData,
        id: item.id,
      };
    });

export const getFilesNames = (files) => files.map(({ file: { name } }) => name).join('#');

export const getValidFiles = (files) => files.filter(({ valid }) => valid);

export const isUploadInProgress = (files) =>
  getValidFiles(files).some(({ isLoading }) => isLoading);

export const isUploadFinished = (files) => {
  const validFiles = getValidFiles(files);
  return validFiles.length ? validFiles.every(({ uploaded }) => uploaded) : false;
};
