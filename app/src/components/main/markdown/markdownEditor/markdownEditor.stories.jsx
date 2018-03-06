/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import { MarkdownEditor } from '../';
import README from './README.md';

const testMarkdown = '# Intro\n' +
  'Go ahead, play around with the editor! Be sure to check out **bold** and *italic* styling, or even [links](https://google.com). You can type the Markdown syntax, use the toolbar, or use shortcuts like `cmd-b` or `ctrl-b`.\n' +
  '\n' +
  '## Lists\n' +
  'Unordered lists can be started using the toolbar or by typing `* `, `- `, or `+ `. Ordered lists can be started by typing `1. `.\n' +
  '\n' +
  '### Unordered\n' +
  '> quote\n' +
  '\n' +
  '\n' +
  '`var bla = \'bar\';`\n' +
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

storiesOf('Components/Main/markdown/markdownEditor', module)
  .addDecorator(host({
    title: 'Markdown editor component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#fff',
    height: 'auto',
    width: '70%',
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <MarkdownEditor />
  ))
  .add('with placeholder', () => (
    <MarkdownEditor placeholder="Some placeholder for markdown editor..." />
  ))
  .add('with provided markdown text', () => (
    <MarkdownEditor value={testMarkdown} onChange={action('changed')} />
  ))
;
