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

import { useCallback, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { change, formValueSelector } from 'redux-form';
import { isEmpty } from 'es-toolkit/compat';

import { useFileProcessing, BaseAttachmentFile } from 'common/hooks';
import type { AppState } from 'types/store';

import { useAttachmentUpload } from './useAttachmentUpload';
import { messages } from './messages';
import {
  areAttachmentFormListsEqual,
  normalizeAttachmentsFromUnknown,
} from './utils';

interface UseTmsFileUploadOptions {
  formName: string;
  fieldName: string;
}

export const useTmsFileUpload = ({ formName, fieldName }: UseTmsFileUploadOptions) => {
  const dispatch = useDispatch();
  const { uploadAttachment } = useAttachmentUpload();
  const { formatMessage } = useIntl();
  const isInitializedRef = useRef(false);
  const selector = formValueSelector(formName || 'no-form');
  const fieldAttachments =
    useSelector<AppState, BaseAttachmentFile[] | undefined>(
      (state) => selector(state, fieldName) as BaseAttachmentFile[] | undefined,
    ) || [];

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        const response = await uploadAttachment(file);

        return {
          attachmentId: response.id,
        };
      } catch {
        return {
          uploadError: formatMessage(messages.uploadFailed),
        };
      }
    },
    [formatMessage, uploadAttachment],
  );

  const { attachedFiles, addFiles, removeFile, downloadFile, setAttachedFiles } =
    useFileProcessing<BaseAttachmentFile>({
      onUpload: handleUpload,
    });

  useEffect(() => {
    if (!isEmpty(fieldAttachments) && isEmpty(attachedFiles) && !isInitializedRef.current) {
      const backendAttachments: BaseAttachmentFile[] = fieldAttachments
        .filter((attachment) => (attachment.id ?? attachment.attachmentId) && attachment.fileName)
        .map((attachment) => ({
          id: String(attachment.id ?? attachment.attachmentId ?? ''),
          fileName: attachment.fileName || 'Attachment',
          file: new File([], attachment.fileName || 'attachment'),
          size: Number(attachment.size ?? attachment.fileSize ?? 0),
          attachmentId: attachment.id ?? attachment.attachmentId,
          isUploading: false,
          uploadingProgress: 100,
        }));

      setAttachedFiles(backendAttachments);
      isInitializedRef.current = true;

      return;
    }

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
    }

    const attachments = normalizeAttachmentsFromUnknown(
      attachedFiles
        .filter((file) => file.attachmentId && !file.uploadError)
        .map(({ attachmentId, fileName, size }) => ({
          id: attachmentId,
          fileName,
          size,
        })) as unknown[],
    );

    const current = normalizeAttachmentsFromUnknown(
      (Array.isArray(fieldAttachments) ? fieldAttachments : []) as unknown[],
    );

    if (areAttachmentFormListsEqual(attachments, current)) {
      return;
    }

    dispatch(change(formName, fieldName, attachments));
  }, [fieldAttachments, attachedFiles, dispatch, formName, fieldName, setAttachedFiles]);

  return {
    attachedFiles,
    addFiles,
    removeFile,
    downloadFile,
  };
};
