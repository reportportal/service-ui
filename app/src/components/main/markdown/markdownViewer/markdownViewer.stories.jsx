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

import { MarkdownViewer } from '../';
import README from './README.md';
import TestImage from './testImg/test-image.png';

const boldMock = '**bold**';
const italicMock = '*italic*';
const strikethroughMock = '~~strikethrough~~';
const unorderedListMock = [
  '* Generic list item',
  '* Generic list item',
  '* Generic list item',
].join('\n');
const orderedListMock = [
  '1. Numbered list item',
  '2. Numbered list item',
  '3. Numbered list item',
].join('\n');
const linkMock = '[Report portal](http://reportportal.io/)';
const quoteMock = '> This is a quote.';
const codeMock = '`var example = "hello!";`';
const imageMock = `![Yes](${TestImage})`;
const combinationMock =
  '## Lists\n' +
  'Unordered lists can be started using the toolbar or by typing `* `, `- `, or `+ `. Ordered lists can be started by typing `1. `.\n' +
  '\n' +
  '### Unordered\n' +
  '* Lists are a piece of cake\n' +
  '* They even auto continue as you type\n' +
  '\n' +
  '#### Ordered\n' +
  '1. Numbered lists...\n' +
  '2. ...work too!\n' +
  '\n' +
  '## What about images?\n' +
  `![Yes](${TestImage})\n`;

storiesOf('Components/Main/Markdown/MarkdownViewer', module)
  .addDecorator(
    host({
      title: 'Markdown viewer component',
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
  .add('default state', () => <MarkdownViewer />)
  .add('with bold markdown text', () => <MarkdownViewer value={boldMock} />)
  .add('with italic markdown text', () => <MarkdownViewer value={italicMock} />)
  .add('with strikethrough text', () => <MarkdownViewer value={strikethroughMock} />)
  .add('with unordered list', () => <MarkdownViewer value={unorderedListMock} />)
  .add('with ordered list', () => <MarkdownViewer value={orderedListMock} />)
  .add('with link', () => <MarkdownViewer value={linkMock} />)
  .add('with quote block', () => <MarkdownViewer value={quoteMock} />)
  .add('with code block', () => <MarkdownViewer value={codeMock} />)
  .add('with image', () => <MarkdownViewer value={imageMock} onResize={action('block resized!')} />)
  .add('different types of markdown', () => (
    <MarkdownViewer value={combinationMock} onResize={action('block resized!')} />
  ));
