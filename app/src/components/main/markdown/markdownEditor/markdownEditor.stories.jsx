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

import { MarkdownEditor } from '../';
import README from './README.md';

const testMarkdown =
  '# Intro\n' +
  'Go ahead, play around with the editor! Be sure to check out **bold** and *italic* styling, or even [links](https://google.com). You can type the Markdown syntax, use the toolbar, or use shortcuts like `cmd-b` or `ctrl-b`.\n' +
  '\n' +
  '## Lists\n' +
  'Unordered lists can be started using the toolbar or by typing `* `, `- `, or `+ `. Ordered lists can be started by typing `1. `.\n' +
  '\n' +
  '### Unordered\n' +
  '> quote\n' +
  '\n' +
  '\n' +
  "`var bla = 'bar';`\n" +
  '\n' +
  '* Lists are a piece of cake\n' +
  '* They even auto continue as you type\n' +
  '* A double enter will end them\n' +
  '* Tabs and shift-tabs work too\n' +
  '\n' +
  '#### Ordered\n' +
  '1. Numbered lists...\n' +
  '2. ...work too!\n' +
  '\n' +
  '## What about images?\n' +
  '![Yes](https://i.imgur.com/sZlktY7.png)\n';

storiesOf('Components/Main/Markdown/MarkdownEditor', module)
  .addDecorator(
    host({
      title: 'Markdown editor component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 'auto',
      width: '70%',
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <MarkdownEditor />)
  .add('with placeholder', () => (
    <MarkdownEditor placeholder="Some placeholder for markdown editor..." />
  ))
  .add('with provided markdown text', () => (
    <MarkdownEditor value={testMarkdown} onChange={action('changed')} />
  ));
