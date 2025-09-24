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

import { useCallback, useState, useRef, useEffect } from 'react';
import { noop, isEmpty } from 'lodash';

import { uniqueId } from 'common/utils';
import { downloadFileFromBlob } from 'common/utils/fileUtils';

import type {
  FileWithValidation,
  FileValidationError,
} from '@reportportal/ui-kit/dist/components/fileDropArea/types';

export interface BaseAttachmentFile {
  id: string;
  fileName: string;
  file: File;
  size: number;
  uploadingProgress?: number;
  isUploading?: boolean;
  validationErrors?: FileValidationError[];
}

interface UseFileProcessingOptions<T extends BaseAttachmentFile> {
  onFilesChange?: (files: T[]) => void;
}

export const useFileProcessing = <T extends BaseAttachmentFile = BaseAttachmentFile>({
  onFilesChange = noop,
}: UseFileProcessingOptions<T> = {}) => {
  const [attachedFiles, setAttachedFiles] = useState<T[]>([]);
  const activeUploadsRef = useRef<
    Record<string, { interval: NodeJS.Timeout; timeout: NodeJS.Timeout } | undefined>
  >({});

  const updateFileProgress = useCallback((fileId: string) => {
    setAttachedFiles((prev) =>
      prev.map((file) => {
        if (file.id !== fileId) {
          return file;
        }

        const currentProgress = file.uploadingProgress ?? 0;
        const progressIncrement = 5;

        return { ...file, uploadingProgress: Math.min(currentProgress + progressIncrement, 100) };
      }),
    );
  }, []);

  const completeFileUpload = useCallback((fileId: string) => {
    setAttachedFiles((prev) =>
      prev.map((file) => {
        if (file.id !== fileId) {
          return file;
        }

        return {
          ...file,
          isUploading: false,
          uploadingProgress: 100,
        };
      }),
    );
  }, []);

  const simulateFileUpload = useCallback(
    (fileId: string) => {
      const interval = setInterval(() => updateFileProgress(fileId), 60);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        activeUploadsRef.current[fileId] = undefined;
        completeFileUpload(fileId);
      }, 3000);

      activeUploadsRef.current[fileId] = { interval, timeout };
    },
    [updateFileProgress, completeFileUpload],
  );

  const createFileFromValidation = useCallback(
    ({ file, validationErrors }: FileWithValidation): T => {
      const size = Math.round((file.size / (1024 * 1024)) * 100) / 100;
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
      const newFiles = filesWithValidation.map(createFileFromValidation);

      setAttachedFiles((prevFiles) => {
        const updatedFiles = [...prevFiles, ...newFiles];

        onFilesChange(updatedFiles);

        return updatedFiles;
      });

      newFiles.forEach((file) => {
        if (file.isUploading) {
          simulateFileUpload(file.id);
        }
      });
    },
    [createFileFromValidation, onFilesChange, simulateFileUpload],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      const activeUpload = activeUploadsRef.current[fileId];

      if (activeUpload) {
        clearInterval(activeUpload.interval);
        clearTimeout(activeUpload.timeout);
        activeUploadsRef.current[fileId] = undefined;
      }

      const updatedFiles = attachedFiles.filter((file) => file.id !== fileId);

      handleFilesChange(updatedFiles);
    },
    [attachedFiles, handleFilesChange],
  );

  const downloadFile = useCallback((file: T) => {
    downloadFileFromBlob(file.file, file.fileName);
  }, []);

  useEffect(() => {
    const activeUploads = activeUploadsRef.current;

    return () => {
      Object.entries(activeUploads).forEach(([key, uploadData]) => {
        if (uploadData) {
          clearInterval(uploadData.interval);
          clearTimeout(uploadData.timeout);
        }

        activeUploads[key] = undefined;
      });
    };
  }, []);

  return {
    attachedFiles,
    addFiles,
    removeFile,
    downloadFile,
    setAttachedFiles,
  };
};
