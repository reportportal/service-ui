/*
 * Copyright 2019 EPAM Systems
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

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';

// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { Attachments } from './attachments';
import README from './README.md';

const ALL_FILETYPES = [
  'image/png',
  'text/xml',
  'application/xml',
  'text/x-php',
  'application/json',
  'application/pdf',
  'application/javascript',
  'xxx/har',
  'xxx/pic',
  'text/css',
  'text/csv',
  'text/html',
  'text/plain',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-tar',
  'application/gzip',
];

const logsWithAttachments = ALL_FILETYPES.map((contentType, id) => ({
  binaryContent: {
    contentType,
    id,
  },
}));

const state = {
  log: {
    attachments: {
      logsWithAttachments,
      loading: false,
    },
  },
  modal: {
    activeModal: null,
  },
};

storiesOf('Pages/Inside/LogsPage/LogItemInfo/LogItemInfoTabs/Attachments', module)
  .addDecorator(
    host({
      title: 'Log Attachment',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#f5f5f5',
      width: 800,
      height: 'auto',
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('With all icon types', () => (
    <WithState state={state}>
      <Attachments activeItemId={0} onChangeActiveItem={action('Change active item')} />
    </WithState>
  ));
