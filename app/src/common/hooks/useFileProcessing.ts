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

import { useCallback, useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { isEmpty, keyBy } from 'es-toolkit/compat';
import { noop } from 'es-toolkit';
import type {
  FileWithValidation,
  FileValidationError,
} from '@reportportal/ui-kit/dist/components/fileDropArea/types';

import { uniqueId } from 'common/utils';
import { downloadFileFromBlob, getFileKey } from 'common/utils/fileUtils';

import { useFileUploadProgressSimulation } from './useFileUploadProgressSimulation';

export interface BaseAttachmentFile {
  id: string;
  fileName: string;
  file: File;
  size: number;
  uploadingProgress?: number;
  isUploading?: boolean;
  validationErrors?: FileValidationError[];
  customErrorMessage?: string;
  attachmentId?: string;
  uploadError?: string;
}

export interface UploadResult {
  attachmentId?: string;
  uploadError?: string;
}

interface UseFileProcessingOptions<T extends BaseAttachmentFile> {
  onFilesChange?: (files: T[]) => void;
  onUpload?: (file: File) => Promise<UploadResult>;
}

const messages = defineMessages({
  fileAlreadyExists: {
    id: 'fileProcessing.fileAlreadyExists',
    defaultMessage: 'File already exists',
  },
});

const PROGRESS_END = 100;

export const useFileProcessing = <T extends BaseAttachmentFile = BaseAttachmentFile>({
  onFilesChange = noop,
  onUpload,
}: UseFileProcessingOptions<T> = {}) => {
  const { formatMessage } = useIntl();
  const [attachedFiles, setAttachedFiles] = useState<T[]>([]);
  const { startSimulation, stopSimulation, stopAllSimulations } = useFileUploadProgressSimulation();

  const updateFileById = useCallback((fileId: string, updates: Partial<T>) => {
    setAttachedFiles((prev) =>
      prev.map((file) => (file.id === fileId ? { ...file, ...updates } : file)),
    );
  }, []);

  const updateFileProgress = useCallback((fileId: string) => {
    setAttachedFiles((prev) =>
      prev.map((file) => {
        if (file.id !== fileId) {
          return file;
        }

        const currentProgress = file.uploadingProgress ?? 0;
        const progressIncrement = 5;

        return {
          ...file,
          uploadingProgress: Math.min(currentProgress + progressIncrement, PROGRESS_END),
        };
      }),
    );
  }, []);

  const completeFileUpload = useCallback(
    (fileId: string) => {
      updateFileById(fileId, {
        isUploading: false,
        uploadingProgress: PROGRESS_END,
      } as Partial<T>);
    },
    [updateFileById],
  );

  const uploadFile = useCallback(
    async (fileToUpload: T) => {
      if (!fileToUpload.file) {
        return;
      }

      startSimulation({
        fileId: fileToUpload.id,
        onProgressUpdate: updateFileProgress,
        onComplete: completeFileUpload,
      });

      if (!onUpload) {
        return;
      }

      const uploadedFile = await onUpload(fileToUpload.file);

      stopSimulation(fileToUpload.id);

      updateFileById(fileToUpload.id, {
        attachmentId: uploadedFile.attachmentId,
        isUploading: false,
        uploadingProgress: uploadedFile.attachmentId ? PROGRESS_END : 0,
        customErrorMessage: uploadedFile.uploadError,
      } as Partial<T>);
    },
    [
      onUpload,
      startSimulation,
      stopSimulation,
      updateFileProgress,
      completeFileUpload,
      updateFileById,
    ],
  );

  const createFileFromValidation = useCallback(
    ({ file, validationErrors }: FileWithValidation): T => {
      const size = Math.round((file.size / (1000 * 1000)) * 100) / 100;
      const hasValidationErrors = !isEmpty(validationErrors);

      return {
        id: uniqueId(),
        file,
        fileName: file.name,
        size,
        validationErrors,
        uploadingProgress: hasValidationErrors ? undefined : 0,
        isUploading: !hasValidationErrors,
      } as T;
    },
    [],
  );

  const handleFilesChange = useCallback(
    (files: T[]) => {
      setAttachedFiles(files);
      onFilesChange(files);
    },
    [onFilesChange],
  );

  const addFiles = useCallback(
    (filesWithValidation: FileWithValidation[]) => {
      setAttachedFiles((prevFiles) => {
        const existingFileKeys = keyBy(prevFiles, getFileKey);

        const newFiles = filesWithValidation.map((fileWithValidation) => {
          const newFile = createFileFromValidation(fileWithValidation);
          const fileKey = getFileKey(newFile);

          if (existingFileKeys[fileKey]) {
            return {
              ...newFile,
              customErrorMessage: formatMessage(messages.fileAlreadyExists),
              isUploading: false,
              uploadingProgress: undefined,
            };
          }

          return newFile;
        });

        const updatedFiles = [...prevFiles, ...newFiles];

        onFilesChange(updatedFiles);

        newFiles.forEach((file) => {
          if (file.isUploading) {
            uploadFile(file).catch(noop);
          }
        });

        return updatedFiles;
      });
    },
    [onFilesChange, createFileFromValidation, formatMessage, uploadFile],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      stopSimulation(fileId);

      const updatedFiles = attachedFiles.filter((file) => file.id !== fileId);

      handleFilesChange(updatedFiles);
    },
    [attachedFiles, handleFilesChange, stopSimulation],
  );

  const downloadFile = useCallback((file: T) => {
    downloadFileFromBlob(file.file, file.fileName);
  }, []);

  useEffect(() => stopAllSimulations, [stopAllSimulations]);

  return {
    attachedFiles,
    addFiles,
    removeFile,
    downloadFile,
    setAttachedFiles,
  };
};
