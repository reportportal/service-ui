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

import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { useFileProcessing, BaseAttachmentFile } from 'common/hooks';
import { useAttachmentUpload } from './useAttachmentUpload';
import { messages } from './messages';

interface UseTmsFileUploadOptions {
  formName: string;
  fieldName: string;
}

export const useTmsFileUpload = ({ formName, fieldName }: UseTmsFileUploadOptions) => {
  const dispatch = useDispatch();
  const { uploadAttachment } = useAttachmentUpload();
  const { formatMessage } = useIntl();

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

  const { attachedFiles, addFiles, removeFile, downloadFile } =
    useFileProcessing<BaseAttachmentFile>({
      onUpload: handleUpload,
    });

  useEffect(() => {
    const attachments = attachedFiles
      .filter((file) => file.attachmentId && !file.uploadError)
      .map(({ attachmentId }) => ({ id: attachmentId }));

    dispatch(change(formName, fieldName, attachments));
  }, [attachedFiles, dispatch, formName, fieldName]);

  return {
    attachedFiles,
    addFiles,
    removeFile,
    downloadFile,
  };
};
