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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  modalTitle: {
    id: 'LogTypeModal.create.modalTitle',
    defaultMessage: 'Create Log Type',
  },
  modalDescription: {
    id: 'LogTypeModal.create.modalDescription',
    defaultMessage: 'Create your own log type by filling in the form below',
  },
  logTypeName: {
    id: 'LogTypeModal.logTypeName',
    defaultMessage: 'Log type name',
  },
  logLevel: {
    id: 'LogTypeModal.logLevel',
    defaultMessage: 'Log level',
  },
  levelHelperText: {
    id: 'LogTypeModal.levelHelperText',
    defaultMessage: 'Log level is used to identify the log type during test execution',
  },
  colorPalette: {
    id: 'LogTypeModal.colorPalette',
    defaultMessage: 'Color Palette',
  },
  labelColor: {
    id: 'LogTypeModal.labelColor',
    defaultMessage: 'Label color',
  },
  backgroundColor: {
    id: 'LogTypeModal.backgroundColor',
    defaultMessage: 'Background',
  },
  textColor: {
    id: 'LogTypeModal.textColor',
    defaultMessage: 'Text color',
  },
  textBold: {
    id: 'LogTypeModal.textBold',
    defaultMessage: 'Text bold',
  },
  previewText: {
    id: 'LogTypeModal.previewText',
    defaultMessage: 'Preview: log example',
  },
  updateModalTitle: {
    id: 'LogTypeModal.update.modalTitle',
    defaultMessage: 'Edit Log Type',
  },
  systemLogTypeInfoMessageHeader: {
    id: 'LogTypeModal.systemLogTypeInfoMessageHeader',
    defaultMessage: 'This is core log type',
  },
  systemLogTypeInfoMessage: {
    id: 'LogTypeModal.systemLogTypeInfoMessage',
    defaultMessage:
      'Name and log level cannot be changed — only its visual appearance settings can be adjusted.',
  },
  deleteModalTitle: {
    id: 'LogTypeModal.delete.modalTitle',
    defaultMessage: 'Delete Log Type',
  },
  deleteModalMessage: {
    id: 'LogTypeModal.delete.modalMessage',
    defaultMessage:
      'Are you sure you want to delete <b>{name}</b>?<br/>Logs with this log level will be treated as <b>Undefined</b>.',
  },
});
