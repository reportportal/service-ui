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

import { useIntl } from 'react-intl';
import { AddImageIcon, FieldTextFlex, FieldLabel, FileDropArea } from '@reportportal/ui-kit';
import { MIME_TYPES } from '@reportportal/ui-kit/fileDropArea';

import { createClassnames } from 'common/utils';
import { FieldErrorHint, FieldProvider } from 'components/fields';

import { messages as commonMessages } from '../../messages';
import { messages } from './messages';
import { MAX_FILE_SIZE } from '../../constants';
import { useTmsFileUpload } from '../../useTmsFileUpload';

import styles from './textTemplate.scss';

const cx = createClassnames(styles);

interface TextTemplateProps {
  formName: string;
}

export const TextTemplate = ({ formName }: TextTemplateProps) => {
  const { formatMessage } = useIntl();
  const { attachedFiles, addFiles, removeFile, downloadFile } = useTmsFileUpload({
    formName,
    fieldName: 'textAttachments',
  });

  return (
    <div className={cx('text-template')}>
      <FieldProvider name="instructions">
        <FieldErrorHint>
          <FieldTextFlex
            label={formatMessage(messages.instructions)}
            placeholder={formatMessage(messages.enterInstructions)}
            value=""
          />
        </FieldErrorHint>
      </FieldProvider>
      <FieldProvider name="expectedResult">
        <FieldErrorHint>
          <FieldTextFlex
            label={formatMessage(messages.expectedResult)}
            placeholder={formatMessage(messages.enterExpectedResult)}
            value=""
          />
        </FieldErrorHint>
      </FieldProvider>
      <div className={cx('text-template__drop-area')}>
        <FieldLabel>{formatMessage(commonMessages.attachments)}</FieldLabel>
        <FileDropArea
          acceptFileMimeTypes={[MIME_TYPES.jpeg, MIME_TYPES.png]}
          messages={{
            incorrectFileFormat: formatMessage(commonMessages.incorrectFileFormat),
            incorrectFileSize: formatMessage(commonMessages.fileSizeInfo),
          }}
          maxFileSize={MAX_FILE_SIZE}
          onFilesAdded={addFiles}
        >
          <FileDropArea.DropZone
            className={cx('text-template__dropzone')}
            icon={<AddImageIcon />}
            description={formatMessage(commonMessages.dropFileDescription, {
              browseButton: (
                <FileDropArea.BrowseButton>
                  {formatMessage(commonMessages.browseText)}
                </FileDropArea.BrowseButton>
              ),
            })}
            fileSizeMessage={formatMessage(commonMessages.fileSizeInfo)}
          />
          <FileDropArea.AttachedFilesList
            files={attachedFiles}
            onRemoveFile={removeFile}
            onDownloadFile={downloadFile}
          />
        </FileDropArea>
      </div>
    </div>
  );
};
