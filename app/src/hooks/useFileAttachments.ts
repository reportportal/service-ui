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

import { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { FileWithValidation } from '@reportportal/ui-kit/fileDropArea';
import { isEmpty } from 'es-toolkit/compat';

import { convertBytesToMB } from 'common/utils';
import { showWarningNotification } from 'controllers/notification';

export interface ServerAttachment {
  id: number | string;
  fileName: string;
  fileSize: number;
}

export interface AttachedFileData {
  id: string;
  fileName: string;
  size: number;
  file: File;
}

export interface UseFileAttachmentsOptions {
  resetKey: string;
  existingAttachments?: ServerAttachment[];
  messages: {
    duplicateFileNames: { id: string; defaultMessage: string };
    emptyFiles: { id: string; defaultMessage: string };
  };
}

export interface UseFileAttachmentsReturn {
  pendingFiles: File[];
  removedAttachmentIds: Set<string>;
  visibleExistingAttachments: ServerAttachment[];
  existingAttachmentsData: AttachedFileData[];
  pendingFilesData: AttachedFileData[];
  handleFilesAdded: (filesWithValidation: FileWithValidation[]) => void;
  handlePendingRemove: (fileId: string) => void;
  handleExistingRemove: (id: string | number) => void;
  reset: () => void;
  setPendingFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setRemovedAttachmentIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const useFileAttachments = ({
  resetKey,
  existingAttachments = [],
  messages,
}: UseFileAttachmentsOptions): UseFileAttachmentsReturn => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<Set<string>>(() => new Set());

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPendingFiles([]);
    setRemovedAttachmentIds(new Set());
  }

  const visibleExistingAttachments = useMemo(
    () => existingAttachments.filter((a) => !removedAttachmentIds.has(String(a.id))),
    [existingAttachments, removedAttachmentIds],
  );

  const existingAttachmentsData: AttachedFileData[] = useMemo(
    () =>
      visibleExistingAttachments.map((att) => ({
        id: String(att.id),
        fileName: att.fileName,
        size: convertBytesToMB(att.fileSize),
        file: undefined!,
      })),
    [visibleExistingAttachments],
  );

  const pendingFilesData: AttachedFileData[] = useMemo(
    () =>
      pendingFiles.map((file, index) => ({
        id: `${file.name}-${index}`,
        fileName: file.name,
        file,
        size: convertBytesToMB(file.size),
      })),
    [pendingFiles],
  );

  const handleFilesAdded = (filesWithValidation: FileWithValidation[]) => {
    const incoming = filesWithValidation.map((f) => f.file);
    const existingNames = new Set([
      ...visibleExistingAttachments.map((a) => a.fileName.toLowerCase()),
      ...pendingFiles.map((f) => f.name.toLowerCase()),
    ]);

    const duplicates: string[] = [];
    const emptyFiles: string[] = [];
    const uniqueFiles = incoming.filter((f) => {
      if (f.size === 0) {
        emptyFiles.push(f.name);
        return false;
      }
      const key = f.name.toLowerCase();
      if (existingNames.has(key)) {
        duplicates.push(f.name);
        return false;
      }
      existingNames.add(key);
      return true;
    });

    if (!isEmpty(emptyFiles)) {
      dispatch(
        showWarningNotification({
          message: formatMessage(messages.emptyFiles, {
            files: emptyFiles.join(', '),
          }),
        }),
      );
    }

    if (!isEmpty(duplicates)) {
      dispatch(
        showWarningNotification({
          message: formatMessage(messages.duplicateFileNames, {
            files: duplicates.join(', '),
          }),
        }),
      );
    }

    if (!isEmpty(uniqueFiles)) {
      setPendingFiles((prev) => [...prev, ...uniqueFiles]);
    }
  };

  const handlePendingRemove = (fileId: string) => {
    const index = pendingFiles.findIndex((f, i) => `${f.name}-${i}` === fileId);
    if (index !== -1) {
      setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleExistingRemove = (id: string | number) => {
    setRemovedAttachmentIds((prev) => new Set([...prev, String(id)]));
  };

  const reset = () => {
    setPendingFiles([]);
    setRemovedAttachmentIds(new Set());
  };

  return {
    pendingFiles,
    removedAttachmentIds,
    visibleExistingAttachments,
    existingAttachmentsData,
    pendingFilesData,
    handleFilesAdded,
    handlePendingRemove,
    handleExistingRemove,
    reset,
    setPendingFiles,
    setRemovedAttachmentIds,
  };
};
