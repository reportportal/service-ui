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

import type { AttachmentFormValue } from '../types';
import { useAttachmentUpload } from './useAttachmentUpload';
import { messages } from './messages';
import {
  areAttachmentFormListsEqual,
  normalizeAttachmentsFromUnknown,
} from './utils';

type FieldAttachmentRow = AttachmentFormValue | BaseAttachmentFile;

const EMPTY_FIELD_ATTACHMENTS: FieldAttachmentRow[] = [];

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
  const fieldAttachmentsRaw = useSelector<
    AppState,
    AttachmentFormValue[] | BaseAttachmentFile[] | undefined
  >(
    (state) =>
      selector(state, fieldName) as AttachmentFormValue[] | BaseAttachmentFile[] | undefined,
  );
  const fieldAttachments = fieldAttachmentsRaw ?? EMPTY_FIELD_ATTACHMENTS;

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        const response = await uploadAttachment(file);

        return {
          attachmentId: String(response.id),
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
    if (!isEmpty(fieldAttachments) && !isInitializedRef.current) {
      const backendAttachments: BaseAttachmentFile[] = fieldAttachments.flatMap(
        (attachment: FieldAttachmentRow) => {
          const id =
            attachment.id ??
            ('attachmentId' in attachment ? attachment.attachmentId : undefined);

          if (id == null || id === '' || !attachment.fileName) {
            return [];
          }

          const idString = String(id);
          const fileName = attachment.fileName || 'Attachment';
          const blobName = attachment.fileName || 'attachment';

          return [
            {
              id: idString,
              fileName,
              file: new File([], blobName),
              size: Number(
                attachment.size ??
                  ('fileSize' in attachment ? attachment.fileSize : undefined) ??
                  0,
              ),
              attachmentId: idString,
              isUploading: false,
              uploadingProgress: 100,
            },
          ];
        },
      );

      setAttachedFiles(backendAttachments);
      isInitializedRef.current = true;

      return;
    }

    if (!isInitializedRef.current && isEmpty(fieldAttachments)) {
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

    const current = normalizeAttachmentsFromUnknown(fieldAttachments as unknown[]);

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
