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

export const downloadFileFromBlob = (file: File, fileName?: string): void => {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName || file.name;
  link.click();
  URL.revokeObjectURL(url);
};

export interface FileValidationOptions {
  maxFileSize?: number;
  acceptFileMimeTypes?: string[];
}

export const validateFile = (
  file: File,
  options: FileValidationOptions,
  formatMessage: (message: { id: string; defaultMessage: string }) => string,
  messages: {
    incorrectFileSize: { id: string; defaultMessage: string };
    incorrectFileFormat: { id: string; defaultMessage: string };
  },
): string[] => {
  const { maxFileSize, acceptFileMimeTypes = [] } = options;
  const errors: string[] = [];

  if (maxFileSize && file.size > maxFileSize) {
    errors.push(formatMessage(messages.incorrectFileSize));
  }

  if (acceptFileMimeTypes.length > 0) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidType = acceptFileMimeTypes.some((type) =>
      type.startsWith('.') ? fileExtension === type.slice(1) : file.type === type,
    );

    if (!isValidType) {
      errors.push(formatMessage(messages.incorrectFileFormat));
    }
  }

  return errors;
};
